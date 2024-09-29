// models/Ingreso.js
import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Ingreso = db.define('Ingresos', {
  Motivo: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  Monto: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  FechaIngreso: {
    type: DataTypes.DATEONLY, // Solo almacena la fecha
    allowNull: false,
  },
  FechaPago: {
    type: DataTypes.DATE, // Almacena fecha y hora
    allowNull: false,
  },
  Metodo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'Ingresos', // Nombre de la tabla en la BD
  timestamps: false, // Si no tienes campos createdAt o updatedAt
});

export default Ingreso;
