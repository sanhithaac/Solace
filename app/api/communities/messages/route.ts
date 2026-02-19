import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Community from "@/models/Community";
import CommunityThread from "@/models/CommunityThread";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const communityId = searchParams.get("communityId");

        if (!communityId) {
            return NextResponse.json({ error: "Missing communityId" }, { status: 400 });
        }

        const thread = await CommunityThread.findOne({ communityId }).lean();
        return NextResponse.json({ messages: thread?.messages || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { communityId, uid, text, userLabel, role } = await request.json();

        if (!communityId || !uid || !text) {
            return NextResponse.json({ error: "Missing communityId, uid, or text" }, { status: 400 });
        }

        const community = await Community.findById(communityId).select("_id");
        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        const safeRole = role === "doctor" ? "doctor" : "user";
        const message = {
            uid,
            userLabel: userLabel || "Anonymous Member",
            role: safeRole,
            text: String(text).trim(),
            createdAt: new Date(),
        };

        const thread = await CommunityThread.findOneAndUpdate(
            { communityId },
            { $setOnInsert: { communityId }, $push: { messages: message } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const saved = thread.messages[thread.messages.length - 1];
        return NextResponse.json({ success: true, message: saved });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
