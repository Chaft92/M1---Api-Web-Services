import validator from 'validator';
import bcrypt from 'bcryptjs';

import UserSchema from '../models/user.mjs';
import auth from '../middlewares/auth.mjs';

const Users = class Users {
    constructor(app, connect){
        this.app = app;
        this.connect = connect;
        this.User = connect.model('User', UserSchema);

        this.run();
    }

    validateUser({ firstname, lastname, age, email, password }, partial = false) {
        const errors = [];

        if (email !== undefined || !partial) {
            if (typeof email !== 'string' || !validator.isEmail(email)) {
                errors.push('email : adresse email invalide');
            }
        }
        if (firstname !== undefined || !partial) {
            if (typeof firstname !== 'string' || !validator.isAlpha(firstname, 'fr-FR') || !validator.isLength(firstname, { min: 2, max: 50 })) {
                errors.push('firstname : lettres uniquement, entre 2 et 50 caractères');
            }
        }
        if (lastname !== undefined || !partial) {
            if (typeof lastname !== 'string' || !validator.isAlpha(lastname, 'fr-FR') || !validator.isLength(lastname, { min: 2, max: 50 })) {
                errors.push('lastname : lettres uniquement, entre 2 et 50 caractères');
            }
        }
        if (age !== undefined || !partial) {
            if (!validator.isInt(String(age), { min: 0, max: 150 })) {
                errors.push('age : entier entre 0 et 150');
            }
        }
        if (password !== undefined || !partial) {
            if (typeof password !== 'string' || !validator.isLength(password, { min: 8 })) {
                errors.push('password : 8 caractères minimum');
            }
        }
        return errors;
    }

    getUserById(){
        this.app.get('/users/:id', async (req, res) => {
            try {
                const user = await this.User.findById(req.params.id).select('-password');
                if (!user) {
                    return res.status(404).json({ code: 404, message: 'User not found' });
                }
                res.status(200).json(user);
            } catch (err) {
                res.status(500).json({ code: 500, message: 'Internal Server Error' });
            }
        })
    }

    getUsers(){
        this.app.get('/users', async (req, res) => {
            try {
                const users = await this.User.find().select('-password');
                res.status(200).json(users);
            } catch {
                res.status(500).json({
                    code:500,
                    message: 'Internal Server Error',
                });
            }
        })
    }

    createUser(){
        this.app.post('/users', async (req, res) => {
            try {
                const errors = this.validateUser(req.body);
                if (errors.length) {
                    return res.status(400).json({ code: 400, message: errors.join(', ') });
                }
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const user = await this.User.create({ ...req.body, password: hashedPassword });
                const { password, ...safeUser } = user.toObject();
                res.status(201).json(safeUser);
            } catch (err) {
                res.status(400).json({ code: 400, message: err.message });
            }
        })
    }

    updateUser(){
        this.app.put('/users/:id', auth, async (req, res) => {
            try {
                const errors = this.validateUser(req.body);
                if (errors.length) {
                    return res.status(400).json({ code: 400, message: errors.join(', ') });
                }
                const body = { ...req.body, password: await bcrypt.hash(req.body.password, 10) };
                const user = await this.User.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).select('-password');
                if (!user) {
                    return res.status(404).json({ code: 404, message: 'User pas trouvé' });
                }
                res.status(200).json(user);
            } catch (err) {
                res.status(400).json({ code: 400, message: err.message });
            }
        })
    }

    patchUser(){
        this.app.patch('/users/:id', auth, async (req, res) => {
            try {
                const errors = this.validateUser(req.body, true);
                if (errors.length) {
                    return res.status(400).json({ code: 400, message: errors.join(', ') });
                }
                const body = { ...req.body };
                if (body.password !== undefined) {
                    body.password = await bcrypt.hash(body.password, 10);
                }
                const user = await this.User.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).select('-password');
                if (!user) {
                    return res.status(404).json({ code: 404, message: 'User not found' });
                }
                res.status(200).json(user);
            } catch (err) {
                res.status(400).json({ code: 400, message: err.message });
            }
        })
    }

    deleteUser(){
        this.app.delete('/users/:id', auth, async (req, res) => {
            try {
                const user = await this.User.findByIdAndDelete(req.params.id);
                if (!user) {
                    return res.status(404).json({ code: 404, message: 'User not found' });
                }
                res.status(204).send();
            } catch (err) {
                res.status(500).json({ code: 500, message: 'Internal Server Error' });
            }
        })
    }

    run(){
        this.getUserById();
        this.getUsers();
        this.createUser();
        this.updateUser();
        this.patchUser();
        this.deleteUser();
    }
}

export default Users;
