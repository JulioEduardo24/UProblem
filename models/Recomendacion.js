const supabase = require('../config/supabase');
const Gasto = require('./Gasto');
const Presupuesto = require('./Presupuesto');

class Recomendacion {
  
  /**
   * Generar todas las recomendaciones para un usuario
   */
  static async generarRecomendaciones(usuarioId, mes, anio) {
    const recomendaciones = [];

    try {
      // 1. Alertas de sobre-gasto por categoría
      const alertasSobreGasto = await this.analizarSobreGasto(usuarioId, mes, anio);
      recomendaciones.push(...alertasSobreGasto);

      // 2. Comparación con meses anteriores
      const comparacionTemporal = await this.compararConMesesAnteriores(usuarioId, mes, anio);
      recomendaciones.push(...comparacionTemporal);

      // 3. Proyección de gasto mensual
      const proyeccion = await this.proyectarGastoMensual(usuarioId, mes, anio);
      if (proyeccion) recomendaciones.push(proyeccion);

      // 4. Sugerencias de ahorro
      const sugerenciasAhorro = await this.sugerirAhorros(usuarioId, mes, anio);
      recomendaciones.push(...sugerenciasAhorro);

      // 5. Análisis de patrones
      const patrones = await this.detectarPatrones(usuarioId, mes, anio);
      recomendaciones.push(...patrones);

      // Ordenar por prioridad (crítico > alto > medio > bajo)
      const prioridades = { 'critico': 1, 'alto': 2, 'medio': 3, 'bajo': 4, 'info': 5 };
      recomendaciones.sort((a, b) => prioridades[a.prioridad] - prioridades[b.prioridad]);

      return recomendaciones;
    } catch (error) {
      console.error('Error al generar recomendaciones:', error);
      return [];
    }
  }

  /**
   * 1. Analizar sobre-gasto respecto al presupuesto
   */
  static async analizarSobreGasto(usuarioId, mes, anio) {
    const recomendaciones = [];
    
    const presupuesto = await Presupuesto.obtenerActual(usuarioId, mes, anio);
    if (!presupuesto) return recomendaciones;

    const progreso = await Presupuesto.calcularProgreso(usuarioId, mes, anio);
    
    // Alerta general
    if (progreso.porcentajeGastado >= 90) {
      recomendaciones.push({
        tipo: 'alerta',
        prioridad: 'critico',
        titulo: '¡Presupuesto casi agotado!',
        descripcion: `Has gastado el ${progreso.porcentajeGastado.toFixed(1)}% de tu presupuesto mensual. Solo te quedan S/ ${progreso.restante.toFixed(2)}.`,
        icono: '🚨',
        accion: 'Reduce gastos inmediatamente',
        categoria: null
      });
    } else if (progreso.porcentajeGastado >= 80) {
      recomendaciones.push({
        tipo: 'alerta',
        prioridad: 'alto',
        titulo: 'Alerta de presupuesto',
        descripcion: `Has gastado el ${progreso.porcentajeGastado.toFixed(1)}% de tu presupuesto. Quedan S/ ${progreso.restante.toFixed(2)}.`,
        icono: '⚠️',
        accion: 'Controla tus gastos esta semana',
        categoria: null
      });
    }

    // Alertas por categoría
    if (progreso.categorias) {
      progreso.categorias.forEach(cat => {
        if (cat.porcentajeGastado >= 100) {
          recomendaciones.push({
            tipo: 'alerta',
            prioridad: 'critico',
            titulo: `Presupuesto excedido en ${cat.categoria}`,
            descripcion: `Has gastado S/ ${cat.gastado.toFixed(2)} de S/ ${cat.presupuesto.toFixed(2)} (${cat.porcentajeGastado.toFixed(1)}%).`,
            icono: '🔴',
            accion: `Evita gastos en ${cat.categoria}`,
            categoria: cat.categoria
          });
        } else if (cat.porcentajeGastado >= 80) {
          recomendaciones.push({
            tipo: 'alerta',
            prioridad: 'medio',
            titulo: `Presupuesto alto en ${cat.categoria}`,
            descripcion: `Llevas ${cat.porcentajeGastado.toFixed(1)}% gastado. Quedan S/ ${cat.restante.toFixed(2)}.`,
            icono: '🟡',
            accion: `Reduce gastos en ${cat.categoria}`,
            categoria: cat.categoria
          });
        }
      });
    }

    return recomendaciones;
  }

  /**
   * 2. Comparar con meses anteriores (3 meses)
   */
  static async compararConMesesAnteriores(usuarioId, mes, anio) {
    const recomendaciones = [];
    
    // Obtener gastos de los últimos 3 meses
    const gastosActuales = await this.obtenerGastosPorCategoria(usuarioId, mes, anio);
    const totalActual = Object.values(gastosActuales).reduce((sum, val) => sum + val, 0);

    if (totalActual === 0) return recomendaciones;

    const mesesAnteriores = [];
    for (let i = 1; i <= 3; i++) {
      let mesAnterior = mes - i;
      let anioAnterior = anio;
      
      if (mesAnterior <= 0) {
        mesAnterior += 12;
        anioAnterior -= 1;
      }
      
      const gastos = await this.obtenerGastosPorCategoria(usuarioId, mesAnterior, anioAnterior);
      const total = Object.values(gastos).reduce((sum, val) => sum + val, 0);
      mesesAnteriores.push({ mes: mesAnterior, anio: anioAnterior, total, gastos });
    }

    // Calcular promedio de 3 meses anteriores
    const promedioTotal = mesesAnteriores.reduce((sum, m) => sum + m.total, 0) / mesesAnteriores.length;
    
    if (promedioTotal > 0) {
      const diferenciaTotal = totalActual - promedioTotal;
      const porcentajeDiferencia = (diferenciaTotal / promedioTotal) * 100;

      if (porcentajeDiferencia > 30) {
        recomendaciones.push({
          tipo: 'comparacion',
          prioridad: 'alto',
          titulo: 'Gasto mensual muy elevado',
          descripcion: `Estás gastando ${porcentajeDiferencia.toFixed(1)}% más que tu promedio de los últimos 3 meses (S/ ${promedioTotal.toFixed(2)}).`,
          icono: '📈',
          accion: 'Revisa tus gastos recientes',
          categoria: null
        });
      } else if (porcentajeDiferencia < -20) {
        recomendaciones.push({
          tipo: 'logro',
          prioridad: 'info',
          titulo: '¡Excelente control de gastos!',
          descripcion: `Has reducido tus gastos en ${Math.abs(porcentajeDiferencia).toFixed(1)}% comparado con tu promedio.`,
          icono: '🎉',
          accion: 'Mantén este ritmo',
          categoria: null
        });
      }
    }

    // Comparar por categorías
    Object.keys(gastosActuales).forEach(categoria => {
      const gastoActual = gastosActuales[categoria];
      const gastosCategoria = mesesAnteriores.map(m => m.gastos[categoria] || 0);
      const promedioCategoria = gastosCategoria.reduce((sum, g) => sum + g, 0) / gastosCategoria.length;

      if (promedioCategoria > 0) {
        const diferencia = gastoActual - promedioCategoria;
        const porcentaje = (diferencia / promedioCategoria) * 100;

        if (porcentaje > 50 && gastoActual > 100) {
          recomendaciones.push({
            tipo: 'comparacion',
            prioridad: 'medio',
            titulo: `Aumento en ${categoria}`,
            descripcion: `Gastas ${porcentaje.toFixed(1)}% más en ${categoria} que tu promedio (S/ ${promedioCategoria.toFixed(2)}).`,
            icono: '📊',
            accion: `Revisa gastos en ${categoria}`,
            categoria: categoria
          });
        }
      }
    });

    return recomendaciones;
  }

  /**
   * 3. Proyectar gasto al final del mes
   */
  static async proyectarGastoMensual(usuarioId, mes, anio) {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const diasDelMes = new Date(anio, mes, 0).getDate();

    // Solo proyectar si estamos antes del día 25
    if (diaActual >= 25) return null;

    const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
    const fechaHoy = hoy.toISOString().split('T')[0];

    const { data: gastos, error } = await supabase
      .from('gastos')
      .select('monto')
      .eq('usuario_id', usuarioId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaHoy);

    if (error || !gastos || gastos.length === 0) return null;

    const totalGastado = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    const promedioXDia = totalGastado / diaActual;
    const proyeccionFinal = promedioXDia * diasDelMes;

    const presupuesto = await Presupuesto.obtenerActual(usuarioId, mes, anio);

    if (presupuesto) {
      const presupuestoTotal = parseFloat(presupuesto.monto_total);
      const diferencia = proyeccionFinal - presupuestoTotal;
      const porcentaje = (diferencia / presupuestoTotal) * 100;

      if (diferencia > 0) {
        return {
          tipo: 'proyeccion',
          prioridad: porcentaje > 20 ? 'alto' : 'medio',
          titulo: 'Proyección de sobre-gasto',
          descripcion: `Al ritmo actual, gastarás S/ ${proyeccionFinal.toFixed(2)} este mes, excediendo tu presupuesto en S/ ${diferencia.toFixed(2)}.`,
          icono: '🔮',
          accion: 'Reduce gastos diarios',
          categoria: null
        };
      }
    }

    return null;
  }

  /**
   * 4. Sugerir ahorros en categorías específicas
   */
  static async sugerirAhorros(usuarioId, mes, anio) {
    const recomendaciones = [];
    
    const gastosPorCategoria = await this.obtenerGastosPorCategoria(usuarioId, mes, anio);
    const totalGastado = Object.values(gastosPorCategoria).reduce((sum, val) => sum + val, 0);

    if (totalGastado === 0) return recomendaciones;

    // Categorías con mayor gasto
    const categoriasOrdenadas = Object.entries(gastosPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const sugerenciasPorCategoria = {
      'Alimentación': 'Cocina más en casa y reduce pedidos a delivery',
      'Transporte': 'Considera usar transporte público o compartir viajes',
      'Entretenimiento': 'Busca actividades gratuitas o de menor costo',
      'Ropa y Cuidado Personal': 'Aprovecha ofertas y evalúa compras necesarias',
      'Otros': 'Revisa gastos hormiga y evalúa suscripciones innecesarias'
    };

    categoriasOrdenadas.forEach(([categoria, monto], index) => {
      const porcentaje = (monto / totalGastado) * 100;
      
      if (porcentaje > 25 && index === 0) {
        recomendaciones.push({
          tipo: 'ahorro',
          prioridad: 'medio',
          titulo: `${categoria} representa ${porcentaje.toFixed(1)}% de tu gasto`,
          descripcion: `Sugerencia: ${sugerenciasPorCategoria[categoria] || 'Evalúa formas de reducir este gasto'}.`,
          icono: '💡',
          accion: 'Ver detalles de gastos',
          categoria: categoria
        });
      }
    });

    return recomendaciones;
  }

  /**
   * 5. Detectar patrones de gasto
   */
  static async detectarPatrones(usuarioId, mes, anio) {
    const recomendaciones = [];
    
    const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];

    const { data: gastos, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true });

    if (error || !gastos || gastos.length < 5) return recomendaciones;

    // Detectar gastos frecuentes por descripción similar
    const gastosAgrupados = {};
    gastos.forEach(gasto => {
      const desc = gasto.descripcion.toLowerCase().trim();
      const palabras = desc.split(' ');
      const clave = palabras[0]; // Usar primera palabra como clave

      if (!gastosAgrupados[clave]) {
        gastosAgrupados[clave] = [];
      }
      gastosAgrupados[clave].push(gasto);
    });

    // Gastos recurrentes (3 o más veces al mes)
    Object.entries(gastosAgrupados).forEach(([clave, gastosGrupo]) => {
      if (gastosGrupo.length >= 3) {
        const totalGrupo = gastosGrupo.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        const promedio = totalGrupo / gastosGrupo.length;

        recomendaciones.push({
          tipo: 'patron',
          prioridad: 'info',
          titulo: `Gasto recurrente detectado`,
          descripcion: `Has realizado ${gastosGrupo.length} gastos relacionados con "${clave}" por un total de S/ ${totalGrupo.toFixed(2)} (promedio S/ ${promedio.toFixed(2)}).`,
          icono: '🔁',
          accion: 'Considera presupuestar este gasto',
          categoria: gastosGrupo[0].categoria
        });
      }
    });

    // Días de la semana con más gastos
    const gastosPorDia = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    gastos.forEach(gasto => {
      const fecha = new Date(gasto.fecha + 'T00:00:00');
      const dia = fecha.getDay();
      gastosPorDia[dia] += parseFloat(gasto.monto);
    });

    const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaConMasGasto = Object.entries(gastosPorDia)
      .sort((a, b) => b[1] - a[1])[0];

    if (diaConMasGasto[1] > 0) {
      const porcentajeDia = (diaConMasGasto[1] / gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0)) * 100;
      
      if (porcentajeDia > 30) {
        recomendaciones.push({
          tipo: 'patron',
          prioridad: 'bajo',
          titulo: `Mayor gasto los ${diasNombres[diaConMasGasto[0]]}`,
          descripcion: `Los ${diasNombres[diaConMasGasto[0]]} gastas ${porcentajeDia.toFixed(1)}% más que otros días (S/ ${diaConMasGasto[1].toFixed(2)}).`,
          icono: '📅',
          accion: 'Ten precaución este día',
          categoria: null
        });
      }
    }

    return recomendaciones;
  }

  /**
   * Método auxiliar: Obtener gastos por categoría
   */
  static async obtenerGastosPorCategoria(usuarioId, mes, anio) {
    const gastos = await Gasto.obtenerResumenPorCategoria(usuarioId, mes, anio);
    return gastos;
  }
}

module.exports = Recomendacion;