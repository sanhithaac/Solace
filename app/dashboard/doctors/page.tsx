"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

type SessionType = "Video" | "Voice" | "Chat";

interface Doctor {
    id: string;
    fullName: string;
    title: string;
    category: string;
    specialties: string[];
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    consultationFee: number;
    languages: string[];
    education: string;
    bio: string;
    currentWork: string;
    profileImage: string;
    verified: boolean;
    nextSlotAt: string | null;
    availableSlots: number;
}

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    sessionType: SessionType;
}

interface SlotsResponse {
    dates: string[];
    slotsByDate: Record<string, Slot[]>;
}

export default function DoctorsPage() {
    const { t } = useTheme();
    const { user } = useAuth();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState<"default" | "rating" | "experience" | "name">("default");
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [slotsState, setSlotsState] = useState<SlotsResponse>({ dates: [], slotsByDate: {} });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSessionType, setSelectedSessionType] = useState<SessionType>("Video");
    const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
    const [bookingBusy, setBookingBusy] = useState(false);
    const [bookingMessage, setBookingMessage] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                category: activeCategory,
                sortBy,
                minRating: String(minRating),
                limit: "180",
            });
            const res = await fetch(`/api/doctors?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to load doctors");
                setDoctors([]);
                return;
            }

            setDoctors(data.doctors || []);
            setCategories(data.categories || ["All"]);
        } catch (err) {
            console.error("Doctors fetch error:", err);
            setError("Unable to load doctors right now.");
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, sortBy, minRating]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const selectedDoctor = useMemo(
        () => doctors.find((doctor) => doctor.id === selectedDoctorId) || null,
        [doctors, selectedDoctorId]
    );

    const totalPages = Math.max(1, Math.ceil(doctors.length / pageSize));
    const paginatedDoctors = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return doctors.slice(start, start + pageSize);
    }, [doctors, currentPage]);

    const loadSlots = async (doctorId: string) => {
        setSlotsState({ dates: [], slotsByDate: {} });
        setSelectedDate(null);
        setBookingMessage(null);
        setSlotsError(null);
        setSlotsLoading(true);

        try {
            const res = await fetch(`/api/doctors/slots?doctorId=${doctorId}&days=7`);
            const data = await res.json();
            if (!res.ok) {
                setSlotsError(data.error || "Could not load availability.");
                return;
            }

            const payload: SlotsResponse = {
                dates: data.dates || [],
                slotsByDate: data.slotsByDate || {},
            };
            setSlotsState(payload);
            if (payload.dates.length > 0) setSelectedDate(payload.dates[0]);
        } catch (err) {
            console.error("Slots fetch error:", err);
            setSlotsError("Could not load availability.");
        } finally {
            setSlotsLoading(false);
        }
    };

    const openDoctor = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        loadSlots(doctorId);
    };

    const closeDoctor = () => {
        setSelectedDoctorId(null);
        setSlotsState({ dates: [], slotsByDate: {} });
        setSelectedDate(null);
        setBookingSlotId(null);
        setBookingMessage(null);
        setSlotsError(null);
    };

    const activeSlots = selectedDate ? slotsState.slotsByDate[selectedDate] || [] : [];

    const handleBook = async () => {
        if (!user) {
            setBookingMessage("Please sign in before booking.");
            return;
        }
        if (!selectedDoctor || !bookingSlotId) {
            setBookingMessage("Please choose a slot first.");
            return;
        }

        setBookingBusy(true);
        setBookingMessage(null);

        try {
            const res = await fetch("/api/doctors/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    doctorId: selectedDoctor.id,
                    slotId: bookingSlotId,
                    sessionType: selectedSessionType,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setBookingMessage(data.error || "Booking failed.");
                return;
            }

            setBookingMessage(`Booked with ${data.booking?.doctorName} successfully.`);
            setBookingSlotId(null);
            await loadSlots(selectedDoctor.id);
            await fetchDoctors();
        } catch (err) {
            console.error("Booking error:", err);
            setBookingMessage("Booking failed. Please try again.");
        } finally {
            setBookingBusy(false);
        }
    };

    if (selectedDoctor) {
        return (
            <div style={{ display: "grid", gap: 20 }}>
                <button
                    onClick={closeDoctor}
                    style={{
                        justifySelf: "start",
                        border: `1px solid ${t.cardBorder}`,
                        background: t.cardBg,
                        color: t.textSoft,
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                    }}
                >
                    Back to Doctors
                </button>

                <style jsx>{`
                    .doctor-detail-top {
                        display: grid;
                        grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
                        gap: 16px;
                        align-items: start;
                    }
                    @media (max-width: 1024px) {
                        .doctor-detail-top {
                            grid-template-columns: minmax(0, 1fr);
                        }
                    }
                `}</style>

                <div style={{ display: "grid", gap: 16 }}>
                    <div className="doctor-detail-top">
                    <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: 18 }}>
                        <img
                            src={selectedDoctor.profileImage}
                            alt={selectedDoctor.fullName}
                            style={{ width: "100%", aspectRatio: "1/1", borderRadius: 16, objectFit: "cover", marginBottom: 14 }}
                        />
                        <h2 style={{ fontSize: 30, fontWeight: 900, color: t.text, lineHeight: 1.15 }}>{selectedDoctor.fullName}</h2>
                        <p style={{ fontSize: 15, color: t.accent, fontWeight: 800, marginTop: 4 }}>{selectedDoctor.title}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.textSoft }}>{selectedDoctor.experienceYears} yrs exp</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: t.textSoft }}>★ {selectedDoctor.rating} ({selectedDoctor.reviewsCount})</span>
                        </div>
                    </div>

                    <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 800, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Doctor Bio</p>
                                <p style={{ marginTop: 8, fontSize: 17, color: t.textSoft, lineHeight: 1.75, maxWidth: 760 }}>{selectedDoctor.bio}</p>
                            </div>
                            <div
                                style={{
                                    border: `1px solid ${t.accentBorder}`,
                                    background: t.accentSoft,
                                    borderRadius: 12,
                                    padding: "14px 18px",
                                    minWidth: 190,
                                }}
                            >
                                <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Consultation Fee</p>
                                <p style={{ fontSize: 42, color: t.accent, fontWeight: 900, lineHeight: 1.05, marginTop: 4 }}>₹{selectedDoctor.consultationFee}</p>
                                <p style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>/session</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                            <p style={{ fontSize: 15, color: t.text }}><strong>Education:</strong> {selectedDoctor.education}</p>
                            <p style={{ fontSize: 15, color: t.text }}><strong>Current Work:</strong> {selectedDoctor.currentWork}</p>
                            <p style={{ fontSize: 15, color: t.text }}><strong>Languages:</strong> {selectedDoctor.languages.join(", ")}</p>
                        </div>
                    </div>
                    </div>

                    <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: 18 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 12 }}>Book Appointment</h3>

                        {slotsLoading ? (
                            <div style={{ fontSize: 13, color: t.textSoft }}>Loading availability...</div>
                        ) : slotsError ? (
                            <div style={{ fontSize: 13, color: t.danger }}>{slotsError}</div>
                        ) : slotsState.dates.length === 0 ? (
                            <div style={{ fontSize: 13, color: t.textSoft }}>No open slots available in the next 7 days.</div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 14 }}>
                                    <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                        1. Select Date
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {slotsState.dates.map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            style={{
                                                border: `1px solid ${selectedDate === date ? t.accent : t.cardBorder}`,
                                                background: selectedDate === date ? t.accentSoft : "transparent",
                                                color: selectedDate === date ? t.accent : t.textSoft,
                                                borderRadius: 8,
                                                padding: "8px 10px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                        </button>
                                    ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                        2. Session Type
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(90px, 1fr))", gap: 8 }}>
                                    {(["Video", "Voice", "Chat"] as const).map((session) => (
                                        <button
                                            key={session}
                                            onClick={() => setSelectedSessionType(session)}
                                            style={{
                                                border: `1px solid ${selectedSessionType === session ? t.accent : t.cardBorder}`,
                                                background: selectedSessionType === session ? t.accentSoft : "transparent",
                                                color: selectedSessionType === session ? t.accent : t.textSoft,
                                                borderRadius: 8,
                                                padding: "7px 10px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {session}
                                        </button>
                                    ))}
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                        3. Choose Time Slot
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {activeSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setBookingSlotId(slot.id)}
                                            style={{
                                                border: `1px solid ${bookingSlotId === slot.id ? t.accent : t.cardBorder}`,
                                                background: bookingSlotId === slot.id ? t.accentSoft : "transparent",
                                                color: bookingSlotId === slot.id ? t.accent : t.textSoft,
                                                borderRadius: 8,
                                                padding: "8px 11px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {new Date(slot.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                        </button>
                                    ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleBook}
                                    disabled={!bookingSlotId || bookingBusy}
                                    style={{
                                        marginTop: 14,
                                        width: "100%",
                                        border: "none",
                                        background: t.accentGrad,
                                        color: "#fff",
                                        borderRadius: 10,
                                        padding: "11px 14px",
                                        fontSize: 13,
                                        fontWeight: 800,
                                        cursor: !bookingSlotId || bookingBusy ? "not-allowed" : "pointer",
                                        opacity: !bookingSlotId || bookingBusy ? 0.6 : 1,
                                    }}
                                >
                                    {bookingBusy ? "Booking..." : "Confirm Booking"}
                                </motion.button>
                            </>
                        )}

                        {bookingMessage && (
                            <div
                                style={{
                                    marginTop: 10,
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: `1px solid ${t.accentBorder}`,
                                    background: t.accentSoft,
                                    fontSize: 12,
                                    color: t.text,
                                    fontWeight: 700,
                                }}
                            >
                                {bookingMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 18 }}>
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: t.text, letterSpacing: "-0.03em", marginBottom: 5 }}>
                    Care & Career Doctors
                </h1>
                <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 600 }}>
                    Browse mental wellness, career guidance, and medical experts with live slot availability.
                </p>
            </div>

            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 14 }}>
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search doctor name, role, specialty..."
                        style={{
                            width: "100%",
                            border: `1px solid ${t.inputBorder}`,
                            borderRadius: 10,
                            background: t.pageBg,
                            color: t.text,
                            padding: "10px 12px",
                            fontSize: 13,
                            fontWeight: 600,
                            outline: "none",
                            fontFamily: "inherit",
                        }}
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "default" | "rating" | "experience" | "name")}
                        style={{
                            border: `1px solid ${t.inputBorder}`,
                            borderRadius: 10,
                            background: t.pageBg,
                            color: t.text,
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <option value="default">Sort: Default</option>
                        <option value="rating">Sort: Top Rated</option>
                        <option value="experience">Sort: Experience</option>
                        <option value="name">Sort: Name A-Z</option>
                    </select>
                    <select
                        value={String(minRating)}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        style={{
                            border: `1px solid ${t.inputBorder}`,
                            borderRadius: 10,
                            background: t.pageBg,
                            color: t.text,
                            padding: "10px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <option value="0">Rating: Any</option>
                        <option value="4">Rating: 4.0+</option>
                        <option value="4.5">Rating: 4.5+</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            style={{
                                border: `1px solid ${activeCategory === category ? t.accent : t.cardBorder}`,
                                background: activeCategory === category ? t.accentSoft : "transparent",
                                color: activeCategory === category ? t.accent : t.textSoft,
                                borderRadius: 18,
                                padding: "7px 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div style={{ color: t.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>}

            {loading ? (
                <div style={{ color: t.textSoft, fontSize: 13 }}>Loading doctors...</div>
            ) : doctors.length === 0 ? (
                <div style={{ color: t.textSoft, fontSize: 13 }}>No doctors found for current filters.</div>
            ) : (
                <>
                    <style jsx>{`
                        .doctor-grid {
                            display: grid;
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 16px;
                        }
                        .doctor-card {
                            min-height: 310px;
                        }
                        @media (max-width: 1024px) {
                            .doctor-grid {
                                grid-template-columns: minmax(0, 1fr);
                            }
                        }
                    `}</style>
                    <div className="doctor-grid">
                        {paginatedDoctors.map((doctor, index) => (
                            <motion.div
                                key={doctor.id}
                                className="doctor-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => openDoctor(doctor.id)}
                                style={{
                                    background: t.cardBg,
                                    border: `1px solid ${t.cardBorder}`,
                                    borderRadius: 18,
                                    padding: 18,
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <img
                                        src={doctor.profileImage}
                                        alt={doctor.fullName}
                                        style={{ width: 96, height: 96, borderRadius: 18, objectFit: "cover", flexShrink: 0 }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ fontSize: 20, fontWeight: 900, color: t.text, lineHeight: 1.2 }}>{doctor.fullName}</h3>
                                        <p style={{ fontSize: 13, color: t.accent, fontWeight: 800 }}>{doctor.title}</p>
                                        <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 700 }}>{doctor.category}</p>
                                    </div>
                                </div>

                                <p style={{ marginTop: 12, fontSize: 13, color: t.textSoft, lineHeight: 1.65 }}>{doctor.bio}</p>

                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                                    <span style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>★ {doctor.rating} ({doctor.reviewsCount})</span>
                                    <span style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>{doctor.experienceYears} yrs exp</span>
                                    <span style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>{doctor.availableSlots} open slots</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>
                            Page {currentPage} of {totalPages} • {doctors.length} doctors
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    border: `1px solid ${t.cardBorder}`,
                                    background: "transparent",
                                    color: t.textSoft,
                                    borderRadius: 8,
                                    padding: "7px 12px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                style={{
                                    border: `1px solid ${t.cardBorder}`,
                                    background: "transparent",
                                    color: t.textSoft,
                                    borderRadius: 8,
                                    padding: "7px 12px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                                    opacity: currentPage >= totalPages ? 0.5 : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
