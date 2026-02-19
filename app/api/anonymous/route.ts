import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AnonymousPost from "@/models/AnonymousPost";
import User from "@/models/User";

// GET /api/anonymous — Fetch all anonymous posts (newest first)
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get("tag");

        const query: any = {};
        if (tag) query.tags = tag;

        const posts = await AnonymousPost.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .select("-uid"); // Never expose uid for anonymity

        return NextResponse.json({ posts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/anonymous — Create a new anonymous post
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, content, tags } = await request.json();

        if (!uid || !content) {
            return NextResponse.json({ error: "Missing uid or content" }, { status: 400 });
        }

        const post = new AnonymousPost({
            uid,
            content,
            tags: tags || [],
        });
        await post.save();

        // Award XP
        await User.findOneAndUpdate({ uid }, { $inc: { xp: 15 } });

        // Return post without uid
        const safePost = post.toObject();
        delete safePost.uid;

        return NextResponse.json({ success: true, post: safePost });
    } catch (error: any) {
        console.error("Anonymous Post Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/anonymous — React to a post (heart/hug)
export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { postId, uid, reaction } = await request.json(); // reaction: "heart" | "hug"

        if (!postId || !uid || !reaction) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const post = await AnonymousPost.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        if (reaction === "heart") {
            if (post.heartedBy.includes(uid)) {
                // Un-heart
                post.heartedBy = post.heartedBy.filter((id: string) => id !== uid);
                post.hearts = Math.max(0, post.hearts - 1);
            } else {
                post.heartedBy.push(uid);
                post.hearts += 1;
            }
        } else if (reaction === "hug") {
            if (post.huggedBy.includes(uid)) {
                post.huggedBy = post.huggedBy.filter((id: string) => id !== uid);
                post.hugs = Math.max(0, post.hugs - 1);
            } else {
                post.huggedBy.push(uid);
                post.hugs += 1;
            }
        }

        await post.save();

        return NextResponse.json({
            success: true,
            hearts: post.hearts,
            hugs: post.hugs,
        });
    } catch (error: any) {
        console.error("Reaction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
