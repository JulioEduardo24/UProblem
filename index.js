// index.js
import express from 'express';
import db from './config/db.js';
import gastosRoutes from './routes/gastosRoutes.js'
import authRoutes from './routes/authRoutes.js'
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';

const app = express();
const port = 3000;

//conexion bd
try{
    await db.authenticate();
    console.log("conexion correcta")
}catch(error){
    console.log(error)
}
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: 'sparkle24',
    resave: false,
    saveUninitialized: true,
}));

// Configurar EJS
app.set('view engine', 'ejs');
app.use(express.json());

// Ruta para la página principal (vista con el formulario)
app.get('/', (req, res) => {
    res.render('./auth/login');
});
//ruta auth
app.use('/auth', authRoutes)
//ruta Insert Gasto
app.use('/out', gastosRoutes)

app.use( express.static('public'))
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
