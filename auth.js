import express from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'secret-de-test-local-a-ne-pas-utiliser-en-production';
const PORT = 3000;

// Identifiants de test en dur, uniquement pour cet essai local.
const USER = { username: 'admin', password: 'admin123' };

const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USER.username && password === USER.password) {
        const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    }

    res.status(401).json({ error: 'Identifiants invalides' });
});

app.get('/protected', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        res.status(200).json({ message: 'Acces autorise', user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Token invalide ou expire' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur auth de test demarre sur http://localhost:${PORT}`);
});
