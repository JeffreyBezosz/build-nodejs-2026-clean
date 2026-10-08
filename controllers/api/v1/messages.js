import mongoose from "mongoose";
import Message from "../../../models/api/v1/Message.js";

// Some clients send "user"/"message", others send "username"/"text".
const extractFields = (body = {}) => {
  const input = body?.data && typeof body.data === "object" ? body.data : body;
  const user = input?.user ?? input?.username ?? input?.name;
  const text = input?.text ?? input?.message ?? input?.content;
  return { user, text };
};

const validText = (value) => typeof value === "string" && value.trim().length > 0;

const messageFields = ({ user, text }) => ({
  ...(user !== undefined ? { username: user, user } : {}),
  ...(text !== undefined ? { text, message: text } : {})
});

const databaseError = (res, err) => {
  console.error("Message API error:", err);
  return res.status(500).json({
    status: "error",
    data: { message: "Database request failed" }
  });
};

const invalidId = (res) => res.status(400).json({
  status: "error",
  data: { message: "Invalid message ID" }
});

export const list = async (req, res) => {
  try {
    const user = req.query.user;
    const filter = typeof user === "string" && user
      ? { $or: [{ username: user }, { user }] }
      : {};
    const messages = await Message.find(filter);
    return res.json({ status: "success", data: { messages } });
  } catch (err) {
    return databaseError(res, err);
  }
};

export const get = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ status: "error", data: { message: "Message not found" } });
    }
    return res.json({ status: "success", data: { message } });
  } catch (err) {
    return databaseError(res, err);
  }
};

export const create = async (req, res) => {
  const fields = extractFields(req.body);
  if (!validText(fields.user) || !validText(fields.text)) {
    return res.status(400).json({
      status: "error",
      data: { message: "Both user (or username) and message (or text) are required" }
    });
  }
  try {
    const message = await Message.create(messageFields(fields));
    return res.status(200).json({ status: "success", data: { message } });
  } catch (err) {
    return databaseError(res, err);
  }
};

export const update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const fields = extractFields(req.body);
  if ((fields.user !== undefined && !validText(fields.user)) ||
      (fields.text !== undefined && !validText(fields.text)) ||
      (fields.user === undefined && fields.text === undefined)) {
    return res.status(400).json({
      status: "error",
      data: { message: "Provide a valid user or message to update" }
    });
  }
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: messageFields(fields) },
      { new: true, runValidators: true }
    );
    if (!message) {
      return res.status(404).json({ status: "error", data: { message: "Message not found" } });
    }
    return res.json({ status: "success", data: { message } });
  } catch (err) {
    return databaseError(res, err);
  }
};

export const remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ status: "error", data: { message: "Message not found" } });
    }
    return res.json({ status: "success", data: { message } });
  } catch (err) {
    return databaseError(res, err);
  }
};
