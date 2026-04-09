/**
 * CONTROLLER DE EVALUACIONES - SOLO PRE-TEST
 * 
 * Versión inicial: Solo muestra datos pre-test de Dimensión 1
 * Post-test se agregará posteriormente
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Mostrar panel principal de evaluaciones
 * Ruta: GET /evaluaciones
 */
exports.mostrarPanel = async (req, res) => {
  try {
    // Cargar datos pre-test Dimensión 1
    const pretestD1 = await cargarPretestDimension1();
    
    res.render('admin/evaluados', {
      titulo: 'Evaluación Pre-test vs Post-test',
      pretestD1,
      req
    });

  } catch (error) {
    console.error('Error al cargar panel de evaluaciones:', error);
    res.status(500).send('Error al cargar evaluaciones');
  }
};

/**
 * Exportar datos pre-test en CSV
 * Ruta: GET /evaluaciones/exportar/1
 */
exports.exportarPretest = async (req, res) => {
  try {
    const pretest = await cargarPretestDimension1();
    
    // Generar CSV
    let csv = 'N°,Participante,Fecha,Tiempo Total (s),N° Transacc.,T. Promedio (s)\n';
    
    pretest.participantes.forEach(p => {
      csv += `${p.id},${p.nombre},${p.fecha},${p.tiempo_total_segundos},${p.numero_transacciones},${p.tiempo_promedio_segundos}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Dimension1_Pretest.csv"');
    res.send(csv);

  } catch (error) {
    console.error('Error al exportar datos:', error);
    res.status(500).send('Error al exportar');
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Cargar datos pre-test de Dimensión 1 desde JSON
 */
async function cargarPretestDimension1() {
  try {
    const jsonPath = path.join(__dirname, '../data/pretest_dimension1.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(jsonData);
    
    return data;
  } catch (error) {
    console.error('Error al cargar JSON pre-test:', error);
    
    // Retornar estructura vacía en caso de error
    return {
      metadata: {
        dimension: 'Dimensión 1: Eficiencia Temporal',
        fase: 'PRE-TEST',
        total_participantes: 0
      },
      participantes: [],
      estadisticas: {
        tiempo_total_promedio: 0,
        tiempo_por_transaccion_promedio: 0
      }
    };
  }
}

module.exports = exports;