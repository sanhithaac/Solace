import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DoctorSlot from "@/models/DoctorSlot";
import { ensureSlotsSeeded } from "@/lib/doctorsSeed";
import { Types } from "mongoose";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get("doctorId") || "";
        if (!Types.ObjectId.isValid(doctorId)) {
            return NextResponse.json({ error: "Invalid doctor id" }, { status: 400 });
        }

        await connectToDatabase();
        await ensureSlotsSeeded();

        const days = Math.min(14, Math.max(1, Number(searchParams.get("days") || 7)));
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + days);

        const slots = await DoctorSlot.find({
            doctorId,
            status: "available",
            startTime: { $gte: now, $lte: end },
        })
            .sort({ startTime: 1 })
            .lean();

        const grouped: Record<string, any[]> = {};
        for (const slot of slots) {
            const date = new Date(slot.startTime).toISOString().slice(0, 10);
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push({
                id: String(slot._id),
                startTime: slot.startTime,
                endTime: slot.endTime,
                sessionType: slot.sessionType,
            });
        }

        return NextResponse.json({
            dates: Object.keys(grouped),
            slotsByDate: grouped,
        });
    } catch (error: any) {
        console.error("Doctor slots error:", error);
        return NextResponse.json({ error: error.message || "Failed to load slots" }, { status: 500 });
    }
}
