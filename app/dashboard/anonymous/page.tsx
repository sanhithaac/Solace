"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface AnonPost {
    _id: string;
    anonHandle: string;
    title?: string;
    content: string;
    tags: string[];
    hearts: number;
    hugs: number;
    replies: number;
    reposts: number;
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
    const [postTitle, setPostTitle] = useState("");
    const [newPost, setNewPost] = useState("");
    const [selectedTag, setSelectedTag] = useState("courage");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = user?.uid ? `?uid=${user.uid}` : "";
                const res = await fetch(`/api/anonymous${q}`);
                const data = await res.json();
                if (data.posts) setPosts(data.posts);
            } catch (err) {
                console.error("Fetch anonymous posts error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [user]);

    const addPost = async () => {
        if (!newPost.trim() || !user) return;
        setPosting(true);
        try {
            const res = await fetch("/api/anonymous", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, title: postTitle, content: newPost, tags: [selectedTag] }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts([data.post, ...posts]);
                setPostTitle("");
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
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <style jsx>{`
                .anon-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }
                @media (max-width: 900px) {
                    .anon-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
            `}</style>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Anonymous Space</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>X-style anonymous timeline: post, react, and support without revealing identity.</p>
            </div>

            <div style={{ padding: 18, borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                <input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Post header (optional)"
                    style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: t.text,
                        fontSize: 14,
                        fontWeight: 800,
                        outline: "none",
                        fontFamily: "inherit",
                        borderBottom: `1px solid ${t.divider}`,
                        paddingBottom: 8,
                        marginBottom: 10,
                    }}
                />
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What do you want to say today?"
                    rows={3}
                    style={{
                        width: "100%", border: "none", resize: "none", background: "transparent",
                        color: t.text, fontSize: 14, lineHeight: 1.65, outline: "none", fontFamily: "inherit", fontWeight: 500,
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                        padding: "10px 18px", borderRadius: 10, border: "none",
                        background: t.accentGrad, color: "#fff", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit", opacity: posting ? 0.7 : 1,
                    }}>
                        {posting ? "Posting..." : "Post (+15 XP)"}
                    </motion.button>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 11, color: t.textMuted, fontWeight: 600 }}>
                    Add a short header, then describe what happened and how you feel.
                </p>
            </div>

            <div className="anon-grid">
                {loading ? (
                    <p style={{ textAlign: "center", color: t.textSoft, padding: 30, gridColumn: "1 / -1" }}>Loading timeline...</p>
                ) : posts.length === 0 ? (
                    <p style={{ textAlign: "center", color: t.textSoft, padding: 30, gridColumn: "1 / -1" }}>No posts yet. Be the first to share.</p>
                ) : posts.map((post, i) => (
                    <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ padding: "18px 20px", borderRadius: 14, background: "#1f141b", border: "1px solid rgba(216,138,158,0.35)" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accentSoft, display: "grid", placeItems: "center", fontSize: 12, color: t.accent, fontWeight: 900 }}>X</div>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#ffeef4" }}>{post.anonHandle}</span>
                                    <span style={{ fontSize: 11, color: "#d8a9ba", fontWeight: 600, marginLeft: 8 }}>{timeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
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

                        {post.title && (
                            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 900, color: "#ffeef4", lineHeight: 1.25 }}>
                                {post.title}
                            </h3>
                        )}
                        <p style={{ fontSize: 16, color: "#ffeef4", lineHeight: 1.7, fontWeight: 600, marginBottom: 12 }}>{post.content}</p>

                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#d8a9ba" }}>↩ {post.replies || 0}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#d8a9ba" }}>🔁 {post.reposts || 0}</span>
                            <button onClick={() => react(post._id, "heart")} style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                                color: post.hearted ? "#ffd3e2" : "#d8a9ba",
                            }}>
                                ❤ {post.hearts}
                            </button>
                            <button onClick={() => react(post._id, "hug")} style={{
                                display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                                color: post.hugged ? "#ffd3e2" : "#d8a9ba",
                            }}>
                                🤗 {post.hugs}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
