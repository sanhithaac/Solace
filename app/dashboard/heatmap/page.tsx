"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

function generateHeatmapData() {
    const data: { date: string; level: number; mood: string }[] = [];
    const moods = ["😄", "😊", "😐", "😔", "😢"];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const level = Math.floor(Math.random() * 5);
        data.push({
            date: d.toISOString().split("T")[0],
            level,
            mood: moods[4 - level] || "😐",
        });
    }
    return data;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HeatmapPage() {
    const { t, isDark } = useTheme();
    const data = useMemo(generateHeatmapData, []);

    const colors = isDark
        ? ["rgba(139,164,232,0.05)", "rgba(139,164,232,0.15)", "rgba(139,164,232,0.3)", "rgba(139,164,232,0.55)", "rgba(139,164,232,0.85)"]
        : ["rgba(199,109,133,0.05)", "rgba(199,109,133,0.12)", "rgba(199,109,133,0.25)", "rgba(199,109,133,0.45)", "rgba(199,109,133,0.75)"];

    // Organize into weeks
    const weeks: typeof data[] = [];
    let currentWeek: typeof data = [];
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

    // Stats
    const avgMood = (data.reduce((s, d) => s + d.level, 0) / data.length).toFixed(1);
    const bestStreak = 12;
    const totalLogged = data.filter((d) => d.level > 0).length;

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
                    { label: "This Month", value: "23 days", icon: "📅" },
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
