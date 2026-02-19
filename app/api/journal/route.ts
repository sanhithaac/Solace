import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import User from "@/models/User";
import { storeMemory } from "@/lib/ragMemory";
import { analyzeJournal } from "@/lib/gemini";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ entries: [] });

        const entries = await JournalEntry.find({ uid }).sort({ createdAt: -1 });
        return NextResponse.json({ entries });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, title, content, mood, tags } = await request.json();

        if (!uid || !content) {
            return NextResponse.json({ error: "Missing uid or content" }, { status: 400 });
        }

        // 1. AI analyze journal using Gemini (fallback if unavailable)
        let derivedMood = mood || "Reflective";
        let derivedSentiment = "Neutral";
        let derivedTags = Array.isArray(tags) && tags.length ? tags : ["journal"];

        try {
            const analysis = await analyzeJournal(content);
            derivedMood = analysis.mood || derivedMood;
            derivedSentiment = analysis.sentiment || derivedSentiment;
            if (analysis.tags?.length) derivedTags = analysis.tags;
        } catch (err) {
            console.error("Gemini journal fallback:", err);
            derivedSentiment = content.length > 100 ? "Positive" : "Neutral";
        }

        // 2. Create entry
        const entry = new JournalEntry({
            uid,
            title: title || "Untitled Entry",
            content,
            mood: derivedMood,
            tags: derivedTags,
            sentiment: derivedSentiment,
        });

        await entry.save();

        // 3. Award XP to User in MongoDB
        await User.findOneAndUpdate(
            { uid },
            { $inc: { xp: 50 } } // +50 XP for journaling
        );

        // 4. Persist journal entry in semantic memory service
        const journalPayload = `${title || "Untitled Entry"}\n${content}`;
        await storeMemory({
            uid,
            text: journalPayload,
            role: "user",
            source: "journal",
            metadata: {
                journalEntryId: entry._id?.toString?.() || "",
                mood: derivedMood,
                sentiment: derivedSentiment,
                tags: derivedTags,
            },
        });

        return NextResponse.json({ success: true, entry });
    } catch (error: any) {
        console.error("Journal API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const { id } = await request.json();

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await JournalEntry.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Journal Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
