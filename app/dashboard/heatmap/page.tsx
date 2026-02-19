"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HeatmapPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [data, setData] = useState<{ date: string; level: number; mood: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchHeatmap = async () => {
            try {
                const res = await fetch(`/api/heatmap?uid=${user.uid}`);
                const json = await res.json();
                if (json.data) setData(json.data);
            } catch (err) {
                console.error("Heatmap fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, [user]);

    const colors = ["rgba(199,109,133,0.05)", "rgba(199,109,133,0.12)", "rgba(199,109,133,0.25)", "rgba(199,109,133,0.45)", "rgba(199,109,133,0.75)"];

    // Organize into weeks
    const weeks: typeof data[] = [];
    let currentWeek: typeof data = [];
    if (data.length > 0) {
        const firstDay = new Date(data[0].date).getDay();
        for (let i = 0; i < firstDay; i++) currentWeek.push({ date: "", level: -1, mood: "" });
        for (const d of data) {
            currentWeek.push(d);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) weeks.push(currentWeek);
    }

    // Stats
    const loggedDays = data.filter((d) => d.level >= 0);
    const avgMood = loggedDays.length > 0 ? (loggedDays.reduce((s, d) => s + d.level, 0) / loggedDays.length).toFixed(1) : "0";
    const totalLogged = loggedDays.length;

    // Calculate best streak
    let bestStreak = 0, currentStreak = 0;
    for (const d of data) {
        if (d.level >= 0) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
        else { currentStreak = 0; }
    }

    // This month logged
    const now = new Date();
    const thisMonthLogged = data.filter((d) => {
        if (d.level < 0) return false;
        const dd = new Date(d.date);
        return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
    }).length;

    if (loading) return <p style={{ textAlign: "center", color: t.textSoft, padding: 60 }}>Loading heatmap...</p>;

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Mood Heatmap</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Your mood journey visualized over the past year.</p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
                {[
                    { label: "Days Logged", value: totalLogged.toString(), icon: "📊" },
                    { label: "Avg Mood", value: `${avgMood}/4`, icon: "😊" },
                    { label: "Best Streak", value: `${bestStreak} days`, icon: "🔥" },
                    { label: "This Month", value: `${thisMonthLogged} days`, icon: "📅" },
                ].map((s) => (
                    <div key={s.label} style={{
                        flex: 1, padding: "16px 18px", borderRadius: 12, background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{s.icon}</span>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{s.value}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase" }}>{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Heatmap */}
            <div style={{
                padding: 24, borderRadius: 16, background: t.cardBg,
                border: `1px solid ${t.cardBorder}`, overflowX: "auto",
            }}>
                <div style={{ display: "flex", gap: 3, minWidth: 840 }}>
                    {/* Day labels */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingRight: 8 }}>
                        {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                            <div key={i} style={{ width: 28, height: 13, fontSize: 9, fontWeight: 600, color: t.textMuted, display: "flex", alignItems: "center" }}>{d}</div>
                        ))}
                    </div>

                    {/* Weeks */}
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {week.map((day, di) => (
                                <motion.div
                                    key={`${wi}-${di}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: wi * 0.005 + di * 0.01 }}
                                    title={day.date ? `${day.date}: ${day.mood}` : ""}
                                    style={{
                                        width: 13, height: 13, borderRadius: 3,
                                        background: day.level < 0 ? "transparent" : colors[day.level],
                                        cursor: day.date ? "pointer" : "default",
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>Less</span>
                    {colors.map((c, i) => (
                        <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
                    ))}
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>More</span>
                </div>
            </div>
        </>
    );
}
