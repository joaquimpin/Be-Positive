const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: String,
    name: String,
    secondName: String,
    password: String,
    birthday: new Date(),
    profession: String,
    countrie: String,
    email: String,
    pictureOfUser: String,
    phone: Number
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
}
);

const User = mongoose.model("user", userSchema);

module.exports = User;