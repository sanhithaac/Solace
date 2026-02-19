"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface Todo {
    _id: string;
    text: string;
    completed: boolean;
    priority: "High" | "Medium" | "Low";
    createdAt: string;
}

const priorityConfig = {
    High: { color: "#ef6b6b", label: "HIGH" },
    Medium: { color: "#f0c35a", label: "MED" },
    Low: { color: "#6bdb8e", label: "LOW" },
};

export default function TodosPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Fetch todos
    useEffect(() => {
        if (!user) return;
        const fetchTodos = async () => {
            try {
                const res = await fetch(`/api/todos?uid=${user.uid}`);
                const data = await res.json();
                if (data.todos) setTodos(data.todos);
            } catch (err) {
                console.error("Fetch todos error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTodos();
    }, [user]);

    const toggleTodo = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/todos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, completed: !currentStatus, uid: user?.uid }),
            });
            const data = await res.json();
            if (data.success) {
                setTodos(todos.map((td) => td._id === id ? { ...td, completed: !currentStatus } : td));
            }
        } catch (err) {
            console.error("Toggle error:", err);
        }
    };

    const addTodo = async () => {
        if (!newTodo.trim() || !user) return;
        try {
            const res = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, text: newTodo, priority: "Medium" }),
            });
            const data = await res.json();
            if (data.success) {
                setTodos([data.todo, ...todos]);
                setNewTodo("");
            }
        } catch (err) {
            console.error("Add error:", err);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            setTodos(todos.filter(t => t._id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const filtered = filter === "all" ? todos : filter === "done" ? todos.filter((td) => td.completed) : todos.filter((td) => !td.completed);
    const doneCount = todos.filter((td) => td.completed).length;
    const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

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
                        key={todo._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        layout
                        style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "14px 16px", borderRadius: 12,
                            background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                            opacity: todo.completed ? 0.55 : 1,
                            transition: "all 0.25s",
                        }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleTodo(todo._id, todo.completed)}
                            style={{
                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                border: `2px solid ${todo.completed ? t.accent : t.textMuted}`,
                                background: todo.completed ? t.accent : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            {todo.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </motion.button>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted }}>📅 {new Date(todo.createdAt).toLocaleDateString()}</span>
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

                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => deleteTodo(todo._id)}
                            style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                border: "none", background: "transparent", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                opacity: 0.4, transition: "opacity 0.2s",
                            }}
                            onHoverStart={() => {}}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.danger} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
