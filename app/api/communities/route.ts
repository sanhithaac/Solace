import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Community from "@/models/Community";
import CommunityThread from "@/models/CommunityThread";
import User from "@/models/User";

type SeedCommunity = {
    name: string;
    description: string;
    category: string;
    icon: string;
    seedMembers: number;
};

const SEED_COMMUNITIES: SeedCommunity[] = [
    { name: "Anxiety Warriors", description: "Grounding techniques for panic, spirals, and overthinking nights.", category: "Fear & Panic", icon: "AN", seedMembers: 16 },
    { name: "Healing From Heartbreak", description: "A safe place to rebuild identity after emotional loss.", category: "Relationships", icon: "HB", seedMembers: 22 },
    { name: "Burnout Recovery", description: "Boundaries, rest rhythms, and recovery for chronic exhaustion.", category: "Work & Life", icon: "BR", seedMembers: 18 },
    { name: "Morning Motivation", description: "Small daily wins when getting out of bed feels heavy.", category: "Depression", icon: "MM", seedMembers: 14 },
    { name: "Shadow Seeker Hub", description: "Anonymous emotional processing for people not ready to be seen.", category: "Anonymous Therapy", icon: "SS", seedMembers: 11 },
    { name: "Quiet Minds", description: "Mindfulness and calm routines for nervous-system reset.", category: "Mindfulness", icon: "QM", seedMembers: 13 },
    { name: "Exam Pressure Circle", description: "Study anxiety support for students under academic pressure.", category: "Academic", icon: "EP", seedMembers: 17 },
    { name: "Career Stress Lounge", description: "Job uncertainty, workplace stress, and confidence recovery.", category: "Career", icon: "CS", seedMembers: 15 },
    { name: "Insomnia Support Room", description: "Night-time support for racing thoughts and poor sleep.", category: "Sleep", icon: "IS", seedMembers: 12 },
    { name: "Gentle Grief Space", description: "Compassionate room for grief, memory, and healing.", category: "Grief", icon: "GG", seedMembers: 10 },
    { name: "Social Anxiety Circle", description: "Practice confidence and reduce fear in social settings.", category: "Social Anxiety", icon: "SA", seedMembers: 16 },
    { name: "New Moms Sanctuary", description: "Postpartum emotions, overwhelm, and maternal wellbeing.", category: "Parenting", icon: "NM", seedMembers: 9 },
    { name: "Fatherhood Check-In", description: "Mental health support for fathers and new dads.", category: "Parenting", icon: "FC", seedMembers: 8 },
    { name: "Body Image Recovery", description: "A healthier relationship with body image and self-worth.", category: "Self-Esteem", icon: "BI", seedMembers: 13 },
    { name: "Self Worth Studio", description: "Rebuilding confidence through kind internal dialogue.", category: "Self-Esteem", icon: "SW", seedMembers: 15 },
    { name: "Overthinkers Club", description: "Break rumination loops and practice clarity techniques.", category: "Thought Patterns", icon: "OC", seedMembers: 20 },
    { name: "Panic SOS Circle", description: "Immediate coping support during panic episodes.", category: "Fear & Panic", icon: "PS", seedMembers: 12 },
    { name: "Work-Life Balance Lab", description: "Schedules, boundaries, and rest-first planning.", category: "Work & Life", icon: "WB", seedMembers: 14 },
    { name: "Breakup Recovery Daily", description: "Daily prompts for emotional recovery after breakup.", category: "Relationships", icon: "BD", seedMembers: 11 },
    { name: "Loneliness Support", description: "Connection and warmth for those feeling isolated.", category: "Social", icon: "LS", seedMembers: 16 },
    { name: "Women In Tech Wellness", description: "Burnout and mental load support for women in tech.", category: "Women", icon: "WT", seedMembers: 10 },
    { name: "Men's Mental Fitness", description: "Emotional strength, vulnerability, and practical coping.", category: "Men", icon: "MF", seedMembers: 9 },
    { name: "Students Night Desk", description: "Late-night motivation and study accountability space.", category: "Academic", icon: "SN", seedMembers: 18 },
    { name: "Neurodivergent Safe Space", description: "Support for sensory overload, masking, and burnout.", category: "Neurodivergence", icon: "NS", seedMembers: 12 },
    { name: "Mindful Breathing Hub", description: "Breathwork routines for stress and emotional reset.", category: "Mindfulness", icon: "MB", seedMembers: 14 },
    { name: "Trauma-Informed Healing", description: "Grounded support with trauma-aware conversation norms.", category: "Trauma", icon: "TH", seedMembers: 8 },
    { name: "Crisis De-Escalation Room", description: "Immediate calming tools and safe check-ins.", category: "Crisis Support", icon: "CD", seedMembers: 7 },
    { name: "Digital Detox Circle", description: "Reduce doomscrolling and reclaim mental focus.", category: "Lifestyle", icon: "DD", seedMembers: 13 },
    { name: "Confidence Reboot", description: "Practical confidence exercises and accountability.", category: "Growth", icon: "CR", seedMembers: 15 },
    { name: "Healing Through Journaling", description: "Prompt-based writing for emotional processing.", category: "Journaling", icon: "HJ", seedMembers: 12 },
];

function seededMemberIds(seedIdx: number, count: number): string[] {
    return Array.from({ length: count }, (_, i) => `seed_member_${seedIdx + 1}_${i + 1}`);
}

function seededMessages(communityName: string) {
    return [
        {
            uid: "seed_user_01",
            userLabel: "Brave_Soul_4",
            role: "user",
            text: `Checking in at ${communityName}. Today felt heavy, but I still showed up.`,
        },
        {
            uid: "seed_doctor_01",
            userLabel: "Dr. Sharma",
            role: "doctor",
            text: "That consistency matters. Progress is not speed, it is repetition.",
        },
        {
            uid: "seed_user_02",
            userLabel: "Quiet_River",
            role: "user",
            text: "I needed to hear that. Anyone else taking things hour by hour today?",
        },
        {
            uid: "seed_ai_01",
            userLabel: "TENA AI",
            role: "ai",
            text: "Try this: inhale 4s, hold 4s, exhale 6s for 5 rounds before your next task.",
        },
        {
            uid: "seed_user_03",
            userLabel: "HopeThread",
            role: "user",
            text: "Did the breathing cycle. Chest tension dropped a little. Thank you all.",
        },
    ];
}

async function ensureSeedData() {
    const seededNames = SEED_COMMUNITIES.map((c) => c.name);
    const existingSeedCount = await Community.countDocuments({ name: { $in: seededNames } });

    if (existingSeedCount < SEED_COMMUNITIES.length) {
        for (let i = 0; i < SEED_COMMUNITIES.length; i += 1) {
            const seed = SEED_COMMUNITIES[i];
            await Community.updateOne(
                { name: seed.name },
                {
                    $setOnInsert: {
                        name: seed.name,
                        description: seed.description,
                        category: seed.category,
                        icon: seed.icon,
                        members: seededMemberIds(i, seed.seedMembers),
                        memberCount: seed.seedMembers,
                        createdBy: "seed_system",
                        createdAt: new Date(),
                    },
                },
                { upsert: true }
            );
        }
    }

    const seededCommunities = await Community.find({ name: { $in: seededNames } }).select("_id name");

    for (const community of seededCommunities) {
        await CommunityThread.updateOne(
            { communityId: community._id },
            {
                $setOnInsert: {
                    communityId: community._id,
                    messages: seededMessages(community.name),
                },
            },
            { upsert: true }
        );
    }
}

// GET /api/communities - Fetch all communities
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        await ensureSeedData();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const uid = searchParams.get("uid");

        const query: any = {};
        if (category && category !== "All") query.category = category;

        const communities = await Community.find(query).sort({ memberCount: -1 });

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

// POST /api/communities - Create a new community
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, name, description, category, icon } = await request.json();

        if (!uid || !name) {
            return NextResponse.json({ error: "Missing uid or name" }, { status: 400 });
        }

        const exists = await Community.findOne({ name });
        if (exists) return NextResponse.json({ error: "Community already exists" }, { status: 409 });

        const community = new Community({
            name,
            description: description || "",
            category: category || "General",
            icon: icon || "CM",
            members: [uid],
            memberCount: 1,
            createdBy: uid,
        });
        await community.save();

        await CommunityThread.create({
            communityId: community._id,
            messages: [
                {
                    uid,
                    userLabel: "Founding Member",
                    role: "user",
                    text: `Welcome to ${community.name}. This circle is now live.`,
                },
                {
                    uid: "seed_ai_01",
                    userLabel: "TENA AI",
                    role: "ai",
                    text: "Circle reminder: be empathetic, non-judgmental, and protect privacy.",
                },
            ],
        });

        await User.findOneAndUpdate({ uid }, { $inc: { xp: 25 } });

        return NextResponse.json({ success: true, community });
    } catch (error: any) {
        console.error("Community Create Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/communities - Join/Leave a community
export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { communityId, uid, action } = await request.json();

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
