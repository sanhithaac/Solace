import { NextResponse } from "next/server";
import { sarvamDefaults, getSarvamClient } from "@/lib/sarvam";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const mode = String(formData.get("mode") || sarvamDefaults.sttMode);
        const model = String(formData.get("model") || sarvamDefaults.sttModel);
        const languageCode = formData.get("languageCode");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
        }

        const client = getSarvamClient();
        const audioBuffer = Buffer.from(await file.arrayBuffer());

        const result = await client.speechToText.transcribe({
            file: {
                data: audioBuffer,
                filename: file.name || "recording.webm",
                contentType: file.type || "audio/webm",
            },
            model: model as any,
            mode: mode as any,
            language_code: languageCode ? String(languageCode) as any : undefined,
        });

        return NextResponse.json({
            transcript: result.transcript || "",
            languageCode: result.language_code || null,
            requestId: result.request_id || null,
        });
    } catch (error: any) {
        console.error("STT API error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to transcribe audio" },
            { status: 500 },
        );
    }
}
