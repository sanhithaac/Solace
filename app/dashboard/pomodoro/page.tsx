"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

type TimerState = "idle" | "focus" | "break";

// ─── Presets ────────────────────────────────────────────
const presets = [
    { focus: 25, break: 5, label: "Classic 25/5" },
    { focus: 50, break: 10, label: "Deep 50/10" },
    { focus: 15, break: 3, label: "Quick 15/3" },
    { focus: 90, break: 15, label: "Ultra 90/15" },
];

// ─── Categories ─────────────────────────────────────────
const categories = [
    { label: "Study", color: "#6b8de3" },
    { label: "Work", color: "#e88a30" },
    { label: "Code", color: "#4caf7c" },
    { label: "Read", color: "#b39ddb" },
    { label: "Create", color: "#e8729a" },
    { label: "Exercise", color: "#ef6b6b" },
    { label: "Meditate", color: "#7ec8e3" },
    { label: "Other", color: "#f0c35a" },
];

// ─── Recommended YouTube Videos ─────────────────────────
const recommendedVideos = [
    { title: "Lofi Hip Hop — Beats to Study", id: "jfKfPfyJRdk", category: "Lofi" },
    { title: "Peaceful Piano for Focus", id: "lTRiuFIWV54", category: "Piano" },
    { title: "Rain Sounds — 3 Hours", id: "mPZkdNFkNps", category: "Nature" },
    { title: "Coffee Shop Ambient", id: "h2zkV-l_TbY", category: "Ambience" },
    { title: "Deep Focus — Electronic", id: "oPVte6aMprI", category: "Electronic" },
    { title: "Studio Ghibli Music Box", id: "CExAd6MdBBI", category: "Anime" },
    { title: "Classical Music for Brain", id: "WPni755-Krg", category: "Classical" },
    { title: "Forest Sounds — Birds", id: "xNN7iTA57jM", category: "Nature" },
];

// ─── Helpers ────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    // Maybe they just pasted the ID directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
}

export default function PomodoroPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    // Timer state
    const [preset, setPreset] = useState(presets[0]);
    const [customFocus, setCustomFocus] = useState(25);
    const [customBreak, setCustomBreak] = useState(5);
    const [showCustom, setShowCustom] = useState(false);
    const [state, setState] = useState<TimerState>("idle");
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isPaused, setIsPaused] = useState(false);
    const [category, setCategory] = useState(categories[0]);

    // Stats
    const [sessions, setSessions] = useState(0);
    const [totalFocus, setTotalFocus] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);

    // YouTube
    const [ytUrl, setYtUrl] = useState("");
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [showRecommendations, setShowRecommendations] = useState(true);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalTime = state === "focus" ? preset.focus * 60 : preset.break * 60;
    const progress = state === "idle" ? 0 : ((totalTime - timeLeft) / totalTime) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const startFocus = useCallback(() => {
        setState("focus");
        setIsPaused(false);
        setTimeLeft(preset.focus * 60);
    }, [preset]);

    const startBreak = useCallback(() => {
        setState("break");
        setIsPaused(false);
        setTimeLeft(preset.break * 60);
    }, [preset]);

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState("idle");
        setIsPaused(false);
        setTimeLeft(preset.focus * 60);
    }, [preset]);

    const togglePause = () => setIsPaused((p) => !p);

    // Load stats
    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/pomodoro?uid=${user.uid}`);
                const data = await res.json();
                if (data.stats) {
                    setSessions(data.stats.todayCount);
                    setTotalFocus(data.stats.todayMinutes);
                    setTotalSessions(data.stats.totalSessions);
                    setTotalMinutes(data.stats.totalMinutes);
                }
            } catch (err) {
                console.error("Pomodoro stats error:", err);
            }
        };
        fetchStats();
    }, [user]);

    const saveSession = useCallback(async (duration: number) => {
        if (!user) return;
        try {
            await fetch("/api/pomodoro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, duration, type: "focus" }),
            });
        } catch (err) {
            console.error("Save pomodoro error:", err);
        }
    }, [user]);

    // Timer tick
    useEffect(() => {
        if (state === "idle" || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (state === "focus") {
                        setSessions((s) => s + 1);
                        setTotalFocus((f) => f + preset.focus);
                        setTotalSessions((s) => s + 1);
                        setTotalMinutes((m) => m + preset.focus);
                        saveSession(preset.focus);
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
    }, [state, isPaused, preset, startBreak, startFocus, saveSession]);

    // Preset change resets timer
    useEffect(() => {
        setTimeLeft(preset.focus * 60);
        setState("idle");
        setIsPaused(false);
    }, [preset]);

    // Apply custom timer
    const applyCustom = () => {
        const f = Math.max(1, Math.min(180, customFocus));
        const b = Math.max(1, Math.min(60, customBreak));
        const custom = { focus: f, break: b, label: `Custom ${f}/${b}` };
        setPreset(custom);
        setShowCustom(false);
    };

    // Play a YouTube video
    const playVideo = (videoId: string) => {
        setActiveVideoId(videoId);
        setShowRecommendations(false);
    };

    const playFromUrl = () => {
        const id = extractYouTubeId(ytUrl);
        if (id) {
            playVideo(id);
            setYtUrl("");
        }
    };

    return (
        <>
            {/* ─── Header ─── */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
                    Pomodoro Timer 🍅
                </h1>
                <p style={{ fontSize: 15, color: t.textSoft, fontWeight: 500 }}>
                    Stay focused, take breaks, play music, boost productivity.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 22, alignItems: "start" }}>
                {/* ═══ LEFT: Timer + Controls ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Timer Card */}
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "36px 32px", borderRadius: 20, background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                    }}>
                        {/* Category Selector */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
                            {categories.map((c) => (
                                <motion.button
                                    key={c.label}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => setCategory(c)}
                                    style={{
                                        padding: "6px 14px", borderRadius: 20,
                                        border: `1.5px solid ${category.label === c.label ? c.color : t.cardBorder}`,
                                        background: category.label === c.label ? `${c.color}15` : "transparent",
                                        color: category.label === c.label ? c.color : t.textMuted,
                                        fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s",
                                    }}
                                >
                                    {c.label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Presets */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", justifyContent: "center" }}>
                            {presets.map((p) => (
                                <button key={p.label} onClick={() => setPreset(p)} style={{
                                    padding: "8px 16px", borderRadius: 10,
                                    border: `1.5px solid ${preset.label === p.label ? t.accent : t.cardBorder}`,
                                    background: preset.label === p.label ? t.accentSoft : "transparent",
                                    color: preset.label === p.label ? t.accent : t.textMuted,
                                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                    transition: "all 0.2s",
                                }}>
                                    {p.label}
                                </button>
                            ))}
                            <button onClick={() => setShowCustom(!showCustom)} style={{
                                padding: "8px 16px", borderRadius: 10,
                                border: `1.5px solid ${showCustom ? t.accent : t.cardBorder}`,
                                background: showCustom ? t.accentSoft : "transparent",
                                color: showCustom ? t.accent : t.textMuted,
                                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                transition: "all 0.2s",
                            }}>
                                ⚙️ Custom
                            </button>
                        </div>

                        {/* Custom Timer Input */}
                        <AnimatePresence>
                            {showCustom && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: "hidden", width: "100%", maxWidth: 340, marginBottom: 12 }}
                                >
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                                        borderRadius: 12, background: t.inputBg, border: `1px solid ${t.cardBorder}`,
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                Focus (min)
                                            </label>
                                            <input
                                                type="number" min={1} max={180} value={customFocus}
                                                onChange={(e) => setCustomFocus(Number(e.target.value))}
                                                style={{
                                                    width: "100%", padding: "6px 0", border: "none", background: "transparent",
                                                    color: t.text, fontSize: 20, fontWeight: 800, outline: "none", fontFamily: "inherit",
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 18, color: t.textMuted, fontWeight: 600 }}>/</span>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                Break (min)
                                            </label>
                                            <input
                                                type="number" min={1} max={60} value={customBreak}
                                                onChange={(e) => setCustomBreak(Number(e.target.value))}
                                                style={{
                                                    width: "100%", padding: "6px 0", border: "none", background: "transparent",
                                                    color: t.text, fontSize: 20, fontWeight: 800, outline: "none", fontFamily: "inherit",
                                                }}
                                            />
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={applyCustom}
                                            style={{
                                                padding: "10px 18px", borderRadius: 10, border: "none",
                                                background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700,
                                                cursor: "pointer", fontFamily: "inherit",
                                            }}
                                        >
                                            Set
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Circular Timer */}
                        <div style={{ position: "relative", width: 240, height: 240, marginBottom: 28 }}>
                            <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="120" cy="120" r="106" fill="none" stroke={t.cardBorder} strokeWidth="8" />
                                <motion.circle
                                    cx="120" cy="120" r="106" fill="none"
                                    stroke={state === "break" ? "#4caf7c" : category.color}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${(progress / 100) * 666} 666`}
                                    style={{ transition: "stroke-dasharray 1s linear" }}
                                />
                            </svg>
                            <div style={{
                                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <div style={{ fontSize: 48, fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                                </div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                                    color: state === "focus" ? category.color : state === "break" ? "#4caf7c" : t.textMuted,
                                    marginTop: 2,
                                }}>
                                    {state === "idle" ? "Ready" : state === "focus" ? `${category.label} Focus` : "Break Time"}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: "flex", gap: 10 }}>
                            {state === "idle" ? (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={startFocus}
                                    style={{
                                        padding: "14px 40px", borderRadius: 14, border: "none",
                                        background: t.accentGrad, color: "#fff", fontSize: 16, fontWeight: 700,
                                        cursor: "pointer", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: 8,
                                    }}
                                >
                                    Start Focus ▶
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={togglePause} style={{
                                        padding: "12px 24px", borderRadius: 10,
                                        border: `1.5px solid ${isPaused ? t.accent : t.cardBorder}`,
                                        background: isPaused ? t.accentSoft : "transparent",
                                        color: isPaused ? t.accent : t.textSoft,
                                        fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                    }}>
                                        {isPaused ? "▶ Resume" : "⏸ Pause"}
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => state === "focus" ? startBreak() : startFocus()} style={{
                                        padding: "12px 24px", borderRadius: 10, border: "none",
                                        background: t.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                                        cursor: "pointer", fontFamily: "inherit",
                                    }}>
                                        Skip →
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={reset} style={{
                                        padding: "12px 24px", borderRadius: 10, border: `1.5px solid ${t.cardBorder}`,
                                        background: "transparent", color: t.textSoft, fontSize: 14, fontWeight: 700,
                                        cursor: "pointer", fontFamily: "inherit",
                                    }}>
                                        Reset
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── YouTube Music Player ─── */}
                    <div style={{ padding: 22, borderRadius: 18, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Study Music</h3>
                            {activeVideoId && (
                                <button
                                    onClick={() => { setActiveVideoId(null); setShowRecommendations(true); }}
                                    style={{
                                        padding: "5px 12px", borderRadius: 8, border: `1px solid ${t.cardBorder}`,
                                        background: "transparent", color: t.textMuted, fontSize: 11, fontWeight: 700,
                                        cursor: "pointer", fontFamily: "inherit",
                                    }}
                                >
                                    ✕ Close Player
                                </button>
                            )}
                        </div>

                        {/* URL Input */}
                        <div style={{
                            display: "flex", gap: 8, marginBottom: 16,
                            padding: 5, borderRadius: 12, border: `1.5px solid ${t.cardBorder}`, background: t.inputBg,
                        }}>
                            <input
                                value={ytUrl}
                                onChange={(e) => setYtUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && playFromUrl()}
                                placeholder="Paste YouTube URL or video ID..."
                                style={{
                                    flex: 1, padding: "10px 12px", border: "none", background: "transparent",
                                    color: t.text, fontSize: 13, fontWeight: 500, outline: "none", fontFamily: "inherit",
                                }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={playFromUrl}
                                style={{
                                    padding: "8px 18px", borderRadius: 8, border: "none",
                                    background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                ▶ Play
                            </motion.button>
                        </div>

                        {/* Video Player */}
                        <AnimatePresence>
                            {activeVideoId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: "hidden", borderRadius: 14, marginBottom: 16 }}
                                >
                                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 14, overflow: "hidden" }}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&loop=1`}
                                            title="YouTube Music Player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{
                                                position: "absolute", top: 0, left: 0,
                                                width: "100%", height: "100%", border: "none", borderRadius: 14,
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recommendations */}
                        {showRecommendations && (
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Recommended
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    {recommendedVideos.map((v) => (
                                        <motion.button
                                            key={v.id}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => playVideo(v.id)}
                                            style={{
                                                padding: "12px 14px", borderRadius: 12,
                                                border: `1px solid ${t.cardBorder}`, background: t.inputBg,
                                                cursor: "pointer", fontFamily: "inherit",
                                                textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: `${t.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill={t.accent} style={{ opacity: 0.7 }}>
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {v.title}
                                                </div>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{v.category}</div>
                                            </div>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill={t.accent} style={{ flexShrink: 0, opacity: 0.6 }}>
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT: Stats Sidebar ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Session Info */}
                    <div style={{
                        padding: "18px 18px", borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: category.color, opacity: 0.8,
                            }} />
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{category.label} Session</div>
                                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>{preset.focus}m focus / {preset.break}m break</div>
                            </div>
                        </div>
                        <div style={{
                            height: 6, borderRadius: 3, background: t.accentSoft, overflow: "hidden",
                        }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    height: "100%", borderRadius: 3,
                                    background: state === "break" ? "#4caf7c" : category.color,
                                }}
                            />
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {[
                        { label: "Sessions Today", value: sessions.toString(), icon: "🎯" },
                        { label: "Focus Today", value: `${totalFocus}m`, icon: "⏱️" },
                        { label: "All-time Sessions", value: totalSessions.toString(), icon: "🏆" },
                        { label: "All-time Focus", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: "🔥" },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            padding: "16px 18px", borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 24 }}>{stat.icon}</span>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{stat.value}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Tips */}
                    <div style={{ padding: "14px 16px", borderRadius: 12, background: t.accentSoft, border: `1px solid ${t.accentBorder}` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, textAlign: "center", lineHeight: 1.6 }}>
                            💡 Tip: Play some lo-fi music while you focus — it helps block distractions!
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
