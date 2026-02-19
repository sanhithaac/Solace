type GeminiPart = { text: string };
type GeminiContent = { role?: string; parts: GeminiPart[] };

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 12000);
const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 0);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(errorPayload: any) {
    const details = errorPayload?.error?.details;
    if (!Array.isArray(details)) return null;
    const retryInfo = details.find((d) => d?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo");
    const retryDelay = retryInfo?.retryDelay;
    if (typeof retryDelay !== "string") return null;
    const secMatch = retryDelay.match(/^(\d+)s$/);
    if (secMatch) return Number(secMatch[1]) * 1000;
    const msMatch = retryDelay.match(/^(\d+)ms$/);
    if (msMatch) return Number(msMatch[1]);
    return null;
}

async function callGemini(contents: GeminiContent[], temperature = 0.6) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    let lastError = "Gemini request failed";

    for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

        let res: Response;
        try {
            res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature,
                        topP: 0.9,
                        maxOutputTokens: 700,
                    },
                }),
            });
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error?.name === "AbortError") {
                lastError = `Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`;
            } else {
                lastError = String(error?.message || "Gemini network error");
            }
            if (attempt < GEMINI_MAX_RETRIES) {
                await sleep(500 * (attempt + 1));
                continue;
            }
            throw new Error(lastError);
        } finally {
            clearTimeout(timeoutId);
        }

        if (!res.ok) {
            const txt = await res.text();
            let parsed: any = null;
            try {
                parsed = JSON.parse(txt);
            } catch {
                parsed = null;
            }
            const retryDelayMs = parseRetryDelayMs(parsed);
            lastError = `Gemini request failed (${res.status}): ${txt}`;

            if ((res.status === 429 || res.status >= 500) && attempt < GEMINI_MAX_RETRIES) {
                await sleep(retryDelayMs ?? 1000 * (attempt + 1));
                continue;
            }
            throw new Error(lastError);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) {
            lastError = "Gemini returned empty response";
            if (attempt < GEMINI_MAX_RETRIES) {
                await sleep(400 * (attempt + 1));
                continue;
            }
            throw new Error(lastError);
        }
        return text;
    }

    throw new Error(lastError);
}

async function callGroq(contents: GeminiContent[], temperature = 0.6) {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const messages = contents.map((c) => ({
            role: c.role || "user",
            content: c.parts.map((p) => p.text).join("\n"),
        }));

        const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                temperature,
                max_tokens: 220,
            }),
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Groq request failed (${res.status}): ${txt}`);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || "";
        if (!text) {
            throw new Error("Groq returned empty response");
        }
        return text;
    } catch (error: any) {
        if (error?.name === "AbortError") {
            throw new Error(`Groq request timed out after ${GEMINI_TIMEOUT_MS}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function callLLM(contents: GeminiContent[], temperature = 0.6) {
    try {
        return await callGroq(contents, temperature);
    } catch (groqError) {
        try {
            return await callGemini(contents, temperature);
        } catch (geminiError) {
            const gr = groqError instanceof Error ? groqError.message : String(groqError);
            const g = geminiError instanceof Error ? geminiError.message : String(geminiError);
            throw new Error(`Both Groq and Gemini failed. Groq: ${gr}; Gemini: ${g}`);
        }
    }
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
        const out = await callLLM([{ role: "user", parts: [{ text: prompt }] }], 0.1);
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
        const out = await callLLM([{ role: "user", parts: [{ text: prompt }] }], 0.2);
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
    responseLanguage?: "english" | "hindi" | "tamil" | "telugu";
}) {
    const { userText, retrievedContext, responseLanguage = "english" } = params;
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

    const languageInstruction =
        responseLanguage === "english"
            ? "Reply only in English."
            : responseLanguage === "hindi"
                ? "Reply only in Hindi (Devanagari script)."
                : responseLanguage === "tamil"
                    ? "Reply only in Tamil script."
                    : "Reply only in Telugu script.";

    const system = [
        "You are a calm, charming, emotionally intelligent friend.",
        "Use only the memories provided below as grounding context; do not invent extra past history.",
        "If no memories are provided, answer only from the current user input.",
        "Do not reveal retrieval mechanics unless asked.",
        "Keep replies crisp: 2 to 4 short sentences max, under 90 words.",
        "Sound natural and warm, not clinical, not preachy, not like a yoga instructor.",
        "Use simple language and one practical next step.",
        languageInstruction,
    ].join(" ");

    return callLLM(
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

    const raw = await callLLM([{ role: "user", parts: [{ text: prompt }] }], 0.3);
    const parsed = JSON.parse(cleanJsonBlock(raw));

    return {
        mood: String(parsed?.mood || "Reflective"),
        sentiment: String(parsed?.sentiment || "Neutral"),
        tags: Array.isArray(parsed?.tags) ? parsed.tags.map((t: unknown) => String(t).toLowerCase()) : ["journal"],
    };
}

function moodToEmoji(mood: string) {
    const m = mood.toLowerCase();
    if (m.includes("anx")) return "😰";
    if (m.includes("sad") || m.includes("heavy")) return "🌧️";
    if (m.includes("calm")) return "😌";
    if (m.includes("happy") || m.includes("optim")) return "☀️";
    if (m.includes("mixed")) return "⛅";
    return "📝";
}

export async function analyzeJournalInsights(content: string) {
    const prompt = [
        "You are a kind, emotionally intelligent friend.",
        "Analyze this journal and return STRICT JSON only.",
        "Return keys exactly:",
        "{",
        '  "mood": "short label",',
        '  "emoji": "single emoji",',
        '  "sentiment": "Very Positive|Positive|Neutral|Mixed|Negative",',
        '  "score": number_from_1_to_10,',
        '  "summary": "one concise sentence",',
        '  "clinicalInsight": "one practical observation in plain language",',
        '  "positiveReframing": "one supportive reframe",',
        '  "suggestions": ["3 short actionable suggestions"],',
        '  "tags": ["3 to 6 lowercase_snake_case tags"]',
        "}",
        "No markdown. No extra text.",
        `Journal:\n${content}`,
    ].join("\n");

    try {
        const raw = await callLLM([{ role: "user", parts: [{ text: prompt }] }], 0.3);
        const parsed = extractJson(raw) || {};

        return {
            mood: String(parsed?.mood || "Reflective"),
            emoji: String(parsed?.emoji || moodToEmoji(String(parsed?.mood || "Reflective"))),
            sentiment: String(parsed?.sentiment || "Neutral"),
            score: Number(parsed?.score || 5),
            summary: String(parsed?.summary || "You showed up and reflected honestly."),
            clinicalInsight: String(parsed?.clinicalInsight || "Your writing suggests emotional load that can be reduced with smaller, focused steps."),
            positiveReframing: String(parsed?.positiveReframing || "You are handling a hard moment with courage."),
            suggestions: Array.isArray(parsed?.suggestions)
                ? parsed.suggestions.map((s: unknown) => String(s)).slice(0, 4)
                : ["Take 5 slow breaths", "Drink water", "Do one small next step"],
            tags: Array.isArray(parsed?.tags)
                ? parsed.tags.map((t: unknown) => String(t).toLowerCase())
                : ["journal", "reflection", "support"],
        };
    } catch {
        const base = await analyzeJournal(content).catch(() => ({ mood: "Reflective", sentiment: "Neutral", tags: ["journal"] }));
        return {
            mood: base.mood,
            emoji: moodToEmoji(base.mood),
            sentiment: base.sentiment,
            score: 5,
            summary: "You expressed your thoughts clearly and that matters.",
            clinicalInsight: "There may be some pressure building up; gentle structure can help.",
            positiveReframing: "You are not stuck, you are processing.",
            suggestions: ["Take a short walk", "Write one priority for tomorrow", "Reach out to one trusted person"],
            tags: base.tags,
        };
    }
}
