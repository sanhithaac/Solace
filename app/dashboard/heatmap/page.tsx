"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELL = 20;
const GAP = 4;

// Each mood → its own unique color on the heatmap grid
const MOOD_COLORS: Record<string, string> = {
    Great: "#4caf7c", Happy: "#e8729a",
    Good: "#6bdb8e", Calm: "#7ec8e3",
    Okay: "#f0c35a", Tired: "#9e9e9e", Nauseous: "#8bc34a", Dizzy: "#b39ddb",
    Low: "#e8a830", Sad: "#ef6b6b", Angry: "#d94f4f", Anxious: "#e88a30",
};

type DayData = { date: string; level: number; mood: string; color: string };

export default function HeatmapPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [data, setData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; day: DayData } | null>(null);

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch(`/api/heatmap?uid=${user.uid}`);
                const json = await res.json();
                if (json.data) setData(json.data);
            } catch (err) {
                console.error("Heatmap fetch error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const emptyColor = "rgba(199,109,133,0.06)";
    const futureColor = "rgba(199,109,133,0.02)";

    // Organize days into columns (weeks). Sunday = row 0.
    const { weeks, monthLabels } = useMemo(() => {
        const validData = data.filter((d): d is DayData => d != null && typeof d.date === "string");
        if (validData.length === 0) return { weeks: [] as DayData[][], monthLabels: [] as { col: number; label: string }[] };

        const cols: DayData[][] = [];
        let col: DayData[] = [];

        // Pad first week with blanks
        const firstDate = validData[0]?.date;
        const firstDow = firstDate ? new Date(firstDate + "T00:00:00").getDay() : 0;
        for (let i = 0; i < firstDow; i++) col.push({ date: "", level: -1, mood: "", color: "" });

        for (const d of validData) {
            col.push(d);
            if (col.length === 7) {
                cols.push(col);
                col = [];
            }
        }
        if (col.length > 0) cols.push(col);

        // Month labels — find first week that enters each month
        const labels: { col: number; label: string }[] = [];
        let lastMonth = -1;
        cols.forEach((week, wi) => {
            for (const day of week) {
                if (!day?.date) continue;
                const m = new Date(day.date + "T00:00:00").getMonth();
                if (m !== lastMonth) {
                    labels.push({ col: wi, label: MONTHS[m] });
                    lastMonth = m;
                }
                break;
            }
        });

        return { weeks: cols, monthLabels: labels };
    }, [data]);

    // Stats
    const loggedDays = data.filter((d) => d && d.level >= 0);
    const totalLogged = loggedDays.length;
    const avgLevel = totalLogged > 0 ? (loggedDays.reduce((s, d) => s + d.level, 0) / totalLogged) : 0;

    //  Streaks
    const todayStr = new Date().toISOString().split("T")[0];
    let bestStreak = 0, curStreak = 0, currentStreak = 0;
    for (const d of data) {
        if (!d || !d.date) continue;
        if (d.date > todayStr) break; // don't count future
        if (d.level >= 0) { curStreak++; bestStreak = Math.max(bestStreak, curStreak); }
        else { curStreak = 0; }
    }
    // Current streak (from today backwards)
    const todayIdx = data.findIndex((d) => d && d.date === todayStr);
    if (todayIdx >= 0) {
        for (let i = todayIdx; i >= 0; i--) {
            if (!data[i] || !data[i].date) continue;
            if (data[i].level >= 0) currentStreak++;
            else break;
        }
    }

    // This month count
    const now = new Date();
    const thisMonthLogged = data.filter((d) => {
        if (!d?.date || d.level < 0) return false;
        const dd = new Date(d.date + "T00:00:00");
        return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
    }).length;

    // Mood breakdown
    const moodCounts: Record<string, { count: number; color: string }> = {};
    for (const d of loggedDays) {
        if (!d || !d.mood) continue;
        if (!moodCounts[d.mood]) moodCounts[d.mood] = { count: 0, color: d.color || MOOD_COLORS[d.mood] || "#c76d85" };
        moodCounts[d.mood].count++;
    }
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1].count - a[1].count);

    // Get cell color based on mood
    const getCellColor = (day: DayData) => {
        if (!day.date) return "transparent";
        if (day.level >= 0) {
            return day.color || MOOD_COLORS[day.mood] || "#c76d85";
        }
        // Future date: lighter shade
        if (day.date > todayStr) return futureColor;
        return emptyColor;
    };

    const handleCellHover = useCallback((e: React.MouseEvent, day: DayData) => {
        if (day.level < 0) return;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const container = (e.target as HTMLElement).closest("[data-heatmap]")?.getBoundingClientRect();
        if (!container) return;
        setTooltip({
            x: rect.left - container.left + rect.width / 2,
            y: rect.top - container.top - 8,
            day,
        });
    }, []);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    width: 36, height: 36, border: `3px solid ${t.accentBorder}`, borderTopColor: t.accent,
                    borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
                }} />
                <p style={{ color: t.textSoft, fontSize: 14, fontWeight: 600 }}>Loading your heatmap...</p>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ marginBottom: 28, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
                        Mood Heatmap
                        <span style={{ fontSize: 18, fontWeight: 700, color: t.textSoft, marginLeft: 10 }}>{currentYear}</span>
                    </h1>
                    <p style={{ fontSize: 14, color: t.textSoft, fontWeight: 500 }}>
                        {totalLogged > 0
                            ? `${totalLogged} mood ${totalLogged === 1 ? "entry" : "entries"} logged this year`
                            : "Start logging your mood daily to see it visualized here"}
                    </p>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
                {[
                    { label: "Days Logged", value: totalLogged.toString() },
                    { label: "Current Streak", value: `${currentStreak}d` },
                    { label: "Best Streak", value: `${bestStreak}d` },
                    { label: "This Month", value: `${thisMonthLogged}d` },
                ].map((s) => (
                    <div key={s.label} style={{
                        padding: "18px 20px", borderRadius: 14, background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", marginTop: 6, letterSpacing: "0.04em" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Heatmap card */}
            <div
                data-heatmap
                style={{
                    position: "relative",
                    padding: "24px 24px 20px", borderRadius: 16, background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`, overflowX: "auto", marginBottom: 28,
                }}
                onMouseLeave={() => setTooltip(null)}
            >
                {/* Month labels */}
                <div style={{ display: "flex", paddingLeft: 40, marginBottom: 8, position: "relative", height: 18 }}>
                    {monthLabels.map((m, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: 40 + m.col * (CELL + GAP),
                                top: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: t.textSoft,
                            }}
                        >
                            {m.label}
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: GAP, minWidth: weeks.length * (CELL + GAP) + 40 }}>
                    {/* Day labels */}
                    <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingRight: 8, flexShrink: 0 }}>
                        {DAY_LABELS.map((d, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 28, height: CELL,
                                    fontSize: 11, fontWeight: 600, color: t.textMuted,
                                    display: "flex", alignItems: "center",
                                    visibility: i % 2 === 1 ? "visible" : "hidden",
                                }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Weeks grid */}
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                            {week.map((day, di) => {
                                const isLogged = day.level >= 0;
                                const isToday = day.date === todayStr;
                                const cellColor = getCellColor(day);
                                return (
                                    <motion.div
                                        key={`${wi}-${di}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: wi * 0.003, duration: 0.3 }}
                                        onMouseEnter={(e) => handleCellHover(e, day)}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            width: CELL, height: CELL, borderRadius: 4,
                                            background: cellColor,
                                            cursor: isLogged ? "pointer" : "default",
                                            outline: isToday ? `2px solid ${t.accent}` : "none",
                                            outlineOffset: 1,
                                            transition: "transform 0.1s ease",
                                        }}
                                        whileHover={isLogged ? { scale: 1.5, zIndex: 10 } : {}}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Mood color legend */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginRight: 2 }}>Moods:</span>
                    {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                        <div key={mood} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: t.textSoft }}>{mood}</span>
                        </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: emptyColor }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: t.textSoft }}>No log</span>
                    </div>
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                    {tooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: "absolute",
                                left: tooltip.x,
                                top: tooltip.y,
                                transform: "translate(-50%, -100%)",
                                background: "#2d1a22",
                                color: "#fff",
                                padding: "8px 12px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                zIndex: 50,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                            }}
                        >
                            <div style={{ marginBottom: 2 }}>{formatDate(tooltip.day.date)}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: 3,
                                    background: tooltip.day.color || MOOD_COLORS[tooltip.day.mood] || "#c76d85",
                                }} />
                                <span style={{ fontSize: 13 }}>{tooltip.day.mood}</span>
                            </div>
                            {/* Arrow */}
                            <div style={{
                                position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                                width: 0, height: 0,
                                borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                                borderTop: "5px solid #2d1a22",
                            }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom section — mood breakdown + insights */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Mood Breakdown */}
                <div style={{
                    padding: "20px 22px", borderRadius: 14, background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>Mood Breakdown</h3>
                    {sortedMoods.length === 0 ? (
                        <p style={{ fontSize: 13, color: t.textSoft }}>No mood data yet. Start logging!</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {sortedMoods.map(([mood, { count, color }]) => {
                                const pct = totalLogged > 0 ? (count / totalLogged) * 100 : 0;
                                return (
                                    <div key={mood}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{mood}</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: t.textSoft }}>{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: t.accentSoft, overflow: "hidden" }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                style={{ height: "100%", borderRadius: 3, background: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Insights */}
                <div style={{
                    padding: "20px 22px", borderRadius: 14, background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>Insights</h3>
                    {totalLogged === 0 ? (
                        <p style={{ fontSize: 13, color: t.textSoft }}>Log your mood on the Mood & Cycle page to see insights here.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* Average mood bar */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.04em" }}>
                                    Average Mood Level
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: t.accentSoft, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: 4,
                                            background: t.accent,
                                            width: `${(avgLevel / 4) * 100}%`,
                                            transition: "width 0.8s ease",
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{avgLevel.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Top mood */}
                            {sortedMoods.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.04em" }}>
                                        Most Frequent
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{
                                            width: 12, height: 12, borderRadius: 3,
                                            background: sortedMoods[0][1].color,
                                        }} />
                                        <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{sortedMoods[0][0]}</span>
                                        <span style={{ fontSize: 12, color: t.textSoft }}>
                                            — {sortedMoods[0][1].count} {sortedMoods[0][1].count === 1 ? "day" : "days"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Current streak */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.04em" }}>
                                    Consistency
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                                    {currentStreak > 0
                                        ? `You're on a ${currentStreak}-day logging streak! Keep going.`
                                        : "Log your mood today to start a streak!"}
                                </div>
                            </div>

                            {/* Month over month */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.04em" }}>
                                    This Month
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                                    {thisMonthLogged} out of {now.getDate()} days logged
                                    {thisMonthLogged >= now.getDate()
                                        ? " — Perfect!"
                                        : thisMonthLogged >= now.getDate() * 0.7
                                            ? " — Great consistency!"
                                            : " — Try to log every day"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
