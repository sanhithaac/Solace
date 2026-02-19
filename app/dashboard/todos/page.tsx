"use client";

import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface Todo {
    id: number;
    text: string;
    done: boolean;
    priority: "high" | "medium" | "low";
    due?: string;
    category: string;
}

const initialTodos: Todo[] = [
    { id: 1, text: "Complete Data Structures assignment", done: false, priority: "high", due: "Today", category: "Study" },
    { id: 2, text: "30-minute yoga session", done: true, priority: "medium", due: "Today", category: "Wellness" },
    { id: 3, text: "Write journal entry", done: false, priority: "medium", due: "Today", category: "Self-Care" },
    { id: 4, text: "Read 20 pages of Atomic Habits", done: false, priority: "low", due: "Tomorrow", category: "Reading" },
    { id: 5, text: "Attend therapy session", done: false, priority: "high", due: "Wed", category: "Health" },
    { id: 6, text: "Call mom", done: true, priority: "medium", due: "Today", category: "Personal" },
    { id: 7, text: "Review math notes for midterm", done: false, priority: "high", due: "Thu", category: "Study" },
];

const priorityConfig = {
    high: { color: "#ef6b6b", label: "HIGH" },
    medium: { color: "#f0c35a", label: "MED" },
    low: { color: "#6bdb8e", label: "LOW" },
};

export default function TodosPage() {
    const { t } = useTheme();
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [newTodo, setNewTodo] = useState("");
    const [filter, setFilter] = useState("all");

    const toggleTodo = (id: number) => {
        setTodos(todos.map((td) => td.id === id ? { ...td, done: !td.done } : td));
    };

    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos([{ id: Date.now(), text: newTodo, done: false, priority: "medium", due: "Today", category: "General" }, ...todos]);
        setNewTodo("");
    };

    const filtered = filter === "all" ? todos : filter === "done" ? todos.filter((td) => td.done) : todos.filter((td) => !td.done);
    const doneCount = todos.filter((td) => td.done).length;
    const progress = Math.round((doneCount / todos.length) * 100);

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 3 }}>To-Do List</h1>
                    <p style={{ fontSize: 13, color: t.textSoft, fontWeight: 500 }}>Organize your tasks, manage your time.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{progress}%</div>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{doneCount}/{todos.length} done</div>
                    </div>
                    <div style={{ width: 50, height: 50, position: "relative" }}>
                        <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="25" cy="25" r="20" fill="none" stroke={t.cardBorder} strokeWidth="4" />
                            <circle cx="25" cy="25" r="20" fill="none" stroke={t.accent} strokeWidth="4"
                                strokeDasharray={`${(progress / 100) * 126} 126`} strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Add New */}
            <div style={{
                display: "flex", gap: 8, marginBottom: 20,
                padding: 6, borderRadius: 12, border: `1.5px solid ${t.cardBorder}`, background: t.cardBg,
            }}>
                <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Add a new task..."
                    style={{
                        flex: 1, padding: "12px 14px", border: "none", background: "transparent",
                        color: t.text, fontSize: 13, fontWeight: 500, outline: "none", fontFamily: "inherit",
                    }}
                />
                <motion.button whileTap={{ scale: 0.95 }} onClick={addTodo} style={{
                    padding: "10px 20px", borderRadius: 9, border: "none", background: t.accentGrad,
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>
                    Add
                </motion.button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[{ key: "all", label: "All" }, { key: "pending", label: "Pending" }, { key: "done", label: "Done" }].map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: "7px 16px", borderRadius: 8, border: `1px solid ${filter === f.key ? t.accent : t.cardBorder}`,
                        background: filter === f.key ? t.accentSoft : "transparent",
                        color: filter === f.key ? t.accent : t.textMuted,
                        fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tasks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((todo, i) => (
                    <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        layout
                        style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "14px 16px", borderRadius: 12,
                            background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                            opacity: todo.done ? 0.55 : 1,
                            transition: "all 0.25s",
                        }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleTodo(todo.id)}
                            style={{
                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                border: `2px solid ${todo.done ? t.accent : t.textMuted}`,
                                background: todo.done ? t.accent : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            {todo.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </motion.button>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, textDecoration: todo.done ? "line-through" : "none" }}>{todo.text}</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>📅 {todo.due}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>📁 {todo.category}</span>
                            </div>
                        </div>

                        <span style={{
                            fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5,
                            background: `${priorityConfig[todo.priority].color}18`,
                            color: priorityConfig[todo.priority].color,
                            letterSpacing: "0.06em",
                        }}>
                            {priorityConfig[todo.priority].label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
