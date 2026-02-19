import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StoryContent from "@/models/StoryContent";
import { ensureStoriesSeeded } from "@/lib/storiesSeed";
export const dynamic = "force-dynamic";

function getDayOfYear(date: Date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

export async function GET(request: Request) {
    await connectToDatabase();
    await ensureStoriesSeeded();

    const { searchParams } = new URL(request.url);
    const limitRaw = Number(searchParams.get("limit") || 150);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 150)) : 150;

    const quotes = await StoryContent.find({ kind: "quote" })
        .sort({ sortOrder: 1 })
        .limit(limit)
        .lean();

    const dayIndex = getDayOfYear(new Date()) % Math.max(1, quotes.length);
    const quoteOfDay = quotes[dayIndex];

    return NextResponse.json({
        success: true,
        total: quotes.length,
        quoteOfDay,
        quotes: quotes.map((q) => ({
            id: Number(q.sortOrder),
            quote: String(q.quote || ""),
            author: String(q.author || "Unknown"),
        })),
    });
}

