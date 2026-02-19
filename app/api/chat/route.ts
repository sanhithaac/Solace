import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

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

        // 2. Add user message
        conversation.messages.push({ role: "user", text });

        // 3. Simple AI logic (Replace with real LLM API call if needed)
        const aiResponses = [
            "I hear you, and your feelings are completely valid. Let's take a moment to breathe. Would you like a grounding exercise?",
            "That sounds like a lot to carry. Remember, it's okay to not be okay. Want some coping strategies?",
            "Thank you for sharing that. Your honesty takes courage. Let's explore what might help.",
            "I understand how that can feel overwhelming. Let's break it down into smaller steps. Want to try?",
        ];
        const aiText = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        // 4. Add AI response
        conversation.messages.push({ role: "ai", text: aiText });
        conversation.lastInteraction = new Date();

        // 5. Save to MongoDB
        await conversation.save();

        return NextResponse.json({
            success: true,
            aiMessage: { role: "ai", text: aiText, timestamp: new Date() }
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
