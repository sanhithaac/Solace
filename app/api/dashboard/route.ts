import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import MoodLog from "@/models/MoodLog";
import JournalEntry from "@/models/JournalEntry";
import Todo from "@/models/Todo";
import PomodoroSession from "@/models/PomodoroSession";

// GET /api/dashboard?uid=xxx — Aggregated overview data
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Parallel fetches
        const [
            user,
            moodLogs,
            weekMoodLogs,
            journalCount,
            weekJournalCount,
            todosDone,
            todosTotal,
            todayPomodoro,
            recentJournals,
            recentMoods,
        ] = await Promise.all([
            User.findOne({ uid }),
            MoodLog.countDocuments({ uid }),
            MoodLog.countDocuments({ uid, createdAt: { $gte: weekAgo } }),
            JournalEntry.countDocuments({ uid }),
            JournalEntry.countDocuments({ uid, createdAt: { $gte: weekAgo } }),
            Todo.countDocuments({ uid, completed: true }),
            Todo.countDocuments({ uid }),
            PomodoroSession.find({ uid, completed: true, createdAt: { $gte: todayStart } }),
            JournalEntry.find({ uid }).sort({ createdAt: -1 }).limit(3),
            MoodLog.find({ uid }).sort({ createdAt: -1 }).limit(3),
        ]);

        const focusMinutesToday = todayPomodoro.reduce((sum, s) => sum + s.duration, 0);
        const focusHours = Math.floor(focusMinutesToday / 60);
        const focusMins = focusMinutesToday % 60;

        // Calculate mood streak (consecutive days with a mood log)
        const allMoodLogs = await MoodLog.find({ uid }).sort({ createdAt: -1 }).limit(60);
        let streak = 0;
        const checkDate = new Date();
        for (let i = 0; i < 60; i++) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const hasLog = allMoodLogs.some(
                (log) => new Date(log.createdAt).toISOString().split("T")[0] === dateStr
            );
            if (hasLog) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Build recent activity
        const activity: any[] = [];
        for (const j of recentJournals) {
            activity.push({
                type: "journal",
                text: `Wrote "${j.title}"`,
                time: j.createdAt,
                mood: "📝",
            });
        }
        for (const m of recentMoods) {
            activity.push({
                type: "mood",
                text: `Logged mood: ${m.mood}`,
                time: m.createdAt,
                mood: m.icon || "😊",
            });
        }
        // Sort by time descending
        activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Format time ago
        const timeAgo = (date: Date) => {
            const diff = Date.now() - new Date(date).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            const days = Math.floor(hrs / 24);
            return `${days}d ago`;
        };

        return NextResponse.json({
            quickStats: [
                {
                    label: "Mood Streak",
                    value: `${streak} day${streak !== 1 ? "s" : ""}`,
                    icon: "🔥",
                    delta: `${weekMoodLogs} this week`,
                },
                {
                    label: "Journal Entries",
                    value: journalCount.toString(),
                    icon: "📝",
                    delta: `+${weekJournalCount} this week`,
                },
                {
                    label: "Tasks Done",
                    value: `${todosDone}/${todosTotal}`,
                    icon: "✅",
                    delta: todosTotal > 0 ? `${Math.round((todosDone / todosTotal) * 100)}%` : "0%",
                },
                {
                    label: "Focus Time",
                    value: focusMinutesToday > 0 ? `${focusHours}h ${focusMins}m` : "0m",
                    icon: "⏱️",
                    delta: "Today",
                },
            ],
            recentActivity: activity.slice(0, 5).map((a) => ({
                ...a,
                time: timeAgo(a.time),
            })),
            user: user
                ? {
                    displayName: user.displayName || "User",
                    xp: user.xp || 0,
                    level: Math.floor((user.xp || 0) / 100) + 1,
                }
                : null,
        });
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
