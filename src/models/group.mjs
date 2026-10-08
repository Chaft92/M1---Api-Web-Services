import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    coverPhoto: { type: String },
    type: { type: String, enum: ['public', 'private', 'secret'], required: true },
    allowMemberPosts: { type: Boolean, default: true },
    allowMemberEvents: { type: Boolean, default: false },
    members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validate: v => v.length > 0
    },
    admins: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validate: v => v.length > 0
    }
}, {
    versionKey: false
});

export default (connect) => connect.model('Group', groupSchema);
