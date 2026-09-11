# 🅿️ SmartPark

Sistema de gestión de parqueaderos: backend Node.js + MySQL y app móvil en React Native (Expo).

## 🛠️ Tecnologías
- **Backend:** Node.js, Express, MySQL2, JWT, bcrypt
- **Mobile:** React Native, Expo, Axios
- **BD:** MySQL (XAMPP, puerto 3307)

## ⚙️ Requisitos
- Node.js v18+
- XAMPP con MySQL en puerto **3307**
- Expo Go (para el celular)

## 🚀 Instalación

```bash
# 1. Instalar dependencias
node start.js
# o manual:
cd backend && npm install
cd ../mobile-app && npm install
bash
# 2. Importar base de datos (desde phpMyAdmin o consola)
mysql -u root -P 3307 < database/schema.sql
bash
# 3. Crear backend/.env
PORT=3000
JWT_SECRET=tu_clave_secreta
js
// 4. Ajustar IP en mobile-app/src/services/api.js
const API_URL = 'http://TU_IP_LOCAL:3000/api';
▶️ Ejecutar
bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - App
cd mobile-app && npx expo start -c
🔑 Credenciales de Prueba
Rol	Correo	Contraseña
Admin	admin@smartpark.com	admin123
Empleado	empleado@smartpark.com	empleado123
📱 Funcionalidades
Login con JWT

Dashboard con mapa de espacios

Registrar entrada / salida (cálculo automático de tarifa)

Historial con filtros

Reportes de ingresos (admin)

Configurar tarifas (admin)

Gestionar empleados (admin)

🧮 Tarifas
🚗 Carro: $5.000/hora

🛵 Moto: $3.000/hora

🐛 Problemas Comunes
Error MySQL: verifica XAMPP en puerto 3307

App no conecta: revisa la IP en api.js

Token inválido: vuelve a iniciar sesión (expira en 8h)

📄 Licencia