"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const greetings = ["Good morning", "Good afternoon", "Good evening"];
function getGreeting() {
    const h = new Date().getHours();
    return h < 12 ? greetings[0] : h < 17 ? greetings[1] : greetings[2];
}

const quickStats = [
    { label: "Mood Streak", value: "12 days", icon: "🔥", delta: "+2" },
    { label: "Journal Entries", value: "47", icon: "📝", delta: "+3 this week" },
    { label: "Tasks Done", value: "8/12", icon: "✅", delta: "67%" },
    { label: "Focus Time", value: "3h 20m", icon: "⏱️", delta: "Today" },
];

const recentActivity = [
    { type: "journal", text: "Wrote a journal entry about gratitude", time: "2h ago", mood: "😊" },
    { type: "pomodoro", text: "Completed 4 pomodoro sessions", time: "4h ago", mood: "💪" },
    { type: "mood", text: "Logged mood: Feeling calm", time: "6h ago", mood: "😌" },
    { type: "community", text: "Joined 'Study Buddies' community", time: "1d ago", mood: "🤝" },
    { type: "wellness", text: "Completed 10-min breathing exercise", time: "1d ago", mood: "🧘" },
];

const dailyChallenges = [
    { title: "Write 3 things you're grateful for", xp: 20, done: true },
    { title: "Complete a 25-min pomodoro session", xp: 15, done: true },
    { title: "Log your mood for today", xp: 10, done: false },
    { title: "Read one wellness article", xp: 10, done: false },
];

export default function DashboardPage() {
    const { t, isDark } = useTheme();

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
                    {getGreeting()}, <span style={{ background: t.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>User</span> 👋
                </h1>
                <p style={{ fontSize: 14, color: t.textSoft, fontWeight: 500 }}>
                    Here&apos;s how your wellness journey is going.
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
                {quickStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                            padding: "20px 18px",
                            borderRadius: 14,
                            background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                            cursor: "default",
                            transition: "border-color 0.2s",
                        }}
                        whileHover={{ borderColor: t.accent }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <span style={{ fontSize: 28 }}>{stat.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: t.accentSoft, padding: "3px 8px", borderRadius: 6 }}>{stat.delta}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 2 }}>{stat.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Two Column: Activity + Challenges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
                >
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16, letterSpacing: "-0.01em" }}>Recent Activity</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {recentActivity.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < recentActivity.length - 1 ? `1px solid ${t.divider}` : "none" }}>
                                <span style={{ fontSize: 20 }}>{a.mood}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{a.text}</div>
                                    <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginTop: 1 }}>{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Daily Challenges */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
                >
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16, letterSpacing: "-0.01em" }}>Daily Challenges</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {dailyChallenges.map((c, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "12px 14px", borderRadius: 10,
                                background: c.done ? t.accentSoft : "transparent",
                                border: `1px solid ${c.done ? t.accentBorder : t.divider}`,
                                opacity: c.done ? 0.7 : 1,
                            }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: 6,
                                    border: `2px solid ${c.done ? t.accent : t.textMuted}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: c.done ? t.accent : "transparent",
                                    flexShrink: 0,
                                }}>
                                    {c.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, textDecoration: c.done ? "line-through" : "none" }}>{c.title}</div>
                                </div>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: t.accent,
                                    background: t.accentSoft, padding: "3px 8px", borderRadius: 5,
                                }}>+{c.xp} XP</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: t.accentSoft, textAlign: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>🎯 2 of 4 completed — 35 XP earned today</span>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
