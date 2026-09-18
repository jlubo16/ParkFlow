# 🅿️ SmartPark

Sistema de gestión de parqueaderos: backend en Node.js + MySQL y app móvil en React Native (Expo).

Permite registrar la entrada y salida de vehículos, calcular automáticamente el monto a pagar según tarifas configurables, gestionar empleados, consultar historial y generar reportes de ingresos.

## ✨ Funcionalidades

- **Autenticación** con JWT (login por correo y contraseña, roles admin/empleado)
- **Registro de entrada y salida** de vehículos, con cálculo automático de tiempo estacionado y tarifa
- **Gestión de empleados** (crear, actualizar, desactivar) — solo administrador
- **Configuración de tarifas** por tipo de vehículo, con historial de cambios
- **Reportes de ingresos** por rango de fechas (total, promedio diario, desglose por tipo de vehículo, mejor día)
- **Historial** general y por placa de vehículo

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, MySQL2, JWT, bcrypt
- **Mobile:** React Native, Expo, Axios
- **BD:** MySQL (vía XAMPP, puerto 3307)
- **Testing:** Jest

## ⚙️ Requisitos

- Node.js v18+
- XAMPP con MySQL corriendo en el puerto **3307**
- Expo Go instalado en el celular (para probar la app móvil)

## 🚀 Instalación

```bash
# Opción 1: script automático
node start.js

# Opción 2: manual
cd backend && npm install
cd ../mobile-app && npm install
```

## 🔧 Configuración

### Backend

Crea un archivo `.env` dentro de `backend/` con:

```env
DB_HOST=localhost
JWT_SECRET=tu_clave_secreta_aqui
PORT=3000
```

Asegúrate de tener la base de datos `smartpark` creada en MySQL/XAMPP importando `database/schema.sql`.

### App móvil

En `mobile-app/src/services/api.js`, cambia la IP por la de tu propia red local (la de tu computador donde corre el backend):

```js
const API_URL = 'http://TU_IP_LOCAL:3000/api';
```

> El celular y el computador deben estar en la misma red Wi-Fi para que la app pueda conectarse al backend.

## ▶️ Ejecución

```bash
# Backend
cd backend
npm start          # o: npx nodemon server.js

# App móvil (en otra terminal)
cd mobile-app
npx expo start
```

El backend queda disponible en `http://localhost:3000`, con un endpoint de salud en `/api/health`.

## 🧪 Pruebas

El backend cuenta con pruebas unitarias hechas con Jest (mockeando la capa de base de datos):

```bash
cd backend
npm test
```

## 📁 Estructura del proyecto

```
├── backend
│   └── src
│       ├── config        # Conexión a MySQL
│       ├── controllers   # Lógica de negocio
│       ├── middleware    # Autenticación y validaciones
│       └── routes        # Endpoints de la API
├── database
│   └── schema.sql        # Esquema de la base de datos
└── mobile-app
    └── src
        ├── contexts      # Contexto de autenticación
        ├── screens       # Pantallas de la app
        └── services      # Cliente HTTP (Axios)
```

## 👤 Roles

| Rol | Permisos |
|---|---|
| **Admin** | Todo lo anterior + gestionar empleados, tarifas y reportes |
| **Empleado** | Registrar entrada/salida de vehículos, consultar historial |
