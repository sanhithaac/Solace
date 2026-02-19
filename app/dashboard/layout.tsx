"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/journal", label: "Journal", icon: "edit_note" },
  { href: "/dashboard/mood", label: "Mood", icon: "mood" },
  { href: "/dashboard/chat", label: "AI Chat", icon: "forum" },
  { href: "/dashboard/todos", label: "To-Do", icon: "checklist" },
  { href: "/dashboard/doctors", label: "Doctors", icon: "medical_services" },
  { href: "/dashboard/anonymous", label: "Anonymous", icon: "campaign" },
  { href: "/dashboard/communities", label: "Communities", icon: "groups" },
  { href: "/dashboard/pomodoro", label: "Pomodoro", icon: "timer" },
  { href: "/dashboard/wellness", label: "Wellness", icon: "self_improvement" },
  { href: "/dashboard/heatmap", label: "Heatmap", icon: "calendar_month" },
  { href: "/dashboard/stories", label: "Stories", icon: "auto_stories" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
];

function CrisisButton() {
  return (
    <Link href="/crisis" title="Crisis Support">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 60,
          width: 56,
          height: 56,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background: "linear-gradient(135deg, #d94f4f 0%, #bb2f2f 100%)",
          border: "2px solid rgba(255,255,255,0.3)",
          boxShadow: "0 12px 28px rgba(185,53,53,0.35)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
          emergency
        </span>
      </motion.div>
    </Link>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || typeof window === "undefined" || typeof Notification === "undefined") return;

    const AGENT_PREFIX = "solace-reminder-agent";
    const reminderWindowMs = 30 * 60 * 1000;
    let intervalId: ReturnType<typeof setInterval> | null = null;

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
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0"
        rel="stylesheet"
      />

      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: t.font }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(8px)",
            background: "rgba(255,251,252,0.92)",
            borderBottom: `1px solid ${t.divider}`,
          }}
        >
          <div
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: "fit-content",
                paddingRight: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: t.accentSoft,
                  border: `1px solid ${t.accentBorder}`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 19, color: t.accent }}>
                  favorite
                </span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.02em", color: t.text }}>Solace</div>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted, fontWeight: 800 }}>
                  Wellness OS
                </div>
              </div>
            </Link>

            <nav className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, flex: 1 }}>
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      textDecoration: "none",
                      minWidth: "fit-content",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 12px",
                      borderRadius: 12,
                      border: `1px solid ${active ? t.accentBorder : t.cardBorder}`,
                      background: active ? t.accentSoft : "rgba(199,109,133,0.02)",
                      color: active ? t.accent : t.textSoft,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1440, margin: "0 auto", padding: "22px 16px 40px" }}>{children}</main>
        <CrisisButton />
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardInner>{children}</DashboardInner>
    </ThemeProvider>
  );
}
