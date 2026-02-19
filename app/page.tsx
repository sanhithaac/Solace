"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";

const FRAME_COUNT = 183;

export default function Home() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const { scrollYProgress } = useScroll();

    // Smooth scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        setMounted(true);
        preloadImages();
    }, []);

    const preloadImages = () => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            const frameIndex = i.toString().padStart(3, '0');
            img.src = `/frames/ezgif-frame-${frameIndex}.jpg`;
            img.onload = () => {
                loadedCount++;
                setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                if (loadedCount === FRAME_COUNT) {
                    setImages(loadedImages);
                }
            };
            loadedImages[i - 1] = img;
        }
    };

    const currentFrame = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // Define opacities at top level to avoid hook errors
    const opacity1 = useTransform(smoothProgress, [0, 0.1, 0.2], [1, 1, 0]);
    const opacity2 = useTransform(smoothProgress, [0.25, 0.35, 0.45], [0, 1, 0]);
    const opacity3 = useTransform(smoothProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
    const opacity4 = useTransform(smoothProgress, [0.75, 0.85, 0.95], [0, 1, 0]);
    const opacity5 = useTransform(smoothProgress, [0.95, 1], [0, 1]);
    const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);

    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx && images[index]) {
            const img = images[index];
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgAspectRatio = img.width / img.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (canvasAspectRatio > imgAspectRatio) {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgAspectRatio;
                offsetX = 0;
                offsetY = (canvasHeight - drawHeight) / 2;
            } else {
                drawWidth = canvasHeight * imgAspectRatio;
                drawHeight = canvasHeight;
                offsetX = (canvasWidth - drawWidth) / 2;
                offsetY = 0;
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    };

    useEffect(() => {
        const unsubscribe = currentFrame.on("change", (v) => {
            renderFrame(Math.round(v));
        });
        return () => unsubscribe();
    }, [images, currentFrame]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
                canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
                canvasRef.current.style.width = `${window.innerWidth}px`;
                canvasRef.current.style.height = `${window.innerHeight}px`;
                renderFrame(Math.round(currentFrame.get()));
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [images]);

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: "#000", minHeight: "800vh", position: "relative" }}>
            {/* Loading Overlay */}
            {loadingProgress < 100 && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    backgroundColor: "#000", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", color: "#fff"
                }}>
                    <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        Solace
                    </motion.h2>
                    <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.1)", marginTop: 20 }}>
                        <motion.div style={{ height: "100%", background: "#fff", width: `${loadingProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Sticky Canvas background */}
            <div style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
                zIndex: 0, overflow: "hidden"
            }}>
                <canvas ref={canvasRef} />
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
                    pointerEvents: "none"
                }} />
            </div>

            {/* Navigation */}
            <header style={{
                position: "fixed", top: 0, left: 0, width: "100%",
                padding: "24px 40px", display: "flex", justifyContent: "space-between",
                alignItems: "center", zIndex: 100, mixBlendMode: "difference"
            }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ cursor: "pointer" }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", margin: 0 }}>
                        SOLACE
                    </h1>
                </motion.div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={() => router.push("/auth?view=login")}
                        style={btnStyle(false)}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => router.push("/auth?view=signup")}
                        style={btnStyle(true)}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* Scrollytelling Content Sections */}
            <div style={{ position: "relative", zIndex: 10 }}>
                <Section opacity={opacity1}>
                    <motion.h2 style={titleStyle} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                        Breathe In Control
                    </motion.h2>
                    <motion.p style={subTitleStyle} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        Your sanctuary for mental clarity and emotional growth.
                    </motion.p>
                </Section>

                <Section opacity={opacity2}>
                    <h2 style={titleStyle}>Trace Your Progress</h2>
                    <p style={subTitleStyle}>Mood tracking that feels like a natural part of your day.</p>
                </Section>

                <Section opacity={opacity3}>
                    <h2 style={titleStyle}>Deep Journaling</h2>
                    <p style={subTitleStyle}>A private space for your thoughts, protected and personal.</p>
                </Section>

                <Section opacity={opacity4}>
                    <h2 style={titleStyle}>Empowered Communities</h2>
                    <p style={subTitleStyle}>Connect with those who walk the same path as you.</p>
                </Section>

                <Section opacity={opacity5}>
                    <h2 style={{ ...titleStyle, fontSize: "clamp(48px, 8vw, 96px)" }}>Find Your Solace</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/auth?view=signup")}
                        style={{
                            marginTop: 32, padding: "18px 56px", fontSize: 20, fontWeight: 700,
                            borderRadius: 100, background: "#fff", color: "#000", border: "none",
                            cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                        }}
                    >
                        Get Started Free
                    </motion.button>
                </Section>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                style={{
                    position: "fixed", bottom: 40, left: "50%", x: "-50%",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 8, opacity: scrollIndicatorOpacity,
                    zIndex: 10
                }}
            >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
                    Scroll to Explore
                </div>
                <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }} />
            </motion.div>
        </div>
    );
}

function Section({ children, opacity }: { children: React.ReactNode, opacity: any }) {
    return (
        <motion.section
            style={{
                height: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center",
                color: "#fff", padding: "0 20px", opacity
            }}
        >
            {children}
        </motion.section>
    );
}

const titleStyle: React.CSSProperties = {
    fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 900,
    letterSpacing: "-0.05em", marginBottom: 16, lineHeight: 1.1
};

const subTitleStyle: React.CSSProperties = {
    fontSize: "clamp(16px, 1.5vw, 24px)", opacity: 0.7,
    maxWidth: 700, fontWeight: 500, lineHeight: 1.6
};

const btnStyle = (primary: boolean): React.CSSProperties => ({
    padding: "12px 28px",
    borderRadius: 100,
    background: primary ? "#fff" : "rgba(255,255,255,0.08)",
    color: primary ? "#000" : "#fff",
    border: primary ? "none" : "1px solid rgba(255,255,255,0.15)",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    backdropFilter: primary ? "none" : "blur(12px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: primary ? "0 4px 15px rgba(255,255,255,0.1)" : "none"
});
