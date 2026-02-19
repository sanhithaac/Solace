import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import MoodLog from "@/models/MoodLog";
import JournalEntry from "@/models/JournalEntry";
import Todo from "@/models/Todo";
import PomodoroSession from "@/models/PomodoroSession";
export const dynamic = "force-dynamic";

// GET /api/profile?uid=xxx — Fetch user profile with real stats
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

        const user = await User.findOne({ uid });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Gather stats in parallel
        const [journalCount, moodCount, todosDone, todosTotal, pomodoroSessions] = await Promise.all([
            JournalEntry.countDocuments({ uid }),
            MoodLog.countDocuments({ uid }),
            Todo.countDocuments({ uid, completed: true }),
            Todo.countDocuments({ uid }),
            PomodoroSession.countDocuments({ uid, completed: true }),
        ]);

        // Calculate level from XP
        const xp = user.xp || 0;
        const level = Math.floor(xp / 100) + 1;
        const xpInLevel = xp % 100;
        const xpForNext = 100;

        // Level titles
        const titles: Record<number, string> = {
            1: "Newcomer", 2: "Beginner", 3: "Learner", 4: "Explorer",
            5: "Practitioner", 6: "Achiever", 7: "Mindful Explorer",
            8: "Wellness Seeker", 9: "Inner Warrior", 10: "Wellness Warrior",
        };
        const title = titles[Math.min(level, 10)] || "Enlightened Soul";

        return NextResponse.json({
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Anonymous User",
                photoURL: user.photoURL,
                mode: user.mode,
                xp,
                level,
                xpInLevel,
                xpForNext,
                title,
                createdAt: user.createdAt,
            },
            stats: {
                journalEntries: journalCount,
                moodLogs: moodCount,
                todosDone,
                todosTotal,
                pomodoroSessions,
            },
        });
    } catch (error: any) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/profile — Update user profile (mode, displayName, etc.)
export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { uid, displayName, mode } = await request.json();

        if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (mode !== undefined) updateData.mode = mode;

        const user = await User.findOneAndUpdate({ uid }, updateData, { new: true });
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
