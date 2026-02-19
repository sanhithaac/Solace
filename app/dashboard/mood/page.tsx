"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

// ─── Data ───────────────────────────────────────────────
const moods = [
    { emoji: "😄", label: "Great", color: "#4caf7c", level: 5 },
    { emoji: "🥰", label: "Happy", color: "#e8729a", level: 5 },
    { emoji: "😊", label: "Good", color: "#6bdb8e", level: 4 },
    { emoji: "😌", label: "Calm", color: "#7ec8e3", level: 4 },
    { emoji: "😐", label: "Okay", color: "#f0c35a", level: 3 },
    { emoji: "😔", label: "Low", color: "#e8a830", level: 2 },
    { emoji: "😢", label: "Sad", color: "#ef6b6b", level: 1 },
    { emoji: "😤", label: "Angry", color: "#d94f4f", level: 1 },
    { emoji: "😰", label: "Anxious", color: "#e88a30", level: 1 },
    { emoji: "😴", label: "Tired", color: "#9e9e9e", level: 2 },
    { emoji: "🤢", label: "Nauseous", color: "#8bc34a", level: 2 },
    { emoji: "💫", label: "Dizzy", color: "#b39ddb", level: 2 },
];

const symptoms = [
    { emoji: "🔴", label: "Cramps" },
    { emoji: "🤕", label: "Headache" },
    { emoji: "💨", label: "Bloating" },
    { emoji: "😩", label: "Fatigue" },
    { emoji: "🤢", label: "Nausea" },
    { emoji: "😢", label: "Mood Swings" },
    { emoji: "🍫", label: "Cravings" },
    { emoji: "💤", label: "Insomnia" },
    { emoji: "🔥", label: "Hot Flashes" },
    { emoji: "😖", label: "Back Pain" },
    { emoji: "🥺", label: "Breast Tenderness" },
    { emoji: "💧", label: "Acne" },
];

const flowOptions = [
    { label: "Spotting", emoji: "💧", color: "#f8bbd0" },
    { label: "Light", emoji: "🩸", color: "#f48fb1" },
    { label: "Medium", emoji: "🩸🩸", color: "#e91e63" },
    { label: "Heavy", emoji: "🩸🩸🩸", color: "#c62828" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function toDateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function predictNextPeriod(periodDays: string[]): { nextStart: string; nextEnd: string; avgCycle: number; avgDuration: number } | null {
    if (periodDays.length < 1) return null;

    // Find period start dates (first day of each period block)
    const sorted = [...periodDays].sort();
    const periodStarts: string[] = [];
    let lastDate = "";
    for (const d of sorted) {
        if (!lastDate) {
            periodStarts.push(d);
            lastDate = d;
            continue;
        }
        const diff = (new Date(d).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 3) {
            periodStarts.push(d);
        }
        lastDate = d;
    }

    if (periodStarts.length < 1) return null;

    // Calculate average cycle length
    const cycleLengths: number[] = [];
    for (let i = 1; i < periodStarts.length; i++) {
        const diff = (new Date(periodStarts[i]).getTime() - new Date(periodStarts[i - 1]).getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 15 && diff < 45) cycleLengths.push(diff);
    }

    // Default to 28-day cycle if only one period logged
    const avgCycle = cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 28;

    // Calculate average period duration
    const durations: number[] = [];
    let currentStart = sorted[0];
    let currentEnd = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i]).getTime() - new Date(currentEnd).getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 2) {
            currentEnd = sorted[i];
        } else {
            const dur = (new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 60 * 60 * 24) + 1;
            durations.push(dur);
            currentStart = sorted[i];
            currentEnd = sorted[i];
        }
    }
    const lastDur = (new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 60 * 60 * 24) + 1;
    durations.push(lastDur);
    // Default to 5-day period if only one day logged
    const avgDuration = durations.length > 0 ? Math.max(Math.round(durations.reduce((a, b) => a + b, 0) / durations.length), 5) : 5;

    // Predict next period from the last period start
    const lastStart = periodStarts[periodStarts.length - 1];
    const nextStartDate = new Date(lastStart);
    nextStartDate.setDate(nextStartDate.getDate() + avgCycle);
    const nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextEndDate.getDate() + avgDuration - 1);

    return {
        nextStart: nextStartDate.toISOString().split("T")[0],
        nextEnd: nextEndDate.toISOString().split("T")[0],
        avgCycle,
        avgDuration,
    };
}

// ─── Component ──────────────────────────────────────────
export default function MoodPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    // Calendar state
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));

    // Form state
    const [selectedMood, setSelectedMood] = useState<typeof moods[0] | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedFlow, setSelectedFlow] = useState<string>("");
    const [isPeriodDay, setIsPeriodDay] = useState(false);
    const [note, setNote] = useState("");

    // Data
    const [monthLogs, setMonthLogs] = useState<any[]>([]);
    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"log" | "insights">("log");

    // Fetch logs for current month + all period logs for prediction
    useEffect(() => {
        if (!user) return;
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
                const [monthRes, allRes] = await Promise.all([
                    fetch(`/api/mood?uid=${user.uid}&month=${monthStr}`),
                    fetch(`/api/mood?uid=${user.uid}`),
                ]);
                const monthData = await monthRes.json();
                const allData = await allRes.json();
                if (monthData.logs) setMonthLogs(monthData.logs);
                if (allData.logs) setAllLogs(allData.logs);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user, viewYear, viewMonth]);

    // When selecting a date, populate form if log exists
    useEffect(() => {
        const existing = monthLogs.find((l) => l.date === selectedDate);
        if (existing) {
            const mDef = moods.find((m) => m.label === existing.mood) || null;
            setSelectedMood(mDef);
            setSelectedSymptoms(existing.symptoms || []);
            setSelectedFlow(existing.flow || "");
            setIsPeriodDay(existing.period || false);
            setNote(existing.note || "");
        } else {
            setSelectedMood(null);
            setSelectedSymptoms([]);
            setSelectedFlow("");
            setIsPeriodDay(false);
            setNote("");
        }
    }, [selectedDate, monthLogs]);

    // Calendar data
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    // Map of date → log
    const logMap = useMemo(() => {
        const map: Record<string, any> = {};
        for (const log of monthLogs) {
            if (log.date) map[log.date] = log;
        }
        return map;
    }, [monthLogs]);

    // Period prediction
    const periodDays = useMemo(() => allLogs.filter((l) => l.period).map((l) => l.date).filter(Boolean), [allLogs]);
    const prediction = useMemo(() => predictNextPeriod(periodDays), [periodDays]);

    // Predicted period dates for calendar highlighting
    const predictedDates = useMemo(() => {
        if (!prediction) return new Set<string>();
        const dates = new Set<string>();
        const start = new Date(prediction.nextStart);
        for (let i = 0; i < prediction.avgDuration; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            dates.add(d.toISOString().split("T")[0]);
        }
        return dates;
    }, [prediction]);

    // Navigate month
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    // Save log — when period is toggled ON, auto-mark the next 5 days as period too
    const handleSave = async () => {
        if (!user || !selectedMood) return;
        setSaving(true);
        try {
            // Save the main entry
            const res = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    mood: selectedMood.label,
                    icon: selectedMood.emoji,
                    note,
                    period: isPeriodDay,
                    flow: isPeriodDay ? selectedFlow : "",
                    symptoms: selectedSymptoms,
                    date: selectedDate,
                }),
            });
            const data = await res.json();
            if (data.success) {
                const newLogs = [data.log];

                // If period day, auto-mark the next 5 days as period days
                if (isPeriodDay) {
                    const baseDate = new Date(selectedDate + "T00:00:00");
                    const autoPromises = [];
                    for (let i = 1; i <= 5; i++) {
                        const nextDate = new Date(baseDate);
                        nextDate.setDate(nextDate.getDate() + i);
                        const nextDateStr = nextDate.toISOString().split("T")[0];
                        // Only auto-fill if that day doesn't already have a log
                        const existingLog = allLogs.find((l) => l.date === nextDateStr);
                        if (!existingLog) {
                            autoPromises.push(
                                fetch("/api/mood", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        uid: user.uid,
                                        mood: selectedMood.label,
                                        icon: selectedMood.emoji,
                                        note: "(Auto-logged period day)",
                                        period: true,
                                        flow: selectedFlow || "medium",
                                        symptoms: selectedSymptoms,
                                        date: nextDateStr,
                                    }),
                                }).then((r) => r.json())
                            );
                        }
                    }
                    const results = await Promise.all(autoPromises);
                    for (const r of results) {
                        if (r.success) newLogs.push(r.log);
                    }
                }

                // Update local state with all new logs
                const newDates = new Set(newLogs.map((l: any) => l.date));
                setMonthLogs((prev) => {
                    const filtered = prev.filter((l) => !newDates.has(l.date));
                    return [...filtered, ...newLogs].sort((a: any, b: any) => a.date.localeCompare(b.date));
                });
                setAllLogs((prev) => {
                    const filtered = prev.filter((l) => !newDates.has(l.date));
                    return [...filtered, ...newLogs];
                });
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleSymptom = (label: string) => {
        setSelectedSymptoms((prev) => prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]);
    };

    // Insight stats
    const periodDaysThisMonth = monthLogs.filter((l) => l.period).length;
    const moodCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const log of monthLogs) {
            counts[log.mood] = (counts[log.mood] || 0) + 1;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [monthLogs]);

    // Current cycle phase based on prediction
    const currentPhase = useMemo(() => {
        if (!prediction) return null;
        const todayTime = today.getTime();
        const nextStartTime = new Date(prediction.nextStart).getTime();
        const daysUntilPeriod = Math.round((nextStartTime - todayTime) / (1000 * 60 * 60 * 24));
        
        if (daysUntilPeriod <= 0 && daysUntilPeriod > -prediction.avgDuration) return { phase: "Period", emoji: "🩸", color: "#e91e63", daysUntil: 0 };
        if (daysUntilPeriod > 0 && daysUntilPeriod <= 5) return { phase: "PMS", emoji: "⚠️", color: "#ff9800", daysUntil: daysUntilPeriod };
        if (daysUntilPeriod > 5 && daysUntilPeriod <= 14) return { phase: "Luteal", emoji: "🌙", color: "#e8a830", daysUntil: daysUntilPeriod };
        if (daysUntilPeriod > 14 && daysUntilPeriod <= 17) return { phase: "Ovulation", emoji: "🌸", color: "#f0c35a", daysUntil: daysUntilPeriod };
        return { phase: "Follicular", emoji: "🌿", color: "#6bdb8e", daysUntil: daysUntilPeriod };
    }, [prediction, today]);

    return (
        <>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>
                Mood & Cycle 🌸
            </h1>
            <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500, marginBottom: 24 }}>
                Track your emotional well-being and menstrual cycle.
            </p>

            {/* ─── Cycle Overview Banner ─── */}
            {prediction && currentPhase && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: "18px 22px", borderRadius: 16, marginBottom: 20,
                        background: `linear-gradient(135deg, ${currentPhase.color}18 0%, ${currentPhase.color}08 100%)`,
                        border: `1.5px solid ${currentPhase.color}30`,
                        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                    }}
                >
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: `${currentPhase.color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 26, flexShrink: 0,
                    }}>
                        {currentPhase.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 2 }}>
                            {currentPhase.phase} Phase
                        </div>
                        <div style={{ fontSize: 12, color: t.textSoft, fontWeight: 500 }}>
                            {currentPhase.daysUntil > 0
                                ? `Next period in ${currentPhase.daysUntil} days (${new Date(prediction.nextStart).toLocaleDateString("en-IN", { month: "short", day: "numeric" })})`
                                : "You may be on your period now"}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: currentPhase.color }}>{prediction.avgCycle}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cycle Length</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: currentPhase.color }}>{prediction.avgDuration}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Period Days</div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* ─── Calendar ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: 22, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
                >
                    {/* Month Navigation */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: t.accent, padding: "4px 8px" }}>‹</button>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </h3>
                        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: t.accent, padding: "4px 8px" }}>›</button>
                    </div>

                    {/* Day Headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
                        {DAY_LABELS.map((d) => (
                            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 0" }}>{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
                        {/* Empty cells for days before month start */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`e-${i}`} style={{ aspectRatio: "1", borderRadius: 10 }} />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = toDateStr(viewYear, viewMonth, day);
                            const log = logMap[dateStr];
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;
                            const isPeriod = log?.period;
                            const isPredicted = predictedDates.has(dateStr) && !isPeriod;
                            const moodDef = log ? moods.find((m) => m.label === log.mood) : null;

                            return (
                                <motion.button
                                    key={day}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => setSelectedDate(dateStr)}
                                    style={{
                                        aspectRatio: "1", borderRadius: 10, border: "none", cursor: "pointer",
                                        background: isSelected ? t.accentGrad
                                            : isPeriod ? "linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)"
                                            : isPredicted ? "linear-gradient(135deg, #f8bbd018 0%, #f48fb118 100%)"
                                            : "transparent",
                                        borderWidth: isToday ? 2 : 0,
                                        borderStyle: "solid",
                                        borderColor: isToday ? t.accent : "transparent",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                        fontFamily: "inherit", position: "relative",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {/* Mood emoji */}
                                    {moodDef && !isSelected && (
                                        <span style={{ fontSize: 13, lineHeight: 1 }}>{moodDef.emoji}</span>
                                    )}
                                    <span style={{
                                        fontSize: moodDef && !isSelected ? 9 : 12,
                                        fontWeight: isToday || isSelected ? 800 : 600,
                                        color: isSelected || isPeriod ? "#fff" : isToday ? t.accent : t.text,
                                    }}>
                                        {day}
                                    </span>
                                    {/* Period dot */}
                                    {isPeriod && !isSelected && (
                                        <div style={{ width: 4, height: 4, borderRadius: 2, background: "#fff", position: "absolute", bottom: 3 }} />
                                    )}
                                    {/* Predicted dot */}
                                    {isPredicted && !isSelected && (
                                        <div style={{ width: 4, height: 4, borderRadius: 2, background: "#f48fb1", position: "absolute", bottom: 3, opacity: 0.6 }} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                        {[
                            { color: "#e91e63", label: "Period" },
                            { color: "#f48fb140", label: "Predicted" },
                            { color: t.accent, label: "Today" },
                        ].map((l) => (
                            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 3, background: l.color }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ─── Right Panel: Log / Insights ─── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Tab Switcher */}
                    <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 10, background: t.accentSoft }}>
                        {(["log", "insights"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: "9px 6px", borderRadius: 8, border: "none", cursor: "pointer",
                                    fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                                    textTransform: "uppercase",
                                    background: activeTab === tab ? t.accentGrad : "transparent",
                                    color: activeTab === tab ? "#fff" : t.textMuted,
                                    transition: "all 0.25s",
                                }}
                            >
                                {tab === "log" ? `📝 Log ${new Date(selectedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : "📊 Insights"}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "log" ? (
                            <motion.div
                                key="log"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{ display: "flex", flexDirection: "column", gap: 14 }}
                            >
                                {/* Mood Selection */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>How are you feeling? 💭</h4>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {moods.map((m) => (
                                            <motion.button
                                                key={m.label}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedMood(selectedMood?.label === m.label ? null : m)}
                                                style={{
                                                    padding: "8px 10px", borderRadius: 10,
                                                    border: `1.5px solid ${selectedMood?.label === m.label ? m.color : t.cardBorder}`,
                                                    background: selectedMood?.label === m.label ? `${m.color}15` : "transparent",
                                                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                                                    fontFamily: "inherit", transition: "all 0.2s", minWidth: 52,
                                                }}
                                            >
                                                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                                                <span style={{ fontSize: 8, fontWeight: 700, color: selectedMood?.label === m.label ? m.color : t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Period Toggle + Flow */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isPeriodDay ? 14 : 0 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Period day? 🩸</h4>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => { setIsPeriodDay(!isPeriodDay); if (isPeriodDay) setSelectedFlow(""); }}
                                            style={{
                                                width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                                                background: isPeriodDay ? "linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)" : t.accentSoft,
                                                position: "relative", transition: "background 0.3s",
                                            }}
                                        >
                                            <motion.div
                                                animate={{ x: isPeriodDay ? 23 : 3 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", top: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                                            />
                                        </motion.button>
                                    </div>

                                    {/* Flow Intensity */}
                                    <AnimatePresence>
                                        {isPeriodDay && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <p style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, marginBottom: 8 }}>Flow intensity:</p>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    {flowOptions.map((f) => (
                                                        <motion.button
                                                            key={f.label}
                                                            whileTap={{ scale: 0.92 }}
                                                            onClick={() => setSelectedFlow(selectedFlow === f.label.toLowerCase() ? "" : f.label.toLowerCase())}
                                                            style={{
                                                                flex: 1, padding: "10px 6px", borderRadius: 10,
                                                                border: `1.5px solid ${selectedFlow === f.label.toLowerCase() ? f.color : t.cardBorder}`,
                                                                background: selectedFlow === f.label.toLowerCase() ? `${f.color}18` : "transparent",
                                                                cursor: "pointer", fontFamily: "inherit", textAlign: "center",
                                                                transition: "all 0.2s",
                                                            }}
                                                        >
                                                            <div style={{ fontSize: 14, marginBottom: 2 }}>{f.emoji}</div>
                                                            <div style={{ fontSize: 8, fontWeight: 700, color: selectedFlow === f.label.toLowerCase() ? f.color : t.textMuted, textTransform: "uppercase" }}>{f.label}</div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Symptoms */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>Symptoms 🩹</h4>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {symptoms.map((s) => {
                                            const active = selectedSymptoms.includes(s.label);
                                            return (
                                                <motion.button
                                                    key={s.label}
                                                    whileTap={{ scale: 0.92 }}
                                                    onClick={() => toggleSymptom(s.label)}
                                                    style={{
                                                        padding: "7px 12px", borderRadius: 20,
                                                        border: `1.5px solid ${active ? t.accent : t.cardBorder}`,
                                                        background: active ? t.accentSoft : "transparent",
                                                        cursor: "pointer", fontFamily: "inherit",
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        fontSize: 11, fontWeight: 600,
                                                        color: active ? t.accent : t.textSoft,
                                                        transition: "all 0.2s",
                                                    }}
                                                >
                                                    {s.emoji} {s.label}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Note */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>Notes ✍️</h4>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="How's your day going? Any thoughts..."
                                        style={{
                                            width: "100%", minHeight: 60, padding: 12, borderRadius: 10,
                                            border: `1.5px solid ${t.cardBorder}`, background: t.inputBg,
                                            color: t.text, fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                                            outline: "none", resize: "vertical",
                                        }}
                                    />
                                </div>

                                {/* Save Button */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={!selectedMood || saving}
                                    style={{
                                        padding: "14px 24px", borderRadius: 12, border: "none",
                                        background: selectedMood ? t.accentGrad : t.accentSoft,
                                        color: selectedMood ? "#fff" : t.textMuted,
                                        fontSize: 14, fontWeight: 700, cursor: selectedMood ? "pointer" : "not-allowed",
                                        fontFamily: "inherit", opacity: saving ? 0.7 : 1,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    }}
                                >
                                    {saving ? "Saving..." : "Save Entry (+20 XP) ✨"}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="insights"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{ display: "flex", flexDirection: "column", gap: 14 }}
                            >
                                {/* Cycle Stats */}
                                {prediction && (
                                    <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14 }}>Cycle Prediction 🔮</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            {[
                                                { label: "Next Period", value: new Date(prediction.nextStart).toLocaleDateString("en-IN", { month: "short", day: "numeric" }), emoji: "📅" },
                                                { label: "Ends Around", value: new Date(prediction.nextEnd).toLocaleDateString("en-IN", { month: "short", day: "numeric" }), emoji: "🏁" },
                                                { label: "Avg Cycle", value: `${prediction.avgCycle} days`, emoji: "🔄" },
                                                { label: "Avg Duration", value: `${prediction.avgDuration} days`, emoji: "⏱️" },
                                            ].map((s) => (
                                                <div key={s.label} style={{ padding: 12, borderRadius: 10, background: t.accentSoft, textAlign: "center" }}>
                                                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.emoji}</div>
                                                    <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{s.value}</div>
                                                    <div style={{ fontSize: 9, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Monthly Mood Summary */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14 }}>
                                        {MONTH_NAMES[viewMonth]} Mood Summary 📊
                                    </h4>
                                    {moodCounts.length === 0 ? (
                                        <p style={{ fontSize: 12, color: t.textSoft, textAlign: "center", padding: 16 }}>No mood data for this month yet.</p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {moodCounts.slice(0, 6).map(([mood, count]) => {
                                                const mDef = moods.find((m) => m.label === mood);
                                                const pct = Math.round((count / monthLogs.length) * 100);
                                                return (
                                                    <div key={mood} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{mDef?.emoji || "❓"}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{mood}</span>
                                                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{count}x ({pct}%)</span>
                                                            </div>
                                                            <div style={{ height: 6, borderRadius: 3, background: t.accentSoft, overflow: "hidden" }}>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ duration: 0.5 }}
                                                                    style={{ height: "100%", borderRadius: 3, background: mDef?.color || t.accent }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Period Stats This Month */}
                                <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14 }}>Period Log This Month 🩸</h4>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "#e91e6310", textAlign: "center" }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: "#e91e63" }}>{periodDaysThisMonth}</div>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: "uppercase" }}>Period Days</div>
                                        </div>
                                        <div style={{ flex: 1, padding: 12, borderRadius: 10, background: t.accentSoft, textAlign: "center" }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>{monthLogs.length}</div>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: "uppercase" }}>Days Logged</div>
                                        </div>
                                        <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "#4caf7c10", textAlign: "center" }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: "#4caf7c" }}>
                                                {monthLogs.filter((l) => l.symptoms?.length > 0).length}
                                            </div>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: "uppercase" }}>Symptom Days</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Symptoms */}
                                {monthLogs.some((l) => l.symptoms?.length > 0) && (
                                    <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14 }}>Top Symptoms 🩹</h4>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {(() => {
                                                const symptomCount: Record<string, number> = {};
                                                for (const log of monthLogs) {
                                                    for (const s of (log.symptoms || [])) {
                                                        symptomCount[s] = (symptomCount[s] || 0) + 1;
                                                    }
                                                }
                                                return Object.entries(symptomCount)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 8)
                                                    .map(([name, count]) => {
                                                        const sDef = symptoms.find((s) => s.label === name);
                                                        return (
                                                            <div key={name} style={{
                                                                padding: "6px 12px", borderRadius: 20, background: t.accentSoft,
                                                                display: "flex", alignItems: "center", gap: 5,
                                                                fontSize: 11, fontWeight: 600, color: t.text,
                                                            }}>
                                                                {sDef?.emoji} {name} <span style={{ color: t.textMuted, fontWeight: 700 }}>×{count}</span>
                                                            </div>
                                                        );
                                                    });
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
