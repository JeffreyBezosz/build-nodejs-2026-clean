// import Message model
import Message from "../../../models/api/v1/Message.js";

export const list = async (req, res) => {
    const messages = await Message.find({});
    const result = {
        status: 'success',
        data: {
            messages: messages
        }
    };
    res.json(result);
};

export const get = (req, res) => {
  res.send("GET messages with id " + req.params.id);
};

export const create = async (req, res) => {

    try {
      let message = new Message();
      message.text = req.body.text;
      message.username = req.body.username;
      await message.save();

      const result = {
        'status': 'success',
        'data': {'message': message}
      };

      res.status(200).json(result);

    } catch (err) {
      console.error(err);
      const result = {
        'status': 'error',
        'data': {'message': "something went wrong."}
      };

      res.status(500).json(result);
    }
};

export const update = async (req, res) => {
  try {
    if (!Message.db.base.isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid message ID" });
    }
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { text: req.body.text, username: req.body.username } },
      { new: true, runValidators: true }
    );
    if (!message) {
      return res.status(404).json({ status: "error", message: "Message not found" });
    }
    return res.json({ status: "success", data: { message } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Could not update message" });
  }
};

export const remove = async (req, res) => {
  try {
    if (!Message.db.base.isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid message ID" });
    }
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ status: "error", message: "Message not found" });
    }
    return res.json({ status: "success", data: { message } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Could not delete message" });
  }
};
