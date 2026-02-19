import { NextResponse } from "next/server";
import { sarvamDefaults, getSarvamClient } from "@/lib/sarvam";

const ALLOWED_TTS_SPEAKERS = new Set([
    "anushka",
    "abhilash",
    "manisha",
    "vidya",
    "arya",
    "karun",
    "hitesh",
    "aditya",
    "ritu",
    "priya",
    "neha",
    "rahul",
    "pooja",
    "rohan",
    "simran",
    "kavya",
    "amit",
    "dev",
    "ishita",
    "shreya",
    "ratan",
    "varun",
    "manan",
    "sumit",
    "roopa",
    "kabir",
    "aayan",
    "shubh",
    "ashutosh",
    "advait",
    "amelia",
    "sophia",
    "anand",
    "tanya",
    "tarun",
    "sunny",
    "mani",
    "gokul",
    "vijay",
    "shruti",
    "suhani",
    "mohit",
    "kavitha",
    "rehan",
    "soham",
    "rupali",
]);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const text = String(body?.text || "").trim();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const client = getSarvamClient();
        const rawSpeaker = String(body?.speaker || sarvamDefaults.ttsSpeaker);
        const speaker = rawSpeaker.trim().toLowerCase();
        if (!ALLOWED_TTS_SPEAKERS.has(speaker)) {
            return NextResponse.json(
                { error: `Invalid speaker '${rawSpeaker}'.` },
                { status: 400 },
            );
        }
        const result = await client.textToSpeech.convert({
            text,
            target_language_code: String(body?.languageCode || sarvamDefaults.ttsLanguageCode) as any,
            model: String(body?.model || sarvamDefaults.ttsModel) as any,
            speaker: speaker as any,
        });

        return NextResponse.json({
            audioBase64: result.audios?.[0] || "",
            mimeType: "audio/wav",
            requestId: result.request_id || null,
        });
    } catch (error: any) {
        console.error("TTS API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to synthesize audio" },
            { status: 500 },
        );
    }
}
