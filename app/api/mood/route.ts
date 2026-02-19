import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";
import User from "@/models/User";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");
        const month = searchParams.get("month"); // "YYYY-MM" for calendar view

        if (!uid) return NextResponse.json({ logs: [] });

        if (month) {
            // Calendar view: get all logs for a given month
            const startDate = `${month}-01`;
            const [y, m] = month.split("-").map(Number);
            const endDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
            const logs = await MoodLog.find({
                uid,
                date: { $gte: startDate, $lt: m === 12 ? `${y + 1}-01-01` : endDate },
            }).sort({ date: 1 });
            return NextResponse.json({ logs });
        }

        // Default: last 60 logs
        const logs = await MoodLog.find({ uid }).sort({ createdAt: -1 }).limit(60);
        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, mood, icon, note, period, flow, symptoms, date } = await request.json();

        if (!uid || !mood || !icon) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const logDate = date || new Date().toISOString().split("T")[0];

        // Upsert: one log per day per user
        const log = await MoodLog.findOneAndUpdate(
            { uid, date: logDate },
            { uid, mood, icon, note, period: period || false, flow: flow || "", symptoms: symptoms || [], date: logDate },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Award XP
        await User.findOneAndUpdate({ uid }, { $inc: { xp: 20 } });

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        console.error("Mood API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a specific mood log
export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const uid = searchParams.get("uid");

        if (!id || !uid) return NextResponse.json({ error: "Missing id or uid" }, { status: 400 });

        await MoodLog.findOneAndDelete({ _id: id, uid });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
