import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import MoodLog from "@/models/MoodLog";

// Map all mood labels → intensity level (0-4)
const moodLevels: Record<string, number> = {
    Great: 4, Happy: 4,
    Good: 3, Calm: 3,
    Okay: 2, Tired: 2, Nauseous: 2, Dizzy: 2,
    Low: 1, Sad: 1, Angry: 1, Anxious: 1,
};

// Map mood labels → display color
const moodColors: Record<string, string> = {
    Great: "#4caf7c", Happy: "#e8729a",
    Good: "#6bdb8e", Calm: "#7ec8e3",
    Okay: "#f0c35a", Tired: "#9e9e9e", Nauseous: "#8bc34a", Dizzy: "#b39ddb",
    Low: "#e8a830", Sad: "#ef6b6b", Angry: "#d94f4f", Anxious: "#e88a30",
};

// GET /api/heatmap?uid=xxx — Fetch mood data for heatmap (last 365 days)
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ data: [] });

        // Full calendar year: Jan 1 → Dec 31 of current year
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1); // Jan 1
        const yearEnd = new Date(now.getFullYear(), 11, 31); // Dec 31

        const logs = await MoodLog.find({
            uid,
            $or: [
                { date: { $gte: yearStart.toISOString().split("T")[0], $lte: yearEnd.toISOString().split("T")[0] } },
                { createdAt: { $gte: yearStart, $lte: yearEnd } },
            ],
        }).sort({ createdAt: 1 });

        // Build a map keyed by date string
        const dateMap: Record<string, { level: number; mood: string; color: string }> = {};
        for (const log of logs) {
            const dateKey = log.date || new Date(log.createdAt).toISOString().split("T")[0];
            dateMap[dateKey] = {
                level: moodLevels[log.mood] ?? 2,
                mood: log.mood || "Okay",
                color: moodColors[log.mood] || "#c76d85",
            };
        }

        // Generate every day from Jan 1 → Dec 31
        const data = [];
        const cursor = new Date(yearStart);
        while (cursor <= yearEnd) {
            const dateKey = cursor.toISOString().split("T")[0];
            if (dateMap[dateKey]) {
                data.push({ date: dateKey, ...dateMap[dateKey] });
            } else {
                data.push({ date: dateKey, level: -1, mood: "", color: "" });
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Heatmap API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
