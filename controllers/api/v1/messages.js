import mongoose from "mongoose";
import Message from "../../../models/api/v1/Message.js";

// The assignment submits { message: { user: "...", text: "..." } }.
// Also accept the flat formats used by Postman and the older version of this API.
const extractFields = (body = {}) => {
  const payload = body && typeof body === "object" ? body : {};
  const nested = payload.data?.message ?? payload.message ?? payload.data;
  const input = nested && typeof nested === "object" && !Array.isArray(nested)
    ? nested
    : payload;

  return {
    user: input.user ?? input.username ?? input.name,
    text: input.text ?? (typeof input.message === "string" ? input.message : undefined) ?? input.content
  };
};

const isNonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

// Present the field names required in the assignment, even for older documents.
const asPublicMessage = (doc, listFormat = false) => {
  const value = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const result = {
    user: value.user ?? value.username,
    ...(listFormat
      ? { message: value.message ?? value.text }
      : { text: value.text ?? value.message }),
    _id: value._id
  };
  if (!listFormat && value.__v !== undefined) result.__v = value.__v;
  return result;
};

const error = (res, code, reason) =>
  res.status(code).json({ status: "error", message: reason });

const unexpectedError = (res, err) => {
  console.error("Message API error:", err);
  return error(res, 500, "Database request failed");
};

const validId = (res, id) => {
  if (mongoose.isValidObjectId(id)) return true;
  error(res, 400, "Invalid message ID");
  return false;
};

export const list = async (req, res) => {
  try {
    const user = req.query.user;
    const hasUser = typeof user === "string" && user.trim() !== "";
    const filter = hasUser
      ? { $or: [{ user: new RegExp(`^${user.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
                { username: new RegExp(`^${user.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }] }
      : {};
    const messages = await Message.find(filter);

    return res.json({
      status: "success",
      message: hasUser ? `Messages from user ${user}` : "GETTING messages",
      data: { messages: messages.map((doc) => asPublicMessage(doc, true)) }
    });
  } catch (err) {
    return unexpectedError(res, err);
  }
};

export const get = async (req, res) => {
  if (!validId(res, req.params.id)) return;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return error(res, 404, "Message not found");

    return res.json({
      status: "success",
      message: "GETTING message 1",
      data: { message: asPublicMessage(message, true) }
    });
  } catch (err) {
    return unexpectedError(res, err);
  }
};

export const create = async (req, res) => {
  const { user, text } = extractFields(req.body);
  if (!isNonEmpty(user) || !isNonEmpty(text)) {
    return error(res, 400, "A message must contain user and text");
  }
  try {
    const message = await Message.create({
      user, username: user, text, message: text
    });
    return res.status(200).json({
      status: "success",
      message: "Message saved",
      data: { message: asPublicMessage(message) }
    });
  } catch (err) {
    return unexpectedError(res, err);
  }
};

export const update = async (req, res) => {
  if (!validId(res, req.params.id)) return;

  const { user, text } = extractFields(req.body);
  if ((user !== undefined && !isNonEmpty(user)) ||
      (text !== undefined && !isNonEmpty(text)) ||
      (user === undefined && text === undefined)) {
    return error(res, 400, "Provide a valid user or text");
  }

  try {
    const fields = {
      ...(user !== undefined ? { user, username: user } : {}),
      ...(text !== undefined ? { text, message: text } : {})
    };
    const message = await Message.findByIdAndUpdate(
      req.params.id, { $set: fields }, { new: true, runValidators: true }
    );
    if (!message) return error(res, 404, "Message not found");

    return res.json({
      status: "success",
      message: "Message updated",
      data: { message: asPublicMessage(message) }
    });
  } catch (err) {
    return unexpectedError(res, err);
  }
};

export const remove = async (req, res) => {
  if (!validId(res, req.params.id)) return;
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return error(res, 404, "Message not found");

    return res.json({
      status: "success",
      message: "Message deleted",
      data: { message: { _id: message._id } }
    });
  } catch (err) {
    return unexpectedError(res, err);
  }
};
