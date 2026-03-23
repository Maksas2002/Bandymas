import express from 'express';
import cors from 'cors';
import sql from './db.js';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

// REGISTRACIJA - sutvarkyta pagal tavo formą
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Įrašome vartotoją. Svarbu: init.sql turi turėti email stulpelį!
        const [newUser] = await sql`
            INSERT INTO users (username, email, password, role) 
            VALUES (${username}, ${email}, ${password}, 'user') 
            RETURNING id, username, email, role
        `;
        
        console.log('✅ Naujas vartotojas:', newUser.username);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('❌ DB Klaida:', err.message);
        // Jei vartotojas jau egzistuoja
        if (err.message.includes('unique')) {
            return res.status(400).json({ error: "Vartotojas jau egzistuoja" });
        }
        res.status(500).json({ error: "Serverio klaida rašant į DB" });
    }
});

// PRISIJUNGIMAS
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (user && user.password === password) {
            delete user.password;
            res.json(user);
        } else {
            res.status(401).json({ error: "Neteisingi duomenys" });
        }
    } catch (err) {
        res.status(500).json({ error: "Serverio klaida" });
    }
});

// KATEGORIJOS (Ištaiso 404 tavo pradiniame lange)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await sql`SELECT * FROM categories ORDER BY id ASC`;
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Nepavyko gauti kategorijų" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveris paruoštas ant http://localhost:${PORT}`));