import { Schema, model, models, Types } from "mongoose";

const DoctorBookingSchema = new Schema(
    {
        uid: { type: String, required: true, index: true },
        doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
        slotId: { type: Types.ObjectId, ref: "DoctorSlot", required: true, unique: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        sessionType: { type: String, enum: ["Video", "Voice", "Chat"], required: true },
        status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked", index: true },
    },
    { timestamps: true }
);

DoctorBookingSchema.index({ uid: 1, createdAt: -1 });

const DoctorBooking = models.DoctorBooking || model("DoctorBooking", DoctorBookingSchema);

export default DoctorBooking;
