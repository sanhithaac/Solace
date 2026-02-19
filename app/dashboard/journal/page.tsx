"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    sentiment: string;
    tags: string[];
    createdAt: string;
}

interface JournalAnalysis {
    mood: string;
    emoji: string;
    sentiment: string;
    score: number;
    summary: string;
    clinicalInsight: string;
    positiveReframing: string;
    suggestions: string[];
    tags: string[];
}

const sentimentColors: Record<string, string> = {
    "Very Positive": "#4caf7c",
    "Positive": "#6bdb8e",
    "Neutral": "#f0c35a",
    "Mixed": "#e8a830",
    "Negative": "#ef6b6b",
};

function buildAnalysis(text: string): JournalAnalysis {
    const lower = text.toLowerCase();
    const positives = ["good", "grateful", "better", "happy", "calm", "proud", "progress", "hope", "joy", "peace"];
    const negatives = ["sad", "anxious", "stress", "overwhelmed", "tired", "angry", "fear", "panic", "alone", "hurt"];

    const positiveHits = positives.filter((word) => lower.includes(word)).length;
    const negativeHits = negatives.filter((word) => lower.includes(word)).length;
    const balance = positiveHits - negativeHits;

    let score = 5;
    if (balance >= 3) score = 9;
    else if (balance >= 1) score = 7;
    else if (balance <= -3) score = 2;
    else if (balance < 0) score = 4;

    let mood = "Reflective";
    let emoji = "📝";
    let sentiment = "Neutral";

    if (score >= 8) {
        mood = "Optimistic";
        emoji = "☀️";
        sentiment = "Very Positive";
    } else if (score >= 6) {
        mood = "Steady";
        emoji = "🌤️";
        sentiment = "Positive";
    } else if (score <= 3) {
        mood = "Heavy";
        emoji = "🌧️";
        sentiment = "Negative";
    } else if (score <= 4) {
        mood = "Mixed";
        emoji = "⛅";
        sentiment = "Mixed";
    }

    const suggestions =
        score <= 4
            ? ["4-7-8 breathing", "10-min walk", "hydrate", "message a friend"]
            : ["gratitude note", "light stretch", "protect your routine"];

    const tags = Array.from(
        new Set([
            mood.toLowerCase(),
            score <= 4 ? "support" : "growth",
            text.length > 300 ? "deep-dive" : "quick-checkin",
        ])
    );

    return {
        mood,
        emoji,
        sentiment,
        score,
        summary:
            score <= 4
                ? "Your writing shows emotional load today. Naming it clearly is already progress."
                : "Your reflection shows self-awareness and forward movement. Keep building on what works.",
        clinicalInsight:
            score <= 4
                ? "Pattern suggests stress accumulation. Reduce cognitive load and prioritize recovery tonight."
                : "Pattern suggests stable self-regulation with healthy emotional processing.",
        positiveReframing:
            score <= 4
                ? "You are not behind. You are in a hard moment and still showing up."
                : "Consistency in reflection is strengthening your emotional fitness.",
        suggestions,
        tags,
    };
}

export default function JournalPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchEntries = async () => {
            try {
                const res = await fetch(`/api/journal?uid=${user.uid}`);
                const data = await res.json();
                if (data.entries) setEntries(data.entries);
            } catch (err) {
                console.error("Failed to load journal:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [user]);

    const handleAnalyze = async () => {
        if (!newEntry.trim()) return;

        setError(null);
        setSaveMessage(null);
        setIsAnalyzing(true);

        try {
            const res = await fetch("/api/journal/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newEntry }),
            });
            const data = await res.json();
            if (!res.ok || !data.analysis) {
                throw new Error(data?.error || "Could not analyze right now.");
            }
            setAnalysis(data.analysis);
        } catch (err) {
            console.error("Analyze failed:", err);
            setAnalysis(buildAnalysis(newEntry));
            setError("AI analysis unavailable, showing local analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!newEntry.trim()) return;

        if (!user) {
            setError("Please sign in to save your reflection.");
            return;
        }

        setSaving(true);
        setError(null);
        setSaveMessage(null);

        const derived = analysis ?? buildAnalysis(newEntry);

        try {
            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    title: newTitle || newEntry.slice(0, 42) || "Untitled Entry",
                    content: newEntry,
                    mood: derived.emoji,
                    tags: ["journal", ...derived.tags],
                }),
            });

            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Failed to save your reflection.");
                return;
            }

            setEntries([data.entry, ...entries]);
            setNewTitle("");
            setNewEntry("");
            setAnalysis(null);
            setSaveMessage("Reflection saved to your journal (+50 XP).");
        } catch (err) {
            console.error("Save failed:", err);
            setError("Failed to save your reflection. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: "grid", gap: 18 }}>
            <style jsx>{`
                .journal-grid {
                    display: grid;
                    gap: 16px;
                    align-items: start;
                    grid-template-columns: minmax(0, 1fr);
                }
                @media (min-width: 1024px) {
                    .journal-grid {
                        grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
                    }
                }
            `}</style>

            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Journal</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>
                    Unload your mind. Analyze your reflection, then save it to your vault.
                </p>
            </div>

            <div className="journal-grid">
                <div
                    style={{
                        padding: 20,
                        borderRadius: 18,
                        background: t.cardBg,
                        border: `1.5px solid ${t.accentBorder}`,
                    }}
                >
                    <h2 style={{ fontSize: 30, fontWeight: 900, color: t.text, marginBottom: 14, letterSpacing: "-0.04em" }}>
                        Unload Your <span style={{ color: t.accent }}>Mind</span>
                    </h2>

                    <input
                        placeholder="Entry title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            border: "none",
                            borderBottom: `1px solid ${t.divider}`,
                            background: "transparent",
                            fontSize: 17,
                            fontWeight: 700,
                            color: t.text,
                            outline: "none",
                            fontFamily: "inherit",
                            marginBottom: 12,
                        }}
                    />

                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder="What's going on? Nobody is watching..."
                        rows={11}
                        style={{
                            width: "100%",
                            border: "none",
                            resize: "vertical",
                            background: "transparent",
                            fontSize: 15,
                            color: t.text,
                            lineHeight: 1.72,
                            outline: "none",
                            fontFamily: "inherit",
                        }}
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !newEntry.trim()}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 10,
                                border: `1px solid ${t.inputBorder}`,
                                cursor: isAnalyzing || !newEntry.trim() ? "not-allowed" : "pointer",
                                background: t.pageBg,
                                color: t.text,
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: "0.04em",
                                opacity: isAnalyzing || !newEntry.trim() ? 0.55 : 1,
                            }}
                        >
                            {isAnalyzing ? "Decoding..." : "Deep Analysis"}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving || !newEntry.trim()}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 10,
                                border: "none",
                                cursor: saving || !newEntry.trim() ? "not-allowed" : "pointer",
                                background: t.accentGrad,
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: "0.04em",
                                marginLeft: "auto",
                                opacity: saving || !newEntry.trim() ? 0.7 : 1,
                            }}
                        >
                            {saving ? "Saving..." : "Save Reflection"}
                        </motion.button>
                    </div>

                    {error && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "rgba(217,79,79,0.08)",
                                border: "1px solid rgba(217,79,79,0.18)",
                                color: t.danger,
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {saveMessage && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "rgba(76,175,124,0.08)",
                                border: "1px solid rgba(76,175,124,0.18)",
                                color: t.success,
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {saveMessage}
                        </div>
                    )}
                </div>

                <div style={{ position: "sticky", top: 24, display: "grid", gap: 12 }}>
                    <div
                        style={{
                            padding: 18,
                            borderRadius: 18,
                            background: analysis ? "rgba(199,109,133,0.12)" : t.cardBg,
                            border: `1px solid ${t.accentBorder}`,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: t.accent,
                                marginBottom: 12,
                                fontWeight: 800,
                            }}
                        >
                            AI Insights
                        </h3>

                        <AnimatePresence mode="wait">
                            {analysis ? (
                                <motion.div
                                    key="analysis"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    style={{ display: "grid", gap: 11 }}
                                >
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: "50%",
                                                background: t.pageBg,
                                                display: "grid",
                                                placeItems: "center",
                                                fontSize: 22,
                                                border: `1px solid ${t.accentBorder}`,
                                            }}
                                        >
                                            {analysis.emoji}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, textTransform: "uppercase", color: t.textMuted, fontWeight: 700 }}>
                                                Mood Detected
                                            </div>
                                            <div style={{ fontSize: 20, color: t.text, fontWeight: 800 }}>{analysis.mood}</div>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.55 }}>{analysis.summary}</p>

                                    <div style={{ display: "grid", gap: 8 }}>
                                        <div style={{ fontSize: 11, color: t.text, fontWeight: 700 }}>Clinical Insight</div>
                                        <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6 }}>{analysis.clinicalInsight}</p>
                                    </div>

                                    <div style={{ display: "grid", gap: 8 }}>
                                        <div style={{ fontSize: 11, color: t.text, fontWeight: 700 }}>Empathetic Shift</div>
                                        <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6 }}>{analysis.positiveReframing}</p>
                                    </div>

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {analysis.suggestions.map((suggestion) => (
                                            <span
                                                key={suggestion}
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "5px 8px",
                                                    borderRadius: 7,
                                                    background: t.pageBg,
                                                    color: t.text,
                                                    border: `1px solid ${t.divider}`,
                                                }}
                                            >
                                                {suggestion}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ textAlign: "center", padding: "18px 6px" }}
                                >
                                    <div style={{ fontSize: 26, opacity: 0.35, marginBottom: 4 }}>📊</div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            textTransform: "uppercase",
                                            color: t.textMuted,
                                            letterSpacing: "0.08em",
                                            fontWeight: 800,
                                        }}
                                    >
                                        Awaiting Reflection
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div
                        style={{
                            padding: 18,
                            borderRadius: 18,
                            background: "rgba(232,168,48,0.2)",
                            border: "1px solid rgba(232,168,48,0.4)",
                        }}
                    >
                        <h4
                            style={{
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#7a4d00",
                                marginBottom: 8,
                                fontWeight: 900,
                            }}
                        >
                            Privacy First
                        </h4>
                        <p style={{ fontSize: 12, color: "#7a4d00", lineHeight: 1.6, fontWeight: 700 }}>
                            Your reflections are stored in your secured account space. Only you can access your journal timeline.
                        </p>
                        <div
                            style={{
                                marginTop: 10,
                                fontSize: 10,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#7a4d00",
                            }}
                        >
                            Encrypted Session Active
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: 16, color: t.text, fontWeight: 800, letterSpacing: "-0.01em" }}>Recent Reflections</h3>
                {loading ? (
                    <p style={{ textAlign: "center", color: t.textSoft, fontSize: 14 }}>Loading your journal entries...</p>
                ) : entries.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 40,
                            background: t.cardBg,
                            borderRadius: 16,
                            border: `1px dashed ${t.cardBorder}`,
                        }}
                    >
                        <p style={{ color: t.textSoft, fontSize: 14, marginBottom: 10 }}>No entries yet.</p>
                        <p style={{ color: t.textMuted, fontSize: 12 }}>Write your first reflection above and save it.</p>
                    </div>
                ) : (
                    entries.map((entry, i) => (
                        <motion.div
                            key={entry._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                padding: "20px 22px",
                                borderRadius: 14,
                                background: t.cardBg,
                                border: `1px solid ${t.cardBorder}`,
                                transition: "border-color 0.2s",
                            }}
                            whileHover={{ borderColor: t.accent }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 24 }}>{entry.mood || "📝"}</span>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{entry.title}</h3>
                                        <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>
                                            {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                            background: `${sentimentColors[entry.sentiment] || t.accent}20`,
                                            color: sentimentColors[entry.sentiment] || t.accent,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {entry.sentiment || "Neutral"}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: t.accent,
                                            background: t.accentSoft,
                                            padding: "4px 8px",
                                            borderRadius: 5,
                                        }}
                                    >
                                        +50 XP
                                    </span>
                                </div>
                            </div>

                            <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.6, marginBottom: 12 }}>{entry.content}</p>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {entry.tags?.map((tag) => (
                                    <span
                                        key={`${entry._id}-${tag}`}
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            padding: "3px 10px",
                                            borderRadius: 6,
                                            background: t.accentSoft,
                                            color: t.accent,
                                            textTransform: "lowercase",
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
