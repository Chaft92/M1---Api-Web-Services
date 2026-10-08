import AlbumModel from '../models/album.mjs';
import auth from '../middlewares/auth.mjs';

export default class Albums {
    constructor(app, connect) {
        this.app = app;
        this.Album = AlbumModel(connect);
        this.run();
    }

    run() {
        this.app.get('/albums', async (req, res) => {
            try {
                const { title } = req.query;
                let filter = {};
                if (title) {
                    filter.title = { $regex: title, $options: 'i' };
                }
                const albums = await this.Album.find(filter).populate('photos');
                res.status(200).json(albums);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/album/:id', async (req, res) => {
            try {
                const album = await this.Album.findById(req.params.id).populate('photos');
                if (!album) {
                    return res.status(404).json({ message: "Album introuvable" });
                }
                res.status(200).json(album);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/album', auth, async (req, res) => {
            try {
                const newAlbum = new this.Album(req.body);
                const savedAlbum = await newAlbum.save();
                res.status(201).json(savedAlbum);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.put('/album/:id', auth, async (req, res) => {
            try {
                const updatedAlbum = await this.Album.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true, runValidators: true }
                );
                if (!updatedAlbum) {
                    return res.status(404).json({ message: "Album introuvable" });
                }
                res.status(200).json(updatedAlbum);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.delete('/album/:id', auth, async (req, res) => {
            try {
                const deletedAlbum = await this.Album.findByIdAndDelete(req.params.id);
                if (!deletedAlbum) {
                    return res.status(404).json({ message: "Album introuvable" });
                }
                res.status(200).json({ message: "Album supprimé avec succès" });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
