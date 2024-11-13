const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description Get all messages for a specific chat
//@route GET /api/message/:chatId
//@access Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: "Failed to get messages" });
    console.error("Error fetching messages:", error.message);
  }
});

//@description Create a new message
//@route POST /api/message/
//@access Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create the message
    const createdMessage = await Message.create(newMessage);

    // Retrieve the message as a Mongoose document and populate necessary fields
    const message = await Message.findById(createdMessage._id)
      .populate("sender", "name pic")
      .populate("chat")
      .populate({
        path: "chat.users",
        select: "name pic email",
      });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: "Failed to send message" });
    console.error("Error sending message:", error.message);
  }
});

module.exports = { allMessages, sendMessage };
