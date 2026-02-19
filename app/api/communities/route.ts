import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Community from "@/models/Community";
import User from "@/models/User";

// GET /api/communities — Fetch all communities
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const uid = searchParams.get("uid");

        const query: any = {};
        if (category && category !== "All") query.category = category;

        const communities = await Community.find(query).sort({ memberCount: -1 });

        // Add `joined` flag for the current user
        const results = communities.map((c) => ({
            _id: c._id,
            name: c.name,
            description: c.description,
            category: c.category,
            icon: c.icon,
            memberCount: c.memberCount,
            joined: uid ? c.members.includes(uid) : false,
            createdAt: c.createdAt,
        }));

        return NextResponse.json({ communities: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/communities — Create a new community
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, name, description, category, icon } = await request.json();

        if (!uid || !name) {
            return NextResponse.json({ error: "Missing uid or name" }, { status: 400 });
        }

        // Check duplicate
        const exists = await Community.findOne({ name });
        if (exists) return NextResponse.json({ error: "Community already exists" }, { status: 409 });

        const community = new Community({
            name,
            description: description || "",
            category: category || "General",
            icon: icon || "🌐",
            members: [uid],
            memberCount: 1,
            createdBy: uid,
        });
        await community.save();

        // Award XP
        await User.findOneAndUpdate({ uid }, { $inc: { xp: 25 } });

        return NextResponse.json({ success: true, community });
    } catch (error: any) {
        console.error("Community Create Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/communities — Join/Leave a community
export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { communityId, uid, action } = await request.json(); // action: "join" | "leave"

        if (!communityId || !uid || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const community = await Community.findById(communityId);
        if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

        if (action === "join") {
            if (!community.members.includes(uid)) {
                community.members.push(uid);
                community.memberCount = community.members.length;
                await community.save();
                // Award XP for joining
                await User.findOneAndUpdate({ uid }, { $inc: { xp: 10 } });
            }
        } else if (action === "leave") {
            community.members = community.members.filter((id: string) => id !== uid);
            community.memberCount = community.members.length;
            await community.save();
        }

        return NextResponse.json({
            success: true,
            joined: community.members.includes(uid),
            memberCount: community.memberCount,
        });
    } catch (error: any) {
        console.error("Community Join/Leave Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
