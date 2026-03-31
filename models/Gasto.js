const supabase = require('../config/supabase');
const categorizador = require('../utils/categorizador');

class Gasto {
  static async crear(gastoData) {
    const { data, error } = await supabase
      .from('gastos')
      .insert([{
        usuario_id: gastoData.usuario_id,
        descripcion: gastoData.descripcion,
        monto: gastoData.monto,
        categoria: gastoData.categoria,
        fecha: gastoData.fecha,
        categoria_sugerida: gastoData.categoria_sugerida,
        categoria_manual: gastoData.categoria_manual,
        notas: gastoData.notas || null,
        tiempo_registro: gastoData.tiempo_registro || 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async obtenerPorUsuario(usuarioId, filtros = {}) {
    let query = supabase
      .from('gastos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('fecha', { ascending: false });

    if (filtros.categoria && filtros.categoria !== 'Todas') {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.fechaInicio) {
      query = query.gte('fecha', filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      query = query.lte('fecha', filtros.fechaFin);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  static async obtenerPorId(id, usuarioId) {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', usuarioId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async actualizar(id, usuarioId, gastoData) {
    const updateData = {
      descripcion: gastoData.descripcion,
      monto: gastoData.monto,
      categoria: gastoData.categoria,
      fecha: gastoData.fecha,
      notas: gastoData.notas,
      updated_at: new Date().toISOString()
    };

    if (gastoData.categoria_manual !== undefined) {
      updateData.categoria_manual = gastoData.categoria_manual;
    }

    const { data, error } = await supabase
      .from('gastos')
      .update(updateData)
      .eq('id', id)
      .eq('usuario_id', usuarioId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async eliminar(id, usuarioId) {
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuarioId);
    
    if (error) throw error;
    return true;
  }

  static async obtenerResumenPorCategoria(usuarioId, mes, anio) {
    const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gastos')
      .select('categoria, monto')
      .eq('usuario_id', usuarioId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw error;

    const resumen = {};
    data.forEach(gasto => {
      if (!resumen[gasto.categoria]) {
        resumen[gasto.categoria] = 0;
      }
      resumen[gasto.categoria] += parseFloat(gasto.monto);
    });

    return resumen;
  }

  static async obtenerTotalMensual(usuarioId, mes, anio) {
    const fechaInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`;
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gastos')
      .select('monto')
      .eq('usuario_id', usuarioId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);
    
    if (error) throw error;

    return data.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
  }

  static sugerirCategoria(descripcion) {
    return categorizador.categorizar(descripcion);
  }

  static obtenerSugerencias(descripcion) {
    return categorizador.sugerirCategorias(descripcion);
  }
}

module.exports = Gasto;