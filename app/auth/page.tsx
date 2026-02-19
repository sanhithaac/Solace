"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";

type AuthView = "login" | "signup";
type SignupType = "anonymous" | "full";

function AuthPageContent() {
    const searchParams = useSearchParams();
    const initialView = searchParams.get("view") === "login" ? "login" : "signup";
    const [authView, setAuthView] = useState<AuthView>(initialView);
    const [signupType, setSignupType] = useState<SignupType>("anonymous");
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signInAnon, signInGoogle } = useAuth();
    const router = useRouter();

    const isDark = false;

    useEffect(() => {
        setUsername("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setSignupType("anonymous");
    }, [authView]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (authView === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                router.push("/dashboard");
            } else {
                if (signupType === "anonymous") {
                    await signInAnon();
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    if (username) {
                        await updateProfile(userCredential.user, { displayName: username });
                    }
                    router.push("/dashboard");
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    const t = {
        leftBg: "linear-gradient(155deg, #f8f0f4 0%, #f2e4ec 28%, #e8dce8 55%, #e2e0f0 80%, #f0eef8 100%)",
        accent: "#c76d85",
        accentSoft: "rgba(199,109,133,0.08)",
        accentBorder: "rgba(199,109,133,0.16)",
        accentGrad: "linear-gradient(135deg, #b5576f 0%, #d88a9e 100%)",
        formBg: "#fffbfc",
        formBorder: "rgba(199,109,133,0.07)",
        inputBg: "rgba(199,109,133,0.03)",
        inputBorder: "rgba(199,109,133,0.13)",
        inputFocus: "rgba(199,109,133,0.18)",
        text: "#3a2030",
        textSoft: "rgba(58,32,48,0.48)",
        textMuted: "rgba(58,32,48,0.22)",
        socialHover: "rgba(199,109,133,0.05)",
        tagline: "A gentle space for\nyour inner peace.",
        subtitle: "Warmth \u00b7 Strength \u00b7 Serenity",
        quote: "\u201cShe remembered who she was and the game changed.\u201d \u2014 Lalah Delia",
        danger: "#d94f4f",
    };

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
                rel="stylesheet"
            />
            <style jsx global>{`
                .auth-root *, .auth-root *::before, .auth-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .auth-root {
                    font-family: var(--auth-font), sans-serif;
                    display: flex;
                    min-height: 100vh;
                    overflow: hidden;
                }

                /* ── LEFT ── */
                .al { position: relative; flex: 0 0 48%; display: flex; flex-direction: column; justify-content: space-between; padding: 44px 52px; overflow: hidden; transition: background 0.8s cubic-bezier(0.4,0,0.2,1); }
                .al-z { position: relative; z-index: 5; }

                /* ── RIGHT ── */
                .ar { flex: 1; display: flex; align-items: center; justify-content: center; padding: 44px 48px; transition: background-color 0.8s cubic-bezier(0.4,0,0.2,1); overflow-y: auto; }
                .ar-inner { width: 100%; max-width: 400px; }

                /* Logo */
                .alogo { display: flex; align-items: center; gap: 11px; }
                .alogo-m { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .alogo-t { font-size: 20px; font-weight: 800; letter-spacing: -0.04em; }

                /* Headline */
                .ahead { font-size: clamp(32px, 3.6vw, 48px); font-weight: 800; line-height: 1.12; letter-spacing: -0.035em; white-space: pre-line; margin-bottom: 14px; }
                .asub { font-size: 14px; font-weight: 500; letter-spacing: 0.06em; opacity: 0.45; }
                .aquote { font-size: 13px; font-style: italic; font-weight: 400; opacity: 0.32; line-height: 1.65; max-width: 360px; }

                /* Deco circles */
                .adeco { position: absolute; border-radius: 50%; border: 1px solid; pointer-events: none; z-index: 1; }

                /* Toggle */
                .atoggle { display: flex; gap: 4px; padding: 4px; border-radius: 14px; margin-bottom: 32px; }
                .atoggle-btn { flex: 1; position: relative; padding: 11px 8px; border-radius: 11px; border: none; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; background: transparent; z-index: 2; transition: color 0.3s; }

                /* Title */
                .atitle { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 3px; }
                .adesc { font-size: 13px; font-weight: 500; margin-bottom: 26px; }

                /* Tabs */
                .atabs { display: flex; margin-bottom: 26px; border-bottom: 1.5px solid; }
                .atab { padding: 11px 22px; border: none; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.01em; background: transparent; position: relative; transition: color 0.25s; }
                .atab-bar { position: absolute; bottom: -1.5px; left: 0; right: 0; height: 2.5px; border-radius: 3px 3px 0 0; }

                /* Chips */
                .achips { display: flex; gap: 10px; margin-bottom: 22px; }
                .achip { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 11px 12px; border-radius: 11px; border: 1.5px solid; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em; transition: all 0.25s; }

                /* Input */
                .afield { margin-bottom: 16px; }
                .alabel { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
                .ainput-w { position: relative; display: flex; align-items: center; }
                .ainput-i { position: absolute; left: 14px; pointer-events: none; display: flex; z-index: 2; }
                .ainput { width: 100%; padding: 13px 15px 13px 42px; border-radius: 11px; border: 1.5px solid; font-family: var(--auth-font), sans-serif; font-size: 13.5px; font-weight: 500; outline: none; transition: border-color 0.25s, box-shadow 0.25s; }
                .ainput::placeholder { font-weight: 400; opacity: 0.3; }
                .apw-tog { position: absolute; right: 13px; background: none; border: none; cursor: pointer; display: flex; padding: 4px; z-index: 2; opacity: 0.35; transition: opacity 0.2s; }
                .apw-tog:hover { opacity: 0.65; }

                /* Notice */
                .anotice { display: flex; align-items: flex-start; gap: 10px; padding: 11px 13px; border-radius: 10px; margin-bottom: 18px; font-size: 11.5px; font-weight: 500; line-height: 1.55; }
                .anotice strong { font-weight: 700; }

                /* Submit */
                .asubmit { width: 100%; padding: 14px 18px; border-radius: 12px; border: none; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 13.5px; font-weight: 700; letter-spacing: 0.015em; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s, box-shadow 0.3s; }
                .asubmit:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,0,0,0.14); }
                .asubmit:active { transform: translateY(0); }

                /* Divider */
                .adivider { display: flex; align-items: center; gap: 14px; margin: 22px 0; }
                .adiv-line { flex: 1; height: 1px; }
                .adiv-text { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

                /* Social */
                .asocials { display: flex; gap: 8px; }
                .asocial { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 11px 8px; border-radius: 10px; border: 1.5px solid; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 11.5px; font-weight: 600; transition: all 0.25s; background: transparent; }
                .asocial:hover { transform: translateY(-1px); }

                /* Switch */
                .aswitch { text-align: center; margin-top: 22px; font-size: 12.5px; font-weight: 500; }
                .aswitch-l { font-weight: 700; background: none; border: none; cursor: pointer; font-family: var(--auth-font), sans-serif; font-size: 12.5px; text-decoration: none; border-bottom: 1.5px solid; padding-bottom: 1px; transition: opacity 0.2s; }
                .aswitch-l:hover { opacity: 0.65; }

                /* Star bg */
                .sfield { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
                .sstar { position: absolute; border-radius: 50%; }
                /* Sakura bg */
                .skfield { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
                .skpetal { position: absolute; border-radius: 50% 0 50% 0; }
                .smtn { position: absolute; bottom: 0; left: 0; right: 0; z-index: 0; pointer-events: none; }

                @media (max-width: 900px) {
                    .auth-root { flex-direction: column; }
                    .al { flex: 0 0 auto; min-height: 240px; padding: 28px 24px; }
                    .ahead { font-size: 26px !important; }
                    .ar { flex: 1; padding: 28px 20px; }
                    .asocials { flex-direction: column; }
                }
            `}</style>

            <div className="auth-root" style={{ "--auth-font": "'Nunito'" } as React.CSSProperties}>
                {/* ═══ LEFT PANEL ═══ */}
                <motion.div
                    className="al"
                    style={{ background: t.leftBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Sakura /><Mtns />

                    <div className="adeco" style={{ width: 320, height: 320, bottom: "6%", right: "-5%", borderColor: "rgba(199,109,133,0.08)" }} />
                    <div className="adeco" style={{ width: 180, height: 180, top: "12%", left: "-3%", borderColor: "rgba(199,109,133,0.06)" }} />

                        {/* Logo */}
                        <div className="al-z">
                            <div className="alogo">
                                <div className="alogo-m" style={{ background: "rgba(199,109,133,0.1)" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#c76d85" />
                                    </svg>
                                </div>
                                <span className="alogo-t" style={{ color: "#3a2030" }}>Solace</span>
                            </div>
                        </div>

                        {/* Tagline */}
                        <div className="al-z" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <motion.h1 className="ahead" style={{ color: "#3a2030" }} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
                                {t.tagline}
                            </motion.h1>
                            <motion.p className="asub" style={{ color: "#3a2030" }} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ duration: 0.5, delay: 0.25 }}>
                                {t.subtitle}
                            </motion.p>
                        </div>

                        {/* Quote */}
                        <div className="al-z">
                            <p className="aquote" style={{ color: "#3a2030" }}>{t.quote}</p>
                        </div>
                    </motion.div>

                {/* ═══ RIGHT PANEL ═══ */}
                <div className="ar" style={{ backgroundColor: t.formBg }}>
                    <div className="ar-inner">

                        <h2 className="atitle" style={{ color: t.text }}>
                            {authView === "login" ? "Welcome back" : "Create your space"}
                        </h2>
                        <p className="adesc" style={{ color: t.textSoft }}>
                            {authView === "login" ? "Sign in to continue your journey" : "Join a community that truly cares"}
                        </p>

                        {/* Tabs */}
                        <div className="atabs" style={{ borderColor: t.formBorder }}>
                            {(["signup", "login"] as AuthView[]).map((v) => (
                                <button key={v} className="atab" onClick={() => setAuthView(v)} style={{ color: authView === v ? t.accent : t.textMuted }}>
                                    {v === "signup" ? "Sign Up" : "Log In"}
                                    {authView === v && (
                                        <motion.div layoutId="tbar" className="atab-bar" style={{ background: t.accentGrad }} transition={{ type: "spring", stiffness: 500, damping: 34 }} />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={`${authView}-${signupType}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>

                                {/* Signup Chips */}
                                {authView === "signup" && (
                                    <div className="achips">
                                        <motion.button className="achip" whileTap={{ scale: 0.97 }} onClick={() => setSignupType("anonymous")} style={{ background: signupType === "anonymous" ? t.accentGrad : "transparent", borderColor: signupType === "anonymous" ? "transparent" : t.accentBorder, color: signupType === "anonymous" ? "#fff" : t.textSoft }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /><line x1="2" y1="2" x2="22" y2="22" opacity="0.35" /></svg>
                                            Anonymous
                                        </motion.button>
                                        <motion.button className="achip" whileTap={{ scale: 0.97 }} onClick={() => setSignupType("full")} style={{ background: signupType === "full" ? t.accentGrad : "transparent", borderColor: signupType === "full" ? "transparent" : t.accentBorder, color: signupType === "full" ? "#fff" : t.textSoft }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            Full Account
                                        </motion.button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Username — Login always, Anonymous signup */}
                                    {(authView === "login" || (authView === "signup" && signupType === "anonymous")) && (
                                        <div className="afield">
                                            <label className="alabel" style={{ color: t.textSoft }} htmlFor="a-user">Username</label>
                                            <div className="ainput-w">
                                                <span className="ainput-i">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </span>
                                                <input id="a-user" className="ainput" type="text" placeholder="Pick a username" value={username} onChange={(e) => setUsername(e.target.value)}
                                                    style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.text }}
                                                    onFocus={(e) => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.inputFocus}`; }}
                                                    onBlur={(e) => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email — Full signup for ALL modes */}
                                    {authView === "signup" && signupType === "full" && (
                                        <div className="afield">
                                            <label className="alabel" style={{ color: t.textSoft }} htmlFor="a-email">Email</label>
                                            <div className="ainput-w">
                                                <span className="ainput-i">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>
                                                </span>
                                                <input id="a-email" className="ainput" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                                    style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.text }}
                                                    onFocus={(e) => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.inputFocus}`; }}
                                                    onBlur={(e) => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="afield">
                                        <label className="alabel" style={{ color: t.textSoft }} htmlFor="a-pw">Password</label>
                                        <div className="ainput-w">
                                            <span className="ainput-i">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                            </span>
                                            <input id="a-pw" className="ainput" type={showPassword ? "text" : "password"} placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                                style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.text, paddingRight: 46 }}
                                                onFocus={(e) => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.inputFocus}`; }}
                                                onBlur={(e) => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
                                            />
                                            <button type="button" className="apw-tog" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? (
                                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                                ) : (
                                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Anon notice */}
                                    {authView === "signup" && signupType === "anonymous" && (
                                        <motion.div className="anotice" style={{ background: t.accentSoft, border: `1px solid ${t.accentBorder}`, color: t.textSoft }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}>
                                            <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><circle cx="12" cy="8" r="0.5" fill={t.accent} /></svg>
                                            <span><strong style={{ color: t.accent }}>Stay private.</strong> No personal info needed. Your identity stays anonymous.</span>
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: t.danger, fontSize: 12, fontWeight: 600, marginBottom: 16, padding: "8px 12px", background: "rgba(239, 107, 107, 0.1)", borderRadius: 8, border: "1px solid rgba(239, 107, 107, 0.2)" }}>
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Submit */}
                                    <motion.button type="submit" disabled={loading} className="asubmit" style={{ background: t.accentGrad, boxShadow: `0 4px 18px ${t.inputFocus}`, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                                        {loading ? "Processing..." : authView === "login" ? "Sign In" : signupType === "anonymous" ? "Join Anonymously" : "Create Account"}
                                        {!loading && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>}
                                    </motion.button>
                                </form>

                                {/* Socials */}
                                {(authView === "login" || (authView === "signup" && signupType === "full")) && (
                                    <>
                                        <div className="adivider">
                                            <div className="adiv-line" style={{ background: t.formBorder }} />
                                            <span className="adiv-text" style={{ color: t.textMuted }}>or</span>
                                            <div className="adiv-line" style={{ background: t.formBorder }} />
                                        </div>
                                        <div className="asocials">
                                            <button type="button" onClick={() => signInGoogle()} className="asocial" style={{ borderColor: t.inputBorder, color: t.text }} onMouseEnter={(e) => (e.currentTarget.style.background = t.socialHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                Google
                                            </button>
                                            <button className="asocial" style={{ borderColor: t.inputBorder, color: t.text }} onMouseEnter={(e) => (e.currentTarget.style.background = t.socialHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                                <svg width="16" height="16" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022" /><rect x="13" y="1" width="10" height="10" fill="#7FBA00" /><rect x="1" y="13" width="10" height="10" fill="#00A4EF" /><rect x="13" y="13" width="10" height="10" fill="#FFB900" /></svg>
                                                Microsoft
                                            </button>
                                            <button className="asocial" style={{ borderColor: t.inputBorder, color: t.text }} onMouseEnter={(e) => (e.currentTarget.style.background = t.socialHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0122 16.92z" /></svg>
                                                Phone
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="aswitch" style={{ color: t.textMuted }}>
                            {authView === "login" ? (
                                <>New here?{" "}<button className="aswitch-l" style={{ color: t.accent, borderColor: t.accentBorder }} onClick={() => setAuthView("signup")}>Create an account</button></>
                            ) : (
                                <>Already a member?{" "}<button className="aswitch-l" style={{ color: t.accent, borderColor: t.accentBorder }} onClick={() => setAuthView("login")}>Sign in</button></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════
// Background decorations
// ═══════════════════════════════════════════════════════════

function Sakura() {
    const data = React.useMemo(() => Array.from({ length: 14 }, (_, i) => ({
        i, x: Math.random() * 100, s: 7 + Math.random() * 10,
        d: Math.random() * 12, dur: 10 + Math.random() * 8, drift: (Math.random() - 0.5) * 100,
        o: 0.2 + Math.random() * 0.2,
    })), []);
    return (
        <div className="skfield">
            {data.map((p) => (
                <motion.div key={p.i} className="skpetal" style={{ left: `${p.x}%`, top: "-5%", width: p.s, height: p.s, background: `radial-gradient(ellipse at 30% 30%, rgba(199,109,133,${p.o}), transparent 70%)` }}
                    animate={{ y: [0, 1100], x: [0, p.drift], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.d, ease: "linear" }}
                />
            ))}
            <div style={{ position: "absolute", top: "15%", right: "18%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,109,133,0.08) 0%, transparent 70%)", filter: "blur(45px)" }} />
        </div>
    );
}

function Mtns() {
    return (
        <svg className="smtn" viewBox="0 0 800 180" preserveAspectRatio="none" style={{ height: 160 }}>
            <path d="M0 180 L80 90 L160 130 L280 45 L380 100 L500 25 L600 80 L720 55 L800 110 L800 180 Z" fill="rgba(58,32,48,0.05)" />
            <path d="M0 180 L120 120 L220 150 L340 70 L460 130 L580 60 L700 95 L800 140 L800 180 Z" fill="rgba(58,32,48,0.03)" />
        </svg>
    );
}

export default function AuthPage() {
    return (
        <Suspense>
            <AuthPageContent />
        </Suspense>
    );
}
