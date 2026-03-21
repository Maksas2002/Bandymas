import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pool from './db.js';
import jwt from 'jsonwebtoken'; // Būtina įrašyti: npm install jsonwebtoken

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tavo_labai_slaptas_raktas';

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- PAGALBINĖ FUNKCIJA: Autentifikacijos patikra ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Reikalingas prisijungimas" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Sesija pasibaigė" });
        req.user = user;
        next();
    });
};

// --- FR1: Autentifikacija ---

// 1. REGISTRACIJA
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role',
            [username, email, password]
        );
        
        const user = newUser.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
        
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: "Vartotojas jau egzistuoja." });
    }
});

// 2. PRISIJUNGIMAS (Sutvarkytas su JWT)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Sukuriamas tokenas, kurio tikisi tavo Frontend
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
            
            // Pašalinam slaptažodį saugumui prieš siunčiant
            delete user.password;
            res.json({ token, user });
        } else {
            res.status(401).json({ error: "Neteisingi prisijungimo duomenys." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. /api/auth/me (ŠIO MARŠRUTO TRŪKO!)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Vartotojas nerastas" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TRANSAKCIJŲ VALDYMAS ---

app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, c.name as category_name 
             FROM transactions t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = $1 ORDER BY t.date DESC`, 
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Nepavyko užkrauti duomenų" });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { category_id, description, amount, date } = req.body;
    try {
        const newItem = await pool.query(
            'INSERT INTO transactions (user_id, category_id, description, amount, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, category_id || null, description, amount, date || new Date()]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Nepavyko pridėti įrašo" });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: "Ištrinta sėkmingai" });
    } catch (err) {
        res.status(500).json({ error: "Nepavyko ištrinti" });
    }
});

// --- KATEGORIJŲ VALDYMAS ---

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Tik adminams" });
    const { name, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
            [name, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Kategorija jau egzistuoja." });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Tik adminams" });
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
        res.json({ message: "Kategorija pašalinta" });
    } catch (err) {
        res.status(500).json({ error: "Klaida trinant" });
    }
});

app.listen(PORT, () => console.log(`🚀 Serveris veikia ant porto ${PORT}`));