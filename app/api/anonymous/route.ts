import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AnonymousPost from "@/models/AnonymousPost";
import User from "@/models/User";
export const dynamic = "force-dynamic";

const SEED_POSTS = [
    { content: "If today felt heavy, you're not broken. You're carrying a lot.", tags: ["healing", "self_care"] },
    { content: "Studied for 20 minutes after a breakdown. Tiny win still counts.", tags: ["motivation", "resilience"] },
    { content: "Reminder: your worth is not your productivity graph.", tags: ["self_care", "gratitude"] },
    { content: "Anyone else gets anxious when phone notifications pile up?", tags: ["anxiety", "wellness"] },
    { content: "I drank water, showered, and replied to one message. That's my comeback.", tags: ["recovery", "motivation"] },
    { content: "You can restart your day at 3 PM. No permission needed.", tags: ["resilience", "healing"] },
    { content: "Breathing slowly for 2 minutes helped more than doomscrolling for 2 hours.", tags: ["wellness", "self_care"] },
    { content: "I'm learning that rest is not a reward. It's a requirement.", tags: ["recovery", "gratitude"] },
    { content: "If you survived today quietly, that's still strength.", tags: ["courage", "healing"] },
    { content: "No advice needed. Just needed to say: this week was hard.", tags: ["anxiety"] },
    { content: "I set one boundary and my chest finally unclenched.", tags: ["courage", "resilience"] },
    { content: "Comparing timelines is stealing my peace. Logging off for a bit.", tags: ["wellness", "self_care"] },
    { content: "You are allowed to heal slowly.", tags: ["healing"] },
    { content: "My panic didn't disappear, but I stayed with myself through it.", tags: ["anxiety", "recovery"] },
    { content: "Sent that difficult message. Hands shaking, but done.", tags: ["courage"] },
    { content: "I don't need to explain why I'm tired to be valid.", tags: ["self_care"] },
    { content: "One task. One breath. One hour at a time.", tags: ["motivation", "resilience"] },
    { content: "Thanks to whoever posted 'small wins count' yesterday. Needed it.", tags: ["gratitude", "healing"] },
    { content: "If your mind is loud tonight, you're not alone in that.", tags: ["anxiety", "wellness"] },
    { content: "Protect your peace like it's your final exam.", tags: ["courage", "motivation"] },
];

function makeHandle(seed: string) {
    const animals = ["otter", "sparrow", "lynx", "whale", "fox", "raven", "deer", "owl"];
    const moods = ["quiet", "steady", "brave", "gentle", "soft", "clear", "calm", "kind"];
    const n = Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    return `anon_${moods[n % moods.length]}_${animals[n % animals.length]}_${(n % 97).toString().padStart(2, "0")}`;
}

async function ensureSeedPosts() {
    const count = await AnonymousPost.countDocuments();
    if (count >= 20) return;

    for (let i = 0; i < SEED_POSTS.length; i += 1) {
        const p = SEED_POSTS[i];
        await AnonymousPost.create({
            uid: `seed_anon_${i + 1}`,
            anonHandle: makeHandle(`seed_${i + 1}`),
            content: p.content,
            tags: p.tags,
            hearts: Math.floor(Math.random() * 120),
            hugs: Math.floor(Math.random() * 90),
            reposts: Math.floor(Math.random() * 40),
            replies: Math.floor(Math.random() * 30),
        });
    }
}

// GET /api/anonymous - Fetch all anonymous posts (newest first)
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        await ensureSeedPosts();

        const { searchParams } = new URL(request.url);
        const tag = searchParams.get("tag");
        const uid = searchParams.get("uid");

        const query: any = {};
        if (tag) query.tags = tag;

        const posts = await AnonymousPost.find(query)
            .sort({ createdAt: -1 })
            .limit(80);

        const safePosts = posts.map((post: any) => ({
            _id: post._id,
            anonHandle: post.anonHandle || makeHandle(post._id.toString()),
            title: post.title || "",
            content: post.content,
            tags: post.tags,
            hearts: post.hearts,
            hugs: post.hugs,
            reposts: post.reposts || 0,
            replies: post.replies || 0,
            createdAt: post.createdAt,
            hearted: uid ? post.heartedBy.includes(uid) : false,
            hugged: uid ? post.huggedBy.includes(uid) : false,
        }));

        return NextResponse.json({ posts: safePosts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/anonymous - Create a new anonymous post
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, title, content, tags } = await request.json();

        if (!uid || !content) {
            return NextResponse.json({ error: "Missing uid or content" }, { status: 400 });
        }

        const post = new AnonymousPost({
            uid,
            anonHandle: makeHandle(uid),
            title: title || "",
            content,
            tags: tags || [],
        });
        await post.save();

        await User.findOneAndUpdate({ uid }, { $inc: { xp: 15 } });

        const safePost = {
            _id: post._id,
            anonHandle: post.anonHandle,
            title: post.title || "",
            content: post.content,
            tags: post.tags,
            hearts: post.hearts,
            hugs: post.hugs,
            reposts: post.reposts || 0,
            replies: post.replies || 0,
            createdAt: post.createdAt,
            hearted: false,
            hugged: false,
        };

        return NextResponse.json({ success: true, post: safePost });
    } catch (error: any) {
        console.error("Anonymous Post Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/anonymous - React to a post (heart/hug)
export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { postId, uid, reaction } = await request.json();

        if (!postId || !uid || !reaction) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const post = await AnonymousPost.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        if (reaction === "heart") {
            if (post.heartedBy.includes(uid)) {
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
