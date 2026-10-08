import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    purchaseDate: { type: Date, default: Date.now }
}, {
    versionKey: false
});

export default (connect) => connect.model('Ticket', ticketSchema);
