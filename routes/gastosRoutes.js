
import express from "express";
const router = express.Router();
import { createIngreso } from '../controllers/gastoController.js'
router.post('/ingresos', createIngreso);
export default router