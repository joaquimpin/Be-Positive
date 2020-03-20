const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
		text: {type: String, required: true},
		rate: Number,
		date: Date,
		like: [{type: Schema.Types.ObjectId, ref: 'user'}],
		owner: {type: Schema.Types.ObjectId, ref: 'user'},

	},
	{
		timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
	}
);

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;