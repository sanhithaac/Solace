"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface Message {
    id: number;
    role: "user" | "ai";
    text: string;
    time: string;
}

const initialMessages: Message[] = [
    { id: 1, role: "ai", text: "Hi there 💙 I'm your mental health companion. I'm here to listen, support, and guide you. How are you feeling today?", time: "Just now" },
];

const quickPrompts = [
    "I'm feeling anxious today",
    "I need study tips",
    "Help me calm down",
    "I want to talk about my day",
    "Suggest a breathing exercise",
    "I'm feeling lonely",
];

export default function ChatPage() {
    const { t, isDark } = useTheme();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        const userMsg: Message = { id: Date.now(), role: "user", text, time: "Now" };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                "I hear you, and your feelings are completely valid. Let's take a moment to breathe together. Would you like to try a quick grounding exercise?",
                "That sounds like a lot to carry. Remember, it's okay to not be okay. Would you like me to suggest some coping strategies?",
                "Thank you for sharing that with me. Your honesty takes courage. Let's explore what might help you feel better.",
                "I understand how that can feel overwhelming. One thing that might help is breaking things down into smaller, manageable steps. Want to try?",
            ];
            const aiMsg: Message = {
                id: Date.now() + 1,
                role: "ai",
                text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                time: "Now",
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>AI Companion</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Powered by RAG + NLP · Empathetic & non-judgmental</p>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "16px 0",
                display: "flex", flexDirection: "column", gap: 14,
            }}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <div style={{
                            maxWidth: "70%", padding: "14px 18px", borderRadius: 16,
                            background: msg.role === "user" ? t.accentGrad : t.cardBg,
                            border: msg.role === "ai" ? `1px solid ${t.cardBorder}` : "none",
                            color: msg.role === "user" ? "#fff" : t.text,
                            borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                            borderBottomLeftRadius: msg.role === "ai" ? 4 : 16,
                        }}>
                            <p style={{ fontSize: 13.5, lineHeight: 1.65, fontWeight: 500, margin: 0 }}>{msg.text}</p>
                            <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 500, marginTop: 6, display: "block" }}>{msg.time}</span>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div style={{ display: "flex", gap: 6, padding: "14px 18px" }}>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent }}
                            />
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {quickPrompts.map((p) => (
                    <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        style={{
                            padding: "7px 14px", borderRadius: 20, border: `1px solid ${t.cardBorder}`,
                            background: "transparent", color: t.textSoft, fontSize: 11, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.color = t.textSoft; }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div style={{
                display: "flex", gap: 10, padding: 6,
                borderRadius: 14, border: `1.5px solid ${t.cardBorder}`, background: t.cardBg,
            }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1, padding: "12px 14px", border: "none", background: "transparent",
                        color: t.text, fontSize: 13.5, fontWeight: 500, outline: "none", fontFamily: "inherit",
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(input)}
                    style={{
                        width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                        background: t.accentGrad, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </motion.button>
            </div>
        </div>
    );
}
