const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
    text: String,
    rate: Number,
    date: Date,
    like:[{ type: Schema.Types.ObjectId, ref: 'user' }],
    owner: { type: Schema.Types.ObjectId, ref: 'user' }
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;