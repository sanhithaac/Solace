"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const feedItems = [
    { id: 1, type: "article", title: "Understanding Anxiety: A Student's Guide", desc: "Learn the science behind anxiety and practical techniques to manage it during exam season.", category: "Education", readTime: "5 min", emoji: "🧠", likes: 128 },
    { id: 2, type: "exercise", title: "5-Minute Box Breathing Exercise", desc: "A quick guided breathing technique to calm your nervous system instantly.", category: "Exercise", readTime: "5 min", emoji: "🫁", likes: 256 },
    { id: 3, type: "quiz", title: "What's Your Stress Style?", desc: "Take this interactive quiz to discover how you handle stress and get personalized tips.", category: "Interactive", readTime: "3 min", emoji: "📋", likes: 89 },
    { id: 4, type: "article", title: "The Power of Micro-Breaks", desc: "Why taking 30-second breaks every 25 minutes can dramatically improve your mental health.", category: "Productivity", readTime: "4 min", emoji: "⏸️", likes: 195 },
    { id: 5, type: "video", title: "Body Scan Meditation for Beginners", desc: "A 10-minute guided body scan meditation to release tension and relax.", category: "Meditation", readTime: "10 min", emoji: "🧘", likes: 312 },
    { id: 6, type: "challenge", title: "7-Day Gratitude Challenge", desc: "Write 3 things you're grateful for every day this week and watch your mood transform.", category: "Challenge", readTime: "1 min/day", emoji: "🌟", likes: 445 },
];

const categoryColors: Record<string, string> = {
    Education: "#4a6ec9",
    Exercise: "#4caf7c",
    Interactive: "#e8a830",
    Productivity: "#8ba4e8",
    Meditation: "#b5576f",
    Challenge: "#f0c35a",
};

export default function FeedPage() {
    const { t } = useTheme();

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Feed</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Interactive content curated for your wellness journey.</p>
            </div>

            {/* Category Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                {["All", "Education", "Exercise", "Interactive", "Meditation", "Challenge"].map((cat) => (
                    <button key={cat} style={{
                        padding: "8px 16px", borderRadius: 20, border: `1px solid ${cat === "All" ? t.accent : t.cardBorder}`,
                        background: cat === "All" ? t.accentSoft : "transparent",
                        color: cat === "All" ? t.accent : t.textMuted, fontSize: 11, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.03em",
                    }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Feed Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {feedItems.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3, borderColor: t.accent }}
                        style={{
                            padding: "22px 20px", borderRadius: 16, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, cursor: "pointer",
                            transition: "all 0.25s", display: "flex", flexDirection: "column",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <span style={{ fontSize: 34 }}>{item.emoji}</span>
                            <span style={{
                                fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                                background: `${categoryColors[item.category] || t.accent}18`,
                                color: categoryColors[item.category] || t.accent,
                                textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>
                                {item.category}
                            </span>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h3>
                        <p style={{ fontSize: 12.5, color: t.textSoft, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{item.desc}</p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>⏱ {item.readTime}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: t.textMuted, fontSize: 11, fontWeight: 600 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={t.textMuted} opacity="0.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                {item.likes}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
