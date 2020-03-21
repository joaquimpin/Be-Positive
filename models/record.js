const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
		text: {type: String, required: true},
		rate: Number,
		like: [{type: Schema.Types.ObjectId, ref: 'User'}],
		owner: {type: Schema.Types.ObjectId, ref: 'User'},
	},
	{
		timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
	}
);

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;