const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    usernamechat: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String,
    chatId: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;