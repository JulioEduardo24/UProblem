import Ingreso from '../models/Gasto.js';

// Función para obtener el último día de un mes dado una fecha
const getLastDayOfMonth = (year, month) => {
  return new Date(Date.UTC(year, month + 1, 0)); // UTC asegura que estamos trabajando con la fecha correcta sin desviaciones
}

const createIngreso = async (req, res) => {
  try {
    const { Motivo, Monto, FechaIngreso, Metodo, Usuario } = req.body;

    // Validar que se recibieron los campos requeridos
    if (!Motivo || !Monto || !FechaIngreso || !Metodo || !Usuario) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar que Monto sea un número
    if (isNaN(Monto)) {
      return res.status(400).json({ error: 'El campo Monto debe ser un número válido' });
    }

    // Parsear FechaIngreso
    const fechaIngresoDate = new Date(FechaIngreso);
    const diaIngreso = fechaIngresoDate.getUTCDate(); // Obtener el día de la fecha de ingreso usando UTC
    let fechaPago;

    // Si el día es menor o igual a 12, la fecha de pago es el último día del mismo mes
    if (diaIngreso <= 12) {
      fechaPago = getLastDayOfMonth(fechaIngresoDate.getUTCFullYear(), fechaIngresoDate.getUTCMonth());
    } else {
      // Si el día es mayor a 12, la fecha de pago es el último día del mes siguiente
      let siguienteMes = fechaIngresoDate.getUTCMonth() + 1; // Incrementar el mes

      // Verificamos si el siguiente mes es enero del próximo año
      let añoPago = fechaIngresoDate.getUTCFullYear();
      if (siguienteMes > 11) { // Si es diciembre, pasamos al siguiente año
        siguienteMes = 0; // El siguiente mes de diciembre es enero (mes 0)
        añoPago += 1;
      }

      fechaPago = getLastDayOfMonth(añoPago, siguienteMes);
    }

    // Crear el nuevo ingreso en la base de datos
    const nuevoIngreso = await Ingreso.create({
      Motivo,
      Monto: parseFloat(Monto), // Asegurarnos que Monto es un número flotante
      FechaIngreso: FechaIngreso, // Usamos la fecha parseada
      FechaPago: fechaPago, // Usamos la fecha de pago calculada correctamente
      Metodo: Metodo,
      Usuario: Usuario
    });

    return res.status(201).json(nuevoIngreso);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear el ingreso' });
  }
};



export {
  createIngreso
};
