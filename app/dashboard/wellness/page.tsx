"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const yogaRoutines = [
    { id: 1, title: "Morning Sun Salutation", duration: "15 min", level: "Beginner", emoji: "🌅", desc: "Start your day with energy and positive vibes" },
    { id: 2, title: "Stress Relief Flow", duration: "20 min", level: "All Levels", emoji: "🧘", desc: "Release tension from neck, shoulders, and back" },
    { id: 3, title: "Bedtime Relaxation", duration: "10 min", level: "Beginner", emoji: "🌙", desc: "Gentle stretches to prepare for restful sleep" },
    { id: 4, title: "Focus & Clarity", duration: "25 min", level: "Intermediate", emoji: "🧠", desc: "Improve concentration before study sessions" },
];

const books = [
    { id: 1, title: "Atomic Habits", author: "James Clear", emoji: "⚡", category: "Productivity", rating: 4.8 },
    { id: 2, title: "The Body Keeps the Score", author: "Bessel van der Kolk", emoji: "🧠", category: "Mental Health", rating: 4.9 },
    { id: 3, title: "Feeling Good", author: "David D. Burns", emoji: "😊", category: "CBT", rating: 4.7 },
    { id: 4, title: "Why Has Nobody Told Me This Before?", author: "Dr. Julie Smith", emoji: "💡", category: "Self-Help", rating: 4.8 },
    { id: 5, title: "The Happiness Trap", author: "Russ Harris", emoji: "🦋", category: "ACT", rating: 4.6 },
    { id: 6, title: "Radical Acceptance", author: "Tara Brach", emoji: "🙏", category: "Mindfulness", rating: 4.7 },
];

const exercises = [
    { id: 1, title: "Box Breathing", duration: "4 min", emoji: "🫁", desc: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat.", type: "Breathing" },
    { id: 2, title: "5-4-3-2-1 Grounding", duration: "5 min", emoji: "🌿", desc: "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.", type: "Grounding" },
    { id: 3, title: "Progressive Muscle Relaxation", duration: "10 min", emoji: "💆", desc: "Tense and release each muscle group from toes to head.", type: "Relaxation" },
    { id: 4, title: "Gratitude Journaling", duration: "5 min", emoji: "📝", desc: "Write 3 things you're grateful for and why they matter.", type: "Mindfulness" },
    { id: 5, title: "Body Scan Meditation", duration: "15 min", emoji: "🧘", desc: "Slowly scan from head to toe, noticing sensations without judgment.", type: "Meditation" },
    { id: 6, title: "Visualization Exercise", duration: "8 min", emoji: "🏖️", desc: "Imagine your safe, peaceful place in vivid detail.", type: "Relaxation" },
];

export default function WellnessPage() {
    const { t } = useTheme();

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Wellness Hub</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Yoga, books, exercises & techniques for your mental wellbeing.</p>
            </div>

            {/* ─── Yoga ─── */}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 14 }}>🧘 Yoga Routines</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 32 }}>
                {yogaRoutines.map((yoga, i) => (
                    <motion.div
                        key={yoga.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3 }}
                        style={{
                            padding: 20, borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, cursor: "pointer", transition: "all 0.25s",
                        }}
                    >
                        <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>{yoga.emoji}</span>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{yoga.title}</h3>
                        <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.5, marginBottom: 10 }}>{yoga.desc}</p>
                        <div style={{ display: "flex", gap: 10, fontSize: 10, fontWeight: 700 }}>
                            <span style={{ color: t.textMuted }}>⏱ {yoga.duration}</span>
                            <span style={{ color: t.accent, background: t.accentSoft, padding: "2px 8px", borderRadius: 4 }}>{yoga.level}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ─── Exercises ─── */}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 14 }}>💆 Mental Health Exercises</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginBottom: 32 }}>
                {exercises.map((ex, i) => (
                    <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            padding: "16px 18px", borderRadius: 12, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.2s",
                        }}
                        whileHover={{ borderColor: t.accent }}
                    >
                        <span style={{ fontSize: 28, flexShrink: 0 }}>{ex.emoji}</span>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>{ex.title}</h4>
                            <p style={{ fontSize: 11, color: t.textSoft, lineHeight: 1.45 }}>{ex.desc}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>{ex.duration}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: t.accent, marginTop: 2 }}>{ex.type}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ─── Books ─── */}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 14 }}>📚 Recommended Books</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {books.map((book, i) => (
                    <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        style={{
                            padding: "18px 20px", borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, cursor: "pointer", transition: "all 0.25s",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <span style={{ fontSize: 32 }}>{book.emoji}</span>
                            <div>
                                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: t.text, marginBottom: 2 }}>{book.title}</h4>
                                <p style={{ fontSize: 11, color: t.textSoft, fontWeight: 500 }}>{book.author}</p>
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: "#f0c35a" }}>★ {book.rating}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: t.accent, background: t.accentSoft, padding: "2px 8px", borderRadius: 4 }}>{book.category}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
