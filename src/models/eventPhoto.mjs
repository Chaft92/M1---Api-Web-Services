import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true, versionKey: false });

const eventPhotoSchema = new mongoose.Schema({
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'EventAlbum', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    comments: [commentSchema]
}, {
    versionKey: false
});

export default (connect) => connect.model('EventPhoto', eventPhotoSchema);
