const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use('/auth', authRoutes);
app.use('/', mainRoutes);

app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('UProblem - Sistema de Gestión de Gastos Personales');
  console.log('='.repeat(60));
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base de datos: PostgreSQL (Supabase)`);
  console.log('='.repeat(60));
});