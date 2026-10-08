import GroupModel from '../models/group.mjs';
import auth from '../middlewares/auth.mjs';

export default class Groups {
    constructor(app, connect) {
        this.app = app;
        this.Group = GroupModel(connect);
        this.run();
    }

    run() {
        this.app.get('/groups', async (req, res) => {
            try {
                const groups = await this.Group.find();
                res.status(200).json(groups);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/groups/:id', async (req, res) => {
            try {
                const group = await this.Group.findById(req.params.id);
                if (!group) {
                    return res.status(404).json({ message: 'Groupe introuvable' });
                }
                res.status(200).json(group);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/groups', auth, async (req, res) => {
            try {
                const group = new this.Group(req.body);
                const saved = await group.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.put('/groups/:id', auth, async (req, res) => {
            try {
                const updated = await this.Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
                if (!updated) {
                    return res.status(404).json({ message: 'Groupe introuvable' });
                }
                res.status(200).json(updated);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.delete('/groups/:id', auth, async (req, res) => {
            try {
                const deleted = await this.Group.findByIdAndDelete(req.params.id);
                if (!deleted) {
                    return res.status(404).json({ message: 'Groupe introuvable' });
                }
                res.status(200).json({ message: 'Groupe supprimé' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
