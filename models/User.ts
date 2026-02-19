import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String },
    displayName: { type: String },
    photoURL: { type: String },
    mode: { type: String, default: "women" },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);

export default User;
