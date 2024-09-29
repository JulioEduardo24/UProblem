import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const db = new Sequelize (process.env.DB_NAME, process.env.DB_NAME, process.env.DB_PASS,{
    host: process.env.DB_HOST,
    port: 3307,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export default db;
