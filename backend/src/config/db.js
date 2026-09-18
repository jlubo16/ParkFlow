// backend/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpark'
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

pool.query('SELECT 1')
    .then(() => {
        console.log('Conectado a la base de datos PostgreSQL');
    })
    .catch((err) => {
        console.error('Error al conectar a PostgreSQL:', err.message);
        console.error('Verifica:');
        console.error('   - Host:', process.env.DB_HOST || 'localhost');
        console.error('   - Puerto:', process.env.DB_PORT || 5432);
        console.error('   - Usuario:', process.env.DB_USER || 'postgres');
        console.error('   - Base de datos:', process.env.DB_NAME || 'smartpark');
    });

module.exports = pool;
