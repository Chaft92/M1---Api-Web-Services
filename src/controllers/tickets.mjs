import TicketTypeModel from '../models/ticketType.mjs';
import TicketModel from '../models/ticket.mjs';
import EventModel from '../models/event.mjs';
import auth from '../middlewares/auth.mjs';

export default class Tickets {
    constructor(app, connect) {
        this.app = app;
        this.TicketType = TicketTypeModel(connect);
        this.Ticket = TicketModel(connect);
        this.Event = EventModel(connect);
        this.run();
    }

    run() {
        this.app.get('/events/:eventId/ticket-types', async (req, res) => {
            try {
                const types = await this.TicketType.find({ event: req.params.eventId });
                res.status(200).json(types);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/events/:eventId/ticket-types', auth, async (req, res) => {
            try {
                const event = await this.Event.findById(req.params.eventId);
                if (!event) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                const isOrganizer = event.organizers.some((id) => id.toString() === req.user.id);
                if (!isOrganizer) {
                    return res.status(403).json({ message: 'Seul un organisateur peut créer un type de billet' });
                }
                const ticketType = new this.TicketType({ ...req.body, event: req.params.eventId });
                const saved = await ticketType.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.post('/ticket-types/:ticketTypeId/tickets', async (req, res) => {
            try {
                const ticketType = await this.TicketType.findById(req.params.ticketTypeId);
                if (!ticketType) {
                    return res.status(404).json({ message: 'Type de billet introuvable' });
                }

                const sold = await this.Ticket.countDocuments({ ticketType: req.params.ticketTypeId });
                if (sold >= ticketType.quantity) {
                    return res.status(409).json({ message: 'Billets épuisés pour ce type' });
                }

                const alreadyHasOne = await this.Ticket.findOne({ ticketType: req.params.ticketTypeId, email: req.body.email });
                if (alreadyHasOne) {
                    return res.status(409).json({ message: 'Un seul billet par personne pour ce type' });
                }

                const ticket = new this.Ticket({ ...req.body, ticketType: req.params.ticketTypeId });
                const saved = await ticket.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.get('/ticket-types/:ticketTypeId/tickets', auth, async (req, res) => {
            try {
                const tickets = await this.Ticket.find({ ticketType: req.params.ticketTypeId });
                res.status(200).json(tickets);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
