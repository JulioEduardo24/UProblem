const Gasto = require('../models/Gasto');

const CATEGORIAS = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Salud',
  'Entretenimiento',
  'Educación',
  'Ropa y Cuidado Personal',
  'Otros'
];

exports.mostrarGastos = async (req, res) => {
  try {
    const { categoria, fechaInicio, fechaFin } = req.query;
    
    const gastos = await Gasto.obtenerPorUsuario(req.userId, {
      categoria,
      fechaInicio,
      fechaFin
    });

    const hoy = new Date();
    const totalMensual = await Gasto.obtenerTotalMensual(
      req.userId, 
      hoy.getMonth() + 1, 
      hoy.getFullYear()
    );

    res.render('main/gastos', {
      gastos,
      categorias: CATEGORIAS,
      filtros: { categoria, fechaInicio, fechaFin },
      totalMensual
    });
  } catch (error) {
    console.error('Error al cargar gastos:', error);
    res.status(500).send('Error al cargar gastos');
  }
};

exports.mostrarFormularioNuevo = (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  res.render('main/gasto-form', {
    gasto: null,
    categorias: CATEGORIAS,
    fechaHoy: hoy,
    error: null
  });
};

exports.sugerirCategoria = async (req, res) => {
  try {
    const { descripcion } = req.body;
    const categoria = Gasto.sugerirCategoria(descripcion);
    const sugerencias = Gasto.obtenerSugerencias(descripcion);
    
    res.json({ 
      categoria, 
      sugerencias,
      success: true 
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.crear = async (req, res) => {
  try {
    const { descripcion, monto, categoria, fecha, notas, categoria_sugerida, categoria_manual_override } = req.body;

    if (!descripcion || !monto || !categoria || !fecha) {
      return res.render('main/gasto-form', {
        gasto: req.body,
        categorias: CATEGORIAS,
        fechaHoy: fecha,
        error: 'Descripción, monto, categoría y fecha son obligatorios'
      });
    }

    if (parseFloat(monto) <= 0) {
      return res.render('main/gasto-form', {
        gasto: req.body,
        categorias: CATEGORIAS,
        fechaHoy: fecha,
        error: 'El monto debe ser mayor a 0'
      });
    }

    // Determinar si fue manual o automático
    const esManual = categoria_manual_override === 'true';

    await Gasto.crear({
      usuario_id: req.userId,
      descripcion,
      monto: parseFloat(monto),
      categoria: categoria,
      categoria_sugerida: categoria_sugerida || categoria,
      categoria_manual: esManual,
      fecha,
      notas
    });

    res.redirect('/gastos?success=created');
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.render('main/gasto-form', {
      gasto: req.body,
      categorias: CATEGORIAS,
      fechaHoy: req.body.fecha,
      error: 'Error al registrar el gasto'
    });
  }
};

exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const gasto = await Gasto.obtenerPorId(req.params.id, req.userId);
    
    if (!gasto) {
      return res.redirect('/gastos');
    }

    res.render('main/gasto-form', {
      gasto,
      categorias: CATEGORIAS,
      fechaHoy: gasto.fecha,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar gasto:', error);
    res.redirect('/gastos');
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { descripcion, monto, categoria, fecha, notas } = req.body;

    if (!descripcion || !monto || !categoria || !fecha) {
      const gasto = await Gasto.obtenerPorId(req.params.id, req.userId);
      return res.render('main/gasto-form', {
        gasto: { ...gasto, ...req.body },
        categorias: CATEGORIAS,
        fechaHoy: fecha,
        error: 'Todos los campos son obligatorios'
      });
    }

    await Gasto.actualizar(req.params.id, req.userId, {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha,
      notas,
      categoria_manual: true
    });

    res.redirect('/gastos?success=updated');
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.redirect('/gastos');
  }
};

exports.eliminar = async (req, res) => {
  try {
    await Gasto.eliminar(req.params.id, req.userId);
    res.redirect('/gastos?success=deleted');
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.redirect('/gastos');
  }
};