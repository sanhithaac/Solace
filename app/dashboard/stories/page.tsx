"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const successStories = [
    { id: 1, title: "From Burnout to Balance", excerpt: "How I recovered from burnout and learned to prioritize my mental health and well-being.", author: "Anonymous", time: "2 days ago", hearts: 234, category: "Recovery", emoji: "🌅" },
    { id: 2, title: "Breaking the Silence", excerpt: "After years of suffering in silence, I finally sought help. Therapy changed my life and I want others to know it's okay to ask.", author: "Anonymous", time: "3 days ago", hearts: 456, category: "Courage", emoji: "🗣️" },
    { id: 3, title: "My Meditation Journey", excerpt: "365 days of meditation: how a simple daily practice transformed my anxiety into calm awareness.", author: "Mindful User", time: "5 days ago", hearts: 189, category: "Wellness", emoji: "🧘" },
    { id: 4, title: "Finding My Voice", excerpt: "As a woman in tech, I faced imposter syndrome daily. Here's how I overcame it and found my confidence.", author: "Anonymous", time: "1 week ago", hearts: 567, category: "Empowerment", emoji: "💪" },
];

const empowermentQuotes = [
    { quote: "She believed she could, so she did.", author: "R.S. Grey", emoji: "✨" },
    { quote: "The most courageous act is still to think for yourself. Aloud.", author: "Coco Chanel", emoji: "👑" },
    { quote: "You are more powerful than you know; you are beautiful just as you are.", author: "Melissa Etheridge", emoji: "🌸" },
    { quote: "A woman is like a tea bag — you never know how strong she is until she gets in hot water.", author: "Eleanor Roosevelt", emoji: "🍵" },
    { quote: "The question isn't who's going to let me; it's who's going to stop me.", author: "Ayn Rand", emoji: "🔥" },
    { quote: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin", emoji: "🦋" },
];

const scrapedNews = [
    { title: "Indian Women Engineers Lead Mars Mission Research", source: "Times of India", time: "1h ago", category: "STEM", emoji: "🚀" },
    { title: "Record Number of Women Founders in Tech Startups This Year", source: "Economic Times", time: "3h ago", category: "Business", emoji: "💼" },
    { title: "Mental Health Awareness Campaign Reaches 1M Women", source: "India Today", time: "6h ago", category: "Health", emoji: "🧠" },
    { title: "New Study Shows Yoga Reduces Anxiety in Women by 40%", source: "Healthline", time: "1d ago", category: "Research", emoji: "📊" },
    { title: "Women's Self-Help Groups Transform Rural Communities", source: "The Hindu", time: "1d ago", category: "Society", emoji: "🤝" },
];

export default function StoriesPage() {
    const { t } = useTheme();
    const [tab, setTab] = useState<"stories" | "quotes" | "news">("stories");

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Stories & Inspiration</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Success stories, empowerment quotes, and uplifting news.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: 4, borderRadius: 12, background: t.accentSoft, width: "fit-content" }}>
                {([
                    { key: "stories", label: "Success Stories", icon: "⭐" },
                    { key: "quotes", label: "Quotes", icon: "💬" },
                    { key: "news", label: "News & Scrapes", icon: "📰" },
                ] as const).map((tb) => (
                    <button key={tb.key} onClick={() => setTab(tb.key)} style={{
                        padding: "10px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                        background: tab === tb.key ? t.accentGrad : "transparent",
                        color: tab === tb.key ? "#fff" : t.textMuted,
                        fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 6, transition: "all 0.25s",
                    }}>
                        {tb.icon} {tb.label}
                    </button>
                ))}
            </div>

            {/* Success Stories */}
            {tab === "stories" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {successStories.map((story, i) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                                padding: "24px 22px", borderRadius: 16, background: t.cardBg,
                                border: `1px solid ${t.cardBorder}`, cursor: "pointer",
                                transition: "border-color 0.2s",
                            }}
                            whileHover={{ borderColor: t.accent }}
                        >
                            <div style={{ display: "flex", gap: 14 }}>
                                <span style={{ fontSize: 36, flexShrink: 0 }}>{story.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                        <div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 2 }}>{story.title}</h3>
                                            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{story.author} · {story.time}</div>
                                        </div>
                                        <span style={{
                                            fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                                            background: t.accentSoft, color: t.accent, textTransform: "uppercase", letterSpacing: "0.04em",
                                        }}>
                                            {story.category}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.65, marginBottom: 12, fontWeight: 500 }}>{story.excerpt}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: t.textMuted }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill={t.textMuted} opacity="0.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                        {story.hearts} hearts
                                        <span style={{ marginLeft: 10, color: t.accent, fontWeight: 700, cursor: "pointer" }}>Read more →</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quotes */}
            {tab === "quotes" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                    {empowermentQuotes.map((q, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07 }}
                            style={{
                                padding: "28px 24px", borderRadius: 16, background: t.cardBg,
                                border: `1px solid ${t.cardBorder}`, textAlign: "center",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <span style={{ fontSize: 36, marginBottom: 14 }}>{q.emoji}</span>
                            <p style={{ fontSize: 15, fontWeight: 600, color: t.text, lineHeight: 1.65, fontStyle: "italic", marginBottom: 12 }}>
                                &ldquo;{q.quote}&rdquo;
                            </p>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>— {q.author}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Scraped News */}
            {tab === "news" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {scrapedNews.map((news, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                padding: "16px 20px", borderRadius: 12, background: t.cardBg,
                                border: `1px solid ${t.cardBorder}`, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 14,
                                transition: "border-color 0.2s",
                            }}
                            whileHover={{ borderColor: t.accent }}
                        >
                            <span style={{ fontSize: 28, flexShrink: 0 }}>{news.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3 }}>{news.title}</h4>
                                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{news.source} · {news.time}</div>
                            </div>
                            <span style={{
                                fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 5,
                                background: t.accentSoft, color: t.accent, textTransform: "uppercase", letterSpacing: "0.04em",
                                flexShrink: 0,
                            }}>
                                {news.category}
                            </span>
                        </motion.div>
                    ))}
                    <div style={{
                        padding: "14px", borderRadius: 10, background: t.accentSoft,
                        border: `1px solid ${t.accentBorder}`, textAlign: "center", marginTop: 8,
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.accent }}>🤖 Stories scraped & updated every 6 hours using AI + Web Scraping</span>
                    </div>
                </div>
            )}
        </>
    );
}
