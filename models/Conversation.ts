import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
    role: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema({
    uid: { type: String, required: true, index: true }, // Ties to User.uid
    messages: [MessageSchema],
    lastInteraction: { type: Date, default: Date.now },
});

const Conversation = models.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
