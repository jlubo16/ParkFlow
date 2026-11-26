# 🅿️ SmartPark

Sistema de gestión de parqueaderos desarrollado con Node.js, PostgreSQL y React Native (Expo).

La aplicación permite registrar entradas y salidas de vehículos, calcular el valor del estacionamiento según las tarifas configuradas, administrar empleados, consultar el historial de vehículos y generar reportes de ingresos.

## ✨ Funcionalidades

- **Autenticación:** inicio de sesión mediante correo electrónico y contraseña, con autenticación JWT y roles de administrador y empleado.
- **Registro de vehículos:** gestión de entradas y salidas, con cálculo automático del tiempo de estacionamiento y del valor a pagar.
- **Gestión de empleados:** creación, actualización y desactivación de empleados, disponible para el administrador.
- **Configuración de tarifas:** administración de tarifas por tipo de vehículo y registro del historial de cambios.
- **Reportes de ingresos:** consulta por rango de fechas, con totales, promedio diario, desglose por tipo de vehículo y mejor día de ingresos.
- **Historial:** consulta general de movimientos y búsqueda por placa del vehículo.

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT y bcrypt.
- **Aplicación móvil:** React Native, Expo y Axios.
- **Base de datos:** PostgreSQL.
- **Pruebas:** Jest.
- **Contenedores:** Docker y Docker Compose.
- **Integración continua:** GitHub Actions.

## ⚙️ Requisitos

- Node.js v18 o superior.
- npm.
- PostgreSQL, si se ejecuta el backend sin Docker.
- Docker Engine y Docker Compose, si se ejecuta el entorno mediante contenedores.
- Expo Go para probar la aplicación móvil en un dispositivo compatible.

## 🚀 Despliegue con Docker

Desde la raíz del repositorio, crea el archivo `.env` a partir del archivo de ejemplo:

```bash
cp .env.example .env
```

Configura las variables de entorno necesarias, incluyendo `DB_PASSWORD`, `JWT_SECRET` y `APP_PORT`. Utiliza credenciales seguras y una clave JWT suficientemente larga y aleatoria.

Construye e inicia los servicios:

```bash
docker compose --env-file .env up -d --build
```

Durante la inicialización, PostgreSQL utiliza `database/schema.sql` para crear las tablas y los datos iniciales definidos en el esquema. Los datos se conservan en el volumen `postgres_data`.

Para consultar el estado de los servicios y los registros del backend:

```bash
docker compose ps
docker compose logs -f backend
```

La API estará disponible en:

```text
http://SERVIDOR:APP_PORT/api
```

El puerto de PostgreSQL no se publica directamente al exterior. El archivo `.env` debe mantenerse fuera del repositorio y no debe incluirse en los commits.

## 📱 Aplicación móvil

La aplicación móvil se ejecuta de manera independiente del backend y de los contenedores de Docker Compose.

Copia el archivo de ejemplo de variables de entorno:

```bash
cd mobile-app
```

Crea `mobile-app/.env` a partir de `mobile-app/.env.example` y configura `EXPO_PUBLIC_API_URL` con la dirección de la API accesible desde el dispositivo móvil. Por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://IP_O_DOMINIO_DEL_SERVIDOR:3000/api
```

Instala las dependencias e inicia Expo:

```bash
npm ci
npx expo start
```

La dirección configurada debe ser accesible desde el dispositivo en el que se ejecuta la aplicación. Después de modificar las variables de entorno, reinicia Expo o genera nuevamente la compilación cuando corresponda.

## 🧰 Ejecución local del backend sin Docker

Para ejecutar el backend localmente, se necesita una instancia de PostgreSQL disponible.

Configura las siguientes variables de entorno en `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartpark
DB_USER=usuario
DB_PASSWORD=contraseña
JWT_SECRET=clave_secreta_segura
```

Los valores son ejemplos y deben sustituirse por los correspondientes al entorno local.

Crea la base de datos e importa el esquema ubicado en `database/schema.sql`. Después, instala las dependencias e inicia el backend:

```bash
cd backend
npm ci
npm start
```

El backend quedará disponible en `http://localhost:3000`, siempre que el puerto configurado sea el predeterminado y esté disponible.

El endpoint de salud de la API es:

```text
/api/health
```

## ▶️ Ejecución del proyecto

Para ejecutar el backend y la aplicación móvil durante el desarrollo, inicia cada servicio en una terminal independiente.

**Backend:**

```bash
cd backend
npm start
```

**Aplicación móvil:**

```bash
cd mobile-app
npx expo start
```

Asegúrate de que la aplicación móvil tenga configurada la URL correcta del backend.

## 🧪 Pruebas

El backend cuenta con pruebas automatizadas desarrolladas con Jest. Las pruebas unitarias verifican el comportamiento de los controladores y utilizan mocks para aislar la lógica de la base de datos y otras dependencias.

Para ejecutar las pruebas:

```bash
cd backend
npm test
```

## 🔄 Integración continua

El workflow `.github/workflows/ci.yml` instala las dependencias y ejecuta las pruebas del backend automáticamente en cada push a las ramas `dev` y `main`, así como en los pull requests dirigidos a estas ramas.

En los pull requests hacia `dev` o `main`, GitHub Actions ejecuta las pruebas del backend; esos eventos no despliegan al VPS. Cuando un cambio se fusiona en `dev`, las pruebas se ejecutan primero y, si pasan, Actions actualiza y reconstruye el backend en el VPS. Los cambios en `main` ejecutan las pruebas, pero no despliegan. La aplicación móvil no forma parte de este despliegue.

Las credenciales y demás variables de entorno se gestionan fuera del repositorio para evitar la exposición de información sensible.

## 📁 Estructura del proyecto

```text
SmartPark/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración y conexión a PostgreSQL
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Autenticación y validaciones
│   │   └── routes/          # Rutas y endpoints de la API
│   ├── tests/
│   │   ├── helpers/         # Utilidades para las pruebas
│   │   └── unit/            # Pruebas unitarias
│   └── package.json
├── database/
│   └── schema.sql           # Esquema de la base de datos
├── mobile-app/
│   ├── src/
│   │   ├── contexts/        # Contextos de la aplicación
│   │   ├── screens/         # Pantallas
│   │   └── services/        # Cliente HTTP y comunicación con la API
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml           # Integración continua y despliegue del backend
├── .env.example
├── docker-compose.yml
└── README.md
```

## 👤 Roles de usuario

| Rol | Permisos |
|---|---|
| **Administrador** | Gestión de empleados, configuración de tarifas, reportes, registro de entradas y salidas y consulta del historial. |
| **Empleado** | Registro de entradas y salidas de vehículos y consulta del historial, según los permisos implementados en la aplicación. |

## 📄 Licencia

La licencia del proyecto se definirá de acuerdo con las condiciones establecidas por sus autores.
