import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PomodoroSession from "@/models/PomodoroSession";
import User from "@/models/User";
export const dynamic = "force-dynamic";

// GET /api/pomodoro?uid=xxx — Fetch pomodoro stats
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ sessions: [], stats: {} });

        // Get today's sessions
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [allSessions, todaySessions] = await Promise.all([
            PomodoroSession.find({ uid, completed: true }).sort({ createdAt: -1 }).limit(50),
            PomodoroSession.find({ uid, completed: true, createdAt: { $gte: todayStart } }),
        ]);

        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
        const totalSessions = allSessions.length;
        const todayCount = todaySessions.length;

        return NextResponse.json({
            sessions: allSessions,
            stats: {
                todayMinutes,
                todayCount,
                totalMinutes,
                totalSessions,
            },
        });
    } catch (error: any) {
        console.error("Pomodoro GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/pomodoro — Log a completed pomodoro session
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, duration, type } = await request.json();

        if (!uid || !duration) {
            return NextResponse.json({ error: "Missing uid or duration" }, { status: 400 });
        }

        const session = new PomodoroSession({
            uid,
            duration,
            type: type || "focus",
            completed: true,
        });
        await session.save();

        // Award XP based on duration
        const xpGain = duration >= 45 ? 30 : duration >= 25 ? 20 : 10;
        await User.findOneAndUpdate({ uid }, { $inc: { xp: xpGain } });

        return NextResponse.json({ success: true, session, xpGain });
    } catch (error: any) {
        console.error("Pomodoro POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
