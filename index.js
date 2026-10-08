import express from 'express';
import messagesRouter from "./routes/api/v1/messages.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/test');

app.use("/api/v1/messages", messagesRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});