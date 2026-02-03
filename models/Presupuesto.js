const supabase = require('../config/supabase');

class Presupuesto {
  static async crear(presupuestoData) {
    // Crear presupuesto principal
    const { data: presupuesto, error: errorPresupuesto } = await supabase
      .from('presupuestos')
      .insert([{
        usuario_id: presupuestoData.usuario_id,
        mes: presupuestoData.mes,
        anio: presupuestoData.anio,
        monto_total: presupuestoData.monto_total,
        activo: true
      }])
      .select()
      .single();
    
    if (errorPresupuesto) throw errorPresupuesto;

    // Si hay categorías asignadas, crearlas
    if (presupuestoData.categorias && presupuestoData.categorias.length > 0) {
      const categoriasInsert = presupuestoData.categorias.map(cat => ({
        presupuesto_id: presupuesto.id,
        categoria: cat.categoria,
        porcentaje: cat.porcentaje,
        monto_asignado: (presupuestoData.monto_total * cat.porcentaje) / 100
      }));

      const { error: errorCategorias } = await supabase
        .from('presupuesto_categorias')
        .insert(categoriasInsert);
      
      if (errorCategorias) throw errorCategorias;
    }

    return presupuesto;
  }

  static async obtenerActual(usuarioId, mes, anio) {
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`
        *,
        presupuesto_categorias (*)
      `)
      .eq('usuario_id', usuarioId)
      .eq('mes', mes)
      .eq('anio', anio)
      .eq('activo', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async obtenerTodos(usuarioId) {
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`
        *,
        presupuesto_categorias (*)
      `)
      .eq('usuario_id', usuarioId)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async actualizar(presupuestoId, usuarioId, presupuestoData) {
    // Actualizar presupuesto principal
    const { data: presupuesto, error: errorPresupuesto } = await supabase
      .from('presupuestos')
      .update({
        monto_total: presupuestoData.monto_total,
        updated_at: new Date().toISOString()
      })
      .eq('id', presupuestoId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();
    
    if (errorPresupuesto) throw errorPresupuesto;

    // Eliminar categorías existentes
    await supabase
      .from('presupuesto_categorias')
      .delete()
      .eq('presupuesto_id', presupuestoId);

    // Crear nuevas categorías si existen
    if (presupuestoData.categorias && presupuestoData.categorias.length > 0) {
      const categoriasInsert = presupuestoData.categorias.map(cat => ({
        presupuesto_id: presupuestoId,
        categoria: cat.categoria,
        porcentaje: cat.porcentaje,
        monto_asignado: (presupuestoData.monto_total * cat.porcentaje) / 100
      }));

      const { error: errorCategorias } = await supabase
        .from('presupuesto_categorias')
        .insert(categoriasInsert);
      
      if (errorCategorias) throw errorCategorias;
    }

    return presupuesto;
  }

  static async eliminar(presupuestoId, usuarioId) {
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', presupuestoId)
      .eq('usuario_id', usuarioId);
    
    if (error) throw error;
    return true;
  }

  static async calcularProgreso(usuarioId, mes, anio) {
    const presupuesto = await this.obtenerActual(usuarioId, mes, anio);
    
    if (!presupuesto) {
      return null;
    }

    // Obtener gastos del mes
    const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];

    const { data: gastos, error } = await supabase
      .from('gastos')
      .select('categoria, monto')
      .eq('usuario_id', usuarioId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw error;

    // Calcular total gastado
    const totalGastado = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);

    // Calcular por categoría
    const gastoPorCategoria = {};
    gastos.forEach(gasto => {
      if (!gastoPorCategoria[gasto.categoria]) {
        gastoPorCategoria[gasto.categoria] = 0;
      }
      gastoPorCategoria[gasto.categoria] += parseFloat(gasto.monto);
    });

    // Construir resultado
    const resultado = {
      presupuesto: presupuesto,
      totalGastado: totalGastado,
      totalPresupuesto: parseFloat(presupuesto.monto_total),
      porcentajeGastado: (totalGastado / parseFloat(presupuesto.monto_total)) * 100,
      restante: parseFloat(presupuesto.monto_total) - totalGastado,
      categorias: []
    };

    // Si hay categorías asignadas, calcular progreso por cada una
    if (presupuesto.presupuesto_categorias && presupuesto.presupuesto_categorias.length > 0) {
      resultado.categorias = presupuesto.presupuesto_categorias.map(cat => {
        const gastado = gastoPorCategoria[cat.categoria] || 0;
        const presupuestoCat = parseFloat(cat.monto_asignado);
        
        return {
          categoria: cat.categoria,
          porcentaje: parseFloat(cat.porcentaje),
          presupuesto: presupuestoCat,
          gastado: gastado,
          porcentajeGastado: (gastado / presupuestoCat) * 100,
          restante: presupuestoCat - gastado,
          alerta: (gastado / presupuestoCat) >= 0.8
        };
      });
    }

    // Alerta general
    resultado.alertaGeneral = resultado.porcentajeGastado >= 80;

    return resultado;
  }

  static obtenerMesActual() {
    const hoy = new Date();
    return {
      mes: hoy.getMonth() + 1,
      anio: hoy.getFullYear()
    };
  }
}

module.exports = Presupuesto;