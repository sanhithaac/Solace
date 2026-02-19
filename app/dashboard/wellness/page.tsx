"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

type Tab = "movement" | "support";

type Topic = "Pressure" | "Mental Health" | "Assault Support" | "Empowerment";

interface Routine {
    id: number;
    title: string;
    duration: string;
    level: string;
    code: string;
    desc: string;
    steps: string[];
}

interface Exercise {
    id: number;
    title: string;
    duration: string;
    type: string;
    code: string;
    desc: string;
}

interface GuidanceCard {
    id: number;
    topic: Topic;
    title: string;
    text: string;
    link: string;
    linkLabel: string;
}

const routines: Routine[] = [
    { id: 1, title: "Morning Aura Rise", duration: "15 min", level: "Beginner", code: "MR", desc: "Gentle wake-up flow.", steps: ["Sit and take 3 deep breaths.", "Roll neck and shoulders slowly.", "Cat-Cow with calm breath rhythm.", "Child's Pose and soften your jaw.", "Stand tall and set one intention."] },
    { id: 2, title: "Sleepy Soul Flow", duration: "20 min", level: "All Levels", code: "SS", desc: "Calm before sleep.", steps: ["Dim lights and settle breathing.", "Legs up the wall pose.", "Seated forward fold.", "Reclined knee hug and rock gently.", "Savasana with long exhale."] },
    { id: 3, title: "Desk Release Yoga", duration: "5 min", level: "Intermediate", code: "DR", desc: "Chair-friendly reset.", steps: ["Sit upright, feet grounded.", "Open chest with hands behind back.", "Seated twists both sides.", "Arms overhead stretch.", "Finish with box breathing."] },
    { id: 4, title: "Vibrant Energy Flow", duration: "30 min", level: "Advanced", code: "VE", desc: "High-energy focus flow.", steps: ["Sun Salutation rounds.", "Warrior II each side.", "Tree pose balance.", "Plank to Downward Dog.", "Seated stillness and exhale."] },
    { id: 5, title: "Grounding Breath Ladder", duration: "8 min", level: "Beginner", code: "GB", desc: "Panic regulation breaths.", steps: ["One hand chest, one hand belly.", "Inhale 4, exhale 4.", "Inhale 4, exhale 6.", "Inhale 4, hold 2, exhale 6.", "Return to natural breath."] },
    { id: 6, title: "Shoulder Reset Flow", duration: "10 min", level: "All Levels", code: "SR", desc: "Release shoulder load.", steps: ["Neck side stretch.", "Shoulder circles.", "Thread-the-needle stretch.", "Puppy pose.", "Shake out arms and exhale."] },
    { id: 7, title: "Hip Release Recovery", duration: "12 min", level: "Intermediate", code: "HR", desc: "Lower-body tension release.", steps: ["Butterfly pose.", "Low lunge right side.", "Low lunge left side.", "Figure-four reclined stretch.", "Supine twist and release."] },
    { id: 8, title: "Post-Exam Decompress", duration: "7 min", level: "Beginner", code: "PE", desc: "After-study stress reset.", steps: ["Shake arms and legs.", "Forward fold with bent knees.", "Half lift and long spine.", "Child's Pose.", "Breath count 10 to 1."] },
    { id: 9, title: "Nervous System Downshift", duration: "9 min", level: "All Levels", code: "ND", desc: "Reduce overwhelm.", steps: ["Lie down and feel support points.", "Inhale 4, exhale 8.", "Knees-to-chest hold.", "Legs elevated on wall/chair.", "Body scan toe to head."] },
    { id: 10, title: "Confidence Warrior Sequence", duration: "11 min", level: "Intermediate", code: "CW", desc: "Stable confidence builder.", steps: ["Mountain pose and grounded stance.", "Warrior I right side.", "Warrior I left side.", "Warrior II both sides.", "Power pose with affirmation."] },
    { id: 11, title: "Lunar Calm Reset", duration: "6 min", level: "Beginner", code: "LC", desc: "Short evening calm.", steps: ["Easy seat with long exhale.", "Side bends both sides.", "Seated twists both sides.", "Supported forward fold.", "Hands on heart, safe thought."] },
    { id: 12, title: "Trauma-Safe Gentle Stretch", duration: "10 min", level: "All Levels", code: "TS", desc: "Choice-based body trust.", steps: ["Choose seated or lying option.", "Notice 3 body support points.", "Gentle shoulder opening.", "Slow side stretch with pause option.", "Return to neutral and orient room."] },
];

const exercises: Exercise[] = [
    { id: 1, title: "Box Breathing", duration: "4 min", type: "Breathing", code: "BB", desc: "Inhale 4, hold 4, exhale 4, hold 4." },
    { id: 2, title: "5-4-3-2-1 Grounding", duration: "5 min", type: "Grounding", code: "GL", desc: "Name what you see, touch, hear, smell, taste." },
    { id: 3, title: "Progressive Relaxation", duration: "10 min", type: "Relaxation", code: "PM", desc: "Tense and release each muscle group." },
    { id: 4, title: "Body Scan", duration: "12 min", type: "Meditation", code: "BS", desc: "Observe sensation without judgment." },
    { id: 5, title: "Two-Column Reframe", duration: "6 min", type: "Cognitive", code: "CR", desc: "Thought and balanced response side-by-side." },
    { id: 6, title: "Safe Place Visualization", duration: "8 min", type: "Imagery", code: "SP", desc: "Imagine a calm place in sensory detail." },
];

const resourceLinks = [
    { label: "Yoga With Adriene", link: "https://www.youtube.com/@yogawithadriene" },
    { label: "DoYogaWithMe", link: "https://www.doyogawithme.com/" },
    { label: "Mindful.org", link: "https://www.mindful.org/" },
    { label: "NIMH Resources", link: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health" },
    { label: "RAINN Support", link: "https://www.rainn.org/get-help" },
];

const guidanceTopics: Topic[] = ["Pressure", "Mental Health", "Assault Support", "Empowerment"];
const guidanceTitles = [
    "Micro-Reset Rule", "Task Chunking", "Deadline Breathing", "Recovery Blocks", "One-Thing Focus",
    "Name the Feeling", "Thought Distance", "Mood Baseline", "Social Buffer", "Compassion Script",
    "Immediate Safety First", "It Is Not Your Fault", "Support Person", "Grounding for Flashbacks", "Crisis Support 24/7",
    "Small Wins Count", "Identity Statements", "Strength Inventory", "Assertive Scripts", "Community Heals",
    "Traffic Light Check", "Emergency Plan", "Choice-Based Movement", "Rest Is Productive", "Boundary Practice",
    "Pressure Journal", "Body Before Brain", "Reduce Doomscrolling", "Window of Tolerance", "Mentor Map",
    "Future Letter", "Breathing Anchor", "Sleep Is Strategy", "Decision Fatigue", "Voice and Boundaries",
    "Safe Routine", "Healing Is Nonlinear", "Reframe Loop", "Ground Through Senses", "Ask for Help",
    "Steady Exhale", "Nervous System First", "Reclaim Pace", "Confidence Reboot"
];
const guidanceTexts = [
    "Take a short pause before reacting. Regulation first, action second.",
    "Break overload into one next step and begin there.",
    "Use slow exhale to prevent panic spirals during pressure moments.",
    "Schedule recovery like a non-negotiable meeting.",
    "Labeling emotion often lowers intensity.",
    "Say: I am noticing this thought, not becoming it.",
    "Reach one trusted person before isolation deepens.",
    "Your safety and pace both matter.",
    "Responsibility belongs to the person who harmed.",
    "Tiny repeated actions build real resilience.",
];
const guidanceLinks = [
    { link: "https://www.apa.org/topics/stress", label: "APA Stress" },
    { link: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/", label: "Mind Stress" },
    { link: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/", label: "NHS Stress Tips" },
    { link: "https://988lifeline.org/", label: "988 Lifeline" },
    { link: "https://www.rainn.org/get-help", label: "RAINN Help" },
    { link: "https://www.mindful.org/", label: "Mindful Practices" },
];

const guidanceCards: GuidanceCard[] = Array.from({ length: 44 }, (_, idx) => ({
    id: idx + 1,
    topic: guidanceTopics[idx % guidanceTopics.length],
    title: guidanceTitles[idx % guidanceTitles.length],
    text: guidanceTexts[idx % guidanceTexts.length],
    link: guidanceLinks[idx % guidanceLinks.length].link,
    linkLabel: guidanceLinks[idx % guidanceLinks.length].label,
}));

function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function WellnessPage() {
    const { t } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("movement");
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [holdSeconds, setHoldSeconds] = useState(10);
    const [isHolding, setIsHolding] = useState(false);
    const [guidanceSlice] = useState<GuidanceCard[]>(() => shuffle(guidanceCards).slice(0, 15));

    useEffect(() => {
        if (!activeRoutine || !isHolding) return;
        const id = setInterval(() => {
            setHoldSeconds((prev) => (prev > 1 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, [activeRoutine, isHolding, stepIndex]);

    useEffect(() => {
        if (!activeRoutine || !isHolding || holdSeconds !== 0) return;
        if (stepIndex < activeRoutine.steps.length - 1) {
            setStepIndex((prev) => prev + 1);
            setHoldSeconds(10);
        } else {
            setIsHolding(false);
        }
    }, [holdSeconds, isHolding, stepIndex, activeRoutine]);

    const progress = useMemo(() => {
        if (!activeRoutine) return 0;
        return ((stepIndex + 1) / activeRoutine.steps.length) * 100;
    }, [activeRoutine, stepIndex]);

    const openRoutine = (routine: Routine) => {
        setActiveRoutine(routine);
        setStepIndex(0);
        setHoldSeconds(10);
        setIsHolding(true);
    };

    const closeRoutine = () => {
        setActiveRoutine(null);
        setStepIndex(0);
        setHoldSeconds(10);
        setIsHolding(false);
    };

    const changeStep = (delta: -1 | 1) => {
        if (!activeRoutine) return;
        const next = stepIndex + delta;
        if (next < 0 || next >= activeRoutine.steps.length) return;
        setStepIndex(next);
        setHoldSeconds(10);
        setIsHolding(true);
    };

    if (activeRoutine) {
        const isLast = stepIndex === activeRoutine.steps.length - 1;
        return (
            <div style={{ display: "grid", gap: 16 }}>
                <button onClick={closeRoutine} style={{ width: "fit-content", padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg, color: t.textSoft, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
                    Exit Routine
                </button>

                <div style={{ borderRadius: 24, border: `1px solid ${t.accentBorder}`, background: t.cardBg, padding: 24, display: "grid", gap: 16 }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 70, height: 70, borderRadius: 16, margin: "0 auto 8px", background: t.accentSoft, border: `1px solid ${t.accentBorder}`, color: t.accent, fontWeight: 900, display: "grid", placeItems: "center", fontSize: 18 }}>{activeRoutine.code}</div>
                        <h2 style={{ margin: 0, color: t.text, fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em" }}>{activeRoutine.title}</h2>
                        <p style={{ margin: "6px 0 0", color: t.textSoft, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Step {stepIndex + 1} / {activeRoutine.steps.length}
                        </p>
                    </div>

                    <div style={{ borderRadius: 16, border: `1px solid ${t.cardBorder}`, background: t.pageBg, padding: 16, textAlign: "center" }}>
                        <p style={{ margin: 0, color: t.text, fontSize: 22, lineHeight: 1.45, fontWeight: 700 }}>{activeRoutine.steps[stepIndex]}</p>
                    </div>

                    <div style={{ display: "grid", justifyItems: "center", gap: 8 }}>
                        <div style={{ width: 95, height: 95, borderRadius: "50%", border: `3px solid ${t.accentBorder}`, background: t.pageBg, display: "grid", placeItems: "center" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: t.accent, lineHeight: 1 }}>{holdSeconds}</div>
                                <div style={{ fontSize: 9, color: t.textMuted, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>sec hold</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                            <button onClick={() => setIsHolding((prev) => !prev)} style={{ borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg, color: t.text, padding: "9px 12px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>{isHolding ? "Pause Timer" : "Resume Timer"}</button>
                            <button onClick={() => { setHoldSeconds(10); setIsHolding(true); }} style={{ borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg, color: t.text, padding: "9px 12px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>Restart 10s</button>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <button onClick={() => changeStep(-1)} disabled={stepIndex === 0} style={{ borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.pageBg, color: t.text, padding: "10px 14px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", opacity: stepIndex === 0 ? 0.5 : 1, cursor: stepIndex === 0 ? "not-allowed" : "pointer" }}>Previous</button>
                        {!isLast ? (
                            <button onClick={() => changeStep(1)} style={{ borderRadius: 10, border: "none", background: t.accentGrad, color: "#fff", padding: "10px 14px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>Next Step</button>
                        ) : (
                            <button onClick={closeRoutine} style={{ borderRadius: 10, border: "none", background: t.accentGrad, color: "#fff", padding: "10px 14px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}>Complete Flow</button>
                        )}
                    </div>

                    <div style={{ height: 7, borderRadius: 999, overflow: "hidden", border: `1px solid ${t.accentBorder}`, background: "rgba(199,109,133,0.12)" }}>
                        <div style={{ width: `${progress}%`, height: "100%", background: t.accentGrad, transition: "width 0.3s ease" }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 10, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: 34, fontWeight: 900, color: t.text, letterSpacing: "-0.04em", marginBottom: 4 }}>
                        The <span style={{ color: t.accent }}>Soul Hub</span>
                    </h1>
                    <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500, maxWidth: 820 }}>
                        Nourish your temple with mindful movement and practical support tools.
                    </p>
                </div>
                <div style={{ display: "flex", background: t.pageBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: 4 }}>
                    <button onClick={() => setActiveTab("movement")} style={{ border: "none", cursor: "pointer", padding: "10px 14px", borderRadius: 9, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: activeTab === "movement" ? t.accentGrad : "transparent", color: activeTab === "movement" ? "#fff" : t.text }}>Movement</button>
                    <button onClick={() => setActiveTab("support")} style={{ border: "none", cursor: "pointer", padding: "10px 14px", borderRadius: 9, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: activeTab === "support" ? t.accentGrad : "transparent", color: activeTab === "support" ? "#fff" : t.text }}>Support Library</button>
                </div>
            </div>

            {activeTab === "movement" ? (
                <>
                    <section style={{ display: "grid", gap: 10 }}>
                        <h2 style={{ margin: 0, fontSize: 16, color: t.text, fontWeight: 900 }}>Yoga Flows (12)</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                            {routines.map((routine, i) => (
                                <motion.div key={routine.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} style={{ borderRadius: 26, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 24, display: "grid", gap: 10, minHeight: 290 }}>
                                    <div style={{ width: 58, height: 58, borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, color: t.accent, display: "grid", placeItems: "center", fontWeight: 900 }}>{routine.code}</div>
                                    <h3 style={{ margin: 0, color: t.text, fontSize: 28, lineHeight: 1.1, fontWeight: 900 }}>{routine.title}</h3>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{routine.duration}</span>
                                        <span style={{ fontSize: 10, color: t.accent, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, borderRadius: 999, padding: "3px 8px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{routine.level}</span>
                                    </div>
                                    <p style={{ margin: 0, color: t.textSoft, fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>{routine.desc}</p>
                                    <button onClick={() => openRoutine(routine)} style={{ marginTop: "auto", borderRadius: 12, border: "none", background: t.accentGrad, color: "#fff", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 14px", cursor: "pointer" }}>Start Routine</button>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section style={{ display: "grid", gap: 10 }}>
                        <h2 style={{ margin: 0, fontSize: 16, color: t.text, fontWeight: 900 }}>Mental Health Exercises</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                            {exercises.map((item) => (
                                <div key={item.id} style={{ borderRadius: 16, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: "14px 16px", display: "flex", gap: 10 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: t.accentSoft, border: `1px solid ${t.accentBorder}`, color: t.accent, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{item.code}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, color: t.text, fontWeight: 800 }}>{item.title}</div>
                                        <div style={{ fontSize: 11, color: t.textSoft, marginTop: 2 }}>{item.desc}</div>
                                        <div style={{ marginTop: 6, fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.duration} • {item.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={{ borderRadius: 20, border: `1px solid ${t.cardBorder}`, background: t.cardBg, padding: 16 }}>
                        <h3 style={{ margin: "0 0 8px", color: t.text, fontSize: 14, fontWeight: 900 }}>Trusted Wellness Links</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {resourceLinks.map((x) => (
                                <a key={x.label} href={x.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: t.accent, fontSize: 11, fontWeight: 800, border: `1px solid ${t.accentBorder}`, borderRadius: 10, background: t.pageBg, padding: "7px 9px" }}>
                                    {x.label}
                                </a>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <section style={{ display: "grid", gap: 10 }}>
                    <h2 style={{ margin: 0, fontSize: 16, color: t.text, fontWeight: 900 }}>Support Library (44 cards total, rotated each visit)</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 16 }}>
                        {guidanceSlice.map((card, i) => (
                            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} style={{ borderRadius: 24, background: "#22151d", border: "1px solid rgba(216,138,158,0.35)", color: "#ffeef4", padding: 22, display: "grid", gap: 10, minHeight: 290 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#d88a9e" }}>{card.topic}</div>
                                <h3 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, fontWeight: 900 }}>{card.title}</h3>
                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#f7dbe7" }}>{card.text}</p>
                                <a href={card.link} target="_blank" rel="noreferrer" style={{ marginTop: "auto", width: "fit-content", textDecoration: "none", fontSize: 11, fontWeight: 800, color: "#ffd6e6", border: "1px solid rgba(255,214,230,0.35)", borderRadius: 10, padding: "8px 10px" }}>
                                    {card.linkLabel}
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
