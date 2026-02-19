"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

type SortBy = "default" | "members" | "name";
type MessageRole = "user" | "doctor" | "ai";
type UserRole = "user" | "doctor";

interface CommunityItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    memberCount: number;
    joined: boolean;
}

interface CircleView extends CommunityItem {
    tag: string;
    membersDisplay: string;
    dailyFocus: string;
    tint: string;
}

interface CircleMessage {
    _id: string;
    uid: string;
    userLabel: string;
    role: MessageRole;
    text: string;
    createdAt: string;
}

interface CommunityRequestItem {
    _id: string;
    name: string;
    category: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

const focusByName: Record<string, string> = {
    "Anxiety Warriors": "Techniques for tackling 3 AM panic",
    "Healing From Heartbreak": "Finding your identity after 'we'",
    "Burnout Recovery": "The power of saying no today",
    "Morning Motivation": "One small thing you did for yourself",
    "Shadow Seeker Hub": "Open floor: what are you carrying?",
};

const tintByCategory: Record<string, string> = {
    "Fear & Panic": "rgba(139,164,232,0.26)",
    Relationships: "rgba(216,138,158,0.28)",
    "Work & Life": "rgba(232,168,48,0.28)",
    Depression: "rgba(76,175,124,0.2)",
    "Anonymous Therapy": "rgba(58,32,48,0.14)",
};


function circleSymbol(name: string): string {
    const words = name.split(" ").filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

function formatMembers(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return `${count}`;
}

function formatMessageTime(value: string): string {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function CommunitiesPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    const [items, setItems] = useState<CommunityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortBy, setSortBy] = useState<SortBy>("default");
    const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [likedMessages, setLikedMessages] = useState<string[]>([]);
    const [messages, setMessages] = useState<CircleMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [requestName, setRequestName] = useState("");
    const [requestCategory, setRequestCategory] = useState("");
    const [requestDescription, setRequestDescription] = useState("");
    const [requestMessage, setRequestMessage] = useState<string | null>(null);
    const [requests, setRequests] = useState<CommunityRequestItem[]>([]);
    const [showRequestStatusPanel, setShowRequestStatusPanel] = useState(false);
    const [pinRequestStatusPanel, setPinRequestStatusPanel] = useState(false);

    const userRole: UserRole = (user?.displayName || "").toLowerCase().includes("dr") ? "doctor" : "user";

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchCommunities = async () => {
            try {
                setError(null);
                const res = await fetch(`/api/communities?uid=${user.uid}`);
                const data = await res.json();
                if (data.communities) setItems(data.communities);
            } catch (err) {
                console.error("Communities fetch error:", err);
                setError("Could not load communities right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, [user]);

    useEffect(() => {
        if (!user) {
            setRequests([]);
            return;
        }

        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/communities/requests?uid=${user.uid}`);
                const data = await res.json();
                if (data.requests) setRequests(data.requests);
            } catch (err) {
                console.error("Requests fetch error:", err);
            }
        };

        fetchRequests();
    }, [user]);

    useEffect(() => {
        if (!activeCircleId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                const res = await fetch(`/api/communities/messages?communityId=${activeCircleId}`);
                const data = await res.json();
                if (data.messages) setMessages(data.messages);
            } catch (err) {
                console.error("Messages fetch error:", err);
                setError("Could not load circle messages right now.");
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [activeCircleId]);

    const circles = useMemo<CircleView[]>(() => {
        return items.map((c) => ({
            ...c,
            tag: c.category,
            membersDisplay: formatMembers(c.memberCount),
            dailyFocus: focusByName[c.name] || "Open support thread for today",
            tint: tintByCategory[c.category] || t.accentSoft,
        }));
    }, [items, t.accentSoft]);

    const sortedCircles = useMemo(() => {
        const result = [...circles];
        if (sortBy === "members") {
            result.sort((a, b) => b.memberCount - a.memberCount);
        } else if (sortBy === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }
        return result;
    }, [circles, sortBy]);

    const joinedCircles = useMemo(() => circles.filter((c) => c.joined), [circles]);
    const activeCircle = useMemo(() => circles.find((c) => c._id === activeCircleId) || null, [circles, activeCircleId]);
    const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
    const requestPanelVisible = showRequestStatusPanel || pinRequestStatusPanel;

    const setJoinState = (communityId: string, joined: boolean, memberCount: number) => {
        setItems((prev) =>
            prev.map((c) =>
                c._id === communityId
                    ? {
                        ...c,
                        joined,
                        memberCount,
                    }
                    : c
            )
        );
    };

    const toggleJoin = async (communityId: string, currentlyJoined: boolean) => {
        if (!user) {
            setError("Please sign in to join a circle.");
            return;
        }

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
            if (!data.success) {
                setError(data.error || "Unable to update membership.");
                return;
            }

            setJoinState(communityId, data.joined, data.memberCount);
        } catch (err) {
            console.error("Toggle join error:", err);
            setError("Unable to update membership right now.");
        }
    };

    const handleJoinOrEnter = async (circle: CircleView) => {
        if (!circle.joined) {
            await toggleJoin(circle._id, false);
        }
        setActiveCircleId(circle._id);
    };

    const handleLeave = async (communityId: string) => {
        await toggleJoin(communityId, true);
        if (activeCircleId === communityId) {
            setActiveCircleId(null);
        }
    };

    const toggleLike = (id: string) => {
        setLikedMessages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const sendMessage = async () => {
        if (!messageInput.trim() || !activeCircleId || !user) return;

        try {
            const payload = {
                communityId: activeCircleId,
                uid: user.uid,
                role: userRole,
                userLabel: userRole === "doctor" ? "You (Moderator)" : "You (Anonymous)",
                text: messageInput.trim(),
            };

            const res = await fetch("/api/communities/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Message could not be sent.");
                return;
            }

            setMessages((prev) => [...prev, data.message]);
            setMessageInput("");
        } catch (err) {
            console.error("Send message error:", err);
            setError("Could not send message right now.");
        }
    };

    const handleRequestCommunity = async () => {
        if (!user) {
            setError("Please sign in to request a community.");
            return;
        }
        if (!requestName.trim() || !requestCategory.trim()) {
            setRequestMessage("Community name and category are required.");
            return;
        }

        const icon = circleSymbol(requestName.trim());
        setRequesting(true);
        setRequestMessage(null);
        setError(null);
        try {
            const res = await fetch("/api/communities/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    name: requestName.trim(),
                    category: requestCategory.trim(),
                    description: requestDescription.trim(),
                    icon,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setRequestMessage(data.error || "Could not submit request.");
                return;
            }

            const refreshed = await fetch(`/api/communities/requests?uid=${user.uid}`);
            const refreshedData = await refreshed.json();
            if (refreshedData.requests) setRequests(refreshedData.requests);

            setRequestMessage("Request submitted. Status: pending.");
            setRequestName("");
            setRequestCategory("");
            setRequestDescription("");
            setShowRequestForm(false);
            setPinRequestStatusPanel(true);
        } catch (err) {
            console.error("Request topic error:", err);
            setRequestMessage("Could not submit request right now.");
        } finally {
            setRequesting(false);
        }
    };

    if (activeCircle) {
        return (
            <div style={{ display: "grid", gap: 14 }}>
                <style jsx>{`
                    .circle-room {
                        display: grid;
                        grid-template-columns: minmax(0, 1fr);
                        gap: 14px;
                        min-height: 78vh;
                    }
                    @media (min-width: 1120px) {
                        .circle-room {
                            grid-template-columns: 300px minmax(0, 1fr);
                        }
                    }
                `}</style>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <button
                        onClick={() => setActiveCircleId(null)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: `1px solid ${t.cardBorder}`,
                            background: t.pageBg,
                            color: t.textSoft,
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                    >
                        Back to Discover
                    </button>
                    <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>
                        Anonymous sanctuary • End-to-end encrypted
                    </span>
                    <button
                        onClick={() => handleLeave(activeCircle._id)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(217,79,79,0.35)",
                            background: "rgba(217,79,79,0.08)",
                            color: t.danger,
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                    >
                        Leave Space
                    </button>
                </div>

                <div className="circle-room">
                    <aside
                        style={{
                            display: joinedCircles.length ? "grid" : "none",
                            gap: 10,
                            alignContent: "start",
                            padding: 14,
                            borderRadius: 18,
                            background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                            maxHeight: "78vh",
                            overflowY: "auto",
                        }}
                    >
                        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted, fontWeight: 800, padding: "4px 6px" }}>
                            Your Circles
                        </div>
                        {joinedCircles.map((c) => {
                            const active = c._id === activeCircleId;
                            return (
                                <button
                                    key={c._id}
                                    onClick={() => setActiveCircleId(c._id)}
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "center",
                                        borderRadius: 12,
                                        border: `1px solid ${active ? t.accentBorder : t.cardBorder}`,
                                        background: active ? t.accentSoft : "transparent",
                                        padding: "10px 12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: c.tint, border: `1px solid ${t.cardBorder}`, fontSize: 17 }}>
                                        <span style={{ fontSize: 11, fontWeight: 900, color: t.text, letterSpacing: "0.05em" }}>{circleSymbol(c.name)}</span>
                                    </div>
                                    <div style={{ textAlign: "left", minWidth: 0 }}>
                                        <div style={{ fontSize: 12, color: active ? t.accent : t.text, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                                        <div style={{ fontSize: 9, color: t.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{c.membersDisplay} active sharing</div>
                                    </div>
                                </button>
                            );
                        })}
                    </aside>

                    <main
                        style={{
                            display: "grid",
                            gridTemplateRows: "auto 1fr auto",
                            borderRadius: 20,
                            overflow: "hidden",
                            border: `1px solid ${t.cardBorder}`,
                            background: t.cardBg,
                            minHeight: "78vh",
                        }}
                    >
                        <div style={{ padding: 18, borderBottom: `1px solid ${t.divider}`, background: activeCircle.tint }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 14, background: t.pageBg, border: `1px solid ${t.cardBorder}`, display: "grid", placeItems: "center", fontSize: 28 }}>
                                        <span style={{ fontSize: 16, fontWeight: 900, color: t.text, letterSpacing: "0.06em" }}>{circleSymbol(activeCircle.name)}</span>
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 25, fontWeight: 900, letterSpacing: "-0.02em", color: t.text }}>{activeCircle.name}</h2>
                                        <div style={{ fontSize: 10, color: t.textSoft, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                            {activeCircle.membersDisplay} healing together
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 10, color: t.textSoft, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg }}>
                                    Daily Focus: {activeCircle.dailyFocus}
                                </div>
                            </div>
                        </div>

                        <div style={{ overflowY: "auto", padding: 16, display: "grid", gap: 14, background: "rgba(58,32,48,0.04)" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, color: t.accent, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Safe Anonymous Sanctuary
                                </div>
                            </div>

                            {loadingMessages ? (
                                <p style={{ textAlign: "center", color: t.textSoft, fontSize: 13, fontWeight: 700 }}>Loading messages...</p>
                            ) : messages.length === 0 ? (
                                <p style={{ textAlign: "center", color: t.textSoft, fontSize: 13, fontWeight: 700 }}>No messages yet. Start the conversation.</p>
                            ) : messages.map((m, i) => {
                                const isDoctor = m.role === "doctor";
                                const isAI = m.role === "ai";
                                const isLiked = likedMessages.includes(m._id);
                                const isOwn = !!user && m.uid === user.uid;

                                return (
                                    <motion.div
                                        key={m._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: isOwn ? "flex-end" : "flex-start",
                                            gap: 6,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "75%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                flexWrap: "wrap",
                                                justifyContent: isOwn ? "flex-end" : "flex-start",
                                            }}
                                        >
                                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: isDoctor ? "#254ca3" : isAI ? t.accent : t.text, letterSpacing: "0.04em" }}>
                                                {m.userLabel} {isDoctor ? "(Verified Moderator)" : ""} {isAI ? "(Digital Guardian)" : ""}
                                            </span>
                                            <span style={{ fontSize: 10, color: t.textSoft, fontWeight: 800 }}>{formatMessageTime(m.createdAt)}</span>
                                        </div>
                                        <div
                                            style={{
                                                width: "75%",
                                                borderRadius: 18,
                                                border: `1px solid ${isOwn ? t.accentBorder : isDoctor ? "rgba(37,76,163,0.45)" : isAI ? t.accentBorder : "rgba(58,32,48,0.18)"}`,
                                                background: isOwn ? "rgba(199,109,133,0.16)" : "rgba(255,255,255,0.95)",
                                                padding: "14px 16px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                alignItems: "start",
                                            }}
                                        >
                                            <p style={{ fontSize: 13, color: t.text, lineHeight: 1.65, fontStyle: isAI ? "italic" : "normal", fontWeight: 700, margin: 0 }}>{m.text}</p>
                                            <button
                                                onClick={() => toggleLike(m._id)}
                                                style={{
                                                    border: `1px solid ${isLiked ? t.accentBorder : t.cardBorder}`,
                                                    background: isLiked ? t.accentSoft : "transparent",
                                                    color: isLiked ? t.accent : t.textMuted,
                                                    borderRadius: 10,
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    padding: "7px 9px",
                                                    cursor: "pointer",
                                                    alignSelf: "center",
                                                }}
                                            >
                                                {isLiked ? "Liked" : "Support"}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div style={{ borderTop: `1px solid ${t.divider}`, padding: 14, background: t.pageBg }}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder={userRole === "doctor" ? "Share professional guidance..." : "Speak your heart, anonymously..."}
                                    style={{
                                        flex: 1,
                                        borderRadius: 12,
                                        border: `1px solid ${t.inputBorder}`,
                                        background: t.inputBg,
                                        color: t.text,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        padding: "12px 14px",
                                        outline: "none",
                                        fontFamily: "inherit",
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim()}
                                    style={{
                                        borderRadius: 12,
                                        border: "none",
                                        padding: "0 16px",
                                        background: t.accentGrad,
                                        color: "#fff",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        letterSpacing: "0.04em",
                                        opacity: messageInput.trim() ? 1 : 0.6,
                                        cursor: messageInput.trim() ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    End-to-end encrypted sanctuary
                                </span>
                                {userRole === "doctor" && (
                                    <span style={{ fontSize: 10, color: "#3366cc", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        Moderator view active
                                    </span>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 10, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: 34, fontWeight: 900, color: t.text, letterSpacing: "-0.04em", marginBottom: 4 }}>
                        Circle <span style={{ color: t.accent }}>Support</span>
                    </h1>
                    <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500, maxWidth: 760 }}>
                        Anonymous spaces for shared healing. Find your circle based on your journey and connect without revealing your identity.
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted, fontWeight: 800 }}>Sort Topics</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        style={{
                            borderRadius: 10,
                            border: `1px solid ${t.inputBorder}`,
                            background: t.pageBg,
                            color: t.text,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            padding: "10px 12px",
                        }}
                    >
                        <option value="default">Relevance</option>
                        <option value="members">Active Now</option>
                        <option value="name">A-Z</option>
                    </select>
                    <div
                        onMouseEnter={() => setShowRequestStatusPanel(true)}
                        onMouseLeave={() => setShowRequestStatusPanel(false)}
                        style={{ position: "relative" }}
                    >
                        <button
                            onClick={() => setPinRequestStatusPanel((prev) => !prev)}
                            style={{
                                borderRadius: 10,
                                border: `1px solid ${t.inputBorder}`,
                                background: t.pageBg,
                                color: t.text,
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                padding: "10px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Pending {pendingRequests.length}
                        </button>
                        {requestPanelVisible && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: 300,
                                    maxHeight: 260,
                                    overflowY: "auto",
                                    borderRadius: 12,
                                    background: t.pageBg,
                                    border: `1px solid ${t.cardBorder}`,
                                    boxShadow: "0 10px 24px rgba(58,32,48,0.1)",
                                    padding: 10,
                                    zIndex: 20,
                                    display: "grid",
                                    gap: 8,
                                }}
                            >
                                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted }}>
                                    Community Requests
                                </div>
                                {requests.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: 12, color: t.textSoft, fontWeight: 700 }}>No requests yet.</p>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req._id} style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: 8, background: t.cardBg }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: t.text }}>{req.name}</span>
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 800,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                        borderRadius: 999,
                                                        padding: "3px 7px",
                                                        background: req.status === "pending" ? "rgba(232,168,48,0.18)" : req.status === "approved" ? "rgba(76,175,124,0.16)" : "rgba(217,79,79,0.14)",
                                                        color: req.status === "pending" ? t.warning : req.status === "approved" ? t.success : t.danger,
                                                        border: `1px solid ${req.status === "pending" ? "rgba(232,168,48,0.35)" : req.status === "approved" ? "rgba(76,175,124,0.35)" : "rgba(217,79,79,0.35)"}`,
                                                    }}
                                                >
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, marginTop: 4 }}>
                                                {req.category} • {new Date(req.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(217,79,79,0.2)", background: "rgba(217,79,79,0.08)", color: t.danger, fontSize: 12, fontWeight: 700 }}>
                    {error}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {loading ? (
                    <p style={{ textAlign: "center", gridColumn: "1 / -1", color: t.textSoft, padding: 40 }}>Loading communities...</p>
                ) : (
                    <>
                        {sortedCircles.map((circle, i) => (
                            <motion.div
                                key={circle._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    borderRadius: 22,
                                    border: `1px solid ${circle.joined ? t.accentBorder : t.cardBorder}`,
                                    background: t.cardBg,
                                    padding: 18,
                                    display: "grid",
                                    gap: 10,
                                }}
                            >
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: circle.tint, border: `1px solid ${t.cardBorder}`, display: "grid", placeItems: "center", fontSize: 26 }}>
                                    <span style={{ fontSize: 16, fontWeight: 900, color: t.text, letterSpacing: "0.06em" }}>{circleSymbol(circle.name)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                                    <h3 style={{ fontSize: 23, lineHeight: 1.1, letterSpacing: "-0.02em", color: t.text, fontWeight: 900 }}>{circle.name}</h3>
                                    {circle.joined && (
                                        <span style={{ borderRadius: 999, padding: "4px 8px", fontSize: 9, fontWeight: 800, color: t.accent, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.08em" }}>{circle.tag}</p>
                                <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.6, minHeight: 62 }}>{circle.description}</p>
                                <div style={{ paddingTop: 10, borderTop: `1px solid ${t.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                    <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>{circle.membersDisplay} sharing</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() => handleJoinOrEnter(circle)}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: 10,
                                                border: circle.joined ? `1px solid ${t.cardBorder}` : "none",
                                                background: circle.joined ? t.pageBg : t.accentGrad,
                                                color: circle.joined ? t.text : "#fff",
                                                fontSize: 11,
                                                fontWeight: 800,
                                                letterSpacing: "0.05em",
                                                textTransform: "uppercase",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {circle.joined ? "Enter Space" : "Join Circle"}
                                        </button>
                                        {circle.joined && (
                                            <button
                                                onClick={() => handleLeave(circle._id)}
                                                style={{
                                                    padding: "8px 12px",
                                                    borderRadius: 10,
                                                    border: "1px solid rgba(217,79,79,0.35)",
                                                    background: "rgba(217,79,79,0.08)",
                                                    color: t.danger,
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    letterSpacing: "0.05em",
                                                    textTransform: "uppercase",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Leave
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div
                            style={{
                                borderRadius: 22,
                                border: `2px dashed ${t.cardBorder}`,
                                background: t.pageBg,
                                padding: 18,
                                display: "grid",
                                alignContent: "center",
                                justifyItems: "center",
                                textAlign: "center",
                                gap: 10,
                            }}
                        >
                            <div style={{ width: 58, height: 58, borderRadius: "50%", border: `1px solid ${t.cardBorder}`, background: t.cardBg, display: "grid", placeItems: "center", fontSize: 24, color: t.accent }}>
                                +
                            </div>
                            <h4 style={{ fontSize: 24, color: t.text, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>Need a Niche?</h4>
                            <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.65, maxWidth: 230 }}>
                                Request a new anonymous circle for your specific struggle.
                            </p>
                            <button
                                onClick={() => {
                                    setShowRequestForm((prev) => !prev);
                                    setRequestMessage(null);
                                }}
                                style={{ borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg, color: t.text, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px", cursor: "pointer" }}
                            >
                                {showRequestForm ? "Close Form" : "Request Topic"}
                            </button>
                            {showRequestForm && (
                                <div style={{ marginTop: 8, width: "100%", display: "grid", gap: 8 }}>
                                    <input
                                        value={requestName}
                                        onChange={(e) => setRequestName(e.target.value)}
                                        placeholder="Community name"
                                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.pageBg, color: t.text, fontSize: 12, padding: "10px 12px", outline: "none" }}
                                    />
                                    <input
                                        value={requestCategory}
                                        onChange={(e) => setRequestCategory(e.target.value)}
                                        placeholder="Category (e.g. Study, Grief)"
                                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.pageBg, color: t.text, fontSize: 12, padding: "10px 12px", outline: "none" }}
                                    />
                                    <textarea
                                        value={requestDescription}
                                        onChange={(e) => setRequestDescription(e.target.value)}
                                        placeholder="Short description"
                                        rows={3}
                                        style={{ width: "100%", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.pageBg, color: t.text, fontSize: 12, padding: "10px 12px", outline: "none", resize: "vertical", fontFamily: "inherit" }}
                                    />
                                    <button
                                        onClick={handleRequestCommunity}
                                        disabled={requesting}
                                        style={{ borderRadius: 10, border: "none", background: t.accentGrad, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "9px 12px", cursor: requesting ? "not-allowed" : "pointer", opacity: requesting ? 0.7 : 1 }}
                                    >
                                        {requesting ? "Submitting..." : "Submit Request"}
                                    </button>
                                    {requestMessage && (
                                        <p style={{ fontSize: 11, color: requestMessage.toLowerCase().includes("pending") ? t.success : t.danger, fontWeight: 700, margin: 0 }}>
                                            {requestMessage}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
