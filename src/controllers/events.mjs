import EventModel from '../models/event.mjs';
import auth from '../middlewares/auth.mjs';

export default class Events {
    constructor(app, connect) {
        this.app = app;
        this.Event = EventModel(connect);
        this.run();
    }

    run() {
        this.app.get('/events', async (req, res) => {
            try {
                const events = await this.Event.find();
                res.status(200).json(events);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/events/:id', async (req, res) => {
            try {
                const event = await this.Event.findById(req.params.id);
                if (!event) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                res.status(200).json(event);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/events', auth, async (req, res) => {
            try {
                const event = new this.Event(req.body);
                const saved = await event.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.put('/events/:id', auth, async (req, res) => {
            try {
                const updated = await this.Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
                if (!updated) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                res.status(200).json(updated);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.delete('/events/:id', auth, async (req, res) => {
            try {
                const deleted = await this.Event.findByIdAndDelete(req.params.id);
                if (!deleted) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                res.status(200).json({ message: 'Événement supprimé' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
