#!/usr/bin/env python3
import base64
import json
import math
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Dict, List
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient, ASCENDING, DESCENDING

HOST = "127.0.0.1"
PORT = 8001
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "solace")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "memories")

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
    def __init__(self, uri: str, db_name: str, collection_name: str):
        self.client = MongoClient(uri)
        self.collection = self.client[db_name][collection_name]
        self._init()

    def _init(self):
        self.collection.create_index([("uid", ASCENDING), ("created_at_ms", DESCENDING)])

    def store(self, uid: str, text: str, role: str, source: str, metadata: Dict):
        embedding = embed_text(text)
        self.collection.insert_one(
            {
                "uid": uid,
                "source": source,
                "role": role,
                "text": text,
                "embedding": embedding,
                "metadata": metadata or {},
                "created_at_ms": now_ms(),
            }
        )

    def retrieve(self, uid: str, query: str, top_k: int = 8) -> List[Dict]:
        qvec = embed_text(query)
        rows = list(self.collection.find({"uid": uid}))
        if not rows:
            return []

        newest = max(row.get("created_at_ms", 0) for row in rows)
        oldest = min(row.get("created_at_ms", 0) for row in rows)
        span = max(1, newest - oldest)

        scored = []
        for row in rows:
            emb = row.get("embedding", [])
            sim = cosine(qvec, emb)
            recency = (row.get("created_at_ms", 0) - oldest) / span
            score = (0.85 * sim) + (0.15 * recency)
            scored.append((score, sim, row))

        scored.sort(key=lambda x: x[0], reverse=True)
        out = []
        for score, sim, row in scored[: max(1, top_k)]:
            out.append(
                {
                    "id": str(row.get("_id")),
                    "uid": row.get("uid"),
                    "source": row.get("source"),
                    "role": row.get("role"),
                    "text": row.get("text", ""),
                    "metadata": row.get("metadata", {}),
                    "createdAtMs": row.get("created_at_ms"),
                    "similarity": sim,
                    "score": score,
                }
            )
        return out


STORE = MemoryStore(MONGODB_URI, MONGODB_DB, MONGODB_COLLECTION)


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
