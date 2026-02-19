"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    High: { color: "#ef6b6b", label: "HIGH", emoji: "🔴" },
    Medium: { color: "#f0c35a", label: "MED", emoji: "🟡" },
    Low: { color: "#6bdb8e", label: "LOW", emoji: "🟢" },
};

export default function TodosPage() {
    const { t } = useTheme();
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Add-task panel state
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [newTasks, setNewTasks] = useState<{ text: string; priority: "High" | "Medium" | "Low"; checked: boolean }[]>([
        { text: "", priority: "Medium", checked: true },
    ]);
    const [saving, setSaving] = useState(false);

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
        // Optimistic update
        setTodos((prev) => prev.map((td) => td._id === id ? { ...td, completed: !currentStatus } : td));
        try {
            const res = await fetch("/api/todos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, completed: !currentStatus, uid: user?.uid }),
            });
            const data = await res.json();
            if (!data.success) {
                setTodos((prev) => prev.map((td) => td._id === id ? { ...td, completed: currentStatus } : td));
            }
        } catch (err) {
            console.error("Toggle error:", err);
            setTodos((prev) => prev.map((td) => td._id === id ? { ...td, completed: currentStatus } : td));
        }
    };

    const addMultipleTodos = async () => {
        if (!user) return;
        const tasksToAdd = newTasks.filter((t) => t.checked && t.text.trim());
        if (tasksToAdd.length === 0) return;
        setSaving(true);
        try {
            const results = await Promise.all(
                tasksToAdd.map((task) =>
                    fetch("/api/todos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uid: user.uid, text: task.text, priority: task.priority }),
                    }).then((r) => r.json())
                )
            );
            const newTodos = results.filter((r) => r.success).map((r) => r.todo);
            setTodos((prev) => [...newTodos, ...prev]);
            setShowAddPanel(false);
            setNewTasks([{ text: "", priority: "Medium", checked: true }]);
        } catch (err) {
            console.error("Add error:", err);
        } finally {
            setSaving(false);
        }
    };

    const deleteTodo = async (id: string) => {
        setTodos((prev) => prev.filter((td) => td._id !== id));
        try {
            await fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const addNewTaskRow = () => {
        setNewTasks((prev) => [...prev, { text: "", priority: "Medium", checked: true }]);
    };

    const updateTaskRow = (index: number, field: string, value: any) => {
        setNewTasks((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    const removeTaskRow = (index: number) => {
        if (newTasks.length <= 1) return;
        setNewTasks((prev) => prev.filter((_, i) => i !== index));
    };

    const filtered = filter === "all" ? todos : filter === "done" ? todos.filter((td) => td.completed) : todos.filter((td) => !td.completed);
    const doneCount = todos.filter((td) => td.completed).length;
    const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

    return (
        <>
            {/* ─── Header ─── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: "-0.03em", marginBottom: 4 }}>To-Do List ✅</h1>
                    <p style={{ fontSize: 15, color: t.textSoft, fontWeight: 500 }}>Organize your tasks, manage your time.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: t.text }}>{progress}%</div>
                        <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>{doneCount}/{todos.length} done</div>
                    </div>
                    <div style={{ width: 56, height: 56, position: "relative" }}>
                        <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="28" cy="28" r="22" fill="none" stroke={t.cardBorder} strokeWidth="5" />
                            <motion.circle
                                cx="28" cy="28" r="22" fill="none" stroke={t.accent} strokeWidth="5"
                                strokeDasharray={`${(progress / 100) * 138.2} 138.2`} strokeLinecap="round"
                                initial={{ strokeDasharray: "0 138.2" }}
                                animate={{ strokeDasharray: `${(progress / 100) * 138.2} 138.2` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ─── Add Button ─── */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddPanel(true)}
                style={{
                    width: "100%", padding: "16px 22px", borderRadius: 14, border: `2px dashed ${t.accent}40`,
                    background: `${t.accent}08`, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    marginBottom: 22, transition: "all 0.2s",
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.accent }}>Add New Tasks</span>
            </motion.button>

            {/* ─── Add Tasks Panel (slides open) ─── */}
            <AnimatePresence>
                {showAddPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 22 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        style={{ overflow: "hidden", borderRadius: 16, border: `1.5px solid ${t.accent}30`, background: t.cardBg }}
                    >
                        <div style={{ padding: 22 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: t.text }}>📝 Add Tasks</h3>
                                <button
                                    onClick={() => { setShowAddPanel(false); setNewTasks([{ text: "", priority: "Medium", checked: true }]); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Task rows */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                                {newTasks.map((task, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "10px 14px", borderRadius: 12,
                                            background: t.inputBg, border: `1px solid ${t.cardBorder}`,
                                        }}
                                    >
                                        {/* Checkbox to include/exclude */}
                                        <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => updateTaskRow(i, "checked", !task.checked)}
                                            style={{
                                                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                                border: `2.5px solid ${task.checked ? t.accent : t.textMuted}`,
                                                background: task.checked ? t.accent : "transparent",
                                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            {task.checked && (
                                                <motion.svg
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </motion.svg>
                                            )}
                                        </motion.button>

                                        {/* Task text input */}
                                        <input
                                            value={task.text}
                                            onChange={(e) => updateTaskRow(i, "text", e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addNewTaskRow();
                                                }
                                            }}
                                            placeholder={`Task ${i + 1}...`}
                                            autoFocus={i === newTasks.length - 1}
                                            style={{
                                                flex: 1, padding: "8px 0", border: "none", background: "transparent",
                                                color: t.text, fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit",
                                                opacity: task.checked ? 1 : 0.4,
                                            }}
                                        />

                                        {/* Priority selector */}
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {(["Low", "Medium", "High"] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => updateTaskRow(i, "priority", p)}
                                                    style={{
                                                        padding: "4px 10px", borderRadius: 6,
                                                        border: `1.5px solid ${task.priority === p ? priorityConfig[p].color : "transparent"}`,
                                                        background: task.priority === p ? `${priorityConfig[p].color}18` : "transparent",
                                                        fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
                                                        color: task.priority === p ? priorityConfig[p].color : t.textMuted,
                                                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                                                    }}
                                                >
                                                    {priorityConfig[p].label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Remove row */}
                                        {newTasks.length > 1 && (
                                            <button
                                                onClick={() => removeTaskRow(i)}
                                                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.35 }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.danger} strokeWidth="2" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Add another row + Save */}
                            <div style={{ display: "flex", gap: 10 }}>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={addNewTaskRow}
                                    style={{
                                        flex: 1, padding: "12px 16px", borderRadius: 10,
                                        border: `1.5px dashed ${t.cardBorder}`, background: "transparent",
                                        color: t.textSoft, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Another
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={addMultipleTodos}
                                    disabled={saving || newTasks.filter((t) => t.checked && t.text.trim()).length === 0}
                                    style={{
                                        flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                                        background: t.accentGrad, color: "#fff", fontSize: 14, fontWeight: 700,
                                        cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
                                        opacity: saving || newTasks.filter((t) => t.checked && t.text.trim()).length === 0 ? 0.5 : 1,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    }}
                                >
                                    {saving ? "Saving..." : `Save ${newTasks.filter((t) => t.checked && t.text.trim()).length} Task${newTasks.filter((t) => t.checked && t.text.trim()).length !== 1 ? "s" : ""}`}
                                    {!saving && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Filters ─── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
                    { key: "all", label: `All (${todos.length})` },
                    { key: "pending", label: `Pending (${todos.length - doneCount})` },
                    { key: "done", label: `Done (${doneCount})` },
                ].map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${filter === f.key ? t.accent : t.cardBorder}`,
                        background: filter === f.key ? t.accentSoft : "transparent",
                        color: filter === f.key ? t.accent : t.textMuted,
                        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.2s",
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* ─── Task List ─── */}
            {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: t.textMuted, fontSize: 15 }}>Loading tasks...</div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: 48, textAlign: "center", borderRadius: 16,
                        background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                    }}
                >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 4 }}>
                        {filter === "done" ? "No completed tasks yet" : filter === "pending" ? "All caught up!" : "No tasks yet"}
                    </div>
                    <div style={{ fontSize: 14, color: t.textSoft }}>
                        {filter === "all" ? "Click \"Add New Tasks\" to get started!" : ""}
                    </div>
                </motion.div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((todo, i) => (
                        <motion.div
                            key={todo._id}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ delay: i * 0.03 }}
                            layout
                            style={{
                                display: "flex", alignItems: "center", gap: 14,
                                padding: "16px 20px", borderRadius: 14,
                                background: t.cardBg,
                                border: `1.5px solid ${todo.completed ? `${t.accent}25` : t.cardBorder}`,
                                transition: "all 0.3s",
                            }}
                        >
                            {/* Checkbox */}
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => toggleTodo(todo._id, todo.completed)}
                                style={{
                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                    border: `2.5px solid ${todo.completed ? t.accent : t.textMuted}`,
                                    background: todo.completed ? t.accent : "transparent",
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.25s",
                                }}
                            >
                                <AnimatePresence>
                                    {todo.completed && (
                                        <motion.svg
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Task content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 16, fontWeight: 600, color: t.text,
                                    textDecoration: todo.completed ? "line-through" : "none",
                                    opacity: todo.completed ? 0.5 : 1,
                                    transition: "all 0.3s",
                                }}>
                                    {todo.text}
                                </div>
                                <div style={{ display: "flex", gap: 10, marginTop: 5, alignItems: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>
                                        📅 {new Date(todo.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                    </span>
                                    {todo.completed && (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: t.accent }}>✓ Done</span>
                                    )}
                                </div>
                            </div>

                            {/* Priority badge */}
                            <span style={{
                                fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 6,
                                background: `${priorityConfig[todo.priority]?.color || "#f0c35a"}18`,
                                color: priorityConfig[todo.priority]?.color || "#f0c35a",
                                letterSpacing: "0.06em",
                            }}>
                                {priorityConfig[todo.priority]?.emoji} {priorityConfig[todo.priority]?.label || "MED"}
                            </span>

                            {/* Delete button */}
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ opacity: 0.8 }}
                                onClick={() => deleteTodo(todo._id)}
                                style={{
                                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                    border: "none", background: `${t.danger}10`, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s",
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.danger} strokeWidth="2" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            )}
        </>
    );
}
