type GeminiPart = { text: string };
type GeminiContent = { role?: string; parts: GeminiPart[] };

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(contents: GeminiContent[], temperature = 0.6) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents,
            generationConfig: {
                temperature,
                topP: 0.9,
                maxOutputTokens: 700,
            },
        }),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Gemini request failed (${res.status}): ${txt}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
        throw new Error("Gemini returned empty response");
    }
    return text;
}

function cleanJsonBlock(raw: string) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("```")) {
        return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
    }
    return trimmed;
}

function extractJson(raw: string) {
    const cleaned = cleanJsonBlock(raw);
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
}

export async function classifyRisk(text: string) {
    const prompt = [
        "Analyze the following message for mental health risk.",
        `Message: "${text}"`,
        "Respond ONLY with one of: safe, emotional_distress, self_harm_risk, suicide_risk.",
    ].join("\n");

    try {
        const out = await callGemini([{ role: "user", parts: [{ text: prompt }] }], 0.1);
        const value = out.trim().toLowerCase();
        const valid = ["safe", "emotional_distress", "self_harm_risk", "suicide_risk"];
        return valid.includes(value) ? value : "safe";
    } catch {
        return "safe";
    }
}

export async function shouldExtractMemory(text: string) {
    const prompt = [
        "Determine if this message should be remembered as long-term support context.",
        `Message: "${text}"`,
        "If yes return JSON:",
        '{"shouldRemember": true, "memoryType": "emotion|recurring_theme|preference|life_context", "summary": "brief factual summary"}',
        "If no return JSON:",
        '{"shouldRemember": false}',
        "Return JSON only.",
    ].join("\n");

    try {
        const out = await callGemini([{ role: "user", parts: [{ text: prompt }] }], 0.2);
        const parsed = extractJson(out);
        if (!parsed || !parsed.shouldRemember) return { shouldRemember: false };
        return {
            shouldRemember: true,
            memoryType: String(parsed.memoryType || "life_context"),
            summary: String(parsed.summary || ""),
        };
    } catch {
        return { shouldRemember: false };
    }
}

export async function generateChatReply(params: {
    userText: string;
    retrievedContext: Array<{ source: string; role: string; text: string; similarity: number; createdAtMs: number }>;
}) {
    const { userText, retrievedContext } = params;
    const contextText =
        retrievedContext.length > 0
            ? retrievedContext
                .map(
                    (m, i) =>
                        `[Memory ${i + 1}] source=${m.source}; role=${m.role}; similarity=${m.similarity.toFixed(
                            3
                        )}; text=${m.text}`
                )
                .join("\n")
            : "NO_RELEVANT_MEMORY";

    const system = [
        "You are an empathetic mental wellness assistant.",
        "Use only the memories provided below as grounding context; do not invent extra past history.",
        "If no memories are provided, answer only from the current user input.",
        "Do not reveal retrieval mechanics unless asked.",
        "Be concise, supportive, and actionable.",
    ].join(" ");

    return callGemini(
        [
            { role: "user", parts: [{ text: `${system}\n\nRetrieved Memories:\n${contextText}\n\nCurrent User Input:\n${userText}` }] },
        ],
        0.65
    );
}

export async function analyzeJournal(content: string) {
    const prompt = [
        "Analyze this journal entry and return strict JSON.",
        "Keys: mood, sentiment, tags.",
        "mood: short label like Calm/Anxious/Reflective/Overwhelmed/Hopeful.",
        "sentiment: one of Very Positive, Positive, Neutral, Mixed, Negative.",
        "tags: array of 3 to 6 lowercase snake_case tags.",
        "Return ONLY valid JSON. No markdown.",
        `Journal:\n${content}`,
    ].join("\n");

    const raw = await callGemini([{ role: "user", parts: [{ text: prompt }] }], 0.3);
    const parsed = JSON.parse(cleanJsonBlock(raw));

    return {
        mood: String(parsed?.mood || "Reflective"),
        sentiment: String(parsed?.sentiment || "Neutral"),
        tags: Array.isArray(parsed?.tags) ? parsed.tags.map((t: unknown) => String(t).toLowerCase()) : ["journal"],
    };
}
