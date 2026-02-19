import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { buildRagReply, retrieveMemories, storeMemory } from "@/lib/ragMemory";
import { generateChatReply } from "@/lib/gemini";

function isHighRiskText(text: string) {
    const value = text.toLowerCase();
    const patterns = [
        "i want to die",
        "i wanna die",
        "kill myself",
        "end my life",
        "suicide",
        "self harm",
        "hurt myself",
        "not safe",
    ];
    return patterns.some((p) => value.includes(p));
}

function inferRiskFromText(text: string) {
    const value = text.toLowerCase();
    if (isHighRiskText(text)) return "suicide_risk";
    if (value.includes("self harm") || value.includes("hurt myself")) return "self_harm_risk";
    const distressTerms = ["panic", "anxious", "hopeless", "overwhelmed", "can't cope", "cant cope", "breakdown"];
    if (distressTerms.some((t) => value.includes(t))) return "emotional_distress";
    return "safe";
}

function inferMemoryDecision(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 35) return { shouldRemember: false };
    const lowered = trimmed.toLowerCase();
    if (
        lowered.includes("i am") ||
        lowered.includes("i feel") ||
        lowered.includes("my family") ||
        lowered.includes("my work") ||
        lowered.includes("always")
    ) {
        return {
            shouldRemember: true,
            memoryType: "life_context",
            summary: trimmed.slice(0, 180),
        };
    }
    return { shouldRemember: false };
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ messages: [] });

        const conversation = await Conversation.findOne({ uid });
        return NextResponse.json({ messages: conversation?.messages || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, text } = await request.json();

        if (!uid || !text) {
            return NextResponse.json({ error: "Missing uid or text" }, { status: 400 });
        }

        // 1. Get Conversation or create new one
        let conversation = await Conversation.findOne({ uid });
        if (!conversation) {
            conversation = new Conversation({ uid, messages: [] });
        }

        // 2. Add user message in local conversation history
        conversation.messages.push({ role: "user", text });

        // 3. RAG retrieval + risk + memory extraction
        const [memories] = await Promise.all([retrieveMemories({ uid, query: text, topK: 8 })]);
        const risk = inferRiskFromText(text);
        const memoryDecision = inferMemoryDecision(text);

        // 4. Build grounded response via Gemini (fallback to local builder)
        let aiText = "";
        if (risk === "self_harm_risk" || risk === "suicide_risk") {
            aiText =
                "I'm really glad you told me. If you're in immediate danger, call or text 988 right now (U.S.). " +
                "If you can, please reach out to someone you trust and stay with them while you get support. " +
                "I'm here with you, and we can take this one step at a time.";
        } else {
            try {
                aiText = await generateChatReply({
                    userText: text,
                    retrievedContext: memories.map((m) => ({
                        source: m.source,
                        role: m.role,
                        text: m.text,
                        similarity: m.similarity,
                        createdAtMs: m.createdAtMs,
                    })),
                });
            } catch (err) {
                console.error("Gemini chat fallback:", err);
                aiText = buildRagReply(text, memories);
            }
        }

        // 5. Add AI response to local conversation history
        conversation.messages.push({ role: "ai", text: aiText });
        conversation.lastInteraction = new Date();

        // 6. Save to MongoDB
        await conversation.save();

        // 7. Persist user+assistant turns into python semantic memory service
        await storeMemory({
            uid,
            text,
            role: "user",
            source: "chat",
            metadata: {
                conversation: "default",
                risk,
                shouldRemember: memoryDecision.shouldRemember,
                memoryType: memoryDecision.shouldRemember ? memoryDecision.memoryType : "",
                summary: memoryDecision.shouldRemember ? memoryDecision.summary : "",
            },
        });
        await storeMemory({
            uid,
            text: aiText,
            role: "assistant",
            source: "chat",
            metadata: { conversation: "default" },
        });

        return NextResponse.json({
            success: true,
            aiMessage: { role: "ai", text: aiText, timestamp: new Date() },
            retrievedCount: memories.length,
            risk,
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
