const Recomendacion = require('../models/Recomendacion');

exports.mostrarRecomendaciones = async (req, res) => {
  try {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    const recomendaciones = await Recomendacion.generarRecomendaciones(req.userId, mes, anio);

    // Agrupar por tipo
    const agrupadas = {
      criticas: recomendaciones.filter(r => r.prioridad === 'critico'),
      altas: recomendaciones.filter(r => r.prioridad === 'alto'),
      medias: recomendaciones.filter(r => r.prioridad === 'medio'),
      bajas: recomendaciones.filter(r => r.prioridad === 'bajo'),
      informativas: recomendaciones.filter(r => r.prioridad === 'info')
    };

    // Estadísticas
    const stats = {
      total: recomendaciones.length,
      alertas: recomendaciones.filter(r => r.tipo === 'alerta').length,
      sugerencias: recomendaciones.filter(r => r.tipo === 'ahorro').length,
      patrones: recomendaciones.filter(r => r.tipo === 'patron').length,
      comparaciones: recomendaciones.filter(r => r.tipo === 'comparacion').length,
      proyecciones: recomendaciones.filter(r => r.tipo === 'proyeccion').length,
      logros: recomendaciones.filter(r => r.tipo === 'logro').length
    };

    res.render('main/recomendaciones', {
      recomendaciones,
      agrupadas,
      stats,
      mes,
      anio
    });
  } catch (error) {
    console.error('Error al cargar recomendaciones:', error);
    res.status(500).send('Error al cargar recomendaciones');
  }
};

exports.obtenerRecomendacionesJson = async (req, res) => {
  try {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    const recomendaciones = await Recomendacion.generarRecomendaciones(req.userId, mes, anio);

    res.json({
      success: true,
      total: recomendaciones.length,
      recomendaciones
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ success: false, error: 'Error al generar recomendaciones' });
  }
};