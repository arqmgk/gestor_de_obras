
import dotenv from 'dotenv'
dotenv.config()

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});


pool.on('error', (err) => {
  console.error('Pool error:', err);
});

// Test de conexión al arrancar
pool.query('SELECT 1').then(() => {
  console.log('✅ DB conectada');
}).catch(err => {
  console.error('❌ DB error:', err.message);
});
export default pool;
