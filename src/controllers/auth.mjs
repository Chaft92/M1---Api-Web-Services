import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import UserSchema from '../models/user.mjs';

const Auth = class Auth {
    constructor(app, connect) {
        this.app = app;
        this.connect = connect;
        this.User = connect.model('User', UserSchema);

        this.run();
    }

    login() {
        this.app.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ code: 400, message: 'email et password sont obligatoires' });
                }

                const user = await this.User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    return res.status(401).json({ code: 401, message: 'Identifiants invalides' });
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.status(401).json({ code: 401, message: 'Identifiants invalides' });
                }

                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({ token });
            } catch (err) {
                res.status(500).json({ code: 500, message: 'Internal Server Error' });
            }
        });
    }

    run() {
        this.login();
    }
}

export default Auth;
