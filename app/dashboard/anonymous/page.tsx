"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface AnonPost {
    _id: string;
    content: string;
    tags: string[];
    hearts: number;
    hugs: number;
    createdAt: string;
    hearted?: boolean;
    hugged?: boolean;
}

const tagColors: Record<string, string> = {
    courage: "#4a6ec9", resilience: "#e8a830", healing: "#b5576f",
    wellness: "#4caf7c", gratitude: "#f0c35a", recovery: "#8ba4e8",
    anxiety: "#ef6b6b", motivation: "#6bdb8e", self_care: "#d88a9e",
};

export default function AnonymousPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [posts, setPosts] = useState<AnonPost[]>([]);
    const [newPost, setNewPost] = useState("");
    const [selectedTag, setSelectedTag] = useState("courage");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch("/api/anonymous");
                const data = await res.json();
                if (data.posts) setPosts(data.posts);
            } catch (err) {
                console.error("Fetch anonymous posts error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const addPost = async () => {
        if (!newPost.trim() || !user) return;
        setPosting(true);
        try {
            const res = await fetch("/api/anonymous", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, content: newPost, tags: [selectedTag] }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts([data.post, ...posts]);
                setNewPost("");
            }
        } catch (err) {
            console.error("Post error:", err);
        } finally {
            setPosting(false);
        }
    };

    const react = async (postId: string, reaction: "heart" | "hug") => {
        if (!user) return;
        try {
            const res = await fetch("/api/anonymous", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, uid: user.uid, reaction }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map((p) =>
                    p._id === postId
                        ? {
                            ...p,
                            hearts: data.hearts,
                            hugs: data.hugs,
                            hearted: reaction === "heart" ? !p.hearted : p.hearted,
                            hugged: reaction === "hug" ? !p.hugged : p.hugged,
                        }
                        : p
                ));
            }
        } catch (err) {
            console.error("React error:", err);
        }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
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
                    <motion.button whileTap={{ scale: 0.95 }} onClick={addPost} disabled={posting} style={{
                        padding: "10px 22px", borderRadius: 10, border: "none",
                        background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit", opacity: posting ? 0.7 : 1,
                    }}>
                        {posting ? "Posting..." : "Post Anonymously (+15 XP)"}
                    </motion.button>
                </div>
            </div>

            {/* Posts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading ? (
                    <p style={{ textAlign: "center", color: t.textSoft, padding: 30 }}>Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p style={{ textAlign: "center", color: t.textSoft, padding: 30 }}>No posts yet. Be the first to share!</p>
                ) : posts.map((post, i) => (
                    <motion.div
                        key={post._id}
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
                                    <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 500, marginLeft: 8 }}>{timeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                {post.tags.map((tag) => (
                                    <span key={tag} style={{
                                        fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 5,
                                        background: `${tagColors[tag] || t.accent}15`,
                                        color: tagColors[tag] || t.accent, textTransform: "lowercase",
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7, fontWeight: 500, marginBottom: 14 }}>{post.content}</p>

                        <div style={{ display: "flex", gap: 16 }}>
                            <button onClick={() => react(post._id, "heart")} style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                                color: post.hearted ? t.accent : t.textMuted, transition: "color 0.2s",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={post.hearted ? t.accent : "none"} stroke={post.hearted ? t.accent : t.textMuted} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                {post.hearts}
                            </button>
                            <button onClick={() => react(post._id, "hug")} style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                                color: post.hugged ? t.accent : t.textMuted, transition: "color 0.2s",
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
