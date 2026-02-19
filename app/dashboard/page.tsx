"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  delta: string;
}

interface ActivityItem {
  text: string;
  time: string;
  mood?: string;
}

interface BookingItem {
  id: string;
  doctorName: string;
  doctorTitle?: string;
  startTime: string;
  sessionType: string;
}

interface JournalItem {
  _id: string;
  title: string;
  mood?: string;
  sentiment?: string;
  createdAt: string;
}

const quotes = [
  "Healing is not linear. It is still progress.",
  "Softness is strength with self-respect.",
  "You are allowed to restart as many times as needed.",
  "Small rituals build big stability.",
  "Your pace is valid. Keep going.",
];

const quickAccess = [
  {
    title: "Write Journal",
    desc: "Unload your thoughts and get AI reflection.",
    href: "/dashboard/journal",
    icon: "edit_note",
    tint: "rgba(232,168,48,0.22)",
  },
  {
    title: "Chat with AI",
    desc: "Talk privately with your empathetic assistant.",
    href: "/dashboard/chat",
    icon: "forum",
    tint: "rgba(139,164,232,0.24)",
  },
  {
    title: "Wellness Hub",
    desc: "Yoga routines, grounding flows, and support cards.",
    href: "/dashboard/wellness",
    icon: "self_improvement",
    tint: "rgba(199,109,133,0.2)",
  },
  {
    title: "Communities",
    desc: "Anonymous circles for shared healing.",
    href: "/dashboard/communities",
    icon: "groups",
    tint: "rgba(76,175,124,0.2)",
  },
  {
    title: "Anonymous Space",
    desc: "Post freely and support others anonymously.",
    href: "/dashboard/anonymous",
    icon: "campaign",
    tint: "rgba(58,32,48,0.12)",
  },
  {
    title: "Find Doctors",
    desc: "Discover and book counselors or therapists.",
    href: "/dashboard/doctors",
    icon: "medical_services",
    tint: "rgba(216,138,158,0.22)",
  },
  {
    title: "Mood & Cycle",
    desc: "Track daily mood and period-cycle patterns.",
    href: "/dashboard/mood",
    icon: "mood",
    tint: "rgba(139,164,232,0.22)",
  },
  {
    title: "To-Do Planner",
    desc: "Plan priorities, reminders, and deadlines.",
    href: "/dashboard/todos",
    icon: "checklist",
    tint: "rgba(232,168,48,0.22)",
  },
  {
    title: "Study Pomodoro",
    desc: "Focus sessions with timer and streaks.",
    href: "/dashboard/pomodoro",
    icon: "timer",
    tint: "rgba(76,175,124,0.2)",
  },
];

const otherRoutes = [
  { href: "/dashboard/mood", label: "Mood & Cycle", icon: "mood" },
  { href: "/dashboard/todos", label: "To-Do Planner", icon: "checklist" },
  { href: "/dashboard/pomodoro", label: "Study Pomodoro", icon: "timer" },
  { href: "/dashboard/heatmap", label: "Mood Heatmap", icon: "calendar_month" },
  { href: "/dashboard/stories", label: "Success Stories", icon: "auto_stories" },
  { href: "/dashboard/profile", label: "Profile & XP", icon: "person" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function calendarGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const days: Array<number | null> = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return {
    days,
    year,
    month,
    monthName: date.toLocaleDateString("en-US", { month: "long" }),
  };
}

function journalScore(entry: JournalItem) {
  const sentiment = (entry.sentiment || "").toLowerCase();
  if (sentiment.includes("positive")) return 8;
  if (sentiment.includes("negative")) return 3;
  return 5;
}

export default function DashboardPage() {
  const { t } = useTheme();
  const { user } = useAuth();

  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [displayName, setDisplayName] = useState("Soul");
  const [upcomingBookings, setUpcomingBookings] = useState<BookingItem[]>([]);
  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const dailyQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);
  const cal = useMemo(() => calendarGrid(viewDate), [viewDate]);

  const moodSeries = useMemo(() => {
    return [...journals]
      .slice(0, 7)
      .reverse()
      .map((j) => ({
        day: new Date(j.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
        score: journalScore(j),
      }));
  }, [journals]);

  const appointmentDates = useMemo(() => {
    const s = new Set<string>();
    upcomingBookings.forEach((b) => {
      const d = new Date(b.startTime);
      if (!Number.isNaN(d.getTime())) {
        s.add(d.toISOString().slice(0, 10));
      }
    });
    return s;
  }, [upcomingBookings]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [dashRes, bookingsRes, journalRes] = await Promise.all([
          fetch(`/api/dashboard?uid=${user.uid}`),
          fetch(`/api/doctors/bookings?uid=${user.uid}`),
          fetch(`/api/journal?uid=${user.uid}`),
        ]);

        const dash = await dashRes.json();
        const bookings = await bookingsRes.json();
        const journalData = await journalRes.json();

        setQuickStats(Array.isArray(dash.quickStats) ? dash.quickStats : []);
        setRecentActivity(Array.isArray(dash.recentActivity) ? dash.recentActivity : []);
        setDisplayName(dash?.user?.displayName || "Soul");
        setUpcomingBookings(Array.isArray(bookings.bookings) ? bookings.bookings.slice(0, 4) : []);
        setJournals(Array.isArray(journalData.entries) ? journalData.entries : []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div style={{ display: "grid", gap: 18, color: t.text }}>
      <style jsx>{`
        .action-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 12px;
        }
        @media (min-width: 760px) {
          .action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1120px) {
          .action-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 28,
          border: `1px solid ${t.cardBorder}`,
          background: "linear-gradient(135deg, rgba(199,109,133,0.14) 0%, rgba(216,138,158,0.06) 54%, rgba(255,255,255,0.8) 100%)",
          padding: "28px 22px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -30,
            width: 180,
            height: 180,
            borderRadius: "999px",
            background: "rgba(199,109,133,0.13)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 900 }}>
                {getGreeting()}, <span style={{ color: t.accent }}>{displayName}</span>
              </h1>
              <p style={{ margin: "8px 0 0", color: t.textSoft, fontWeight: 600, fontSize: 13 }}>
                Your full wellness command center is here. Everything is one tap away.
              </p>
            </div>
            <div
              style={{
                borderRadius: 16,
                border: `1px solid ${t.accentBorder}`,
                background: t.accentSoft,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined" style={{ color: t.accent, fontSize: 18 }}>
                local_fire_department
              </span>
              <span style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.06em", color: t.accent }}>
                Growth Streak Active
              </span>
            </div>
          </div>

          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${t.cardBorder}`,
              background: "rgba(255,255,255,0.65)",
              padding: "12px 14px",
              display: "flex",
              gap: 8,
              alignItems: "center",
              maxWidth: 760,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: t.accent }}>
              format_quote
            </span>
            <p style={{ margin: 0, color: t.text, fontSize: 14, fontWeight: 700 }}>
              {dailyQuote}
            </p>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {quickStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              borderRadius: 16,
              border: `1px solid ${t.cardBorder}`,
              background: t.cardBg,
              padding: "14px 14px",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: `1px solid ${t.accentBorder}`,
                  display: "grid",
                  placeItems: "center",
                  background: t.accentSoft,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: t.accent, fontSize: 18 }}>
                  {s.label.includes("Mood") ? "mood" : s.label.includes("Journal") ? "edit_note" : s.label.includes("Focus") ? "timer" : "task_alt"}
                </span>
              </div>
              <span style={{ fontSize: 10, color: t.accent, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 999, padding: "3px 8px", fontWeight: 800, letterSpacing: "0.05em" }}>
                {s.delta}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: t.text }}>{s.value}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.08em", color: t.textMuted }}>{s.label}</div>
          </motion.div>
        ))}
      </section>

      <section className="action-grid">
        {quickAccess.map((card, i) => (
          <motion.div key={card.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}>
            <Link
              href={card.href}
              style={{
                display: "grid",
                gap: 8,
                borderRadius: 22,
                textDecoration: "none",
                border: `1px solid ${t.cardBorder}`,
                background: t.cardBg,
                padding: "16px 16px",
                minHeight: 158,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${t.cardBorder}`,
                  display: "grid",
                  placeItems: "center",
                  background: card.tint,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: t.text, fontSize: 21 }}>
                  {card.icon}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: t.text }}>{card.title}</div>
              <p style={{ margin: 0, color: t.textSoft, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>{card.desc}</p>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  right: -14,
                  bottom: -10,
                  fontSize: 96,
                  color: "rgba(58,32,48,0.08)",
                  pointerEvents: "none",
                }}
              >
                {card.icon}
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ borderRadius: 22, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 24, letterSpacing: "-0.03em", fontWeight: 900 }}>Emotional Trajectory</h3>
              <p style={{ margin: "3px 0 0", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted, fontWeight: 800 }}>
                Based on latest journal sentiment
              </p>
            </div>
            <Link href="/dashboard/heatmap" style={{ textDecoration: "none", fontSize: 10, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.07em", color: t.accent }}>
              View Heatmap
            </Link>
          </div>

          {moodSeries.length === 0 ? (
            <div style={{ borderRadius: 16, border: `1px dashed ${t.cardBorder}`, padding: "26px 14px", textAlign: "center", color: t.textSoft, fontWeight: 700, fontSize: 13 }}>
              Write one journal entry to see your trend.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${moodSeries.length}, minmax(0,1fr))`, gap: 8, alignItems: "end", height: 190, paddingTop: 14 }}>
              {moodSeries.map((point) => (
                <div key={`${point.day}-${point.score}`} style={{ display: "grid", gap: 6, justifyItems: "center", alignItems: "end" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: t.textMuted }}>{point.score}</div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 42,
                      height: `${Math.max(24, point.score * 16)}px`,
                      borderRadius: 999,
                      background: t.accentGrad,
                      border: `1px solid ${t.accentBorder}`,
                    }}
                  />
                  <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase" }}>{point.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderRadius: 22, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 16, display: "grid", gap: 8, alignContent: "start" }}>
          <h3 style={{ margin: 0, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted }}>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p style={{ margin: 0, color: t.textSoft, fontSize: 13, fontWeight: 700 }}>No activity yet.</p>
          ) : (
            recentActivity.slice(0, 5).map((a, idx) => (
              <div key={`${a.text}-${idx}`} style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 14, background: "rgba(255,255,255,0.6)", padding: "10px 11px", display: "grid", gap: 3 }}>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 800 }}>{a.text}</div>
                <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>{a.time}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ borderRadius: 22, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 16, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.03em", fontWeight: 900 }}>Care Hub</h3>
            <Link href="/dashboard/doctors" style={{ textDecoration: "none", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: t.accent, fontWeight: 800 }}>
              Find Expert
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div style={{ borderRadius: 14, border: `1px dashed ${t.cardBorder}`, padding: 16, color: t.textSoft, fontSize: 13, fontWeight: 700 }}>
              No upcoming sessions yet.
            </div>
          ) : (
            upcomingBookings.map((meeting) => (
              <div key={meeting.id} style={{ borderRadius: 16, border: `1px solid ${t.cardBorder}`, background: "rgba(255,255,255,0.62)", padding: "12px 13px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 18, color: t.text, fontWeight: 900 }}>{meeting.doctorName}</div>
                  <div style={{ fontSize: 11, color: t.textSoft, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                    {meeting.sessionType} � {new Date(meeting.startTime).toLocaleString()}
                  </div>
                </div>
                <span style={{ borderRadius: 999, border: `1px solid ${t.accentBorder}`, background: t.accentSoft, color: t.accent, padding: "5px 10px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Upcoming
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ borderRadius: 22, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 16, display: "grid", gap: 10, alignContent: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", color: t.text }}>{cal.monthName}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted, fontWeight: 800 }}>{cal.year}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: "rgba(255,255,255,0.7)", color: t.text, cursor: "pointer" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
              </button>
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: "rgba(255,255,255,0.7)", color: t.text, cursor: "pointer" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontSize: 9, color: t.textMuted, textAlign: "center", fontWeight: 800, textTransform: "uppercase" }}>
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cal.days.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} style={{ aspectRatio: "1 / 1" }} />;
              const d = `${cal.year}-${String(cal.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = d === new Date().toISOString().split("T")[0];
              const isSelected = d === selectedDate;
              const hasMeeting = appointmentDates.has(d);

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? t.accentBorder : t.cardBorder}`,
                    background: isSelected ? t.accentSoft : isToday ? "rgba(216,138,158,0.12)" : "rgba(255,255,255,0.64)",
                    color: isSelected ? t.accent : t.text,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 800,
                    position: "relative",
                  }}
                >
                  {day}
                  {hasMeeting && (
                    <span
                      style={{
                        position: "absolute",
                        width: 5,
                        height: 5,
                        borderRadius: "999px",
                        background: t.accent,
                        bottom: 3,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        style={{
          borderRadius: 28,
          border: `2px solid ${t.accentBorder}`,
          background: "linear-gradient(145deg, #2f1320 0%, #1d0c15 100%)",
          color: "#fff",
          padding: "22px 20px",
          display: "grid",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.03em", fontWeight: 900 }}>
              You are not alone.
            </h2>
            <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 13 }}>
              Reach immediate support when you feel overwhelmed.
            </p>
          </div>
          <Link
            href="/crisis"
            style={{
              textDecoration: "none",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.35)",
              padding: "10px 14px",
              color: "#fff",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: "rgba(199,109,133,0.36)",
            }}
          >
            Open Crisis Mode
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
          {[
            { label: "US & Canada", value: "988" },
            { label: "Emergency", value: "911" },
            { label: "Women Helpline (India)", value: "181" },
            { label: "KIRAN (India)", value: "1800-599-0019" },
          ].map((h) => (
            <div key={h.label} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", padding: "10px 11px", background: "rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                {h.label}
              </div>
              <div style={{ fontSize: 18, marginTop: 2, fontWeight: 900 }}>{h.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ borderRadius: 18, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 14, display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textMuted, fontWeight: 800 }}>
          More Sections
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
          {otherRoutes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              style={{
                borderRadius: 12,
                border: `1px solid ${t.cardBorder}`,
                background: "rgba(255,255,255,0.62)",
                textDecoration: "none",
                color: t.text,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 11px",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: t.accent }}>
                {r.icon}
              </span>
              <span>{r.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {loading && (
        <div style={{ textAlign: "center", color: t.textSoft, fontWeight: 700, fontSize: 13, paddingBottom: 8 }}>
          Syncing live dashboard data...
        </div>
      )}
    </div>
  );
}
