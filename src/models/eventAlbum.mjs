import mongoose from 'mongoose';

const eventAlbumSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true }
}, {
    versionKey: false
});

export default (connect) => connect.model('EventAlbum', eventAlbumSchema);
