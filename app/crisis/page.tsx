"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const hotlines = [
    { name: "iCall (TISS)", number: "9152987821", desc: "Professional counseling, Mon-Sat 8am-10pm", emoji: "📞" },
    { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 mental health helpline, multilingual support", emoji: "🆘" },
    { name: "AASRA", number: "91-9820466726", desc: "24/7 crisis intervention and suicide prevention", emoji: "💙" },
    { name: "Women Helpline", number: "181", desc: "National helpline for women in distress", emoji: "👩" },
    { name: "Women Helpline", number: "181", desc: "24/7 free helpline for women in distress", emoji: "🌸" },
    { name: "Emergency", number: "112", desc: "National emergency number for immediate danger", emoji: "🚨" },
];

const groundingSteps = [
    { step: "5", instruction: "things you can SEE around you", emoji: "👀" },
    { step: "4", instruction: "things you can TOUCH", emoji: "✋" },
    { step: "3", instruction: "things you can HEAR", emoji: "👂" },
    { step: "2", instruction: "things you can SMELL", emoji: "👃" },
    { step: "1", instruction: "thing you can TASTE", emoji: "👅" },
];

export default function CrisisPage() {
    const [breathePhase, setBreathePhase] = useState<"in" | "hold" | "out">("in");
    const [showGrounding, setShowGrounding] = useState(false);

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <style jsx global>{`
                .crisis-root {
                    font-family: 'Sora', sans-serif;
                    min-height: 100vh;
                    background: linear-gradient(155deg, #1a0a0a 0%, #2d1515 30%, #1a0e20 60%, #0d0d1a 100%);
                    color: #f5e8e8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px 20px;
                    position: relative;
                    overflow: hidden;
                }
                .crisis-root *, .crisis-root *::before, .crisis-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .crisis-glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
            `}</style>

            <div className="crisis-root">
                {/* Background glows */}
                <div className="crisis-glow" style={{ width: 400, height: 400, top: "-10%", left: "-5%", background: "rgba(239,68,68,0.08)" }} />
                <div className="crisis-glow" style={{ width: 300, height: 300, bottom: "10%", right: "-5%", background: "rgba(139,92,246,0.06)" }} />

                {/* Back */}
                <motion.a
                    href="/dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        alignSelf: "flex-start", marginBottom: 32,
                        display: "flex", alignItems: "center", gap: 6,
                        color: "rgba(245,232,232,0.4)", textDecoration: "none",
                        fontSize: 13, fontWeight: 600,
                    }}
                >
                    ← Back to safety
                </motion.a>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: "center", marginBottom: 36, maxWidth: 600 }}
                >
                    <div style={{ fontSize: 48, marginBottom: 14 }}>🫂</div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
                        You&apos;re Not Alone
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(245,232,232,0.55)", lineHeight: 1.7, fontWeight: 500 }}>
                        If you&apos;re in crisis or need immediate support, reach out now. Help is just a call away. You matter, and people care about you.
                    </p>
                </motion.div>

                {/* Breathing Exercise */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        width: "100%", maxWidth: 500,
                        padding: 28, borderRadius: 20,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        textAlign: "center", marginBottom: 24,
                    }}
                >
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(245,232,232,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Breathe With Me</h3>
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1.4, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            times: [0, 0.33, 0.66, 1],
                            ease: "easeInOut",
                        }}
                        style={{
                            width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px",
                            background: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
                            border: "2px solid rgba(239,68,68,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 12, repeat: Infinity, times: [0, 0.5, 1] }}
                            style={{ fontSize: 14, fontWeight: 700, color: "rgba(239,68,68,0.6)" }}
                        >
                            Breathe
                        </motion.span>
                    </motion.div>
                    <p style={{ fontSize: 12, color: "rgba(245,232,232,0.35)", fontWeight: 500 }}>Inhale 4s · Hold 4s · Exhale 4s</p>
                </motion.div>

                {/* Grounding Exercise */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        width: "100%", maxWidth: 500, marginBottom: 24,
                    }}
                >
                    <button
                        onClick={() => setShowGrounding(!showGrounding)}
                        style={{
                            width: "100%", padding: "16px 20px", borderRadius: 14,
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                            color: "#f5e8e8", fontSize: 14, fontWeight: 700, cursor: "pointer",
                            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                    >
                        🌿 5-4-3-2-1 Grounding Exercise {showGrounding ? "▲" : "▼"}
                    </button>
                    {showGrounding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}
                        >
                            {groundingSteps.map((g, i) => (
                                <motion.div
                                    key={g.step}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        padding: "14px 18px", borderRadius: 12,
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "rgba(239,68,68,0.12)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 16, fontWeight: 800, color: "rgba(239,68,68,0.6)",
                                        flexShrink: 0,
                                    }}>
                                        {g.step}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{g.emoji} Name <strong>{g.step}</strong> {g.instruction}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                {/* Hotlines */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ width: "100%", maxWidth: 500 }}
                >
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(245,232,232,0.5)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Helplines</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {hotlines.map((h, i) => (
                            <motion.a
                                key={h.number}
                                href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.07 }}
                                whileHover={{ scale: 1.01, borderColor: "rgba(239,68,68,0.3)" }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "16px 18px", borderRadius: 14,
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    textDecoration: "none", color: "#f5e8e8",
                                    transition: "all 0.2s", cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 22, flexShrink: 0 }}>{h.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{h.name}</div>
                                    <div style={{ fontSize: 11, color: "rgba(245,232,232,0.4)", fontWeight: 500 }}>{h.desc}</div>
                                </div>
                                <div style={{
                                    padding: "8px 16px", borderRadius: 9,
                                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)",
                                    fontSize: 13, fontWeight: 700, color: "#ef6b6b",
                                    flexShrink: 0,
                                }}>
                                    {h.number}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                {/* Reminder */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{
                        marginTop: 36, textAlign: "center",
                        padding: "18px 28px", borderRadius: 14,
                        background: "rgba(139,92,246,0.06)",
                        border: "1px solid rgba(139,92,246,0.1)",
                        maxWidth: 500,
                    }}
                >
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.7, color: "rgba(245,232,232,0.5)" }}>
                        💜 Remember: Asking for help is a sign of strength, not weakness. You are brave, you are worthy, and tomorrow holds new possibilities.
                    </p>
                </motion.div>
            </div>
        </>
    );
}
