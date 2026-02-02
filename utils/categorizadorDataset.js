const trainingData = {
  'Alimentación': [
    'metro', 'wong', 'tottus', 'plaza vea', 'vivanda', 'makro', 'mass',
    'supermercado', 'mercado', 'bodega', 'panaderia', 'panadería',
    'restaurante', 'restaurant', 'comida', 'almuerzo', 'desayuno', 'cena',
    'mcdonalds', 'kfc', 'bembos', 'popeyes', 'pizza hut', 'dominos',
    'starbucks', 'cafe', 'cafeteria', 'cafetería', 'subway', 'chifa',
    'polleria', 'pollería', 'cevicheria', 'cevichería', 'chifa',
    'rappi', 'uber eats', 'pedidos ya', 'delivery', 'comida rapida',
    'verduras', 'frutas', 'carne', 'pollo', 'pescado', 'arroz',
    'pan', 'leche', 'huevos', 'agua', 'gaseosa', 'jugo',
    'tambo', 'listo', 'repshop', 'oxxo', 'kasnet'
  ],

  'Transporte': [
    'uber', 'cabify', 'beat', 'taxi', 'mototaxi', 'colectivo',
    'gasolina', 'combustible', 'grifo', 'petroleo', 'gas',
    'peaje', 'estacionamiento', 'cochera', 'parking',
    'bus', 'micro', 'combi', 'metropolitano', 'corredor',
    'tren', 'metro', 'linea 1', 'linea 2',
    'mantenimiento auto', 'mecanico', 'mecánico', 'llanta',
    'lavado auto', 'lubricante', 'aceite', 'repuesto',
    'pasaje', 'transporte', 'movilidad', 'viaje',
    'avianca', 'latam', 'viva air', 'vuelo', 'avion', 'avión'
  ],

  'Vivienda': [
    'alquiler', 'renta', 'arrendamiento', 'inmobiliaria',
    'luz', 'electricidad', 'entel', 'edelnor', 'luz del sur',
    'agua', 'sedapal', 'sedalib', 'sedapar',
    'internet', 'movistar', 'claro', 'entel', 'wifi',
    'cable', 'directv', 'movistar tv', 'claro tv',
    'telefono', 'teléfono', 'celular', 'recarga',
    'gas', 'balon', 'balón', 'lima gas', 'solgas',
    'mantenimiento', 'condominio', 'arbitra', 'arbitrios',
    'limpieza', 'jardineria', 'jardinería', 'pintura',
    'reparacion', 'reparación', 'plomero', 'electricista',
    'muebles', 'colchon', 'colchón', 'sofa', 'sofá'
  ],

  'Salud': [
    'farmacia', 'botica', 'inkafarma', 'mifarma', 'fasa',
    'medicina', 'medicamento', 'pastilla', 'jarabe', 'antibiotico',
    'doctor', 'medico', 'médico', 'consulta', 'cita',
    'clinica', 'clínica', 'hospital', 'posta', 'centro medico',
    'analisis', 'análisis', 'laboratorio', 'examen', 'radiografia',
    'dentista', 'odontologo', 'odontólogo', 'ortodoncia',
    'psicólogo', 'psicologo', 'terapia', 'psiquiatra',
    'seguro', 'eps', 'pacifico', 'rimac', 'sanitas',
    'vacuna', 'inyeccion', 'inyección', 'suero',
    'lentes', 'optica', 'óptica', 'oftalmólogo'
  ],

  'Entretenimiento': [
    'netflix', 'spotify', 'youtube', 'prime video', 'disney',
    'hbo', 'apple', 'crunchyroll', 'paramount',
    'cine', 'cineplanet', 'cinemark', 'cinepolis', 'movie',
    'teatro', 'obra', 'concierto', 'show', 'evento',
    'bar', 'discoteca', 'disco', 'club', 'pub',
    'gym', 'gimnasio', 'fitness', 'bodytech', 'smart fit',
    'deporte', 'futbol', 'fútbol', 'natacion', 'natación',
    'parque', 'zoo', 'zoologico', 'zoológico', 'acuario',
    'videojuego', 'steam', 'playstation', 'xbox', 'nintendo',
    'suscripcion', 'suscripción', 'membresia', 'membresía'
  ],

  'Educación': [
    'universidad', 'colegio', 'instituto', 'academia',
    'pension', 'pensión', 'matricula', 'matrícula', 'mensualidad',
    'libro', 'cuaderno', 'lapicero', 'útiles', 'utiles',
    'curso', 'capacitacion', 'capacitación', 'taller', 'seminario',
    'udemy', 'coursera', 'platzi', 'crehana', 'domestika',
    'ingles', 'inglés', 'idioma', 'britanico', 'británico',
    'certificacion', 'certificación', 'examen', 'toefl', 'cambridge',
    'tutor', 'profesor', 'teacher', 'clases particulares',
    'libreria', 'librería', 'papeleria', 'papelería', 'impresion',
    'laptop', 'computadora', 'tablet', 'estudio'
  ],

  'Ropa y Cuidado Personal': [
    'ropa', 'polo', 'camisa', 'pantalon', 'pantalón', 'jean',
    'zapatilla', 'zapato', 'sandalia', 'calzado',
    'adidas', 'nike', 'puma', 'reebok', 'converse',
    'saga', 'ripley', 'paris', 'oechsle', 'falabella',
    'peluqueria', 'peluquería', 'barberia', 'barbería', 'salon',
    'corte pelo', 'tinte', 'manicure', 'pedicure', 'spa',
    'perfume', 'colonia', 'desodorante', 'shampoo', 'champu',
    'crema', 'locion', 'loción', 'maquillaje', 'cosmetico',
    'jabon', 'jabón', 'pasta dental', 'cepillo', 'gillette',
    'sephora', 'mac', 'lbel', 'esika', 'unique'
  ],

  'Otros': [
    'regalo', 'obsequio', 'presente', 'cumpleaños',
    'donacion', 'donación', 'caridad', 'ayuda',
    'prestamo', 'préstamo', 'deuda', 'pago deuda',
    'multa', 'infraccion', 'infracción', 'papeleta',
    'seguro', 'notaria', 'notaría', 'tramite', 'trámite',
    'varios', 'miscelaneo', 'misceláneo', 'otro',
    'mascota', 'veterinario', 'veterinaria', 'comida mascota',
    'juguete', 'decoracion', 'decoración', 'planta'
  ]
};

module.exports = trainingData;