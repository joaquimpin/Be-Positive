const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    name: String,
    lastName: String,
    password: { type: String, require },
    birthday: { type: Date, default: new Date(2009, 12, 17) },
    profession: String,
    country: String,
    email: { type: String, require, unique: true },
    pictureOfUser: { type: String, default: "default.png" },
    chat: [{ chatId: String, name: String, user: { type: Schema.Types.ObjectId, ref: 'User' } }],
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const User = mongoose.model("User", userSchema);

module.exports = User;