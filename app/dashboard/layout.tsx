"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

// ─── Nav Items ──────────────────────────────────────────────
const navItems = [
    { href: "/dashboard", label: "Overview", icon: "home" },
    { href: "/dashboard/journal", label: "Journal", icon: "journal" },
    { href: "/dashboard/mood", label: "Mood & Cycle", icon: "mood" },
    { href: "/dashboard/chat", label: "AI Chat", icon: "chat" },
    { href: "/dashboard/todos", label: "To-Do", icon: "todos" },
    { href: "/dashboard/doctors", label: "Doctors", icon: "doctors" },
    { href: "/dashboard/anonymous", label: "Anonymous", icon: "anon" },
    { href: "/dashboard/communities", label: "Communities", icon: "community" },
    { href: "/dashboard/pomodoro", label: "Pomodoro", icon: "pomodoro" },
    { href: "/dashboard/wellness", label: "Wellness", icon: "wellness" },
    { href: "/dashboard/heatmap", label: "Heatmap", icon: "heatmap" },
    { href: "/dashboard/stories", label: "Stories", icon: "stories" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
];

// ─── Icon SVGs ──────────────────────────────────────────────
function NavIcon({ icon, color }: { icon: string; color: string }) {
    const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (icon) {
        case "home": return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
        case "journal": return <svg {...s}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="13" y2="11" /></svg>;
        case "mood": return <svg {...s}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></svg>;
        case "chat": return <svg {...s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>;
        case "todos": return <svg {...s}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
        case "doctors": return <svg {...s}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
        case "anon": return <svg {...s}><circle cx="12" cy="7" r="4" /><path d="M5.5 21C5.5 16.86 8.36 14 12 14s6.5 2.86 6.5 7" /><line x1="2" y1="2" x2="22" y2="22" opacity="0.35" /></svg>;
        case "community": return <svg {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
        case "pomodoro": return <svg {...s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        case "wellness": return <svg {...s}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
        case "heatmap": return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><rect x="6" y="13" width="3" height="3" rx="0.5" fill={color} opacity="0.4" /><rect x="10.5" y="13" width="3" height="3" rx="0.5" fill={color} opacity="0.7" /><rect x="15" y="13" width="3" height="3" rx="0.5" fill={color} /></svg>;
        case "stories": return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
        case "profile": return <svg {...s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        default: return <svg {...s}><circle cx="12" cy="12" r="3" /></svg>;
    }
}

// ─── Crisis Float Button ────────────────────────────────────
function CrisisButton() {
    const { t } = useTheme();
    return (
        <Link href="/crisis">
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: "fixed", bottom: 28, right: 28, zIndex: 999,
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    boxShadow: "0 4px 24px rgba(239,68,68,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "2px solid rgba(255,255,255,0.2)",
                }}
                title="Crisis Support"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0122 16.92z" />
                </svg>
            </motion.div>
        </Link>
    );
}

// ─── Inner Layout (uses theme) ──────────────────────────────
function DashboardInner({ children }: { children: React.ReactNode }) {
    const { t } = useTheme();
    const { user } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!user || typeof window === "undefined" || typeof Notification === "undefined") return;

        const AGENT_PREFIX = "solace-reminder-agent";
        const reminderWindowMs = 30 * 60 * 1000;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        // Reminder Agent: polls upcoming bookings and sends one browser alert 30 minutes before start.
        const runReminderAgent = async () => {
            try {
                localStorage.setItem(`${AGENT_PREFIX}-status`, "running");
                localStorage.setItem(`${AGENT_PREFIX}-last-run`, String(Date.now()));
                localStorage.removeItem(`${AGENT_PREFIX}-last-error`);

                const res = await fetch(`/api/doctors/bookings?uid=${user.uid}`);
                if (!res.ok) return;
                const data = await res.json();
                const bookings = Array.isArray(data.bookings) ? data.bookings : [];
                localStorage.setItem(`${AGENT_PREFIX}-checked-count`, String(bookings.length));
                const now = Date.now();

                for (const booking of bookings) {
                    const startTime = new Date(booking.startTime).getTime();
                    if (!Number.isFinite(startTime)) continue;
                    const reminderAt = startTime - reminderWindowMs;
                    if (now < reminderAt || now >= startTime) continue;

                    const key = `solace-reminder-${booking.id}-${reminderAt}`;
                    if (localStorage.getItem(key)) continue;

                    if (Notification.permission === "granted") {
                        new Notification("Upcoming Appointment", {
                            body: `Your session with ${booking.doctorName || "your doctor"} starts in 30 minutes.`,
                        });
                        localStorage.setItem(`${AGENT_PREFIX}-last-notified-at`, String(now));
                        localStorage.setItem(`${AGENT_PREFIX}-last-notified-booking`, booking.id || "");
                    }

                    localStorage.setItem(key, String(now));
                }
            } catch (err) {
                console.error("Reminder agent error:", err);
                const message = err instanceof Error ? err.message : "Unknown reminder agent error";
                localStorage.setItem(`${AGENT_PREFIX}-last-error`, message);
            }
        };

        if (Notification.permission === "default") {
            Notification.requestPermission().catch(() => {
                // ignore permission request failure
            });
        }

        runReminderAgent();
        intervalId = setInterval(runReminderAgent, 60 * 1000);

        return () => {
            localStorage.setItem(`${AGENT_PREFIX}-status`, "stopped");
            if (intervalId) clearInterval(intervalId);
        };
    }, [user]);

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
                rel="stylesheet"
            />
            <style jsx global>{`
                .dash-root { display: flex; min-height: 100vh; font-family: ${t.font}, sans-serif; transition: background-color 0.6s; }
                .dash-root *, .dash-root *::before, .dash-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .dash-sidebar { position: fixed; top: 0; left: 0; height: 100vh; display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.6s; z-index: 100; overflow: hidden; }
                .dash-sidebar::-webkit-scrollbar { width: 0; }
                .dash-main { flex: 1; transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.6s; min-height: 100vh; overflow-x: hidden; }
                .dash-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s; cursor: pointer; white-space: nowrap; overflow: hidden; }
                .dash-nav-item:hover { transform: translateX(2px); }
                .dash-page-wrap { padding: 32px 36px; max-width: 1400px; animation: fadeUp 0.35s ease; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 768px) {
                    .dash-sidebar { width: 60px !important; }
                    .dash-main { margin-left: 60px !important; }
                    .dash-nav-label { display: none !important; }
                    .dash-page-wrap { padding: 20px 16px; }
                }
            `}</style>

            <div className="dash-root" style={{ backgroundColor: t.pageBg }}>
                {/* ─── Sidebar ─── */}
                <aside
                    className="dash-sidebar"
                    style={{
                        width: collapsed ? 68 : 240,
                        backgroundColor: t.sidebarBg,
                        borderRight: `1px solid ${t.divider}`,
                    }}
                >
                    {/* Logo + Collapse */}
                    <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                                background: t.accentSoft, flexShrink: 0,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={t.accent} />
                                </svg>
                            </div>
                            {!collapsed && (
                                <span style={{ fontSize: 18, fontWeight: 800, color: t.text, letterSpacing: "-0.03em" }}>Solace</span>
                            )}
                        </Link>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                background: "none", border: "none", cursor: "pointer", padding: 4,
                                display: "flex", opacity: 0.4,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} className="dash-nav-item" style={{
                                    background: active ? t.accentSoft : "transparent",
                                    color: active ? t.accent : t.textSoft,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    padding: collapsed ? "10px" : "10px 16px",
                                }}>
                                    <NavIcon icon={item.icon} color={active ? t.accent : t.textMuted} />
                                    {!collapsed && <span className="dash-nav-label">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom: XP bar */}
                    {!collapsed && (
                        <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.divider}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8, background: t.accentGrad,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontSize: 12, fontWeight: 800,
                                }}>
                                    7
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Level 7</div>
                                    <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>320 / 500 XP</div>
                                </div>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: t.accentSoft, overflow: "hidden" }}>
                                <div style={{ width: "64%", height: "100%", borderRadius: 2, background: t.accentGrad, transition: "width 0.5s" }} />
                            </div>
                        </div>
                    )}
                </aside>

                {/* ─── Main Content ─── */}
                <main
                    className="dash-main"
                    style={{ marginLeft: collapsed ? 68 : 240 }}
                >
                    <div className="dash-page-wrap">
                        {children}
                    </div>
                </main>

                {/* Crisis Float */}
                <CrisisButton />
            </div>
        </>
    );
}

// ─── Layout Export ──────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <DashboardInner>{children}</DashboardInner>
        </ThemeProvider>
    );
}
