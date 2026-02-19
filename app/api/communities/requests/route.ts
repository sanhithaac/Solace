import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Community from "@/models/Community";
import CommunityRequest from "@/models/CommunityRequest";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json({ error: "Missing uid" }, { status: 400 });
        }

        const requests = await CommunityRequest.find({ uid }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ requests });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, name, category, description, icon } = await request.json();

        if (!uid || !name || !category) {
            return NextResponse.json({ error: "Missing uid, name, or category" }, { status: 400 });
        }

        const cleanName = String(name).trim();
        const cleanCategory = String(category).trim();
        const cleanDescription = String(description || "").trim();
        const cleanIcon = String(icon || "CM").trim().slice(0, 3).toUpperCase();

        const existingCommunity = await Community.findOne({ name: cleanName }).select("_id");
        if (existingCommunity) {
            return NextResponse.json({ error: "A community with this name already exists." }, { status: 409 });
        }

        const duplicatePending = await CommunityRequest.findOne({
            uid,
            name: cleanName,
            status: "pending",
        }).select("_id");

        if (duplicatePending) {
            return NextResponse.json({ error: "You already have a pending request with this name." }, { status: 409 });
        }

        const created = await CommunityRequest.create({
            uid,
            name: cleanName,
            category: cleanCategory,
            description: cleanDescription,
            icon: cleanIcon || "CM",
            status: "pending",
        });

        return NextResponse.json({ success: true, request: created });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
