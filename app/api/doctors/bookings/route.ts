import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DoctorBooking from "@/models/DoctorBooking";
import DoctorProfile from "@/models/DoctorProfile";
import DoctorSlot from "@/models/DoctorSlot";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { uid, doctorId, slotId, sessionType } = await request.json();
        if (!uid || !doctorId || !slotId || !sessionType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const normalizedSessionType = ["Video", "Voice", "Chat"].includes(sessionType) ? sessionType : "Video";

        const slot = await DoctorSlot.findOneAndUpdate(
            {
                _id: slotId,
                doctorId,
                status: "available",
            },
            {
                $set: {
                    status: "booked",
                    bookedByUid: uid,
                    bookedAt: new Date(),
                    sessionType: normalizedSessionType,
                },
            },
            { new: true }
        );

        if (!slot) {
            return NextResponse.json(
                { error: "This slot was just booked by someone else. Please pick another slot." },
                { status: 409 }
            );
        }

        try {
            const booking = await DoctorBooking.create({
                uid,
                doctorId,
                slotId: slot._id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                sessionType: normalizedSessionType,
            });

            const doctor = await DoctorProfile.findById(doctorId, { fullName: 1, title: 1 }).lean();

            return NextResponse.json({
                success: true,
                booking: {
                    id: String(booking._id),
                    doctorId,
                    doctorName: doctor?.fullName || "Doctor",
                    doctorTitle: doctor?.title || "",
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    sessionType: booking.sessionType,
                    status: booking.status,
                },
            });
        } catch (bookingError: any) {
            // Roll back slot if booking document fails, keeping data consistent.
            await DoctorSlot.updateOne(
                { _id: slot._id, status: "booked", bookedByUid: uid },
                { $set: { status: "available", bookedByUid: null, bookedAt: null } }
            );
            if (bookingError?.code === 11000) {
                return NextResponse.json({ error: "Slot already booked." }, { status: 409 });
            }
            throw bookingError;
        }
    } catch (error: any) {
        console.error("Doctor booking error:", error);
        return NextResponse.json({ error: error.message || "Booking failed" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json({ bookings: [] });
        }

        const bookings = await DoctorBooking.find({ uid, status: "booked" })
            .sort({ startTime: 1 })
            .limit(25)
            .lean();

        const doctorIds = Array.from(new Set(bookings.map((b) => String(b.doctorId))));
        const doctors = doctorIds.length
            ? await DoctorProfile.find({ _id: { $in: doctorIds } }, { fullName: 1, title: 1 }).lean()
            : [];
        const doctorMap = new Map(doctors.map((d) => [String(d._id), { fullName: d.fullName, title: d.title }]));

        return NextResponse.json({
            bookings: bookings.map((b) => ({
                id: String(b._id),
                doctorId: String(b.doctorId),
                slotId: String(b.slotId),
                doctorName: doctorMap.get(String(b.doctorId))?.fullName || "Doctor",
                doctorTitle: doctorMap.get(String(b.doctorId))?.title || "",
                startTime: b.startTime,
                endTime: b.endTime,
                sessionType: b.sessionType,
                status: b.status,
            })),
        });
    } catch (error: any) {
        console.error("Doctor bookings fetch error:", error);
        return NextResponse.json({ error: error.message || "Failed to load bookings" }, { status: 500 });
    }
}
