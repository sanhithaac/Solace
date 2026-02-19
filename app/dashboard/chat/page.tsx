"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface Message {
    id?: string;
    role: "user" | "ai";
    text: string;
    timestamp?: string;
}

type LanguageKey = "english" | "hindi" | "tamil" | "telugu";

type VoiceOption = {
    id: string;
    label: string;
    gender: "male" | "female";
};

const languageCodeByKey: Record<LanguageKey, string> = {
    english: "en-IN",
    hindi: "hi-IN",
    tamil: "ta-IN",
    telugu: "te-IN",
};

const voiceOptions: VoiceOption[] = [
    { id: "rahul", label: "Rahul (Male)", gender: "male" },
    { id: "rohan", label: "Rohan (Male)", gender: "male" },
    { id: "amit", label: "Amit (Male)", gender: "male" },
    { id: "priya", label: "Priya (Female)", gender: "female" },
    { id: "neha", label: "Neha (Female)", gender: "female" },
    { id: "shreya", label: "Shreya (Female)", gender: "female" },
];

const quickPrompts = [
    "I am feeling anxious today",
    "Help me calm down",
    "Suggest a breathing exercise",
    "I want to talk about my day",
    "I am feeling lonely",
    "Give me a small self-care plan",
];

const crisisKeywords = [
    "suicide",
    "kill myself",
    "end my life",
    "self harm",
    "hurt myself",
    "want to die",
    "not safe",
    "hopeless",
    "can not go on",
];

function formatTime(timestamp?: string) {
    if (!timestamp) return "Now";
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return "Now";
    return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function detectCrisis(text: string) {
    const value = text.toLowerCase();
    return crisisKeywords.some((keyword) => value.includes(keyword));
}

export default function ChatPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>("english");
    const [selectedVoice, setSelectedVoice] = useState<string>(voiceOptions[0].id);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const activeAudioUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat?uid=${user.uid}`);
                const data = await res.json();
                if (data.messages) setMessages(data.messages);
            } catch (err) {
                console.error("Failed to load chat history:", err);
            }
        };

        fetchHistory();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => () => stopSpeaking(), []);

    const isSendDisabled = !input.trim() || isTyping || !user;

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    function stopSpeaking() {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
            activeAudioRef.current = null;
        }
        if (activeAudioUrlRef.current) {
            URL.revokeObjectURL(activeAudioUrlRef.current);
            activeAudioUrlRef.current = null;
        }
        setSpeakingMessageId(null);
    }

    const sendMessage = async (text: string) => {
        if (!text.trim() || !user || isTyping) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: "user",
            text,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        if (detectCrisis(text)) {
            setShowCrisisAlert(true);
        }

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, text, responseLanguage: selectedLanguage }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to send message");
            }

            if (data.aiMessage) {
                setMessages((prev) => [...prev, data.aiMessage]);
                if (detectCrisis(String(data.aiMessage.text || ""))) {
                    setShowCrisisAlert(true);
                }
                await playAiMessage(data.aiMessage, Date.now());
            }
        } catch (err: any) {
            console.error("Chat Error:", err);
            const errorMessage: Message = {
                id: `e-${Date.now()}`,
                role: "ai",
                text: `I ran into an issue: ${err?.message || "Please try again."}`,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleVoiceInput = async () => {
        if (!user || isTyping || isTranscribing) return;
        stopSpeaking();

        if (isRecording) {
            recorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                setIsTranscribing(true);
                try {
                    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    const formData = new FormData();
                    formData.append("file", blob, "voice.webm");
                    formData.append("mode", "transcribe");
                    formData.append("model", "saaras:v3");
                    formData.append("languageCode", languageCodeByKey[selectedLanguage]);

                    const response = await fetch("/api/voice/stt", {
                        method: "POST",
                        body: formData,
                    });
                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data?.error || "Could not transcribe audio");
                    }

                    const transcript = String(data?.transcript || "").trim();
                    if (transcript) {
                        await sendMessage(transcript);
                    }
                } catch (err) {
                    console.error("Voice transcription error:", err);
                } finally {
                    setIsTranscribing(false);
                    stream.getTracks().forEach((track) => track.stop());
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access error:", err);
        }
    };

    const playAiMessage = async (msg: Message, index: number) => {
        const messageId = msg.id || `ai-${index}`;
        if (speakingMessageId === messageId) return;
        stopSpeaking();

        try {
            setSpeakingMessageId(messageId);
            const response = await fetch("/api/voice/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: msg.text,
                    languageCode: languageCodeByKey[selectedLanguage],
                    model: "bulbul:v3",
                    speaker: selectedVoice,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "Could not generate audio");
            }

            const base64 = String(data?.audioBase64 || "");
            if (!base64) return;

            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: data?.mimeType || "audio/wav" });
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            activeAudioRef.current = audio;
            activeAudioUrlRef.current = objectUrl;
            audio.onended = () => {
                URL.revokeObjectURL(objectUrl);
                activeAudioRef.current = null;
                activeAudioUrlRef.current = null;
                setSpeakingMessageId(null);
            };
            await audio.play();
        } catch (err) {
            console.error("TTS playback error:", err);
            stopSpeaking();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "calc(100vh - 110px)" }}>
            <style jsx>{`
                .chat-input::placeholder {
                    color: rgba(58, 32, 48, 0.62);
                }
            `}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.03em" }}>AI Companion</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 600 }}>
                    {greeting}. This space is private, supportive, and non-judgmental.
                </p>
            </div>

            <AnimatePresence>
                {showCrisisAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            border: `1px solid rgba(217,79,79,0.4)`,
                            background: "rgba(217,79,79,0.06)",
                            borderRadius: 14,
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 14,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: t.danger, marginBottom: 4 }}>
                                You are not alone. Immediate support is available.
                            </div>
                            <div style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>
                                Call or text 988 in the U.S., or text HOME to 741741.
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCrisisAlert(false)}
                            style={{
                                border: `1px solid ${t.accentBorder}`,
                                background: t.cardBg,
                                color: t.text,
                                borderRadius: 8,
                                padding: "7px 10px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: 18,
                    border: `1px solid ${t.accentBorder}`,
                    background: "linear-gradient(180deg, rgba(199,109,133,0.14) 0%, rgba(199,109,133,0.08) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div
                    className="no-scrollbar"
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "18px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    {messages.length === 0 && (
                        <div
                            style={{
                                margin: "auto 0 auto auto",
                                maxWidth: 520,
                                textAlign: "center",
                                border: `1px solid ${t.accentBorder}`,
                                background: "rgba(199,109,133,0.16)",
                                borderRadius: 16,
                                padding: "22px 18px",
                            }}
                        >
                            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 4 }}>
                                Hello, I am your Solace AI companion.
                            </div>
                            <p style={{ fontSize: 12.5, color: t.textSoft, fontWeight: 600, lineHeight: 1.6 }}>
                                Share what is on your mind, and I will respond with empathy and practical support.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isUser = msg.role === "user";

                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
                                style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
                            >
                                <div style={{ maxWidth: "78%", display: "flex", gap: 8, alignItems: "flex-end" }}>
                                    {!isUser && (
                                        <div
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 8,
                                                background: t.accentSoft,
                                                border: `1px solid ${t.accentBorder}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: t.accent,
                                                fontSize: 12,
                                                fontWeight: 800,
                                                flexShrink: 0,
                                            }}
                                        >
                                            AI
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            borderRadius: 14,
                                            padding: "11px 13px",
                                            background: isUser ? t.accentGrad : t.cardBg,
                                            border: isUser ? "none" : `1px solid ${t.cardBorder}`,
                                            color: isUser ? "#fff" : t.text,
                                            borderBottomRightRadius: isUser ? 5 : 14,
                                            borderBottomLeftRadius: isUser ? 14 : 5,
                                        }}
                                    >
                                        <p style={{ fontSize: 13.5, lineHeight: 1.6, fontWeight: 600, margin: 0 }}>{msg.text}</p>
                                        {!isUser && (
                                            <button
                                                onClick={() => playAiMessage(msg, idx)}
                                                style={{
                                                    marginTop: 8,
                                                    border: `1px solid ${t.accentBorder}`,
                                                    background: "transparent",
                                                    color: t.accent,
                                                    borderRadius: 8,
                                                    padding: "4px 8px",
                                                    fontSize: 10.5,
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {(speakingMessageId === (msg.id || `ai-${idx}`)) ? "Playing..." : "Play voice"}
                                            </button>
                                        )}
                                        <span style={{ fontSize: 10, opacity: isUser ? 0.84 : 0.5, marginTop: 6, display: "block", fontWeight: 700 }}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {isTyping && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                    borderRadius: 12,
                                    padding: "10px 12px",
                                    background: t.cardBg,
                                    border: `1px solid ${t.cardBorder}`,
                                }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.16 }}
                                        style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ borderTop: `1px solid ${t.divider}`, padding: "12px 12px 14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 10 }}>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value as LanguageKey)}
                            style={{
                                border: `1px solid ${t.accentBorder}`,
                                background: t.cardBg,
                                color: t.text,
                                borderRadius: 10,
                                padding: "8px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                            <option value="tamil">Tamil</option>
                            <option value="telugu">Telugu</option>
                        </select>

                        <select
                            value={selectedVoice}
                            onChange={(e) => {
                                stopSpeaking();
                                setSelectedVoice(e.target.value);
                            }}
                            style={{
                                border: `1px solid ${t.accentBorder}`,
                                background: t.cardBg,
                                color: t.text,
                                borderRadius: 10,
                                padding: "8px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            <optgroup label="Male Voices">
                                {voiceOptions.filter((v) => v.gender === "male").map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.label}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Female Voices">
                                {voiceOptions.filter((v) => v.gender === "female").map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.label}
                                    </option>
                                ))}
                            </optgroup>
                        </select>

                        <button
                            onClick={stopSpeaking}
                            disabled={!speakingMessageId}
                            style={{
                                border: `1px solid ${t.accentBorder}`,
                                background: t.cardBg,
                                color: t.text,
                                borderRadius: 10,
                                padding: "8px 10px",
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: speakingMessageId ? "pointer" : "not-allowed",
                                opacity: speakingMessageId ? 1 : 0.5,
                            }}
                        >
                            Stop Voice
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                disabled={isTyping || !user}
                                onClick={() => sendMessage(prompt)}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    border: `1px solid rgba(199,109,133,0.3)`,
                                    background: "rgba(199,109,133,0.16)",
                                    color: t.text,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: isTyping || !user ? "not-allowed" : "pointer",
                                    opacity: isTyping || !user ? 0.5 : 1,
                                    transition: "opacity 0.2s",
                                    fontFamily: "inherit",
                                }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: `1.5px solid rgba(199,109,133,0.32)`,
                            borderRadius: 12,
                            background: "rgba(199,109,133,0.12)",
                            padding: 6,
                        }}
                    >
                        <input
                            className="chat-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                            placeholder={user ? "Tell me what is on your mind..." : "Sign in to start chatting"}
                            disabled={!user}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                color: t.text,
                                fontSize: 13.5,
                                fontWeight: 600,
                                padding: "9px 10px",
                                fontFamily: "inherit",
                            }}
                        />

                        <motion.button
                            whileHover={!user || isTyping || isTranscribing ? undefined : { scale: 1.05 }}
                            whileTap={!user || isTyping || isTranscribing ? undefined : { scale: 0.95 }}
                            onClick={handleVoiceInput}
                            disabled={!user || isTyping || isTranscribing}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: isRecording ? "linear-gradient(135deg, #d94f4f 0%, #b43f3f 100%)" : "rgba(199,109,133,0.25)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: !user || isTyping || isTranscribing ? "not-allowed" : "pointer",
                                opacity: !user || isTyping || isTranscribing ? 0.45 : 1,
                                color: isRecording ? "#fff" : t.text,
                                fontSize: 16,
                                fontWeight: 800,
                            }}
                            aria-label="Record voice"
                            title={isRecording ? "Stop recording" : isTranscribing ? "Transcribing..." : "Record voice"}
                        >
                            {isTranscribing ? "..." : isRecording ? "Stop" : "Mic"}
                        </motion.button>

                        <motion.button
                            whileHover={isSendDisabled ? undefined : { scale: 1.05 }}
                            whileTap={isSendDisabled ? undefined : { scale: 0.95 }}
                            onClick={() => sendMessage(input)}
                            disabled={isSendDisabled}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: t.accentGrad,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isSendDisabled ? "not-allowed" : "pointer",
                                opacity: isSendDisabled ? 0.45 : 1,
                            }}
                            aria-label="Send message"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
