const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: { type: String, require: true ,unique: true },
    name: String,
    secondName: String,
    password: { type: String,require},
    birthday:  Date(),
    profession: String,
    countrie: String,
    email: { type: String,require ,unique: true },
    pictureOfUser: String,
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;