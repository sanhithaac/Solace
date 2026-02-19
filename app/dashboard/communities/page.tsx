"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const communities = [
    { id: 1, name: "Study Buddies", desc: "Find study partners and share academic resources", members: 1240, emoji: "📚", category: "Academic", joined: true, active: 23, color: "#4a6ec9" },
    { id: 2, name: "Anxiety Support", desc: "A safe space to discuss and manage anxiety together", members: 890, emoji: "🫂", category: "Support", joined: true, active: 45, color: "#b5576f" },
    { id: 3, name: "Mindful Women", desc: "Women supporting women through mindfulness practices", members: 560, emoji: "🌸", category: "Women", joined: false, active: 18, color: "#d88a9e" },
    { id: 4, name: "Fitness & Wellness", desc: "Share workout routines and healthy lifestyle tips", members: 2100, emoji: "💪", category: "Wellness", joined: false, active: 67, color: "#4caf7c" },
    { id: 5, name: "Creative Expression", desc: "Art, music, and writing as therapy", members: 430, emoji: "🎨", category: "Creative", joined: false, active: 12, color: "#e8a830" },
    { id: 6, name: "Night Owls", desc: "For those who need late-night company and conversation", members: 780, emoji: "🦉", category: "Social", joined: true, active: 34, color: "#8ba4e8" },
    { id: 7, name: "Career Anxiety", desc: "Discussing job search stress and career worries", members: 650, emoji: "💼", category: "Support", joined: false, active: 28, color: "#f0c35a" },
    { id: 8, name: "Book Club", desc: "Monthly mental health and self-help book discussions", members: 320, emoji: "📖", category: "Creative", joined: false, active: 8, color: "#6bdb8e" },
];

export default function CommunitiesPage() {
    const { t } = useTheme();
    const [items, setItems] = useState(communities);
    const [filter, setFilter] = useState("All");

    const toggleJoin = (id: number) => {
        setItems(items.map((c) => c.id === id ? { ...c, joined: !c.joined, members: c.joined ? c.members - 1 : c.members + 1 } : c));
    };

    const cats = ["All", ...Array.from(new Set(communities.map((c) => c.category)))];
    const filtered = filter === "All" ? items : items.filter((c) => c.category === filter);

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Communities</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Join groups of people who share your interests and experiences.</p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
                {[
                    { label: "Joined", value: items.filter((c) => c.joined).length, icon: "🏠" },
                    { label: "Available", value: items.length, icon: "🌐" },
                    { label: "Active Now", value: items.reduce((a, c) => a + c.active, 0), icon: "🟢" },
                ].map((s) => (
                    <div key={s.label} style={{ padding: "14px 18px", borderRadius: 12, background: t.cardBg, border: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{s.value}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase" }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                {cats.map((c) => (
                    <button key={c} onClick={() => setFilter(c)} style={{
                        padding: "7px 16px", borderRadius: 20, border: `1px solid ${filter === c ? t.accent : t.cardBorder}`,
                        background: filter === c ? t.accentSoft : "transparent",
                        color: filter === c ? t.accent : t.textMuted,
                        fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Community Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {filtered.map((com, i) => (
                    <motion.div
                        key={com.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            padding: 20, borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${com.joined ? t.accentBorder : t.cardBorder}`,
                            transition: "border-color 0.2s",
                        }}
                    >
                        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12, background: `${com.color}15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, flexShrink: 0,
                            }}>
                                {com.emoji}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 2 }}>{com.name}</h3>
                                <span style={{ fontSize: 10, fontWeight: 700, color: com.color, background: `${com.color}12`, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{com.category}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: 12.5, color: t.textSoft, lineHeight: 1.55, marginBottom: 14, fontWeight: 500 }}>{com.desc}</p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 12, fontSize: 11, color: t.textMuted, fontWeight: 600 }}>
                                <span>👥 {com.members.toLocaleString()}</span>
                                <span>🟢 {com.active} active</span>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleJoin(com.id)}
                                style={{
                                    padding: "8px 18px", borderRadius: 8, border: com.joined ? `1px solid ${t.accentBorder}` : "none",
                                    background: com.joined ? "transparent" : t.accentGrad,
                                    color: com.joined ? t.accent : "#fff",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                }}
                            >
                                {com.joined ? "Joined ✓" : "Join"}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
