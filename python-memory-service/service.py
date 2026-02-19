#!/usr/bin/env python3
import base64
import json
import math
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, List
from sentence_transformers import SentenceTransformer

HOST = "127.0.0.1"
PORT = 8001
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
DB_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DB_DIR / "memory_store.sqlite3"

MODEL = SentenceTransformer(EMBED_MODEL_NAME)
DIM = MODEL.get_sentence_embedding_dimension()


def now_ms() -> int:
    return int(time.time() * 1000)


def encode_text(text: str) -> str:
    return base64.b64encode(text.encode("utf-8")).decode("ascii")


def decode_text(payload: str) -> str:
    return base64.b64decode(payload.encode("ascii")).decode("utf-8")


def embed_text(text: str) -> List[float]:
    if not text.strip():
        return [0.0] * DIM
    vec = MODEL.encode([text], normalize_embeddings=True)[0]
    return [float(x) for x in vec]


def cosine(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


class MemoryStore:
    def __init__(self, db_path: Path):
        DB_DIR.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init()

    def _init(self):
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL,
                source TEXT NOT NULL,
                role TEXT NOT NULL,
                text_b64 TEXT NOT NULL,
                embedding_json TEXT NOT NULL,
                metadata_json TEXT NOT NULL,
                created_at_ms INTEGER NOT NULL
            )
            """
        )
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_mem_uid_time ON memories(uid, created_at_ms DESC)")
        self.conn.commit()

    def store(self, uid: str, text: str, role: str, source: str, metadata: Dict):
        text_b64 = encode_text(text)
        embedding = embed_text(text)
        self.conn.execute(
            """
            INSERT INTO memories(uid, source, role, text_b64, embedding_json, metadata_json, created_at_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (uid, source, role, text_b64, json.dumps(embedding), json.dumps(metadata or {}), now_ms()),
        )
        self.conn.commit()

    def retrieve(self, uid: str, query: str, top_k: int = 8) -> List[Dict]:
        qvec = embed_text(query)
        rows = self.conn.execute(
            "SELECT id, uid, source, role, text_b64, embedding_json, metadata_json, created_at_ms FROM memories WHERE uid=?",
            (uid,),
        ).fetchall()
        if not rows:
            return []

        newest = max(row["created_at_ms"] for row in rows)
        oldest = min(row["created_at_ms"] for row in rows)
        span = max(1, newest - oldest)

        scored = []
        for row in rows:
            emb = json.loads(row["embedding_json"])
            sim = cosine(qvec, emb)
            recency = (row["created_at_ms"] - oldest) / span
            score = (0.85 * sim) + (0.15 * recency)
            scored.append((score, sim, row))

        scored.sort(key=lambda x: x[0], reverse=True)
        out = []
        for score, sim, row in scored[: max(1, top_k)]:
            out.append(
                {
                    "id": row["id"],
                    "uid": row["uid"],
                    "source": row["source"],
                    "role": row["role"],
                    "text": decode_text(row["text_b64"]),
                    "metadata": json.loads(row["metadata_json"] or "{}"),
                    "createdAtMs": row["created_at_ms"],
                    "similarity": sim,
                    "score": score,
                }
            )
        return out


STORE = MemoryStore(DB_PATH)


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: Dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> Dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"ok": True, "service": "memory-embed", "dim": DIM, "model": EMBED_MODEL_NAME})
            return
        self._send(404, {"error": "Not found"})

    def do_POST(self):
        try:
            data = self._read_json()
            if self.path == "/encode":
                text = str(data.get("text", ""))
                self._send(200, {"encoded": encode_text(text)})
                return
            if self.path == "/decode":
                encoded = str(data.get("encoded", ""))
                self._send(200, {"text": decode_text(encoded)})
                return
            if self.path == "/embed":
                text = str(data.get("text", ""))
                self._send(200, {"embedding": embed_text(text)})
                return
            if self.path == "/store":
                uid = str(data.get("uid", "")).strip()
                text = str(data.get("text", "")).strip()
                role = str(data.get("role", "user")).strip()
                source = str(data.get("source", "chat")).strip()
                metadata = data.get("metadata", {}) or {}
                if not uid or not text:
                    self._send(400, {"error": "uid and text are required"})
                    return
                STORE.store(uid=uid, text=text, role=role, source=source, metadata=metadata)
                self._send(200, {"success": True})
                return
            if self.path == "/retrieve":
                uid = str(data.get("uid", "")).strip()
                query = str(data.get("query", "")).strip()
                top_k = int(data.get("topK", 8))
                if not uid or not query:
                    self._send(400, {"error": "uid and query are required"})
                    return
                memories = STORE.retrieve(uid=uid, query=query, top_k=top_k)
                self._send(200, {"memories": memories})
                return
            self._send(404, {"error": "Not found"})
        except Exception as exc:
            self._send(500, {"error": str(exc)})


if __name__ == "__main__":
    print(f"Starting memory service on http://{HOST}:{PORT}")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
