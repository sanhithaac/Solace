"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

type TimerState = "idle" | "focus" | "break";

const presets = [
    { focus: 25, break: 5, label: "Classic 25/5" },
    { focus: 50, break: 10, label: "Deep 50/10" },
    { focus: 15, break: 3, label: "Quick 15/3" },
];

export default function PomodoroPage() {
    const { t } = useTheme();
    const [preset, setPreset] = useState(presets[0]);
    const [state, setState] = useState<TimerState>("idle");
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [sessions, setSessions] = useState(0);
    const [totalFocus, setTotalFocus] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalTime = state === "focus" ? preset.focus * 60 : preset.break * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const startFocus = useCallback(() => {
        setState("focus");
        setTimeLeft(preset.focus * 60);
    }, [preset]);

    const startBreak = useCallback(() => {
        setState("break");
        setTimeLeft(preset.break * 60);
    }, [preset]);

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState("idle");
        setTimeLeft(preset.focus * 60);
    }, [preset]);

    useEffect(() => {
        if (state === "idle") return;

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (state === "focus") {
                        setSessions((s) => s + 1);
                        setTotalFocus((f) => f + preset.focus);
                        startBreak();
                    } else {
                        startFocus();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [state, preset, startBreak, startFocus]);

    useEffect(() => {
        setTimeLeft(preset.focus * 60);
        setState("idle");
    }, [preset]);

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Pomodoro Timer</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Stay focused, take breaks, boost productivity.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
                {/* Timer */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40, borderRadius: 20, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                    {/* Presets */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
                        {presets.map((p) => (
                            <button key={p.label} onClick={() => setPreset(p)} style={{
                                padding: "8px 18px", borderRadius: 10, border: `1px solid ${preset === p ? t.accent : t.cardBorder}`,
                                background: preset === p ? t.accentSoft : "transparent",
                                color: preset === p ? t.accent : t.textMuted,
                                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            }}>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Circular Timer */}
                    <div style={{ position: "relative", width: 260, height: 260, marginBottom: 32 }}>
                        <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="130" cy="130" r="116" fill="none" stroke={t.cardBorder} strokeWidth="8" />
                            <circle cx="130" cy="130" r="116" fill="none" stroke={state === "break" ? "#4caf7c" : t.accent} strokeWidth="8"
                                strokeDasharray={`${(progress / 100) * 729} 729`} strokeLinecap="round"
                                style={{ transition: "stroke-dasharray 1s linear" }}
                            />
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <div style={{ fontSize: 52, fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            <div style={{
                                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                                color: state === "focus" ? t.accent : state === "break" ? "#4caf7c" : t.textMuted,
                                marginTop: 4,
                            }}>
                                {state === "idle" ? "Ready" : state === "focus" ? "Focus Time" : "Break Time"}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", gap: 12 }}>
                        {state === "idle" ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={startFocus}
                                style={{
                                    padding: "14px 36px", borderRadius: 12, border: "none",
                                    background: t.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                Start Focus ▶
                            </motion.button>
                        ) : (
                            <>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={reset} style={{
                                    padding: "12px 28px", borderRadius: 10, border: `1px solid ${t.cardBorder}`,
                                    background: "transparent", color: t.textSoft, fontSize: 13, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}>
                                    Reset
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => state === "focus" ? startBreak() : startFocus()} style={{
                                    padding: "12px 28px", borderRadius: 10, border: "none",
                                    background: t.accentGrad, color: "#fff", fontSize: 13, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}>
                                    Skip →
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { label: "Sessions Today", value: sessions.toString(), icon: "🎯" },
                        { label: "Focus Time", value: `${totalFocus}m`, icon: "⏱️" },
                        { label: "Current Streak", value: "5 days", icon: "🔥" },
                        { label: "Best Streak", value: "12 days", icon: "🏆" },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            padding: "18px 16px", borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 22 }}>{stat.icon}</span>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{stat.value}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div style={{ padding: "14px 16px", borderRadius: 12, background: t.accentSoft, border: `1px solid ${t.accentBorder}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textAlign: "center" }}>💡 Tip: Take a walk during breaks to refresh your mind!</div>
                    </div>
                </div>
            </div>
        </>
    );
}
