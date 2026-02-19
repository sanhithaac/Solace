import mongoose, { Schema, model, models } from "mongoose";

const JournalEntrySchema = new Schema({
    uid: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    mood: { type: String }, // e.g., "Calm", "Anxious"
    sentiment: { type: String }, // AI analyzed: "Positive", "Negative", "Neutral"
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const JournalEntry = models.JournalEntry || model("JournalEntry", JournalEntrySchema);

export default JournalEntry;
