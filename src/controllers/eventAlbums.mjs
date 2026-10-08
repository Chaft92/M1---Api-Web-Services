import EventAlbumModel from '../models/eventAlbum.mjs';
import EventModel from '../models/event.mjs';
import auth from '../middlewares/auth.mjs';

export default class EventAlbums {
    constructor(app, connect) {
        this.app = app;
        this.EventAlbum = EventAlbumModel(connect);
        this.Event = EventModel(connect);
        this.run();
    }

    run() {
        this.app.get('/events/:eventId/albums', async (req, res) => {
            try {
                const albums = await this.EventAlbum.find({ event: req.params.eventId });
                res.status(200).json(albums);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/events/:eventId/albums', auth, async (req, res) => {
            try {
                const event = await this.Event.findById(req.params.eventId);
                if (!event) {
                    return res.status(404).json({ message: 'Événement introuvable' });
                }
                const album = new this.EventAlbum({ ...req.body, event: req.params.eventId });
                const saved = await album.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
