import { SarvamAIClient } from "sarvamai";

let sarvamClient: SarvamAIClient | null = null;

export function getSarvamClient() {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        throw new Error("SARVAM_API_KEY is missing");
    }

    if (!sarvamClient) {
        sarvamClient = new SarvamAIClient({ apiSubscriptionKey: apiKey });
    }

    return sarvamClient;
}

export const sarvamDefaults = {
    sttModel: process.env.SARVAM_STT_MODEL || "saaras:v3",
    sttMode: (process.env.SARVAM_STT_MODE || "transcribe") as "transcribe" | "translate" | "verbatim" | "translit" | "codemix",
    ttsModel: process.env.SARVAM_TTS_MODEL || "bulbul:v3",
    ttsSpeaker: process.env.SARVAM_TTS_SPEAKER || "shubh",
    ttsLanguageCode: process.env.SARVAM_TTS_LANG || "en-IN",
};
