import mongoose from "mongoose";
const {Schema} = mongoose;

const messageSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  username: { type: String, required: true },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
