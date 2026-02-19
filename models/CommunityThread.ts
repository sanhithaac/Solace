import { Schema, model, models, Types } from "mongoose";

const CommunityMessageSchema = new Schema({
    uid: { type: String, required: true, index: true },
    userLabel: { type: String, required: true },
    role: { type: String, enum: ["user", "doctor", "ai"], default: "user" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const CommunityThreadSchema = new Schema(
    {
        communityId: { type: Types.ObjectId, ref: "Community", required: true, unique: true, index: true },
        messages: [CommunityMessageSchema],
    },
    { timestamps: true }
);

const CommunityThread = models.CommunityThread || model("CommunityThread", CommunityThreadSchema);

export default CommunityThread;
