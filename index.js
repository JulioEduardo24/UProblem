// index.js
import express from 'express';
import db from './config/db.js';
import gastosRoutes from './routes/gastosRoutes.js'

const app = express();
const port = 3000;

//conexion bd
try{
    await db.authenticate();
    console.log("conexion correcta")
}catch(error){
    console.log(error)
}

// Configurar EJS
app.set('view engine', 'ejs');
app.use(express.json());

// Ruta para la página principal (vista con el formulario)
app.get('/', (req, res) => {
    res.render('index');
});
//ruta Insert Gasto
app.use('/out', gastosRoutes)

app.use( express.static('public'))
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
