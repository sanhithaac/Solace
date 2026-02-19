"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const greetings = ["Good morning", "Good afternoon", "Good evening"];
function getGreeting() {
    const h = new Date().getHours();
    return h < 12 ? greetings[0] : h < 17 ? greetings[1] : greetings[2];
}

const defaultStats = [
    { label: "Mood Streak", value: "0 days", icon: "🔥", delta: "0 this week" },
    { label: "Journal Entries", value: "0", icon: "📝", delta: "+0 this week" },
    { label: "Tasks Done", value: "0/0", icon: "✅", delta: "0%" },
    { label: "Focus Time", value: "0m", icon: "⏱️", delta: "Today" },
];

const dailyChallenges = [
    { title: "Write 3 things you're grateful for", xp: 20, done: false },
    { title: "Complete a 25-min pomodoro session", xp: 15, done: false },
    { title: "Log your mood for today", xp: 10, done: false },
    { title: "Read one wellness article", xp: 10, done: false },
];

export default function DashboardPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [quickStats, setQuickStats] = useState(defaultStats);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [displayName, setDisplayName] = useState("User");
    const [loading, setLoading] = useState(true);
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [agentHealth, setAgentHealth] = useState({
        status: "unknown",
        permission: "unknown",
        lastRun: "",
        checkedCount: "0",
        lastNotifiedAt: "",
        lastNotifiedBooking: "",
        lastError: "",
    });

    const AGENT_PREFIX = "solace-reminder-agent";

    useEffect(() => {
        if (!user) return;
        const fetchDashboard = async () => {
            try {
                const [dashboardRes, bookingsRes] = await Promise.all([
                    fetch(`/api/dashboard?uid=${user.uid}`),
                    fetch(`/api/doctors/bookings?uid=${user.uid}`),
                ]);
                const data = await dashboardRes.json();
                const bookingsData = await bookingsRes.json();
                if (data.quickStats) setQuickStats(data.quickStats);
                if (data.recentActivity) setRecentActivity(data.recentActivity);
                if (data.user?.displayName) setDisplayName(data.user.displayName);
                if (bookingsData.bookings) setUpcomingBookings(bookingsData.bookings.slice(0, 3));
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const readAgentHealth = () => {
            const permission = typeof Notification !== "undefined" ? Notification.permission : "unsupported";
            setAgentHealth({
                status: localStorage.getItem(`${AGENT_PREFIX}-status`) || "unknown",
                permission,
                lastRun: localStorage.getItem(`${AGENT_PREFIX}-last-run`) || "",
                checkedCount: localStorage.getItem(`${AGENT_PREFIX}-checked-count`) || "0",
                lastNotifiedAt: localStorage.getItem(`${AGENT_PREFIX}-last-notified-at`) || "",
                lastNotifiedBooking: localStorage.getItem(`${AGENT_PREFIX}-last-notified-booking`) || "",
                lastError: localStorage.getItem(`${AGENT_PREFIX}-last-error`) || "",
            });
        };

        readAgentHealth();
        const intervalId = setInterval(readAgentHealth, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleTestNotification = async () => {
        if (typeof Notification === "undefined") return;

        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }
        if (Notification.permission !== "granted") return;

        const now = Date.now();
        new Notification("Solace Reminder Test", {
            body: "Test successful: reminder agent can send browser notifications.",
        });
        localStorage.setItem(`${AGENT_PREFIX}-last-notified-at`, String(now));
        localStorage.setItem(`${AGENT_PREFIX}-last-notified-booking`, "manual-test");
        setAgentHealth((prev) => ({
            ...prev,
            permission: Notification.permission,
            lastNotifiedAt: String(now),
            lastNotifiedBooking: "manual-test",
        }));
    };

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
                    {getGreeting()}, <span style={{ background: t.accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName}</span> 👋
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

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`, marginBottom: 18 }}
            >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 12, letterSpacing: "-0.01em" }}>
                    Upcoming Appointments
                </h3>
                {upcomingBookings.length === 0 ? (
                    <p style={{ fontSize: 13, color: t.textSoft }}>No upcoming doctor bookings yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {upcomingBookings.map((booking) => (
                            <div
                                key={booking.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: `1px solid ${t.divider}`,
                                    background: t.pageBg,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
                                        {booking.doctorName} {booking.doctorTitle ? `• ${booking.doctorTitle}` : ""}
                                    </div>
                                    <div style={{ fontSize: 11, color: t.textSoft, fontWeight: 600, marginTop: 2 }}>
                                        {new Date(booking.startTime).toLocaleString()} • {booking.sessionType}
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 800, color: t.accent, background: t.accentSoft, padding: "4px 8px", borderRadius: 6 }}>
                                    BOOKED
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`, marginBottom: 18 }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.01em" }}>Reminder Agent Status</h3>
                    <button
                        onClick={handleTestNotification}
                        style={{
                            border: `1px solid ${t.accentBorder}`,
                            background: t.accentSoft,
                            color: t.accent,
                            borderRadius: 8,
                            padding: "6px 10px",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        Send Test Notification
                    </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Status</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>{agentHealth.status}</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Permission</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>{agentHealth.permission}</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Last Run</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>
                            {agentHealth.lastRun ? new Date(Number(agentHealth.lastRun)).toLocaleTimeString() : "Not yet"}
                        </div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Bookings Checked</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>{agentHealth.checkedCount}</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Last Notification</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>
                            {agentHealth.lastNotifiedAt ? new Date(Number(agentHealth.lastNotifiedAt)).toLocaleTimeString() : "None"}
                        </div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.divider}`, background: t.pageBg }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700 }}>Last Notified Booking</div>
                        <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 2 }}>{agentHealth.lastNotifiedBooking || "-"}</div>
                    </div>
                </div>
                {agentHealth.lastError && (
                    <div style={{ marginTop: 10, fontSize: 12, color: t.danger, fontWeight: 700 }}>
                        Agent error: {agentHealth.lastError}
                    </div>
                )}
            </motion.div>

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
                        {recentActivity.length === 0 ? (
                            <p style={{ fontSize: 13, color: t.textSoft, textAlign: "center", padding: 20 }}>No activity yet. Start by logging your mood or writing a journal entry!</p>
                        ) : recentActivity.map((a, i) => (
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
