import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) return NextResponse.json({ todos: [] });

        const todos = await Todo.find({ uid }).sort({ createdAt: -1 });
        return NextResponse.json({ todos });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { uid, text, priority } = await request.json();

        if (!uid || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const todo = new Todo({ uid, text, priority: priority || "Medium" });
        await todo.save();

        return NextResponse.json({ success: true, todo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await connectToDatabase();
        const { id, completed, uid } = await request.json();

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const todo = await Todo.findByIdAndUpdate(id, { completed }, { new: true });

        // Award XP if completed
        if (completed && uid) {
            await User.findOneAndUpdate({ uid }, { $inc: { xp: 10 } });
        }

        return NextResponse.json({ success: true, todo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const { id } = await request.json();
        await Todo.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
