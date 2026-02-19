import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { buildRagReply, retrieveMemories, storeMemory } from "@/lib/ragMemory";
import { classifyRisk, generateChatReply, shouldExtractMemory } from "@/lib/gemini";

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

        // 3. RAG retrieval (top 8 per user) from python memory service
        const memories = await retrieveMemories({ uid, query: text, topK: 8 });
        const risk = await classifyRisk(text);
        const memoryDecision = await shouldExtractMemory(text);

        // 4. Build grounded response via Gemini (fallback to local builder)
        let aiText = "";
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
