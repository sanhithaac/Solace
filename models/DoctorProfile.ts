import { Schema, model, models } from "mongoose";

const DoctorProfileSchema = new Schema(
    {
        fullName: { type: String, required: true, index: true },
        title: { type: String, required: true },
        category: { type: String, required: true, index: true },
        specialties: [{ type: String }],
        experienceYears: { type: Number, required: true, default: 1 },
        rating: { type: Number, required: true, default: 4.5 },
        reviewsCount: { type: Number, required: true, default: 0 },
        consultationFee: { type: Number, required: true, default: 500 },
        languages: [{ type: String }],
        education: { type: String, required: true },
        bio: { type: String, required: true },
        currentWork: { type: String, required: true },
        profileImage: { type: String, required: true },
        verified: { type: Boolean, default: true },
    },
    { timestamps: true }
);

DoctorProfileSchema.index({ category: 1, rating: -1 });
DoctorProfileSchema.index({ fullName: 1, experienceYears: -1 });

const DoctorProfile = models.DoctorProfile || model("DoctorProfile", DoctorProfileSchema);

export default DoctorProfile;
