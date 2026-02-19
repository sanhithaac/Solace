import mongoose, { Schema, model, models } from "mongoose";

const TodoSchema = new Schema({
    uid: { type: String, required: true, index: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    createdAt: { type: Date, default: Date.now },
});

const Todo = models.Todo || model("Todo", TodoSchema);

export default Todo;
