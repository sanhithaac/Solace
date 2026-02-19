"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const badges = [
    { id: 1, emoji: "🌟", name: "First Steps", desc: "Created your account", check: (s: any) => true },
    { id: 2, emoji: "📝", name: "Storyteller", desc: "Wrote 10 journal entries", check: (s: any) => s.journalEntries >= 10 },
    { id: 3, emoji: "🔥", name: "On Fire", desc: "7-day login streak", check: (s: any) => s.moodLogs >= 7 },
    { id: 4, emoji: "🧘", name: "Zen Master", desc: "Completed 20 wellness exercises", check: (s: any) => false },
    { id: 5, emoji: "🎯", name: "Focused", desc: "10 pomodoro sessions", check: (s: any) => s.pomodoroSessions >= 10 },
    { id: 6, emoji: "💙", name: "Supporter", desc: "Gave 50 hearts on anonymous posts", check: (s: any) => false },
    { id: 7, emoji: "📚", name: "Bookworm", desc: "Read 5 recommended books", check: (s: any) => false },
    { id: 8, emoji: "🏆", name: "Champion", desc: "Reached Level 10", check: (s: any) => s.level >= 10 },
    { id: 9, emoji: "🌈", name: "Mood Master", desc: "Logged mood for 30 days", check: (s: any) => s.moodLogs >= 30 },
    { id: 10, emoji: "🤝", name: "Community Leader", desc: "Joined 5 communities", check: (s: any) => false },
    { id: 11, emoji: "💪", name: "Resilient", desc: "Completed 30-day challenge", check: (s: any) => false },
    { id: 12, emoji: "🎓", name: "Scholar", desc: "Completed all daily challenges for a month", check: (s: any) => false },
];

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
    const { t } = useTheme();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile?uid=${user.uid}`);
                const data = await res.json();
                if (data.user) setProfile(data.user);
                if (data.stats) setStats(data.stats);
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    if (loading || !profile) {
        return <p style={{ color: t.textSoft, textAlign: "center", padding: 60 }}>Loading profile...</p>;
    }

    const progress = (profile.xpInLevel / profile.xpForNext) * 100;
    const earnedBadges = badges.map((b) => ({
        ...b,
        earned: b.check({ ...stats, level: profile.level }),
    }));

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
                        {profile.photoURL ? <img src={profile.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: 20, objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 2 }}>{profile.displayName}</h1>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>🏅 {profile.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Level</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile.level}</div>
                            </div>
                            <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total XP</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile.xp.toLocaleString()}</div>
                            </div>
                            <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Badges</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{earnedBadges.filter((b) => b.earned).length}/{earnedBadges.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                <div style={{ position: "relative", zIndex: 2, marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{profile.xpInLevel} / {profile.xpForNext} XP</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Level {profile.level}</span>
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
                        {earnedBadges.map((badge, i) => (
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
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>⚡ Stats Summary</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { action: `${stats.journalEntries} journal entries`, xp: stats.journalEntries * 50, time: "All time", icon: "📝" },
                                { action: `${stats.moodLogs} mood logs`, xp: stats.moodLogs * 20, time: "All time", icon: "😊" },
                                { action: `${stats.todosDone}/${stats.todosTotal} tasks completed`, xp: stats.todosDone * 10, time: "All time", icon: "✅" },
                                { action: `${stats.pomodoroSessions} pomodoro sessions`, xp: stats.pomodoroSessions * 20, time: "All time", icon: "⏱️" },
                            ].map((a, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "8px 0",
                                    borderBottom: i < 3 ? `1px solid ${t.divider}` : "none",
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
                                const reached = profile.level >= lv.level;
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

            {/* Logout Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                style={{
                    marginTop: 24, padding: "14px 28px", borderRadius: 12, border: `1.5px solid ${t.danger}`,
                    background: "transparent", color: t.danger, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", width: "100%",
                    transition: "all 0.2s",
                }}
            >
                Sign Out
            </motion.button>
        </>
    );
}
