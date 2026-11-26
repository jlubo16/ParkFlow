const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor SmartPark corriendo en http://localhost:${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
});