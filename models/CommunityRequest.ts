import { Schema, model, models } from "mongoose";

const CommunityRequestSchema = new Schema(
    {
        uid: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        icon: { type: String, default: "CM" },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    },
    { timestamps: true }
);

CommunityRequestSchema.index({ uid: 1, name: 1, status: 1 });

const CommunityRequest = models.CommunityRequest || model("CommunityRequest", CommunityRequestSchema);

export default CommunityRequest;
