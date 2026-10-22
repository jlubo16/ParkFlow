# Explicación detallada del proyecto SmartPark

## 1. ¿Qué es este proyecto?

SmartPark es un sistema de gestión para un parqueadero. Tiene dos partes principales:

- Backend: sirve y procesa la lógica del negocio
- Frontend móvil: permite a los usuarios interactuar con el sistema desde un celular

La aplicación permite:

- iniciar sesión
- registrar entradas y salidas de vehículos
- ver espacios ocupados y disponibles
- gestionar tarifas
- registrar pagos
- consultar historial
- administrar empleados
- generar reportes

El proyecto está diseñado en una arquitectura cliente-servidor donde:

- el móvil hace peticiones al backend
- el backend consulta la base de datos PostgreSQL
- la base de datos guarda usuarios, tarifas, espacios, vehículos y pagos
- el backend responde en formato JSON

---

## 2. Cómo está organizado el proyecto

### Backend
La carpeta `backend` contiene la lógica del servidor.

### Base de datos
La carpeta `database` contiene el esquema SQL con todas las tablas.

### Frontend móvil
La carpeta `mobile-app` contiene la aplicación React Native / Expo.

---

## 3. Estructura general del proyecto

```text
park-completo-v1-main/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── empleadoController.js
│       │   ├── historialController.js
│       │   ├── reporteController.js
│       │   ├── tarifaController.js
│       │   ├── vehiculoController.js
│       │   └── AuthControllerMVC.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── validation.js
│       ├── models/
│       │   └── UsuarioModel.js
│       ├── patrones/
│       │   ├── SingletonDatabase.js
│       │   ├── FactoryMethod.js
│       │   └── Observer.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── empleadoRoutes.js
│       │   ├── historialRoutes.js
│       │   ├── reporteRoutes.js
│       │   ├── tarifaRoutes.js
│       │   └── vehiculoRoutes.js
│       └── views/
│           └── AuthView.js
│
├── database/
│   └── schema.sql
│
└── mobile-app/
    ├── App.js
    ├── package.json
    └── src/
        ├── contexts/
        │   └── AuthContext.js
        ├── screens/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── RegistrarEntrada.js
        │   ├── RegistrarSalida.js
        │   ├── Historial.js
        │   ├── Reportes.js
        │   ├── ConfigurarTarifas.js
        │   └── GestionarEmpleados.js
        ├── services/
        │   └── api.js
```

---

## 4. El backend: cómo inicia todo

El punto de entrada del backend es este archivo:

### `backend/server.js`

```js
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor SmartPark corriendo en http://localhost:${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
});
```

### ¿Qué hace este archivo?
- carga la aplicación Express
- toma el puerto desde el `.env`
- levanta el servidor
- queda escuchando conexiones HTTP

Cuando haces esto:

```powershell
node server.js
```

estás iniciando el servidor de la API.

---

## 5. La aplicación Express principal

Archivo:

### `backend/src/app.js`

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const tarifaRoutes = require('./routes/tarifaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const historialRoutes = require('./routes/historialRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/tarifas', tarifaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/empleados', empleadoRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
```

### ¿Qué hace?
- crea la app Express
- habilita CORS para que la app móvil pueda conectarse
- convierte los JSON entrantes en objetos JavaScript
- monta todas las rutas API del proyecto

### ¿Cómo se conecta con el frontend?
El frontend hace llamadas HTTP a rutas como:

- `/api/auth/login`
- `/api/vehiculos/resumen`
- `/api/vehiculos/entrada`
- `/api/vehiculos/salida`

y Express responde con JSON.

---

## 6. Cómo se conecta backend con PostgreSQL

Archivo:

### `backend/src/config/db.js`

```js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpark'
});
```

### ¿Qué hace exactamente?
Crea un pool de conexiones a PostgreSQL con estos datos:

- host: localhost
- puerto: 5432
- usuario: postgres
- contraseña: 1002
- base de datos: smartpark

Esto permite que cualquier parte del backend haga consultas SQL usando el pool sin abrir una conexión nueva cada vez.

### ¿Para qué sirve `pg`?
Porque `pg` es la librería oficial de PostgreSQL en Node.js. Permite ejecutar consultas SQL desde JavaScript.

---

## 7. Variables de entorno

Archivo:

### `backend/.env`

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1002
DB_NAME=smartpark
DB_PORT=5432
JWT_SECRET=smartpark_secret_key_2026
PORT=3001
```

### ¿Qué representa cada una?
- `DB_HOST`: dónde está PostgreSQL
- `DB_USER`: usuario de la base
- `DB_PASSWORD`: contraseña
- `DB_NAME`: nombre de la base
- `DB_PORT`: puerto de PostgreSQL
- `JWT_SECRET`: clave para firmar tokens
- `PORT`: puerto del backend

Esto es crucial porque sin estas variables, la API no sabe dónde está la base ni cómo autenticar a los usuarios.

---

## 8. Rutas del backend

Cada ruta del sistema está en la carpeta `backend/src/routes`.

### `backend/src/routes/authRoutes.js`

```js
const express = require('express');
const router = express.Router();
const AuthControllerMVC = require('../controllers/AuthControllerMVC');

router.post('/login', AuthControllerMVC.login);

module.exports = router;
```

### ¿Qué hace este archivo?
- prepara un router Express
- crea la ruta `/login`
- manda la petición al controlador `AuthControllerMVC.login`

### ¿Cómo se activa la ruta?
Porque en `app.js` se monta así:

```js
app.use('/api/auth', authRoutes);
```

Entonces cuando el frontend hace esto:

```text
POST /api/auth/login
```

se está invocando este archivo.

---

### `backend/src/routes/vehiculoRoutes.js`

```js
router.use(authMiddleware);

router.get('/estacionados', getVehiculosEstacionados);
router.get('/resumen', getResumenEspacios);
router.post('/entrada', validateEntry, registrarEntrada);
router.post('/salida', registrarSalida);
```

### ¿Qué hace?
- aplica el middleware de autenticación a todas estas rutas
- define rutas para:
  - obtener los vehículos estacionados
  - ver resumen de espacios
  - registrar entrada
  - registrar salida

Esto quiere decir que antes de poder acceder a estos servicios, el usuario debe estar autenticado.

---

### `backend/src/routes/tarifaRoutes.js`

Se encarga de:
- listar tarifas
- actualizar tarifas
- consultar precios por tipo de vehículo

### `backend/src/routes/reporteRoutes.js`

Se encarga de:
- obtener reportes del sistema
- consultar estadísticas

### `backend/src/routes/historialRoutes.js`

Se encarga de:
- mostrar historial de movimientos
- consultar pagos o entradas previas

### `backend/src/routes/empleadoRoutes.js`

Se encarga de:
- crear empleados
- editar empleados
- desactivar empleados
- consultar lista de empleados

---

## 9. Middleware del backend

### `backend/src/middleware/auth.js`

```js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
};
```

### ¿Qué hace?
- lee el token del header Authorization
- verifica que sea válido
- lo decodifica
- coloca la información del usuario en `req.usuario`

### ¿Por qué es importante?
Porque así el backend sabe quién está haciendo la petición. Por ejemplo, cuando un empleado intenta registrar una salida, el sistema sabe cuál usuario está autenticado y así puede guardar ese dato correctamente en la base de datos.

### `adminMiddleware`
Este middleware verifica si el usuario es administrador:

```js
if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
}
```

---

## 10. Controladores del backend

La lógica del negocio está en la carpeta `backend/src/controllers`.

### `backend/src/controllers/authController.js`

Este archivo contiene la lógica del login original. Tiene este flujo:

1. recibe correo y contraseña
2. busca el usuario en la base de datos
3. compara la contraseña con `bcrypt.compare`
4. genera un JWT
5. devuelve `success: true`, token y usuario

```js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { correo, contrasena } = req.body;
    const { rows } = await db.query(
        'SELECT * FROM usuario WHERE correo = $1 AND estado = TRUE',
        [correo]
    );

    const usuario = rows[0];
    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

    const token = jwt.sign(
        {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre_completo,
            correo: usuario.correo,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.json({ success: true, token, usuario });
};
```

### ¿Qué hace aquí?
Es el cerebro de la autenticación.

---

### `backend/src/controllers/vehiculoController.js`

Este es uno de los controladores más importantes porque maneja el estacionamiento.

#### `registrarEntrada`
1. recibe placa, tipo de vehículo y espacio
2. valida que el espacio esté disponible
3. valida que el tipo del espacio coincida con el tipo del vehículo
4. valida que el vehículo no esté ya dentro
5. inserta el registro en `vehiculo_estacionado`
6. cambia el estado del espacio a `ocupado`

```js
const { rows: espacioRows } = await db.query(
    "SELECT * FROM espacio WHERE id_espacio = $1 AND estado = 'disponible'",
    [id_espacio]
);
```

#### `registrarSalida`
1. busca el vehículo activo
2. calcula el tiempo que estuvo estacionado
3. calcula el costo total según la tarifa del tipo de vehículo
4. actualiza la salida y el total
5. actualiza el espacio a `disponible`
6. registra la transacción de pago

#### `getVehiculosEstacionados`
Devuelve una lista de vehículos que aún no han salido.

#### `getResumenEspacios`
Consulta cuántos espacios hay:
- totales
- ocupados
- disponibles
- por tipo `carro` y `moto`

---

### `backend/src/controllers/tarifaController.js`

Este módulo:
- consulta precios por hora
- actualiza tarifas
- guarda historial de cambios en `historial_tarifas`

### `backend/src/controllers/reporteController.js`

Genera reportes con datos del sistema, por ejemplo:
- carros estacionados
- movimientos del día
- ingresos y pagos

### `backend/src/controllers/historialController.js`

Muestra el historial de:
- entradas
- salidas
- pagos
- cambios de tarifa

### `backend/src/controllers/empleadoController.js`

Maneja:
- registro de empleados
- actualización de información
- desactivación o activación
- consulta por correo y rol

---

## 11. Modelo y capa de acceso a datos

### `backend/src/models/UsuarioModel.js`

```js
class UsuarioModel {
  async buscarPorCorreo(correo) {
    const { rows } = await db.query(
      'SELECT * FROM usuario WHERE correo = $1 AND estado = TRUE',
      [correo]
    );
    return rows[0] || null;
  }
}
```

### ¿Qué hace?
Aplica la lógica de acceso a datos de usuario. La idea es que el controlador no llame SQL directamente, sino que use este modelo.

---

## 12. Vista del backend

### `backend/src/views/AuthView.js`

```js
class AuthView {
  static responderLoginExitoso(res, token, usuario) {
    delete usuario.contrasena;

    return res.json({
      success: true,
      token,
      usuario
    });
  }

  static responderError(res, statusCode, mensaje) {
    return res.status(statusCode).json({ error: mensaje });
  }
}
```

### ¿Qué hace?
- prepara la respuesta JSON del servidor
- elimina la contraseña antes de devolver el usuario
- responde con errores si algo falla

Esto ayuda a separar la lógica de negocio de la estructura de la respuesta.

---

## 13. MVC aplicado

El sistema tiene una versión MVC más clara en estos archivos:

- modelo: `UsuarioModel.js`
- vista: `AuthView.js`
- controlador: `AuthControllerMVC.js`

### `backend/src/controllers/AuthControllerMVC.js`

```js
class AuthControllerMVC {
  async login(req, res) {
    const { correo, contrasena } = req.body;

    const usuario = await UsuarioModel.buscarPorCorreo(correo);
    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

    const token = jwt.sign(...);

    return AuthView.responderLoginExitoso(res, token, usuario);
  }
}
```

### ¿Por qué es importante?
Porque en una arquitectura MVC cada capa tiene una función específica:

- modelo: tocar base de datos
- vista: formar respuesta JSON
- controlador: decidir la lógica de negocio

Esto hace que el código sea más entendible, más fácil de mantener y más fácil de explicar en una sustentación.

---

## 14. Patrones de diseño implementados

### `backend/src/patrones/SingletonDatabase.js`

```js
class SingletonDatabase {
  constructor() {
    if (!SingletonDatabase.instance) {
      const { Pool } = require('pg');
      this.pool = new Pool({ ... });
      SingletonDatabase.instance = this;
    }
    return SingletonDatabase.instance;
  }
}
```

### ¿Qué significa?
Solo existe una instancia de la conexión a la base de datos. Esto evita abrir demasiadas conexiones simultáneas.

### `backend/src/patrones/FactoryMethod.js`

```js
class VehiculoFactory {
  crear(tipoVehiculo) {
    if (tipoVehiculo === 'carro') return new Carro();
    if (tipoVehiculo === 'moto') return new Moto();
  }
}
```

### ¿Qué hace?
Crea objetos según el tipo de vehículo.

### `backend/src/patrones/Observer.js`

```js
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(event, payload) {
    this.observers.forEach((observer) => observer(event, payload));
  }
}
```

### ¿Qué hace?
Notifica a otros objetos cuando ocurre un evento, por ejemplo cambios en tarifa o estado del sistema.

---

## 15. Cómo se ve la base de datos SQL

Archivo:

### `database/schema.sql`

Aquí se crean las tablas del sistema.

### Tabla principal `usuario`
```sql
CREATE TABLE usuario (
    id_usuario INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    estado BOOLEAN DEFAULT TRUE
);
```

### ¿Qué guarda?
Usuarios del sistema con rol de admin o empleado.

### Tabla `espacio`
```sql
CREATE TABLE espacio (
    id_espacio INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    tipo_vehiculo VARCHAR(20) NOT NULL CHECK (tipo_vehiculo IN ('carro', 'moto')),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento'))
);
```

### Tabla `vehiculo_estacionado`
Registra los vehículos dentro del parqueadero.

### Tabla `tarifas`
Guarda el precio por hora según el tipo de vehículo.

### Tabla `transaccion_pago`
Guarda los pagos que se realizan al salir un vehículo.

---

## 16. Cómo funciona la parte móvil

La app móvil está en la carpeta `mobile-app`.

### `mobile-app/App.js`

```js
export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}
```

### ¿Qué hace este archivo?
- crea el proveedor de autenticación
- crea la navegación principal
- decide si mostrar el login o el dashboard dependiendo del estado del usuario

---

### `mobile-app/src/contexts/AuthContext.js`

Este archivo guarda el estado de sesión.

```js
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

### ¿Qué hace?
- lee `token` y `user` desde AsyncStorage
- si ya hay sesión guardada, la restaura
- cuando hace login, guarda el token y los datos del usuario
- lo deja disponible para toda la app

---

### `mobile-app/src/services/api.js`

```js
const API_URL = 'http://192.168.1.113:3001/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});
```

### ¿Qué hace?
- define la URL base de la API
- permite hacer llamadas tipo `api.post('/auth/login')`
- agrega el token JWT en el header de autorización

Es la conexión entre la app móvil y el backend.

---

### `mobile-app/src/screens/Login.js`

```js
const result = await login(correo, contrasena);

if (result.success) {
    navigation.replace('Dashboard');
}
```

### ¿Qué hace?
- toma el correo y la contraseña
- llama a `login()` del contexto
- si la respuesta es correcta, cambia de pantalla
- si falla, muestra un alert con el error

---

### `mobile-app/src/screens/Dashboard.js`

Este archivo muestra:
- saludo del usuario
- rol del usuario
- total de espacios
- espacios ocupados y disponibles
- tarjetas de resumen
- mapa de espacios
- acciones rápidas

La línea más importante es esta:

```js
const response = await api.get('/vehiculos/resumen');
```

### ¿Qué hace?
Llama al backend para pedir el resumen de espacios y luego renderiza esos datos en pantalla.

---

### `mobile-app/src/screens/RegistrarEntrada.js`

Permite registrar la entrada de un vehículo al parqueadero.

Hace una llamada tipo:

```js
api.post('/vehiculos/entrada', datos)
```

### `mobile-app/src/screens/RegistrarSalida.js`

Permite registrar la salida y el pago asociado.

### `mobile-app/src/screens/Historial.js`

Consulta eventos o registros previos del sistema.

### `mobile-app/src/screens/Reportes.js`

Muestra reportes del sistema.

### `mobile-app/src/screens/ConfigurarTarifas.js`

Permite cambiar tarifas por tipo de vehículo.

### `mobile-app/src/screens/GestionarEmpleados.js`

Permite crear y editar empleados.

---

## 17. Cómo se conecta todo en conjunto

El flujo real del sistema es este:

### 1. El usuario abre la app
Se ejecuta `App.js` y se monta `AuthProvider`.

### 2. La app revisa si ya hay sesión guardada
`AuthContext.js` lee `token` y `user` desde `AsyncStorage`.

### 3. Si no hay sesión, se muestra Login
`Login.js` captura correo y contraseña.

### 4. El login se envía al backend
`api.post('/auth/login')` se ejecuta desde el servicio `api.js`.

### 5. El backend recibe la petición
`app.js` recibe la ruta `/api/auth` y el router `authRoutes.js` redirige a `AuthControllerMVC.login` o `authController.js`.

### 6. El controlador consulta la base de datos
`db.js` conecta con PostgreSQL y hace la consulta SQL.

### 7. Se valida la contraseña
Se usa `bcrypt.compare()` para verificar si la contraseña coincide.

### 8. Se genera JWT
Se firma el token con la clave del `.env`.

### 9. Se responde al cliente
El backend responde con `success: true`, `token` y `usuario`.

### 10. La app guarda la sesión
`AuthContext.js` guarda el token y el usuario en AsyncStorage.

### 11. La app navega al Dashboard
`Login.js` hace `navigation.replace('Dashboard');`

### 12. El dashboard pide resumen
`Dashboard.js` llama a `/vehiculos/resumen`.

### 13. El backend consulta la base
`vehiculoController.js` hace consultas SQL a PostgreSQL y devuelve JSON.

### 14. La app renderiza los datos en pantalla
El usuario ya puede interactuar con el sistema.

---

## 18. En una frase: cómo funciona el proyecto

El proyecto funciona como una aplicación completa de software empresarial donde:

- la app móvil es la interfaz visual
- el backend actúa como la lógica y la API
- PostgreSQL es el almacenamiento persistente
- JWT y bcrypt protegen la autenticación
- Express organiza las rutas y los controladores
- MVC separa la lógica para que el sistema sea más ordenado y mantenible

---

## 19. Cómo explicar esto en la sustentación

Puedes decir algo así:

> Este sistema está desarrollado con una arquitectura cliente-servidor. El frontend móvil está hecho en React Native con Expo y consume la API del backend. El backend está desarrollado con Express y Node.js, y se conecta a PostgreSQL mediante la librería pg. La autenticación se realiza con JWT y bcryptjs para proteger la información del usuario. Cada módulo está organizado por rutas, controladores, modelos y vistas, lo que permite una estructura MVC. Las principales operaciones como login, entrada y salida de vehículos, configuración de tarifas y reportes se resuelven desde el backend y se conectan con la base de datos mediante consultas SQL. La app móvil guarda la sesión de forma local usando AsyncStorage y usa Axios para consumir la API.

---

## 20. Resumen final

Este proyecto no es solo una app móvil aislada ni solo un backend aislado. Es un sistema completo donde cada archivo cumple una función específica:

- `server.js` inicia el backend
- `app.js` arma la API
- `db.js` conecta con PostgreSQL
- `routes` definen endpoints
- `controllers` ejecutan la lógica
- `middleware` valida tokens y permisos
- `models` acceden a datos
- `views` estructuran respuestas
- `mobile-app` consume todo desde la interfaz

Todo funciona en conjunto para entregar un sistema real de gestión de parqueadero.
