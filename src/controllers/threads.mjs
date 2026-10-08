import ThreadModel from '../models/thread.mjs';
import MessageModel from '../models/message.mjs';
import auth from '../middlewares/auth.mjs';

export default class Threads {
    constructor(app, connect) {
        this.app = app;
        this.Thread = ThreadModel(connect);
        this.Message = MessageModel(connect);
        this.run();
    }

    run() {
        this.app.get('/threads', async (req, res) => {
            try {
                const { group, event } = req.query;
                const filter = {};
                if (group) filter.group = group;
                if (event) filter.event = event;
                const threads = await this.Thread.find(filter);
                res.status(200).json(threads);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/threads/:id', async (req, res) => {
            try {
                const thread = await this.Thread.findById(req.params.id);
                if (!thread) {
                    return res.status(404).json({ message: 'Fil de discussion introuvable' });
                }
                res.status(200).json(thread);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/threads', auth, async (req, res) => {
            try {
                const thread = new this.Thread(req.body);
                const saved = await thread.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.delete('/threads/:id', auth, async (req, res) => {
            try {
                const deleted = await this.Thread.findByIdAndDelete(req.params.id);
                if (!deleted) {
                    return res.status(404).json({ message: 'Fil de discussion introuvable' });
                }
                res.status(200).json({ message: 'Fil de discussion supprimé' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.get('/threads/:threadId/messages', async (req, res) => {
            try {
                const messages = await this.Message.find({ thread: req.params.threadId });
                res.status(200).json(messages);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/threads/:threadId/messages', auth, async (req, res) => {
            try {
                const thread = await this.Thread.findById(req.params.threadId);
                if (!thread) {
                    return res.status(404).json({ message: 'Fil de discussion introuvable' });
                }
                const message = new this.Message({ ...req.body, thread: req.params.threadId, author: req.user.id });
                const saved = await message.save();
                res.status(201).json(saved);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
