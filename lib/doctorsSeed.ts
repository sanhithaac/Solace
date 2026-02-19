import DoctorProfile from "@/models/DoctorProfile";
import DoctorSlot from "@/models/DoctorSlot";

type SeedDoctor = {
    fullName: string;
    title: string;
    category: string;
    specialties: string[];
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    consultationFee: number;
    languages: string[];
    education: string;
    bio: string;
    currentWork: string;
    profileImage: string;
    verified: boolean;
};

const firstNames = [
    "Aarav", "Aanya", "Ishaan", "Meera", "Rohan", "Diya", "Arjun", "Anika", "Kabir", "Nisha",
    "Rahul", "Sana", "Vikram", "Priya", "Riya", "Karan", "Neha", "Dev", "Farah", "Aditya",
];

const lastNames = [
    "Sharma", "Patel", "Gupta", "Khan", "Nair", "Singh", "Rao", "Iyer", "Das", "Kapoor",
    "Malhotra", "Joshi", "Bose", "Verma", "Chopra", "Menon", "Bhatt", "Jain", "Pillai", "Mishra",
];

const rolesByCategory: Record<string, string[]> = {
    "Mental Wellness": ["Clinical Psychologist", "Psychiatrist", "Therapist", "Counselor"],
    "Career Guidance": ["Career Counselor", "Resume Strategist", "Leadership Coach", "Interview Mentor"],
    "General Medicine": ["General Physician", "Family Medicine Doctor", "Primary Care Specialist"],
    Cardiology: ["Cardiologist", "Preventive Cardiology Specialist"],
    Dermatology: ["Dermatologist", "Skin Health Specialist"],
    Pediatrics: ["Pediatrician", "Child Health Specialist"],
    Gynecology: ["Gynecologist", "Women Health Specialist"],
    Orthopedics: ["Orthopedic Surgeon", "Sports Injury Specialist"],
    Neurology: ["Neurologist", "Neurophysician"],
    Nutrition: ["Clinical Nutritionist", "Diet and Metabolic Specialist"],
};

const educationPool = [
    "MBBS, MD - Internal Medicine",
    "MBBS, DNB - Family Medicine",
    "MBBS, MD - Psychiatry",
    "MBBS, MS - Orthopedics",
    "MD - Dermatology",
    "MBBS, DM - Cardiology",
    "MBBS, MD - Pediatrics",
    "MBBS, MS - Obstetrics and Gynecology",
    "PhD - Clinical Psychology",
    "MSc - Counseling Psychology",
    "MBA - HR and Career Development",
];

const workPool = [
    "Senior Consultant at Solace Care Clinics",
    "Lead Practitioner at Urban Health Hospital",
    "Consultant at Harmony Medical Center",
    "Visiting Specialist at City Multi-Speciality",
    "Faculty Mentor at Institute of Clinical Sciences",
    "Telehealth Consultant at Solace Digital Care",
];

const languagePool = ["English", "Hindi", "Urdu", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Punjabi"];

function pick<T>(arr: T[], idx: number) {
    return arr[idx % arr.length];
}

function makeDoctors(total = 360): SeedDoctor[] {
    const categories = Object.keys(rolesByCategory);
    const doctors: SeedDoctor[] = [];

    for (let i = 0; i < total; i += 1) {
        const category = pick(categories, i);
        const role = pick(rolesByCategory[category], i);
        const firstName = pick(firstNames, i * 3 + 1);
        const lastName = pick(lastNames, i * 5 + 2);
        const fullName = `Dr. ${firstName} ${lastName}`;
        const experienceYears = 3 + (i % 22);
        const rating = Number((3.8 + ((i * 7) % 13) * 0.1).toFixed(1));
        const reviewsCount = 20 + (i * 17) % 380;
        const consultationFee = 400 + (i % 9) * 100;
        const specialtyA = role;
        const specialtyB = category === "Career Guidance" ? "Professional Development" : "Patient Care";

        doctors.push({
            fullName,
            title: role,
            category,
            specialties: [specialtyA, specialtyB],
            experienceYears,
            rating,
            reviewsCount,
            consultationFee,
            languages: [pick(languagePool, i), pick(languagePool, i + 3)].filter((v, idx, src) => src.indexOf(v) === idx),
            education: pick(educationPool, i),
            bio: `${fullName} is focused on practical, evidence-based outcomes with compassionate care and personalized plans.`,
            currentWork: pick(workPool, i),
            profileImage: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
            verified: i % 8 !== 0,
        });
    }

    return doctors;
}

function setDayTime(base: Date, hours: number, minutes: number) {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

export async function ensureDoctorsSeeded() {
    const existingDoctors = await DoctorProfile.countDocuments();
    if (existingDoctors >= 300) {
        return;
    }

    if (existingDoctors === 0) {
        const docs = makeDoctors(360);
        await DoctorProfile.insertMany(docs, { ordered: false });
    } else {
        const docs = makeDoctors(360 - existingDoctors);
        if (docs.length > 0) {
            await DoctorProfile.insertMany(docs, { ordered: false });
        }
    }
}

export async function ensureSlotsSeeded() {
    const doctors = await DoctorProfile.find({}, { _id: 1 }).lean();
    if (doctors.length === 0) {
        return;
    }

    const now = new Date();
    const days = 7;
    const timeTemplates = [
        { h: 10, m: 0, durationMin: 30, sessionType: "Video" as const },
        { h: 14, m: 0, durationMin: 30, sessionType: "Voice" as const },
        { h: 18, m: 0, durationMin: 45, sessionType: "Chat" as const },
    ];

    const expectedSlots = doctors.length * days * timeTemplates.length;
    const futureSlots = await DoctorSlot.countDocuments({ startTime: { $gte: now } });
    if (futureSlots >= Math.floor(expectedSlots * 0.9)) {
        return;
    }

    const ops: any[] = [];
    for (const doc of doctors) {
        for (let day = 0; day < days; day += 1) {
            const date = new Date(now);
            date.setDate(date.getDate() + day);

            for (const tpl of timeTemplates) {
                const startTime = setDayTime(date, tpl.h, tpl.m);
                const endTime = new Date(startTime.getTime() + tpl.durationMin * 60 * 1000);
                ops.push({
                    updateOne: {
                        filter: { doctorId: doc._id, startTime },
                        update: {
                            $setOnInsert: {
                                doctorId: doc._id,
                                startTime,
                                endTime,
                                sessionType: tpl.sessionType,
                                status: "available",
                            },
                        },
                        upsert: true,
                    },
                });
            }
        }
    }

    if (ops.length > 0) {
        await DoctorSlot.bulkWrite(ops, { ordered: false });
    }
}
