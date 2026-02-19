"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const doctors = [
    { id: 1, name: "Dr. Priya Sharma", specialty: "Clinical Psychologist", rating: 4.9, reviews: 128, available: true, price: "₹500", image: "🧑‍⚕️", slots: ["10:00 AM", "2:00 PM", "4:30 PM"], languages: ["English", "Hindi"] },
    { id: 2, name: "Dr. Anika Patel", specialty: "Psychiatrist", rating: 4.8, reviews: 95, available: true, price: "₹800", image: "👩‍⚕️", slots: ["11:00 AM", "3:00 PM"], languages: ["English", "Gujarati"] },
    { id: 3, name: "Dr. Rahul Mehta", specialty: "Counseling Psychologist", rating: 4.7, reviews: 72, available: false, price: "₹600", image: "👨‍⚕️", slots: [], languages: ["English", "Hindi", "Marathi"] },
    { id: 4, name: "Dr. Sarah Khan", specialty: "Art Therapist", rating: 4.9, reviews: 156, available: true, price: "₹450", image: "👩‍🎨", slots: ["9:00 AM", "1:00 PM", "5:00 PM"], languages: ["English", "Urdu"] },
    { id: 5, name: "Dr. Deepa Nair", specialty: "Women's Mental Health", rating: 4.8, reviews: 203, available: true, price: "₹700", image: "👩‍⚕️", slots: ["10:30 AM", "2:30 PM"], languages: ["English", "Malayalam"] },
    { id: 6, name: "Dr. Vikram Singh", specialty: "Student Counselor", rating: 4.6, reviews: 64, available: true, price: "₹400", image: "🧑‍💼", slots: ["11:30 AM", "4:00 PM"], languages: ["English", "Hindi", "Punjabi"] },
];

const specialties = ["All", "Psychologist", "Psychiatrist", "Counselor", "Therapist", "Women's Health"];

export default function DoctorsPage() {
    const { t } = useTheme();
    const [selectedSlot, setSelectedSlot] = useState<{ doctorId: number; slot: string } | null>(null);
    const [booking, setBooking] = useState(false);

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>Book a Session</h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Connect with verified mental health professionals.</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                {specialties.map((s) => (
                    <button key={s} style={{
                        padding: "8px 16px", borderRadius: 20, border: `1px solid ${s === "All" ? t.accent : t.cardBorder}`,
                        background: s === "All" ? t.accentSoft : "transparent",
                        color: s === "All" ? t.accent : t.textMuted,
                        fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Doctor cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                {doctors.map((doc, i) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                            padding: 22, borderRadius: 16, background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`, transition: "border-color 0.2s",
                        }}
                    >
                        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 14, background: t.accentSoft,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0,
                            }}>
                                {doc.image}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 2 }}>{doc.name}</h3>
                                        <p style={{ fontSize: 12, color: t.textSoft, fontWeight: 500 }}>{doc.specialty}</p>
                                    </div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                                        background: doc.available ? "rgba(107,219,142,0.12)" : "rgba(239,107,107,0.12)",
                                        color: doc.available ? "#4caf7c" : "#ef6b6b",
                                    }}>
                                        {doc.available ? "Available" : "Busy"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: t.text }}>
                                <span style={{ color: "#f0c35a" }}>★</span> {doc.rating}
                                <span style={{ color: t.textMuted, fontWeight: 500 }}>({doc.reviews})</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>{doc.price}/session</span>
                            <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>🗣️ {doc.languages.join(", ")}</span>
                        </div>

                        {doc.available && (
                            <>
                                <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Slots</div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {doc.slots.map((slot) => (
                                        <motion.button
                                            key={slot}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedSlot({ doctorId: doc.id, slot })}
                                            style={{
                                                padding: "8px 14px", borderRadius: 8,
                                                border: `1px solid ${selectedSlot?.doctorId === doc.id && selectedSlot?.slot === slot ? t.accent : t.cardBorder}`,
                                                background: selectedSlot?.doctorId === doc.id && selectedSlot?.slot === slot ? t.accentSoft : "transparent",
                                                color: selectedSlot?.doctorId === doc.id && selectedSlot?.slot === slot ? t.accent : t.textSoft,
                                                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                            }}
                                        >
                                            {slot}
                                        </motion.button>
                                    ))}
                                </div>
                                {selectedSlot?.doctorId === doc.id && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileTap={{ scale: 0.97 }}
                                        style={{
                                            width: "100%", marginTop: 14, padding: "11px 18px", borderRadius: 10,
                                            border: "none", background: t.accentGrad, color: "#fff",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                        }}
                                    >
                                        Book {selectedSlot.slot} →
                                    </motion.button>
                                )}
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </>
    );
}
