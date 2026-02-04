const Auth = require('../models/Auth');
const bcrypt = require('bcryptjs');

exports.mostrarPerfil = async (req, res) => {
  try {
    const usuario = await Auth.findById(req.userId);
    
    if (!usuario) {
      return res.redirect('/auth/login');
    }

    res.render('main/perfil', {
      usuario,
      theme: usuario.tema_preferido || 'light',
      req
    });
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    res.status(500).send('Error al cargar el perfil');
  }
};

exports.actualizarPerfil = async (req, res) => {
  try {
    const { correo, telefono } = req.body;

    // Validación: correo es requerido
    if (!correo || correo.trim() === '') {
      return res.redirect('/perfil?error=correo_required');
    }

    // Validación: formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.redirect('/perfil?error=correo_invalid');
    }

    // Validación: teléfono solo números (si se proporciona)
    if (telefono && telefono.trim() !== '') {
      const telefonoRegex = /^\d+$/;
      if (!telefonoRegex.test(telefono.trim())) {
        return res.redirect('/perfil?error=telefono_invalid');
      }
    }

    // Verificar si el correo ya existe (y no es el del usuario actual)
    const usuarioExistente = await Auth.findByEmail(correo);
    if (usuarioExistente && usuarioExistente.id !== req.userId) {
      return res.redirect('/perfil?error=correo_exists');
    }

    // Actualizar usuario
    await Auth.actualizarPerfil(req.userId, {
      correo: correo.trim(),
      telefono: telefono && telefono.trim() !== '' ? telefono.trim() : null
    });

    res.redirect('/perfil?success=updated');
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.redirect('/perfil?error=server');
  }
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { password_actual, password_nueva, password_confirmacion } = req.body;

    // Validaciones
    if (!password_actual || !password_nueva || !password_confirmacion) {
      return res.redirect('/perfil?error=incomplete_password');
    }

    if (password_nueva !== password_confirmacion) {
      return res.redirect('/perfil?error=password_mismatch');
    }

    if (password_nueva.length < 6) {
      return res.redirect('/perfil?error=password_short');
    }

    // Verificar contraseña actual
    const usuario = await Auth.findByIdWithPassword(req.userId);
    const esValida = await bcrypt.compare(password_actual, usuario.password);

    if (!esValida) {
      return res.redirect('/perfil?error=wrong_password');
    }

    // Actualizar contraseña
    const hashNueva = await bcrypt.hash(password_nueva, 10);
    await Auth.actualizarPassword(req.userId, hashNueva);

    res.redirect('/perfil?success=password_changed');
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.redirect('/perfil?error=server');
  }
};