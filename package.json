// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log('✅ Conectado a Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en pool de DB:', err.message);
});

module.exports = pool;
