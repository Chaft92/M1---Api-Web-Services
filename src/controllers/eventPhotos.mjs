import EventPhotoModel from '../models/eventPhoto.mjs';
import EventAlbumModel from '../models/eventAlbum.mjs';
import auth from '../middlewares/auth.mjs';

export default class EventPhotos {
    constructor(app, connect) {
        this.app = app;
        this.EventPhoto = EventPhotoModel(connect);
        this.EventAlbum = EventAlbumModel(connect);
        this.run();
    }

    run() {
        this.app.get('/albums/:albumId/photos', async (req, res) => {
            try {
                const photos = await this.EventPhoto.find({ album: req.params.albumId });
                res.status(200).json(photos);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/albums/:albumId/photos', auth, async (req, res) => {
            try {
                const album = await this.EventAlbum.findById(req.params.albumId);
                if (!album) {
                    return res.status(404).json({ message: 'Album introuvable' });
                }
                const photo = new this.EventPhoto({ ...req.body, album: req.params.albumId, postedBy: req.user.id });
                const saved = await photo.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.post('/photos/:photoId/comments', auth, async (req, res) => {
            try {
                const photo = await this.EventPhoto.findById(req.params.photoId);
                if (!photo) {
                    return res.status(404).json({ message: 'Photo introuvable' });
                }
                photo.comments.push({ author: req.user.id, text: req.body.text });
                const saved = await photo.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
