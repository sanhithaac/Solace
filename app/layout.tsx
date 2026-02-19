import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Solace | A Safe Space for Mental Wellness",
    description: "A gentle space for your inner peace, journaling, and community support.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="no-scrollbar">
            <body className={`${outfit.variable} font-outfit antialiased selection:bg-orange-500 selection:text-white`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
