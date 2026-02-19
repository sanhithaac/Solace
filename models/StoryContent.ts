import { Schema, model, models } from "mongoose";

const StoryContentSchema = new Schema({
    kind: { type: String, enum: ["quote", "success"], required: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    quote: { type: String },
    title: { type: String },
    excerpt: { type: String },
    author: { type: String, required: true },
    emoji: { type: String },
    category: { type: String },
    publishedLabel: { type: String },
}, { timestamps: true });

const StoryContent = models.StoryContent || model("StoryContent", StoryContentSchema);

export default StoryContent;
