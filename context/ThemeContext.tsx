"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserMode = "women";

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
    mode: "women",
    setMode: () => { },
    isDark: false,
    t: womenTokens,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<UserMode>("women");

    useEffect(() => {
        localStorage.setItem("solace-mode", "women");
    }, []);

    const isDark = false;
    const t = womenTokens;

    return (
        <ThemeContext.Provider value={{ mode, setMode, isDark, t }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
