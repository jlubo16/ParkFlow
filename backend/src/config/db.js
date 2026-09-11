// backend/src/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: 3307,  // <-- Puerto de XAMPP
    user: 'root',
    password: '',
    database: 'smartpark',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Probar conexión
promisePool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('Error al conectar a MySQL:', err.message);
        console.error('Verifica:');
        console.error('   - Puerto: 3307');
        console.error('   - Usuario: root');
        console.error('   - Contraseña: (vacío)');
        console.error('   - Base de datos: smartpark');
    });

module.exports = promisePool;