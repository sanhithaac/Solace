"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface AnonPost {
    id: number;
    text: string;
    time: string;
    hearts: number;
    hugs: number;
    tag: string;
    hearted: boolean;
}

const initialPosts: AnonPost[] = [
    { id: 1, text: "Today I finally told someone about my anxiety. It felt like a weight was lifted off my chest. If you're struggling, please reach out. You're not alone. 💙", time: "2h ago", hearts: 48, hugs: 23, tag: "courage", hearted: false },
    { id: 2, text: "Failed my exam today but you know what? I'm not going to let it define me. Tomorrow I try again. 💪", time: "4h ago", hearts: 89, hugs: 45, tag: "resilience", hearted: false },
    { id: 3, text: "Some days I just need to cry and that's okay. Healing isn't linear.", time: "5h ago", hearts: 134, hugs: 67, tag: "healing", hearted: false },
    { id: 4, text: "Started meditation last week and I can already feel the difference. My mind feels less cluttered. Highly recommend! 🧘", time: "8h ago", hearts: 56, hugs: 12, tag: "wellness", hearted: false },
    { id: 5, text: "To the person who smiled at me today in the library — thank you. You have no idea how much I needed that.", time: "12h ago", hearts: 201, hugs: 89, tag: "gratitude", hearted: false },
    { id: 6, text: "I've been clean for 6 months now. Every single day is a battle but I'm winning. Don't give up. ❤️", time: "1d ago", hearts: 342, hugs: 178, tag: "recovery", hearted: false },
];

const tagColors: Record<string, string> = {
    courage: "#4a6ec9", resilience: "#e8a830", healing: "#b5576f",
    wellness: "#4caf7c", gratitude: "#f0c35a", recovery: "#8ba4e8",
};

export default function AnonymousPage() {
    const { t } = useTheme();
    const [posts, setPosts] = useState<AnonPost[]>(initialPosts);
    const [newPost, setNewPost] = useState("");
    const [selectedTag, setSelectedTag] = useState("courage");

    const toggleHeart = (id: number) => {
        setPosts(posts.map((p) =>
            p.id === id ? { ...p, hearted: !p.hearted, hearts: p.hearted ? p.hearts - 1 : p.hearts + 1 } : p
        ));
    };

    const addPost = () => {
        if (!newPost.trim()) return;
        setPosts([{
            id: Date.now(), text: newPost, time: "Just now",
            hearts: 0, hugs: 0, tag: selectedTag, hearted: false,
        }, ...posts]);
        setNewPost("");
    };

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Anonymous Space</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Share your thoughts freely. No identity, no judgment. 🕊️</p>
            </div>

            {/* Compose */}
            <div style={{ padding: 20, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`, marginBottom: 24 }}>
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind? Your identity stays completely anonymous..."
                    rows={3}
                    style={{
                        width: "100%", border: "none", resize: "none", background: "transparent",
                        color: t.text, fontSize: 14, lineHeight: 1.65, outline: "none", fontFamily: "inherit", fontWeight: 500,
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                        {Object.keys(tagColors).map((tag) => (
                            <button key={tag} onClick={() => setSelectedTag(tag)} style={{
                                padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                                border: `1px solid ${selectedTag === tag ? tagColors[tag] : t.cardBorder}`,
                                background: selectedTag === tag ? `${tagColors[tag]}15` : "transparent",
                                color: selectedTag === tag ? tagColors[tag] : t.textMuted,
                                cursor: "pointer", fontFamily: "inherit", textTransform: "lowercase",
                            }}>
                                #{tag}
                            </button>
                        ))}
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={addPost} style={{
                        padding: "10px 22px", borderRadius: 10, border: "none",
                        background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                    }}>
                        Post Anonymously
                    </motion.button>
                </div>
            </div>

            {/* Posts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {posts.map((post, i) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                            padding: "20px 22px", borderRadius: 14, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8, background: t.accentSoft,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 14,
                                }}>🕊️</div>
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Anonymous</span>
                                    <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 500, marginLeft: 8 }}>{post.time}</span>
                                </div>
                            </div>
                            <span style={{
                                fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 5,
                                background: `${tagColors[post.tag] || t.accent}15`,
                                color: tagColors[post.tag] || t.accent, textTransform: "lowercase",
                            }}>
                                #{post.tag}
                            </span>
                        </div>

                        <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7, fontWeight: 500, marginBottom: 14 }}>{post.text}</p>

                        <div style={{ display: "flex", gap: 16 }}>
                            <button onClick={() => toggleHeart(post.id)} style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                                color: post.hearted ? t.accent : t.textMuted, transition: "color 0.2s",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={post.hearted ? t.accent : "none"} stroke={post.hearted ? t.accent : t.textMuted} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                {post.hearts}
                            </button>
                            <button style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: t.textMuted,
                            }}>
                                🤗 {post.hugs}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
