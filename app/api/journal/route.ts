import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import User from "@/models/User";

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

        // 1. Create entry
        const entry = new JournalEntry({
            uid,
            title: title || "Untitled Entry",
            content,
            mood,
            tags: tags || [],
            // Simple sentiment mockup
            sentiment: content.length > 100 ? "Positive" : "Neutral"
        });

        await entry.save();

        // 2. Award XP to User in MongoDB
        await User.findOneAndUpdate(
            { uid },
            { $inc: { xp: 50 } } // +50 XP for journaling
        );

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
