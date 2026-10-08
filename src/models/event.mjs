import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    coverPhoto: { type: String },
    isPrivate: { type: Boolean, default: false },
    organizers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validate: v => v.length > 0
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    versionKey: false
});

export default (connect) => connect.model('Event', eventSchema);
