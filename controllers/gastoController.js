const Gasto = require('../models/Gasto');
const Presupuesto = require('../models/Presupuesto');
const Exportador = require('../utils/exportador');
const Auth = require('../models/Auth');

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
    const { categoria, desde, hasta } = req.query;
    
    // Construir filtros
    const filtros = {};
    
    if (categoria && categoria !== '') {
      filtros.categoria = categoria;
    }
    
    if (desde) {
      filtros.desde = desde;
    }
    
    if (hasta) {
      filtros.hasta = hasta;
    }

    // Obtener gastos
    const gastos = await Gasto.obtenerPorUsuario(req.userId, filtros);

    // Obtener total mensual
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    const totalMensual = await Gasto.obtenerTotalMensual(req.userId, mes, anio);

    // Categorías disponibles
    const categorias = [
      'Alimentación',
      'Transporte',
      'Vivienda',
      'Salud',
      'Entretenimiento',
      'Educación',
      'Ropa y Cuidado Personal',
      'Otros'
    ];

    res.render('main/gastos', {
      gastos,
      categorias,
      totalMensual,
      categoria: categoria || '',
      desde: desde || '',
      hasta: hasta || '',
      req
    });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).send('Error al cargar los gastos');
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
    const { 
      descripcion, 
      monto, 
      categoria, 
      fecha, 
      notas, 
      categoria_sugerida, 
      categoria_manual_override,
      tiempo_registro
    } = req.body;

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
    const esManual = categoria_manual_override === 'true';
    const tiempoRegistroInt = tiempo_registro && parseInt(tiempo_registro) > 0 
      ? parseInt(tiempo_registro) 
      : null;

    console.log(`Tiempo de registro recibido: ${tiempoRegistroInt}s (Manual: ${esManual})`);
    await Gasto.crear({
      usuario_id: req.userId,
      descripcion,
      monto: parseFloat(monto),
      categoria: categoria,
      categoria_sugerida: categoria_sugerida || categoria,
      categoria_manual: esManual,
      fecha,
      notas,
      tiempo_registro: tiempoRegistroInt
    });
    if (tiempoRegistroInt) {
      console.log(`Gasto creado con cronómetro - Tiempo: ${tiempoRegistroInt}s (${(tiempoRegistroInt/60).toFixed(1)}min)`);
    }

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
    const { 
      descripcion, 
      monto, 
      categoria, 
      fecha, 
      notas,
      tiempo_registro  // ← NUEVO CAMPO
    } = req.body;

    if (!descripcion || !monto || !categoria || !fecha) {
      const gasto = await Gasto.obtenerPorId(req.params.id, req.userId);
      return res.render('main/gasto-form', {
        gasto: { ...gasto, ...req.body },
        categorias: CATEGORIAS,
        fechaHoy: fecha,
        error: 'Todos los campos son obligatorios'
      });
    }

    const tiempoRegistroInt = tiempo_registro && parseInt(tiempo_registro) > 0 
      ? parseInt(tiempo_registro) 
      : null;
    await Gasto.actualizar(req.params.id, req.userId, {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha,
      notas,
      categoria_manual: true,
      tiempo_registro: tiempoRegistroInt 
    });

    if (tiempoRegistroInt) {
      console.log(`Gasto actualizado - ID: ${req.params.id}, Tiempo: ${tiempoRegistroInt}s`);
    }

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

exports.exportarPDF = async (req, res) => {
  try {
    const { mes, anio, categoria } = req.query;
    
    // Obtener usuario
    const user = await Auth.findById(req.userId);
    
    // Obtener gastos con filtros
    const filtros = {};
    if (mes) filtros.mes = parseInt(mes);
    if (anio) filtros.anio = parseInt(anio);
    if (categoria && categoria !== 'Todas') filtros.categoria = categoria;
    
    const gastos = await Gasto.obtenerPorUsuario(req.userId, filtros);
    
    if (gastos.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No hay gastos para exportar con los filtros seleccionados' 
      });
    }

    // Obtener mes y año para el reporte
    const mesReporte = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anioReporte = anio ? parseInt(anio) : new Date().getFullYear();

    // Obtener resumen por categoría
    const resumen = await Gasto.obtenerResumenPorCategoria(req.userId, mesReporte, anioReporte);
    
    // Obtener progreso del presupuesto
    let progresoPresupuesto = null;
    const presupuestoActual = await Presupuesto.obtenerActual(req.userId, mesReporte, anioReporte);
    if (presupuestoActual) {
      progresoPresupuesto = await Presupuesto.calcularProgreso(req.userId, mesReporte, anioReporte);
    }

    // Generar PDF
    const pdfBuffer = await Exportador.exportarPDF(
      user, 
      gastos, 
      resumen, 
      mesReporte, 
      anioReporte, 
      progresoPresupuesto
    );

    // Enviar PDF
    const nombreArchivo = `Gastos_${Exportador.obtenerNombreMes(mesReporte)}_${anioReporte}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ success: false, message: 'Error al generar el PDF' });
  }
};

exports.exportarExcel = async (req, res) => {
  try {
    const { mes, anio, categoria } = req.query;
    
    // Obtener usuario
    const user = await Auth.findById(req.userId);
    
    // Obtener gastos con filtros
    const filtros = {};
    if (mes) filtros.mes = parseInt(mes);
    if (anio) filtros.anio = parseInt(anio);
    if (categoria && categoria !== 'Todas') filtros.categoria = categoria;
    
    const gastos = await Gasto.obtenerPorUsuario(req.userId, filtros);
    
    if (gastos.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No hay gastos para exportar con los filtros seleccionados' 
      });
    }

    // Obtener mes y año para el reporte
    const mesReporte = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anioReporte = anio ? parseInt(anio) : new Date().getFullYear();

    // Obtener resumen por categoría
    const resumen = await Gasto.obtenerResumenPorCategoria(req.userId, mesReporte, anioReporte);
    
    // Obtener progreso del presupuesto
    let progresoPresupuesto = null;
    const presupuestoActual = await Presupuesto.obtenerActual(req.userId, mesReporte, anioReporte);
    if (presupuestoActual) {
      progresoPresupuesto = await Presupuesto.calcularProgreso(req.userId, mesReporte, anioReporte);
    }

    // Generar Excel
    const excelBuffer = await Exportador.exportarExcel(
      user, 
      gastos, 
      resumen, 
      mesReporte, 
      anioReporte, 
      progresoPresupuesto
    );

    // Enviar Excel
    const nombreArchivo = `Gastos_${Exportador.obtenerNombreMes(mesReporte)}_${anioReporte}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ success: false, message: 'Error al generar el Excel' });
  }
};