import mongoose, { Schema, model, models } from "mongoose";

const MoodLogSchema = new Schema({
    uid: { type: String, required: true, index: true },
    mood: { type: String, required: true }, // e.g. "Great", "Good", "Okay", "Bad", "Awful"
    icon: { type: String, required: true },
    note: { type: String },
    period: { type: Boolean, default: false }, // For women mode
    createdAt: { type: Date, default: Date.now },
});

const MoodLog = models.MoodLog || model("MoodLog", MoodLogSchema);

export default MoodLog;
