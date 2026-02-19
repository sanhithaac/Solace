import { Schema, model, models, Types } from "mongoose";

const DoctorSlotSchema = new Schema(
    {
        doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
        startTime: { type: Date, required: true, index: true },
        endTime: { type: Date, required: true },
        sessionType: { type: String, enum: ["Video", "Voice", "Chat"], default: "Video" },
        status: { type: String, enum: ["available", "booked", "off"], default: "available", index: true },
        bookedByUid: { type: String, default: null, index: true },
        bookedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

DoctorSlotSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });
DoctorSlotSchema.index({ doctorId: 1, status: 1, startTime: 1 });

const DoctorSlot = models.DoctorSlot || model("DoctorSlot", DoctorSlotSchema);

export default DoctorSlot;
