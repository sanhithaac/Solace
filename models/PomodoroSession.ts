import mongoose, { Schema, model, models } from "mongoose";

const PomodoroSessionSchema = new Schema({
    uid: { type: String, required: true, index: true },
    duration: { type: Number, required: true }, // in minutes (25, 45, 60 etc.)
    type: { type: String, enum: ["focus", "short-break", "long-break"], default: "focus" },
    completed: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const PomodoroSession = models.PomodoroSession || model("PomodoroSession", PomodoroSessionSchema);

export default PomodoroSession;
