# 🅿️ SmartPark

Sistema de gestión de parqueaderos: backend en Node.js + PostgreSQL y app móvil en React Native (Expo).

Permite registrar la entrada y salida de vehículos, calcular automáticamente el monto a pagar según tarifas configurables, gestionar empleados, consultar historial y generar reportes de ingresos.

## ✨ Funcionalidades

- **Autenticación** con JWT (login por correo y contraseña, roles admin/empleado)
- **Registro de entrada y salida** de vehículos, con cálculo automático de tiempo estacionado y tarifa
- **Gestión de empleados** (crear, actualizar, desactivar) — solo administrador
- **Configuración de tarifas** por tipo de vehículo, con historial de cambios
- **Reportes de ingresos** por rango de fechas (total, promedio diario, desglose por tipo de vehículo, mejor día)
- **Historial** general y por placa de vehículo

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt
- **Mobile:** React Native, Expo, Axios
- **BD:** PostgreSQL
- **Testing:** Jest

## ⚙️ Requisitos

- Node.js v18+ (para ejecutar el proyecto sin Docker)
- Docker Engine y Docker Compose (para desplegar el backend y PostgreSQL con contenedores)
- Expo Go instalado en el celular (para probar la app móvil)

## 🚀 Despliegue con Docker

Desde la raíz del repositorio, crea el archivo de variables y reemplaza los valores de ejemplo:

```bash
cp .env.example .env
```

Usa una contraseña segura para `DB_PASSWORD` y una clave aleatoria larga para `JWT_SECRET`. `APP_PORT` es el puerto público asignado en el servidor.

Luego construye e inicia la API y PostgreSQL:

```bash
docker compose --env-file .env up -d --build
```

La primera vez, PostgreSQL crea las tablas y los datos iniciales desde `database/schema.sql`. Los datos persisten en el volumen `postgres_data`. Para revisar el estado y los registros:

```bash
docker compose ps
docker compose logs -f backend
```

La API estará disponible en `http://SERVIDOR:APP_PORT/api`. No se publica el puerto de PostgreSQL al exterior. Conserva el `.env` solo en el servidor; nunca lo subas al repositorio.

## 📱 App móvil

La app Expo se ejecuta o compila aparte; no es un servicio web para incluir en Docker Compose. Copia `mobile-app/.env.example` a `mobile-app/.env` y configura `EXPO_PUBLIC_API_URL` con una dirección que el teléfono pueda alcanzar, por ejemplo `http://IP_O_DOMINIO_DEL_SERVIDOR:3000/api`. La URL se incorpora al iniciar/compilar la app, así que reinicia Expo o vuelve a generar la compilación después de cambiarla.

Para desarrollo, instala sus dependencias y arranca Expo:

```bash
cd mobile-app
npm ci
npx expo start
```

## 🧰 Ejecución local del backend sin Docker

Configura una instancia PostgreSQL y las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `JWT_SECRET` en `backend/.env`. Crea la base de datos e importa `database/schema.sql`. Después:

```bash
cd backend
npm ci
npm start
```

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
│       ├── config        # Conexión a PostgreSQL
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
