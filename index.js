import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import messagesRouter from "./routes/api/v1/messages.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/messages", messagesRouter);

mongoose.connect(process.env.MONGODB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});