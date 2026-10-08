import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: {
        type: [String],
        validate: v => v.length >= 2
    }
}, { versionKey: false });

const pollSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: {
        type: [questionSchema],
        validate: v => v.length > 0
    }
}, {
    versionKey: false
});

export default (connect) => connect.model('Poll', pollSchema);
