import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DoctorProfile from "@/models/DoctorProfile";
import DoctorSlot from "@/models/DoctorSlot";
import { ensureDoctorsSeeded, ensureSlotsSeeded } from "@/lib/doctorsSeed";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        await ensureDoctorsSeeded();
        await ensureSlotsSeeded();

        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("q") || "").trim();
        const category = (searchParams.get("category") || "All").trim();
        const sortBy = (searchParams.get("sortBy") || "default").trim();
        const minRating = Number(searchParams.get("minRating") || 0);
        const page = Math.max(1, Number(searchParams.get("page") || 1));
        const limit = Math.min(200, Math.max(12, Number(searchParams.get("limit") || 120)));

        const match: Record<string, any> = {};
        if (category && category !== "All") {
            match.category = category;
        }
        if (!Number.isNaN(minRating) && minRating > 0) {
            match.rating = { $gte: minRating };
        }
        if (query) {
            const regex = new RegExp(query, "i");
            match.$or = [
                { fullName: regex },
                { title: regex },
                { category: regex },
                { specialties: regex },
                { education: regex },
                { currentWork: regex },
            ];
        }

        const sort: Record<string, 1 | -1> =
            sortBy === "rating"
                ? { rating: -1, reviewsCount: -1 }
                : sortBy === "experience"
                    ? { experienceYears: -1, rating: -1 }
                    : sortBy === "name"
                        ? { fullName: 1 }
                        : { verified: -1, rating: -1 };

        const [total, doctorsRaw, categoriesRaw] = await Promise.all([
            DoctorProfile.countDocuments(match),
            DoctorProfile.find(match)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            DoctorProfile.distinct("category"),
        ]);

        const doctorIds = doctorsRaw.map((d) => d._id);
        const now = new Date();
        const nextSlots = doctorIds.length
            ? await DoctorSlot.aggregate([
                { $match: { doctorId: { $in: doctorIds }, status: "available", startTime: { $gte: now } } },
                { $sort: { startTime: 1 } },
                {
                    $group: {
                        _id: "$doctorId",
                        nextSlotAt: { $first: "$startTime" },
                        availableSlots: { $sum: 1 },
                    },
                },
            ])
            : [];

        const slotMap = new Map<string, { nextSlotAt: Date | null; availableSlots: number }>();
        for (const row of nextSlots) {
            slotMap.set(String(row._id), {
                nextSlotAt: row.nextSlotAt || null,
                availableSlots: row.availableSlots || 0,
            });
        }

        const doctors = doctorsRaw.map((d) => {
            const slotInfo = slotMap.get(String(d._id));
            return {
                id: String(d._id),
                fullName: d.fullName,
                title: d.title,
                category: d.category,
                specialties: d.specialties || [],
                experienceYears: d.experienceYears,
                rating: d.rating,
                reviewsCount: d.reviewsCount,
                consultationFee: d.consultationFee,
                languages: d.languages || [],
                education: d.education,
                bio: d.bio,
                currentWork: d.currentWork,
                profileImage: d.profileImage,
                verified: d.verified,
                nextSlotAt: slotInfo?.nextSlotAt || null,
                availableSlots: slotInfo?.availableSlots || 0,
            };
        });

        return NextResponse.json({
            doctors,
            categories: ["All", ...categoriesRaw.sort((a, b) => a.localeCompare(b))],
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        });
    } catch (error: any) {
        console.error("Doctors discovery error:", error);
        return NextResponse.json({ error: error.message || "Failed to load doctors" }, { status: 500 });
    }
}
