import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  // SVARBU: Docker konteineryje host turi būti DB serviso pavadinimas (pvz. 'db')
  host: process.env.DB_HOST || 'db', 
  database: process.env.DB_NAME || 'budget_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Patikriname prisijungimą paleidžiant
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB PRISIJUNGIMO KLAIDA:', err.message);
  } else {
    console.log('✅ DB PRIJUNGTA SĖKMINGAI');
  }
});

export default pool;