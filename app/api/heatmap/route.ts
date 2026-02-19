import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";

// GET /api/heatmap?uid=xxx — Fetch mood data for heatmap (last 365 days)
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ data: [] });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const logs = await MoodLog.find({
            uid,
            createdAt: { $gte: oneYearAgo },
        }).sort({ createdAt: 1 });

        // Map mood labels to levels
        const moodLevels: Record<string, number> = {
            "Great": 4, "Good": 3, "Okay": 2, "Low": 1, "Sad": 0,
            "Angry": 0, "Anxious": 1, "Tired": 1,
        };
        const moodEmojis: Record<string, string> = {
            "Great": "😄", "Good": "😊", "Okay": "😐", "Low": "😔", "Sad": "😢",
            "Angry": "😤", "Anxious": "😰", "Tired": "😴",
        };

        // Build a map keyed by date string
        const dateMap: Record<string, { level: number; mood: string }> = {};
        for (const log of logs) {
            const dateKey = new Date(log.createdAt).toISOString().split("T")[0];
            dateMap[dateKey] = {
                level: moodLevels[log.mood] ?? 2,
                mood: moodEmojis[log.mood] || log.icon || "😐",
            };
        }

        // Generate full year of data
        const data = [];
        const now = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split("T")[0];
            if (dateMap[dateKey]) {
                data.push({ date: dateKey, ...dateMap[dateKey] });
            } else {
                data.push({ date: dateKey, level: -1, mood: "" }); // No log
            }
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Heatmap API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
