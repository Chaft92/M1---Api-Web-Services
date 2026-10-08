import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
}, {
    versionKey: false
});

export default (connect) => connect.model('TicketType', ticketTypeSchema);
