import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";
import User from "@/models/User";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ logs: [] });

        const logs = await MoodLog.find({ uid }).sort({ createdAt: -1 }).limit(30);
        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, mood, icon, note, period } = await request.json();

        if (!uid || !mood || !icon) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const log = new MoodLog({ uid, mood, icon, note, period });
        await log.save();

        // Award XP
        await User.findOneAndUpdate({ uid }, { $inc: { xp: 20 } });

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        console.error("Mood API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
