"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const badges = [
    { id: 1, emoji: "🌟", name: "First Steps", desc: "Created your account", earned: true },
    { id: 2, emoji: "📝", name: "Storyteller", desc: "Wrote 10 journal entries", earned: true },
    { id: 3, emoji: "🔥", name: "On Fire", desc: "7-day login streak", earned: true },
    { id: 4, emoji: "🧘", name: "Zen Master", desc: "Completed 20 wellness exercises", earned: true },
    { id: 5, emoji: "🎯", name: "Focused", desc: "10 pomodoro sessions", earned: true },
    { id: 6, emoji: "💙", name: "Supporter", desc: "Gave 50 hearts on anonymous posts", earned: false },
    { id: 7, emoji: "📚", name: "Bookworm", desc: "Read 5 recommended books", earned: false },
    { id: 8, emoji: "🏆", name: "Champion", desc: "Reached Level 10", earned: false },
    { id: 9, emoji: "🌈", name: "Mood Master", desc: "Logged mood for 30 consecutive days", earned: false },
    { id: 10, emoji: "🤝", name: "Community Leader", desc: "Joined 5 communities", earned: false },
    { id: 11, emoji: "💪", name: "Resilient", desc: "Completed 30-day challenge", earned: false },
    { id: 12, emoji: "🎓", name: "Scholar", desc: "Completed all daily challenges for a month", earned: false },
];

const activityLog = [
    { action: "Wrote journal entry", xp: 15, time: "2h ago", icon: "📝" },
    { action: "Completed pomodoro session", xp: 10, time: "4h ago", icon: "⏱️" },
    { action: "Logged daily mood", xp: 10, time: "6h ago", icon: "😊" },
    { action: "Joined a community", xp: 20, time: "1d ago", icon: "🤝" },
    { action: "Completed breathing exercise", xp: 10, time: "1d ago", icon: "🫁" },
    { action: "Posted anonymously", xp: 5, time: "2d ago", icon: "🕊️" },
    { action: "Completed daily challenge", xp: 20, time: "2d ago", icon: "🎯" },
];

const levelData = {
    current: 7,
    xp: 320,
    nextLevelXp: 500,
    totalXp: 1820,
    title: "Mindful Explorer",
    nextTitle: "Wellness Warrior",
};

const levels = [
    { level: 1, title: "Newcomer", xp: 0 },
    { level: 3, title: "Beginner", xp: 200 },
    { level: 5, title: "Learner", xp: 600 },
    { level: 7, title: "Mindful Explorer", xp: 1500 },
    { level: 10, title: "Wellness Warrior", xp: 3000 },
    { level: 15, title: "Inner Peace Master", xp: 6000 },
    { level: 20, title: "Enlightened Soul", xp: 10000 },
];

export default function ProfilePage() {
    const { t, isDark } = useTheme();
    const progress = (levelData.xp / levelData.nextLevelXp) * 100;

    return (
        <>
            {/* Profile Header */}
            <div style={{
                padding: 28, borderRadius: 20, marginBottom: 24,
                background: t.accentGrad, position: "relative", overflow: "hidden",
            }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: -60, left: "30%", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36, border: "3px solid rgba(255,255,255,0.25)",
                    }}>
                        👤
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 2 }}>Anonymous User</h1>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>🏅 {levelData.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Level</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{levelData.current}</div>
                            </div>
                            <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total XP</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{levelData.totalXp.toLocaleString()}</div>
                            </div>
                            <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Badges</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{badges.filter((b) => b.earned).length}/{badges.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                <div style={{ position: "relative", zIndex: 2, marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{levelData.xp} / {levelData.nextLevelXp} XP</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Next: {levelData.nextTitle}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 4, background: "rgba(255,255,255,0.5)" }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Badges */}
                <div style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>🏆 Badges</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                        {badges.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    padding: "14px 12px", borderRadius: 12, textAlign: "center",
                                    background: badge.earned ? t.accentSoft : "transparent",
                                    border: `1px solid ${badge.earned ? t.accentBorder : t.divider}`,
                                    opacity: badge.earned ? 1 : 0.4,
                                    cursor: "default",
                                }}
                            >
                                <span style={{ fontSize: 24, display: "block", marginBottom: 4, filter: badge.earned ? "none" : "grayscale(1)" }}>{badge.emoji}</span>
                                <div style={{ fontSize: 11, fontWeight: 700, color: t.text, marginBottom: 2 }}>{badge.name}</div>
                                <div style={{ fontSize: 9, color: t.textMuted, fontWeight: 500 }}>{badge.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Activity + Levels */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Recent XP Activity */}
                    <div style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>⚡ XP Activity</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {activityLog.map((a, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "8px 0",
                                    borderBottom: i < activityLog.length - 1 ? `1px solid ${t.divider}` : "none",
                                }}>
                                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{a.action}</div>
                                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>{a.time}</div>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: t.accent }}>+{a.xp} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Level Roadmap */}
                    <div style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>🗺️ Level Roadmap</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {levels.map((lv, i) => {
                                const reached = levelData.current >= lv.level;
                                return (
                                    <div key={lv.level} style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "8px 12px", borderRadius: 9,
                                        background: reached ? t.accentSoft : "transparent",
                                        border: `1px solid ${reached ? t.accentBorder : t.divider}`,
                                        opacity: reached ? 1 : 0.5,
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 7, display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            background: reached ? t.accentGrad : t.cardBg,
                                            color: reached ? "#fff" : t.textMuted,
                                            fontSize: 11, fontWeight: 800, flexShrink: 0,
                                        }}>
                                            {lv.level}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{lv.title}</div>
                                            <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>{lv.xp.toLocaleString()} XP required</div>
                                        </div>
                                        {reached && <span style={{ fontSize: 12 }}>✅</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
