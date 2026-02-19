import mongoose, { Schema, model, models } from "mongoose";

const CommunitySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String, default: "General" },
    icon: { type: String, default: "🌐" },
    members: [{ type: String }], // Array of UIDs
    memberCount: { type: Number, default: 0 },
    createdBy: { type: String }, // UID of creator
    createdAt: { type: Date, default: Date.now },
});

const Community = models.Community || model("Community", CommunitySchema);

export default Community;
