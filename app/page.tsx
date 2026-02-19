"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(160deg, #a14465 0%, #c76d85 40%, #d88a9e 70%, #e8a8b8 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            fontFamily: "'Outfit', 'Nunito', sans-serif",
        }}>
            {/* Soft floating circles */}
            {[120, 200, 80, 160].map((size, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        width: size, height: size, borderRadius: "50%",
                        background: `rgba(255,255,255,${0.03 + i * 0.02})`,
                        top: `${15 + i * 20}%`,
                        left: `${10 + i * 22}%`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ textAlign: "center", maxWidth: 600, padding: "0 24px", zIndex: 2 }}
            >
                {/* Logo / Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        fontSize: 64, fontWeight: 800, color: "#fff",
                        letterSpacing: "-0.04em", marginBottom: 8, lineHeight: 1,
                    }}
                >
                    Solace
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={{
                        fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500,
                        letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 32,
                    }}
                >
                    A Safe Space for Mental Wellness
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    style={{
                        fontSize: 17, color: "rgba(255,255,255,0.85)", fontWeight: 400,
                        lineHeight: 1.7, marginBottom: 48, maxWidth: 480, margin: "0 auto 48px",
                    }}
                >
                    Track your mood, journal your thoughts, manage your day with focus timers
                    and to-do lists, connect with supportive communities, and take care of your
                    mental and physical well-being — all in one place, completely private.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
                >
                    <button
                        onClick={() => router.push("/auth?view=signup")}
                        style={{
                            padding: "14px 44px", borderRadius: 50,
                            background: "#fff", color: "#a14465",
                            fontSize: 16, fontWeight: 700, border: "none",
                            cursor: "pointer", transition: "all 0.2s ease",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.18)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
                        }}
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={() => router.push("/auth?view=login")}
                        style={{
                            padding: "14px 44px", borderRadius: 50,
                            background: "transparent", color: "#fff",
                            fontSize: 16, fontWeight: 700,
                            border: "2px solid rgba(255,255,255,0.5)",
                            cursor: "pointer", transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.borderColor = "#fff";
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        Log In
                    </button>
                </motion.div>

                {/* Features row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    style={{
                        display: "flex", gap: 28, justifyContent: "center", marginTop: 56,
                        flexWrap: "wrap",
                    }}
                >
                    {[
                        { title: "Mood Tracking", desc: "Log & visualize your daily emotions" },
                        { title: "Journaling", desc: "Private space for your thoughts" },
                        { title: "Focus Timer", desc: "Pomodoro sessions with music" },
                        { title: "Community", desc: "Connect with people who understand" },
                    ].map((f) => (
                        <div key={f.title} style={{
                            textAlign: "center", maxWidth: 130,
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: "rgba(255,255,255,0.12)",
                                margin: "0 auto 10px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: 3,
                                    background: "rgba(255,255,255,0.6)",
                                }} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500, lineHeight: 1.4 }}>{f.desc}</div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Bottom note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                style={{
                    position: "absolute", bottom: 24,
                    fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500,
                    letterSpacing: "0.02em",
                }}
            >
                Your data is private. Your space is safe.
            </motion.p>
        </div>
    );
}
