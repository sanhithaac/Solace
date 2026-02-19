import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StoryContent from "@/models/StoryContent";
import { ensureStoriesSeeded } from "@/lib/storiesSeed";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    await connectToDatabase();
    await ensureStoriesSeeded();

    const { searchParams } = new URL(request.url);
    const limitRaw = Number(searchParams.get("limit") || 100);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 100;

    const stories = await StoryContent.find({ kind: "success" })
        .sort({ sortOrder: 1 })
        .limit(limit)
        .lean();

    return NextResponse.json({
        success: true,
        total: stories.length,
        stories: stories.map((s) => ({
            id: Number(s.sortOrder),
            title: String(s.title || ""),
            excerpt: String(s.excerpt || ""),
            author: String(s.author || "Anonymous"),
            emoji: String(s.emoji || "✨"),
            category: String(s.category || "Growth"),
            publishedLabel: String(s.publishedLabel || "Recent"),
        })),
    });
}
