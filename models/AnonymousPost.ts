import mongoose, { Schema, model, models } from "mongoose";

const AnonymousPostSchema = new Schema({
    uid: { type: String, required: true, index: true }, // Firebase UID (kept for XP, but NOT shown)
    content: { type: String, required: true },
    tags: [{ type: String }],
    hearts: { type: Number, default: 0 },
    hugs: { type: Number, default: 0 },
    heartedBy: [{ type: String }], // UIDs who hearted
    huggedBy: [{ type: String }], // UIDs who hugged
    createdAt: { type: Date, default: Date.now },
});

const AnonymousPost = models.AnonymousPost || model("AnonymousPost", AnonymousPostSchema);

export default AnonymousPost;
