import PollModel from '../models/poll.mjs';
import PollResponseModel from '../models/pollResponse.mjs';
import EventModel from '../models/event.mjs';
import auth from '../middlewares/auth.mjs';

export default class Polls {
    constructor(app, connect) {
        this.app = app;
        this.Poll = PollModel(connect);
        this.PollResponse = PollResponseModel(connect);
        this.Event = EventModel(connect);
        this.run();
    }

    run() {
        this.app.get('/events/:eventId/polls', async (req, res) => {
            try {
                const polls = await this.Poll.find({ event: req.params.eventId });
                res.status(200).json(polls);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/events/:eventId/polls', auth, async (req, res) => {
            try {
                const event = await this.Event.findById(req.params.eventId);
                if (!event) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                const isOrganizer = event.organizers.some((id) => id.toString() === req.user.id);
                if (!isOrganizer) {
                    return res.status(403).json({ message: 'Seul un organisateur peut créer un sondage' });
                }
                const poll = new this.Poll({ ...req.body, event: req.params.eventId, createdBy: req.user.id });
                const saved = await poll.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.post('/polls/:pollId/responses', auth, async (req, res) => {
            try {
                const poll = await this.Poll.findById(req.params.pollId);
                if (!poll) {
                    return res.status(404).json({ message: 'Sondage introuvable' });
                }
                const response = new this.PollResponse({
                    poll: req.params.pollId,
                    participant: req.user.id,
                    answers: req.body.answers
                });
                const saved = await response.save();
                res.status(201).json(saved);
            } catch (error) {
                if (error.code === 11000) {
                    return res.status(409).json({ message: 'Tu as déjà répondu à ce sondage' });
                }
                res.status(400).json({ message: error.message });
            }
        });
    }
}
