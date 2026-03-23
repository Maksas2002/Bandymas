import express from 'express';
import cors from 'cors';
import sql from './db.js';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// REGISTRACIJA
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [user] = await sql`
            INSERT INTO users (username, email, password) 
            VALUES (${username}, ${email}, ${password}) 
            RETURNING id, username, email, role`;
        res.status(201).json(user);
    } catch (e) {
        console.error("Registracijos klaida:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// PRISIJUNGIMAS
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (user && user.password === password) {
            const { password, ...safeUser } = user;
            res.json(safeUser);
        } else {
            res.status(401).json({ error: "Neteisingi duomenys" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// KATEGORIJOS
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await sql`SELECT * FROM categories`;
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log('🚀 Serveris veikia ant prievado 3000'));