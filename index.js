// index.js
import express from 'express';
import db from './config/db.js';
import gastosRoutes from './routes/gastosRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bodyParser from 'body-parser';
import session from 'express-session';
import SequelizeStoreInit from 'connect-session-sequelize';
import cors from 'cors';

const app = express();
const port = 3000;

// Conexión a la base de datos
try {
  await db.authenticate();
  console.log('✅ Conexión correcta a la base de datos');
} catch (error) {
  console.error('❌ Error al conectar con la base de datos:', error);
}

// Configurar store de sesiones con Sequelize
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
  db: db,
  tableName: 'sessions', // Nombre de la tabla que se creará automáticamente
  checkExpirationInterval: 15 * 60 * 1000, // Limpieza cada 15 minutos
  expiration: 24 * 60 * 60 * 1000, // Expiración de sesión: 1 día
});

// Sincronizar la tabla de sesiones
sessionStore.sync();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración segura de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sparkle24', // Usa variable de entorno en producción
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ⚠️ Cambia a true si Render usa HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    },
  })
);

// Configurar EJS
app.set('view engine', 'ejs');
app.use(express.json());

// Ruta para la página principal (vista con el formulario)
app.get('/', (req, res) => {
  res.render('./auth/login');
});

// Rutas
app.use('/auth', authRoutes);
app.use('/out', gastosRoutes);

// Archivos estáticos
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
