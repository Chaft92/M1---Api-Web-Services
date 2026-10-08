import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';
import auth from '../middlewares/auth.mjs';

export default class Photos {
    constructor(app, connect) {
        this.app = app;
        this.Photo = PhotoModel(connect);
        this.Album = AlbumModel(connect);
        this.run();
    }

    run() {
        this.app.get('/album/:idalbum/photos', async (req, res) => {
            try {
                const photos = await this.Photo.find({ album: req.params.idalbum }).populate('album');
                res.status(200).json(photos);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/album/:idalbum/photo/:idphoto', async (req, res) => {
            try {
                const photo = await this.Photo.findOne({ _id: req.params.idphoto, album: req.params.idalbum }).populate('album');
                if (!photo) {
                    return res.status(404).json({ message: "Photo introuvable dans cet album" });
                }
                res.status(200).json(photo);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/album/:idalbum/photo', auth, async (req, res) => {
            try {
                const { idalbum } = req.params;
                const albumExists = await this.Album.findById(idalbum);
                if (!albumExists) {
                    return res.status(404).json({ message: "Album introuvable" });
                }

                const newPhoto = new this.Photo({ ...req.body, album: idalbum });
                const savedPhoto = await newPhoto.save();

                await this.Album.findByIdAndUpdate(idalbum, { $push: { photos: savedPhoto._id } });

                res.status(201).json(savedPhoto);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.put('/album/:idalbum/photo/:idphoto', auth, async (req, res) => {
            try {
                const updatedPhoto = await this.Photo.findOneAndUpdate(
                    { _id: req.params.idphoto, album: req.params.idalbum },
                    req.body,
                    { new: true, runValidators: true }
                );
                if (!updatedPhoto) {
                    return res.status(404).json({ message: "Photo introuvable" });
                }
                res.status(200).json(updatedPhoto);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.delete('/album/:idalbum/photo/:idphoto', auth, async (req, res) => {
            try {
                const { idalbum, idphoto } = req.params;
                const deletedPhoto = await this.Photo.findOneAndDelete({ _id: idphoto, album: idalbum });
                if (!deletedPhoto) {
                    return res.status(404).json({ message: "Photo introuvable" });
                }

                await this.Album.findByIdAndUpdate(idalbum, { $pull: { photos: idphoto } });

                res.status(200).json({ message: "Photo supprimée avec succès" });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
