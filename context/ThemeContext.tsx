"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserMode = "student" | "women";

interface ThemeContextType {
    mode: UserMode;
    setMode: (mode: UserMode) => void;
    isDark: boolean;
    t: ThemeTokens;
}

export interface ThemeTokens {
    // Backgrounds
    sidebarBg: string;
    pageBg: string;
    cardBg: string;
    cardBorder: string;
    cardHover: string;
    // Accents
    accent: string;
    accentSoft: string;
    accentBorder: string;
    accentGrad: string;
    // Text
    text: string;
    textSoft: string;
    textMuted: string;
    // Inputs
    inputBg: string;
    inputBorder: string;
    inputFocus: string;
    // Misc
    divider: string;
    danger: string;
    success: string;
    warning: string;
    font: string;
}

const studentTokens: ThemeTokens = {
    sidebarBg: "#060d1f",
    pageBg: "#080f22",
    cardBg: "rgba(139,164,232,0.04)",
    cardBorder: "rgba(139,164,232,0.08)",
    cardHover: "rgba(139,164,232,0.07)",
    accent: "#8ba4e8",
    accentSoft: "rgba(139,164,232,0.1)",
    accentBorder: "rgba(139,164,232,0.18)",
    accentGrad: "linear-gradient(135deg, #4a6ec9 0%, #8ba4e8 100%)",
    text: "#e4eaf8",
    textSoft: "rgba(228,234,248,0.55)",
    textMuted: "rgba(228,234,248,0.28)",
    inputBg: "rgba(139,164,232,0.05)",
    inputBorder: "rgba(139,164,232,0.12)",
    inputFocus: "rgba(139,164,232,0.25)",
    divider: "rgba(139,164,232,0.06)",
    danger: "#ef6b6b",
    success: "#6bdb8e",
    warning: "#f0c35a",
    font: "'DM Sans'",
};

const womenTokens: ThemeTokens = {
    sidebarBg: "#fef8fa",
    pageBg: "#fffbfc",
    cardBg: "rgba(199,109,133,0.04)",
    cardBorder: "rgba(199,109,133,0.08)",
    cardHover: "rgba(199,109,133,0.06)",
    accent: "#c76d85",
    accentSoft: "rgba(199,109,133,0.08)",
    accentBorder: "rgba(199,109,133,0.14)",
    accentGrad: "linear-gradient(135deg, #b5576f 0%, #d88a9e 100%)",
    text: "#3a2030",
    textSoft: "rgba(58,32,48,0.52)",
    textMuted: "rgba(58,32,48,0.25)",
    inputBg: "rgba(199,109,133,0.03)",
    inputBorder: "rgba(199,109,133,0.12)",
    inputFocus: "rgba(199,109,133,0.18)",
    divider: "rgba(199,109,133,0.07)",
    danger: "#d94f4f",
    success: "#4caf7c",
    warning: "#e8a830",
    font: "'Nunito'",
};

const ThemeContext = createContext<ThemeContextType>({
    mode: "student",
    setMode: () => { },
    isDark: true,
    t: studentTokens,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<UserMode>("student");

    useEffect(() => {
        const saved = localStorage.getItem("solace-mode") as UserMode | null;
        if (saved === "student" || saved === "women") setMode(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("solace-mode", mode);
    }, [mode]);

    const isDark = mode === "student";
    const t = mode === "student" ? studentTokens : womenTokens;

    return (
        <ThemeContext.Provider value={{ mode, setMode, isDark, t }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
