"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface QuoteItem {
    id: number;
    quote: string;
    author: string;
}

interface SuccessStory {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    emoji: string;
    category: string;
    publishedLabel: string;
}

interface NewsItem {
    title: string;
    link: string;
    source: string;
    publishedAt: string;
    image: string;
}

const fallbackQuote: QuoteItem = {
    id: 1,
    quote: "Your courage today is the foundation of tomorrow's breakthrough.",
    author: "Maya Angelou",
};

function timeAgo(iso: string) {
    const d = new Date(iso).getTime();
    if (Number.isNaN(d)) return "Just now";
    const diffMinutes = Math.max(1, Math.floor((Date.now() - d) / (1000 * 60)));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const h = Math.floor(diffMinutes / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function StoriesPage() {
    const { t } = useTheme();
    const [quotes, setQuotes] = useState<QuoteItem[]>([fallbackQuote]);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        const loadQuotes = async () => {
            try {
                const res = await fetch("/api/stories/quotes?limit=150");
                const data = await res.json();
                if (data?.quotes?.length) setQuotes(data.quotes);
            } catch (error) {
                console.error("Quotes fetch error:", error);
            }
        };

        const loadStories = async () => {
            try {
                const res = await fetch("/api/stories/success?limit=100");
                const data = await res.json();
                if (data?.stories?.length) setStories(data.stories);
            } catch (error) {
                console.error("Success stories fetch error:", error);
            }
        };

        const loadNews = async () => {
            try {
                const res = await fetch("/api/stories/news", { cache: "no-store" });
                const data = await res.json();
                if (data?.news?.length) setNews(data.news);
            } catch (error) {
                console.error("News fetch error:", error);
            } finally {
                setLoadingNews(false);
            }
        };

        loadQuotes();
        loadStories();
        loadNews();

        const newsTimer = setInterval(loadNews, 10 * 60 * 1000);
        return () => clearInterval(newsTimer);
    }, []);

    useEffect(() => {
        if (!quotes.length) return;
        const timer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 6500);
        return () => clearInterval(timer);
    }, [quotes]);

    const activeQuote = useMemo(() => quotes[quoteIndex % Math.max(1, quotes.length)] || fallbackQuote, [quotes, quoteIndex]);
    const topNews = useMemo(() => news.slice(0, 4), [news]);
    const marqueeStories = useMemo(() => (stories.length ? [...stories, ...stories] : []), [stories]);

    return (
        <>
            <style jsx>{`
                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }

                .marquee-wrap {
                    position: relative;
                    overflow: hidden;
                    padding: 6px 0;
                }

                .marquee-track {
                    display: flex;
                    gap: 12px;
                    width: max-content;
                    animation: marqueeMove 90s linear infinite;
                    will-change: transform;
                }

                .marquee-wrap:hover .marquee-track {
                    animation-play-state: paused;
                }

                .story-card {
                    width: clamp(240px, 23vw, 320px);
                    flex-shrink: 0;
                }

                .edge-left,
                .edge-right {
                    position: absolute;
                    top: 0;
                    width: 90px;
                    height: 100%;
                    pointer-events: none;
                    z-index: 3;
                }

                .edge-left {
                    left: 0;
                    background: linear-gradient(to right, ${t.pageBg}, rgba(255, 255, 255, 0));
                }

                .edge-right {
                    right: 0;
                    background: linear-gradient(to left, ${t.pageBg}, rgba(255, 255, 255, 0));
                }

                @keyframes marqueeMove {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                @media (max-width: 1100px) {
                    .story-card {
                        width: clamp(240px, 42vw, 340px);
                    }
                    .news-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 27, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>Stories & Inspiration</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 600 }}>
                    Live momentum from women-led achievements, uplifting stories, and rotating motivation.
                </p>
            </div>

            <section style={{ marginBottom: 22 }}>
                <div style={{
                    borderRadius: 16,
                    padding: "26px 24px",
                    background: "linear-gradient(135deg, #3a2030 0%, #4a2a3d 40%, #5a3349 100%)",
                    color: "#fff",
                    boxShadow: "0 12px 34px rgba(58,32,48,0.22)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Daily Quote
                        </span>
                        <button
                            onClick={() => setQuoteIndex((prev) => (prev + 1) % Math.max(1, quotes.length))}
                            style={{
                                border: "1px solid rgba(255,255,255,0.3)",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: 8,
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Next
                        </button>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeQuote.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p style={{ fontSize: "clamp(1.1rem, 2vw, 1.6rem)", lineHeight: 1.6, fontWeight: 800, marginBottom: 8 }}>
                                "{activeQuote.quote}"
                            </p>
                            <div style={{ fontSize: 13, opacity: 0.84, fontWeight: 700 }}>- {activeQuote.author}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            <section style={{ marginBottom: 22 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 10 }}>Success Stories</h2>
                <div className="marquee-wrap">
                    <div className="edge-left" />
                    <div className="edge-right" />
                    <div className="marquee-track">
                        {marqueeStories.map((story, idx) => (
                            <motion.article
                                key={`${story.id}-${idx}`}
                                className="story-card"
                                whileHover={{ y: -4, scale: 1.015 }}
                                style={{
                                    borderRadius: 14,
                                    background: t.cardBg,
                                    border: `1px solid ${t.cardBorder}`,
                                    padding: "14px 13px",
                                    transition: "border-color 0.2s ease",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 20 }}>{story.emoji}</span>
                                        <h3 style={{ fontSize: 13.5, fontWeight: 800, color: t.text, lineHeight: 1.35 }}>{story.title}</h3>
                                    </div>
                                </div>
                                <p style={{ fontSize: 12, color: t.textSoft, fontWeight: 600, lineHeight: 1.55, marginBottom: 8 }}>
                                    {story.excerpt}
                                </p>
                                <div style={{ fontSize: 10.5, color: t.textMuted, fontWeight: 700 }}>
                                    {story.author} | {story.publishedLabel}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Most Relevant Live News</h2>
                    <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>
                        {loadingNews ? "Refreshing..." : "Scraped every 10 minutes"}
                    </span>
                </div>

                <div className="news-grid">
                    {topNews.map((item, i) => (
                        <motion.a
                            key={`${item.link}-${i}`}
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -3 }}
                            style={{
                                textDecoration: "none",
                                borderRadius: 14,
                                border: `1px solid ${t.cardBorder}`,
                                background: t.cardBg,
                                display: "grid",
                                gridTemplateColumns: "130px 1fr",
                                gap: 12,
                                minHeight: 122,
                                overflow: "hidden",
                            }}
                        >
                            <div style={{
                                width: "100%",
                                height: "100%",
                                backgroundImage: `url('${item.image || ""}')`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundColor: "rgba(199,109,133,0.15)",
                            }} />
                            <div style={{ padding: "12px 12px 12px 0", minWidth: 0 }}>
                                <h3 style={{
                                    fontSize: 13.5,
                                    fontWeight: 800,
                                    color: t.text,
                                    lineHeight: 1.45,
                                    marginBottom: 8,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}>
                                    {item.title}
                                </h3>
                                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>
                                    {item.source} | {timeAgo(item.publishedAt)}
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </section>
        </>
    );
}
