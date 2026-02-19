import { NextResponse } from "next/server";
import { analyzeJournalInsights } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        if (!content || !String(content).trim()) {
            return NextResponse.json({ error: "Missing content" }, { status: 400 });
        }

        const analysis = await analyzeJournalInsights(String(content));
        return NextResponse.json({ success: true, analysis });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
    }
}
