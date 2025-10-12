import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const User = db.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Usuario no verificado por defecto
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true, // Token para verificar email
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true, // Fecha de expiración del token
    },
  }, {
    timestamps: true,
  });
  
  export default User;

