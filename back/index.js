import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- FR1: Autentifikacija ---

// Registracija
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role',
            [username, email, password]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        res.status(400).json({ error: "Vartotojas su šiuo el. paštu jau egzistuoja." });
    }
});

// Prisijungimas
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            res.status(401).json({ error: "Neteisingi prisijungimo duomenys." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FR2, FR3 & FR4: Transakcijų valdymas ---

// GAUTI visas vartotojo transakcijas (su kategorijų pavadinimais)
app.get('/api/transactions/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT t.*, c.name as category_name 
             FROM transactions t 
             LEFT JOIN categories c ON t.category_id = c.id 
             WHERE t.user_id = $1 ORDER BY t.date DESC`, 
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Nepavyko užkrauti duomenų" });
    }
});

// PRIDĖTI naują transakciją
app.post('/api/transactions', async (req, res) => {
    const { user_id, category_id, title, amount, type, date } = req.body;
    try {
        const newItem = await pool.query(
            'INSERT INTO transactions (user_id, category_id, title, amount, type, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, category_id || null, title, amount, type, date || new Date()]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Nepavyko pridėti įrašo" });
    }
});

// ŠALINTI transakciją
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: "Ištrinta sėkmingai" });
    } catch (err) {
        res.status(500).json({ error: "Nepavyko ištrinti" });
    }
});

// --- FR0: Kategorijų valdymas (Adminui ir Formoms) ---

// GAUTI visas kategorijas
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PRIDĖTI naują kategoriją (Admin funkcija)
app.post('/api/categories', async (req, res) => {
    const { name, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
            [name, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Kategorija jau egzistuoja arba įvyko klaida." });
    }
});

// ŠALINTI kategoriją (Admin funkcija)
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: "Kategorija pašalinta" });
    } catch (err) {
        res.status(500).json({ error: "Nepavyko ištrinti kategorijos (galbūt ji naudojama?)" });
    }
});

// GAUTI vartotojo biudžetus su apskaičiuotomis išlaidomis
app.get('/api/budgets/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT b.*, c.name, 
            (SELECT COALESCE(SUM(amount), 0) FROM transactions 
             WHERE user_id = $1 AND category_id = b.category_id 
             AND type = 'expense' AND date >= date_trunc('month', now())) as spent
            FROM budgets b
            JOIN categories c ON b.category_id = c.id
            WHERE b.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NAUJINTI arba SUKURTI biudžeto limitą
app.post('/api/budgets', async (req, res) => {
    const { user_id, category_id, limit_amount } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO budgets (user_id, category_id, limit_amount)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, category_id) 
             DO UPDATE SET limit_amount = EXCLUDED.limit_amount
             RETURNING *`,
            [user_id, category_id, limit_amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Serveris veikia ant porto ${PORT}`));