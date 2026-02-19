import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Nano Banana | Future of Freshness",
    description: "Premium cold-pressed juices for the digital age.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="no-scrollbar">
            <body className={`${outfit.variable} font-outfit antialiased selection:bg-orange-500 selection:text-white`}>
                {children}
            </body>
        </html>
    );
}
