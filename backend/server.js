//PUNTO DE ENTRADA DEL BACKEND
const app = require('./src/app'); // 1. Importa la app de Express ya configurada.

// Carga las variables de entorno (PORT, JWT_SECRET, etc.).
require('dotenv').config();

const PORT = process.env.PORT || 3000; //Si no existe, usa 3000 como fallback.

//pone al servidor a escuchar en ese puerto.
app.listen(PORT, () => {
    console.log(`Servidor SmartPark corriendo en http://localhost:${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
});