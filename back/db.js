import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'budgetnest',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

console.log('✅ SQL ryšys paruoštas (postgres.js)');

export default sql;