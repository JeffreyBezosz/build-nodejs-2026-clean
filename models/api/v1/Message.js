import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  username: { type: String, required: true },
  // Accept both naming conventions used by message API clients.
  message: { type: String },
  user: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
