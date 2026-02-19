type StoredMemory = {
    id: string;
    uid: string;
    source: string;
    role: string;
    text: string;
    metadata: Record<string, unknown>;
    createdAtMs: number;
    similarity: number;
    score: number;
};

const BASE_URL = process.env.PY_EMBEDDING_SERVICE_URL || "http://127.0.0.1:8001";

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
}

export async function storeMemory(params: {
    uid: string;
    text: string;
    role: "user" | "assistant";
    source: "chat" | "journal";
    metadata?: Record<string, unknown>;
}) {
    if (!params.uid || !params.text) return;
    await postJson("/store", {
        uid: params.uid,
        text: params.text,
        role: params.role,
        source: params.source,
        metadata: params.metadata || {},
    });
}

export async function retrieveMemories(params: { uid: string; query: string; topK?: number }) {
    if (!params.uid || !params.query) return [] as StoredMemory[];

    // Route query through python encode/decode pipeline before retrieval.
    // This keeps preprocessing centralized in the memory service.
    const encoded = await postJson<{ encoded: string }>("/encode", { text: params.query });
    const decoded = encoded?.encoded
        ? await postJson<{ text: string }>("/decode", { encoded: encoded.encoded })
        : null;
    const normalizedQuery = decoded?.text || params.query;

    const data = await postJson<{ memories: StoredMemory[] }>("/retrieve", {
        uid: params.uid,
        query: normalizedQuery,
        topK: params.topK ?? 8,
    });
    return data?.memories || [];
}

export function buildRagReply(userText: string, memories: StoredMemory[]) {
    const trimmed = userText.trim();
    if (!memories.length) {
        return `I hear you, and I’m with you. Want to pick one tiny step for the next 10 minutes so this feels lighter?`;
    }

    const top = memories.slice(0, 3);
    const recap = top.map((m) => m.text).join(" ");
    const hints = [];
    if (/anx|panic|overwhelm|stress/i.test(trimmed + " " + recap)) {
        hints.push("Take 4 slow breaths: inhale 4, exhale 6.");
    }
    if (/tired|sleep|exhaust|burnout/i.test(trimmed + " " + recap)) {
        hints.push("Protect one 20-minute recovery block today.");
    }
    if (/alone|lonely|nobody/i.test(trimmed + " " + recap)) {
        hints.push("Reach one trusted person with a short check-in message.");
    }
    if (!hints.length) {
        hints.push("Choose one tiny action you can complete in 10 minutes.");
    }

    return `I hear you, and this sounds familiar from what you've been carrying lately. Try this now: ${hints[0]} If you want, I can help you map one small plan for the next hour.`;
}
