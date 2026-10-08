import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, {
    versionKey: false
});

threadSchema.pre('validate', function (next) {
    if (!!this.group === !!this.event) {
        return next(new Error('Un fil de discussion doit être lié à exactement un groupe ou un événement'));
    }
    next();
});

export default (connect) => connect.model('Thread', threadSchema);
