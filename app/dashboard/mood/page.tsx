"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const moods = [
    { emoji: "😄", label: "Great", color: "#4caf7c", level: 5 },
    { emoji: "😊", label: "Good", color: "#6bdb8e", level: 4 },
    { emoji: "😐", label: "Okay", color: "#f0c35a", level: 3 },
    { emoji: "😔", label: "Low", color: "#e8a830", level: 2 },
    { emoji: "😢", label: "Sad", color: "#ef6b6b", level: 1 },
    { emoji: "😤", label: "Angry", color: "#d94f4f", level: 1 },
    { emoji: "😰", label: "Anxious", color: "#e88a30", level: 1 },
    { emoji: "😴", label: "Tired", color: "#9e9e9e", level: 2 },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const cycleData = {
    currentDay: 14,
    cycleLength: 28,
    phase: "Ovulation",
    nextPeriod: "Feb 28",
    lastPeriod: "Feb 5",
    phases: [
        { name: "Period", start: 1, end: 5, color: "#ef6b6b" },
        { name: "Follicular", start: 6, end: 13, color: "#6bdb8e" },
        { name: "Ovulation", start: 14, end: 16, color: "#f0c35a" },
        { name: "Luteal", start: 17, end: 28, color: "#e8a830" },
    ],
};

export default function MoodPage() {
    const { t, mode } = useTheme();
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const isWomen = mode === "women";

    // Load mood history
    useEffect(() => {
        if (!user) return;
        const fetchMood = async () => {
            try {
                const res = await fetch(`/api/mood?uid=${user.uid}`);
                const data = await res.json();
                if (data.logs) {
                    const last7 = weekDays.map((day) => {
                        const log = data.logs.find((l: any) => weekDays[new Date(l.createdAt).getDay()] === day);
                        if (log) {
                            const mDef = moods.find(m => m.label === log.mood) || moods[2];
                            return { day, mood: mDef.emoji, level: mDef.level };
                        }
                        return { day, mood: "-", level: 0 };
                    });
                    setHistory(last7);
                }
            } catch (err) {
                console.error("Mood history error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMood();
    }, [user]);

    const handleLogMood = async () => {
        if (!user || !selectedMood) return;
        setSaving(true);
        try {
            const res = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    mood: selectedMood.label,
                    icon: selectedMood.emoji,
                    note: ""
                }),
            });
            const data = await res.json();
            if (data.success) {
                const dayName = weekDays[new Date().getDay()];
                setHistory(prev => prev.map(d => d.day === dayName ? { ...d, mood: selectedMood.emoji, level: selectedMood.level } : d));
                setSelectedMood(null);
            }
        } catch (err) {
            console.error("Log failed:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>
                {isWomen ? "Mood & Cycle" : "Mood Tracker"}
            </h1>
            <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500, marginBottom: 28 }}>
                Track your emotional well-being {isWomen ? "and menstrual cycle" : "daily"}.
            </p>

            {/* Log Today's Mood */}
            <div style={{ padding: 24, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>How are you feeling right now?</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {moods.map((m) => (
                        <motion.button
                            key={m.label}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMood(m)}
                            style={{
                                padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${selectedMood?.label === m.label ? m.color : t.cardBorder}`,
                                background: selectedMood?.label === m.label ? `${m.color}15` : "transparent",
                                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                fontFamily: "inherit", transition: "all 0.2s",
                            }}
                        >
                            <span style={{ fontSize: 28 }}>{m.emoji}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: selectedMood?.label === m.label ? m.color : t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</span>
                        </motion.button>
                    ))}
                </div>
                {selectedMood && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleLogMood}
                        disabled={saving}
                        style={{
                            marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none",
                            background: t.accentGrad, color: "#fff", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? "Saving..." : "Log Mood (+20 XP) ✨"}
                    </motion.button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isWomen ? "1fr 1fr" : "1fr", gap: 18 }}>
                {/* Weekly Mood Chart */}
                <div style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 18 }}>This Week</h3>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
                        {loading ? (
                            <p style={{ fontSize: 12, color: t.textSoft, width: "100%", textAlign: "center" }}>Loading chart...</p>
                        ) : history.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 18 }}>{d.mood}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: d.level * 20 }}
                                    transition={{ delay: i * 0.08, type: "spring" }}
                                    style={{
                                        width: "100%", maxWidth: 32, borderRadius: 6,
                                        background: t.accentGrad, opacity: 0.3 + d.level * 0.14,
                                    }}
                                />
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Period Cycle (Women only) */}
                {isWomen && (
                    <div style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 18 }}>Cycle Tracker</h3>

                        {/* Circular progress */}
                        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
                            <div style={{ position: "relative", width: 100, height: 100 }}>
                                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke={t.cardBorder} strokeWidth="8" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke={t.accent} strokeWidth="8"
                                        strokeDasharray={`${(cycleData.currentDay / cycleData.cycleLength) * 264} 264`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: t.text }}>Day {cycleData.currentDay}</span>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: t.textMuted }}>of {cycleData.cycleLength}</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{cycleData.phase} Phase</div>
                                <div style={{ fontSize: 12, color: t.textSoft, fontWeight: 500 }}>Next period: <strong>{cycleData.nextPeriod}</strong></div>
                                <div style={{ fontSize: 12, color: t.textSoft, fontWeight: 500 }}>Last period: {cycleData.lastPeriod}</div>
                            </div>
                        </div>

                        {/* Phase Legend */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {cycleData.phases.map((p) => (
                                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 3, background: p.color }} />
                                    <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{p.name} (Day {p.start}-{p.end})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
