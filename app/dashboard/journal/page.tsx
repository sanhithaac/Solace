"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const sentimentColors: Record<string, string> = {
    "Very Positive": "#4caf7c",
    "Positive": "#6bdb8e",
    "Neutral": "#f0c35a",
    "Mixed": "#e8a830",
    "Negative": "#ef6b6b",
};

export default function JournalPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newEntry, setNewEntry] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load entries on mount
    useEffect(() => {
        if (!user) return;
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

    const handleSave = async () => {
        if (!newEntry.trim() || !user) return;
        setSaving(true);
        try {
            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    title: newTitle || "Untitled Entry",
                    content: newEntry,
                    mood: "📝",
                    tags: ["journal"]
                }),
            });
            const data = await res.json();
            if (data.success) {
                setEntries([data.entry, ...entries]);
                setIsWriting(false);
                setNewTitle("");
                setNewEntry("");
            }
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Journal</h1>
                    <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Write your thoughts. AI will analyze your mood & sentiment.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsWriting(!isWriting)}
                    style={{
                        padding: "11px 22px", borderRadius: 11, border: "none", cursor: "pointer",
                        background: t.accentGrad, color: "#fff", fontSize: 13, fontWeight: 700,
                        fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    {isWriting ? "Close Editor" : "New Entry"}
                </motion.button>
            </div>

            {/* Write new entry */}
            <AnimatePresence>
                {isWriting && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden", marginBottom: 24 }}
                    >
                        <div style={{
                            padding: 24, borderRadius: 16, background: t.cardBg,
                            border: `1.5px solid ${t.accentBorder}`,
                        }}>
                            <input
                                placeholder="Entry title..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{
                                    width: "100%", padding: "12px 0", border: "none", borderBottom: `1px solid ${t.divider}`,
                                    background: "transparent", fontSize: 18, fontWeight: 700, color: t.text,
                                    outline: "none", fontFamily: "inherit", marginBottom: 12,
                                }}
                            />
                            <textarea
                                placeholder="What's on your mind? Write freely — your words stay private..."
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                rows={6}
                                style={{
                                    width: "100%", padding: 0, border: "none", resize: "vertical",
                                    background: "transparent", fontSize: 14, color: t.text, lineHeight: 1.7,
                                    outline: "none", fontFamily: "inherit",
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                                <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>🤖 AI sentiment analysis will run on save</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => setIsWriting(false)} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${t.inputBorder}`, background: "transparent", color: t.textSoft, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? "Analyzing..." : "Save & Analyze ✨"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entries List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading ? (
                    <p style={{ textAlign: "center", color: t.textSoft, fontSize: 14 }}>Loading your journal entries...</p>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, background: t.cardBg, borderRadius: 16, border: `1px dashed ${t.cardBorder}` }}>
                        <p style={{ color: t.textSoft, fontSize: 14, marginBottom: 10 }}>No entries yet.</p>
                        <button onClick={() => setIsWriting(true)} style={{ background: "none", border: "none", color: t.accent, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Start your first entry</button>
                    </div>
                ) : entries.map((entry, i) => (
                    <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                            padding: "20px 22px", borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, cursor: "pointer",
                            transition: "border-color 0.2s",
                        }}
                        whileHover={{ borderColor: t.accent }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 24 }}>{entry.mood}</span>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{entry.title}</h3>
                                    <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                                    background: `${sentimentColors[entry.sentiment] || t.accent}20`,
                                    color: sentimentColors[entry.sentiment] || t.accent,
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                }}>
                                    {entry.sentiment}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, background: t.accentSoft, padding: "4px 8px", borderRadius: 5 }}>+50 XP</span>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.6, marginBottom: 12 }}>{entry.content}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {entry.tags.map((tag) => (
                                <span key={tag} style={{
                                    fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                                    background: t.accentSoft, color: t.accent, textTransform: "lowercase",
                                }}>#{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
