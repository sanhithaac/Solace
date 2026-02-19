import mongoose, { Schema, model, models } from "mongoose";

const MoodLogSchema = new Schema({
    uid: { type: String, required: true, index: true },
    mood: { type: String, required: true },
    icon: { type: String, required: true },
    note: { type: String },
    // Period tracking fields
    period: { type: Boolean, default: false },
    flow: { type: String, enum: ["light", "medium", "heavy", "spotting", ""], default: "" },
    symptoms: [{ type: String }], // cramps, headache, bloating, fatigue, etc.
    date: { type: String }, // "YYYY-MM-DD" for calendar lookup
    createdAt: { type: Date, default: Date.now },
});

// Compound index for fast calendar queries
MoodLogSchema.index({ uid: 1, date: 1 });

const MoodLog = models.MoodLog || model("MoodLog", MoodLogSchema);

export default MoodLog;
