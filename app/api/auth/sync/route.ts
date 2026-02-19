import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, email, displayName, photoURL, mode } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: "UID is required" }, { status: 400 });
        }

        // Upsert user: find by uid, update if exists, create if not
        const user = await User.findOneAndUpdate(
            { uid },
            {
                uid,
                email,
                displayName,
                photoURL,
                mode,
                lastLogin: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
