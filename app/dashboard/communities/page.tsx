"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface CommunityItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    memberCount: number;
    joined: boolean;
}

// Default seed communities (will be created on first visit if DB is empty)
const seedCommunities = [
    { name: "Study Buddies", description: "Find study partners and share academic resources", category: "Academic", icon: "📚" },
    { name: "Anxiety Support", description: "A safe space to discuss and manage anxiety together", category: "Support", icon: "🫂" },
    { name: "Mindful Women", description: "Women supporting women through mindfulness practices", category: "Women", icon: "🌸" },
    { name: "Fitness & Wellness", description: "Share workout routines and healthy lifestyle tips", category: "Wellness", icon: "💪" },
    { name: "Creative Expression", description: "Art, music, and writing as therapy", category: "Creative", icon: "🎨" },
    { name: "Night Owls", description: "For those who need late-night company and conversation", category: "Social", icon: "🦉" },
];

const categoryColors: Record<string, string> = {
    Academic: "#4a6ec9", Support: "#b5576f", Women: "#d88a9e",
    Wellness: "#4caf7c", Creative: "#e8a830", Social: "#8ba4e8", General: "#9e9e9e",
};

export default function CommunitiesPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [items, setItems] = useState<CommunityItem[]>([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchCommunities = async () => {
            try {
                const res = await fetch(`/api/communities?uid=${user.uid}`);
                const data = await res.json();
                if (data.communities && data.communities.length > 0) {
                    setItems(data.communities);
                } else {
                    // Seed communities if empty
                    for (const seed of seedCommunities) {
                        await fetch("/api/communities", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ uid: user.uid, ...seed }),
                        });
                    }
                    // Re-fetch
                    const res2 = await fetch(`/api/communities?uid=${user.uid}`);
                    const data2 = await res2.json();
                    if (data2.communities) setItems(data2.communities);
                }
            } catch (err) {
                console.error("Communities fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunities();
    }, [user]);

    const toggleJoin = async (communityId: string, currentlyJoined: boolean) => {
        if (!user) return;
        try {
            const res = await fetch("/api/communities", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    communityId,
                    uid: user.uid,
                    action: currentlyJoined ? "leave" : "join",
                }),
            });
            const data = await res.json();
            if (data.success) {
                setItems(items.map((c) =>
                    c._id === communityId
                        ? { ...c, joined: data.joined, memberCount: data.memberCount }
                        : c
                ));
            }
        } catch (err) {
            console.error("Toggle join error:", err);
        }
    };

    const cats = ["All", ...Array.from(new Set(items.map((c) => c.category)))];
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
                {loading ? (
                    <p style={{ color: t.textSoft, textAlign: "center", padding: 30, gridColumn: "1 / -1" }}>Loading communities...</p>
                ) : filtered.map((com, i) => {
                    const color = categoryColors[com.category] || "#8ba4e8";
                    return (
                    <motion.div
                        key={com._id}
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
                                width: 48, height: 48, borderRadius: 12, background: `${color}15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, flexShrink: 0,
                            }}>
                                {com.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 2 }}>{com.name}</h3>
                                <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{com.category}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: 12.5, color: t.textSoft, lineHeight: 1.55, marginBottom: 14, fontWeight: 500 }}>{com.description}</p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 12, fontSize: 11, color: t.textMuted, fontWeight: 600 }}>
                                <span>👥 {com.memberCount.toLocaleString()}</span>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleJoin(com._id, com.joined)}
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
                    );
                })}
            </div>
        </>
    );
}
