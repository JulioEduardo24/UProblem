const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

class Auth {
  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        fecha_nacimiento: userData.fecha_nacimiento,
        sexo: userData.sexo,
        usuario: userData.usuario,
        correo: userData.correo,
        password: hashedPassword,
        tipo_documento: userData.tipo_documento,
        numero_documento: userData.numero_documento,
        telefono: userData.telefono
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmailOrUsername(identifier) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .or(`correo.eq.${identifier},usuario.eq.${identifier}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByUsername(username) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByDocument(numero_documento) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('numero_documento', numero_documento)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos, fecha_nacimiento, sexo, usuario, correo, tipo_documento, numero_documento, telefono, tema_preferido, fecha_registro')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateTheme(userId, theme) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        tema_preferido: theme,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }
  static async actualizarPerfil(userId, datos) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        correo: datos.correo,
        telefono: datos.telefono,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarPassword(userId, hashPassword) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        password: hashPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }

  static async findByIdWithPassword(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Auth;