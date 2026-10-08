import mongoose from 'mongoose';

const pollResponseSchema = new mongoose.Schema({
    poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
        questionIndex: { type: Number, required: true },
        chosenOptionIndex: { type: Number, required: true }
    }]
}, {
    versionKey: false
});

pollResponseSchema.index({ poll: 1, participant: 1 }, { unique: true });

export default (connect) => connect.model('PollResponse', pollResponseSchema);
