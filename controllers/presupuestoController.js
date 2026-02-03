const Presupuesto = require('../models/Presupuesto');

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

exports.mostrarPresupuestos = async (req, res) => {
  try {
    const presupuestos = await Presupuesto.obtenerTodos(req.userId);
    const { mes, anio } = Presupuesto.obtenerMesActual();
    
    let presupuestoActual = await Presupuesto.obtenerActual(req.userId, mes, anio);
    let progreso = null;

    if (presupuestoActual) {
      progreso = await Presupuesto.calcularProgreso(req.userId, mes, anio);
    }

    res.render('main/presupuestos', {
      presupuestos,
      presupuestoActual,
      progreso,
      mesActual: mes,
      anioActual: anio,
      categorias: CATEGORIAS
    });
  } catch (error) {
    console.error('Error al cargar presupuestos:', error);
    res.status(500).send('Error al cargar presupuestos');
  }
};

exports.mostrarFormularioNuevo = (req, res) => {
  const { mes, anio } = Presupuesto.obtenerMesActual();
  res.render('main/presupuesto-form', {
    presupuesto: null,
    categorias: CATEGORIAS,
    mesActual: mes,
    anioActual: anio,
    error: null
  });
};

exports.crear = async (req, res) => {
  try {
    const { mes, anio, monto_total, categorias_json } = req.body;

    if (!mes || !anio || !monto_total) {
      return res.render('main/presupuesto-form', {
        presupuesto: req.body,
        categorias: CATEGORIAS,
        mesActual: mes,
        anioActual: anio,
        error: 'Mes, año y monto total son obligatorios'
      });
    }

    if (parseFloat(monto_total) <= 0) {
      return res.render('main/presupuesto-form', {
        presupuesto: req.body,
        categorias: CATEGORIAS,
        mesActual: mes,
        anioActual: anio,
        error: 'El monto debe ser mayor a 0'
      });
    }

    // Verificar si ya existe presupuesto para ese mes
    const existente = await Presupuesto.obtenerActual(req.userId, parseInt(mes), parseInt(anio));
    if (existente) {
      return res.render('main/presupuesto-form', {
        presupuesto: req.body,
        categorias: CATEGORIAS,
        mesActual: mes,
        anioActual: anio,
        error: 'Ya existe un presupuesto para este mes'
      });
    }

    const presupuestoData = {
      usuario_id: req.userId,
      mes: parseInt(mes),
      anio: parseInt(anio),
      monto_total: parseFloat(monto_total),
      categorias: []
    };

    // Parsear categorías si existen
    if (categorias_json) {
      try {
        const categorias = JSON.parse(categorias_json);
        
        // Validar que los porcentajes sumen máximo 100%
        const sumaPortentajes = categorias.reduce((sum, cat) => sum + parseFloat(cat.porcentaje), 0);
        
        if (sumaPortentajes > 100) {
          return res.render('main/presupuesto-form', {
            presupuesto: req.body,
            categorias: CATEGORIAS,
            mesActual: mes,
            anioActual: anio,
            error: 'La suma de porcentajes no puede exceder 100%'
          });
        }

        presupuestoData.categorias = categorias.filter(cat => cat.porcentaje > 0);
      } catch (e) {
        console.error('Error al parsear categorías:', e);
      }
    }

    await Presupuesto.crear(presupuestoData);
    res.redirect('/presupuestos?success=created');

  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    const { mes, anio } = Presupuesto.obtenerMesActual();
    res.render('main/presupuesto-form', {
      presupuesto: req.body,
      categorias: CATEGORIAS,
      mesActual: mes,
      anioActual: anio,
      error: 'Error al crear el presupuesto'
    });
  }
};

exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const presupuestos = await Presupuesto.obtenerTodos(req.userId);
    const presupuesto = presupuestos.find(p => p.id === parseInt(req.params.id));
    
    if (!presupuesto) {
      return res.redirect('/presupuestos');
    }

    res.render('main/presupuesto-form', {
      presupuesto,
      categorias: CATEGORIAS,
      mesActual: presupuesto.mes,
      anioActual: presupuesto.anio,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar presupuesto:', error);
    res.redirect('/presupuestos');
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { monto_total, categorias_json } = req.body;

    if (!monto_total || parseFloat(monto_total) <= 0) {
      return res.redirect('/presupuestos?error=invalid');
    }

    const presupuestoData = {
      monto_total: parseFloat(monto_total),
      categorias: []
    };

    if (categorias_json) {
      try {
        const categorias = JSON.parse(categorias_json);
        const sumaPortentajes = categorias.reduce((sum, cat) => sum + parseFloat(cat.porcentaje), 0);
        
        if (sumaPortentajes > 100) {
          return res.redirect('/presupuestos?error=percentage');
        }

        presupuestoData.categorias = categorias.filter(cat => cat.porcentaje > 0);
      } catch (e) {
        console.error('Error al parsear categorías:', e);
      }
    }

    await Presupuesto.actualizar(parseInt(req.params.id), req.userId, presupuestoData);
    res.redirect('/presupuestos?success=updated');

  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    res.redirect('/presupuestos?error=update');
  }
};

exports.eliminar = async (req, res) => {
  try {
    await Presupuesto.eliminar(parseInt(req.params.id), req.userId);
    res.redirect('/presupuestos?success=deleted');
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.redirect('/presupuestos?error=delete');
  }
};