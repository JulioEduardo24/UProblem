const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class Exportador {

  /**
   * Exportar gastos a PDF
   */
  static async exportarPDF(usuario, gastos, resumen, mes, anio, progresoPresupuesto = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        const bold = 'Helvetica-Bold';
        const normal = 'Helvetica';

        // ENCABEZADO
        doc.fontSize(24).font(bold).text('UProblem', { align: 'center' });
        doc.fontSize(12).font(normal).text('Reporte de Gastos Personales', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // INFORMACIÓN DEL USUARIO
        const infoStartY = doc.y;

        doc.fontSize(10).font(bold).text('Usuario:', 50, infoStartY);
        doc.font(normal).text(`${usuario.nombres} ${usuario.apellidos}`, 180, infoStartY);

        doc.font(bold).text('Periodo:', 50, infoStartY + 20);
        doc.font(normal).text(`${this.obtenerNombreMes(mes)} ${anio}`, 180, infoStartY + 20);

        doc.font(bold).text('Fecha de reporte:', 50, infoStartY + 40);
        doc.font(normal).text(new Date().toLocaleDateString('es-PE'), 180, infoStartY + 40);

        doc.moveDown(4);

        // RESUMEN GENERAL
        doc.fontSize(14).font(bold).text('Resumen General', 50, doc.y);
        doc.moveDown(0.5);

        const totalGastado = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        const startY = doc.y;
        doc.fontSize(10);

        doc.rect(50, startY, 495, 80).fillAndStroke('#f5f5f5', '#e0e0e0');
        doc.fillColor('#000000');
        doc.font(bold).text('Total Gastado:', 70, startY + 15);
        doc.font(normal).text(`S/ ${totalGastado.toFixed(2)}`, 200, startY + 15);

        if (progresoPresupuesto) {
          doc.font(bold).text('Presupuesto:', 70, startY + 35);
          doc.font(normal).text(`S/ ${progresoPresupuesto.totalPresupuesto.toFixed(2)}`, 200, startY + 35);
          doc.font(bold).text('Restante:', 70, startY + 55);
          const color = progresoPresupuesto.restante >= 0 ? '#16a34a' : '#c53030';
          doc.fillColor(color).font(normal).text(`S/ ${progresoPresupuesto.restante.toFixed(2)}`, 200, startY + 55);
          doc.fillColor('#000000');
        }

        doc.font(bold).text('Total de gastos:', 320, startY + 15);
        doc.font(normal).text(gastos.length.toString(), 450, startY + 15);
        doc.moveDown(6);

        // GASTOS POR CATEGORÍA
        doc.fontSize(14).font(bold).text('Gastos por Categoría', 50, doc.y);
        doc.moveDown(0.5);

        const categorias = Object.keys(resumen).sort((a, b) => resumen[b] - resumen[a]);
        categorias.forEach((cat) => {
          const monto = resumen[cat];
          const porcentaje = (monto / totalGastado) * 100;
          doc.fontSize(10);
          doc.font(normal).text(`${cat}:`, 70, doc.y);
          doc.text(`S/ ${monto.toFixed(2)}`, 250, doc.y - 10);
          doc.text(`${porcentaje.toFixed(1)}%`, 350, doc.y - 10);
          const barWidth = 150;
          const fillWidth = (monto / totalGastado) * barWidth;
          doc.rect(400, doc.y - 12, barWidth, 10).stroke('#e0e0e0');
          doc.rect(400, doc.y - 12, fillWidth, 10).fill(this.obtenerColorCategoria(cat));
          doc.moveDown(0.8);
        });

        doc.moveDown(2);

        // DETALLE DE GASTOS
        doc.addPage();
        doc.fontSize(14).font(bold).text('Detalle de Gastos', 50, 50);
        doc.moveDown();

        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 150;
        const col3X = 280;
        const col4X = 400;

        doc.fontSize(9).font(bold);
        doc.rect(col1X, tableTop, 495, 20).fillAndStroke('#1a1a1a', '#1a1a1a');
        doc.fillColor('#ffffff');
        doc.text('Fecha', col1X + 5, tableTop + 6);
        doc.text('Descripción', col2X + 5, tableTop + 6);
        doc.text('Categoría', col3X + 5, tableTop + 6);
        doc.text('Monto', col4X + 5, tableTop + 6);
        doc.fillColor('#000000');

        let currentY = tableTop + 25;
        doc.fontSize(8).font(normal);

        gastos.slice(0, 50).forEach((gasto, index) => {
          if (index % 2 === 0) {
            doc.rect(col1X, currentY - 3, 495, 18).fill('#f9f9f9');
          }
          doc.fillColor('#000000');
          doc.text(new Date(gasto.fecha).toLocaleDateString('es-PE'), col1X + 5, currentY);
          doc.text(this.truncarTexto(gasto.descripcion, 25), col2X + 5, currentY);
          doc.text(this.truncarTexto(gasto.categoria, 18), col3X + 5, currentY);
          doc.text(`S/ ${parseFloat(gasto.monto).toFixed(2)}`, col4X + 5, currentY);
          currentY += 18;
          if (currentY > 750) {
            doc.addPage();
            currentY = 50;
          }
        });

        if (gastos.length > 50) {
          doc.moveDown(2);
          doc.fontSize(9).font('Helvetica-Oblique').text(`... y ${gastos.length - 50} gastos más`, { align: 'center' });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Exportar gastos a Excel
   */
  static async exportarExcel(usuario, gastos, resumen, mes, anio, progresoPresupuesto = null) {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'UProblem';
    workbook.created = new Date();

    // HOJA 1: RESUMEN
    const resumenSheet = workbook.addWorksheet('Resumen');

    // Estilos
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };

    const titleStyle = {
      font: { bold: true, size: 16 },
      alignment: { vertical: 'middle', horizontal: 'left' }
    };

    // Título
    resumenSheet.mergeCells('A1:E1');
    resumenSheet.getCell('A1').value = 'UProblem - Reporte de Gastos';
    resumenSheet.getCell('A1').style = titleStyle;
    resumenSheet.getRow(1).height = 25;

    resumenSheet.addRow([]);

    // Información del usuario
    resumenSheet.addRow(['Usuario:', `${usuario.nombres} ${usuario.apellidos}`]);
    resumenSheet.addRow(['Periodo:', `${this.obtenerNombreMes(mes)} ${anio}`]);
    resumenSheet.addRow(['Fecha de reporte:', new Date().toLocaleDateString('es-PE')]);
    resumenSheet.addRow([]);

    // Resumen general
    const totalGastado = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

    resumenSheet.addRow(['RESUMEN GENERAL']).font = { bold: true, size: 14 };
    resumenSheet.addRow([]);

    resumenSheet.addRow(['Total Gastado:', totalGastado.toFixed(2)]);
    if (progresoPresupuesto) {
      resumenSheet.addRow(['Presupuesto:', progresoPresupuesto.totalPresupuesto.toFixed(2)]);
      resumenSheet.addRow(['Restante:', progresoPresupuesto.restante.toFixed(2)]);
    }
    resumenSheet.addRow(['Total de gastos:', gastos.length]);
    resumenSheet.addRow([]);

    // Gastos por categoría
    resumenSheet.addRow(['GASTOS POR CATEGORÍA']).font = { bold: true, size: 14 };
    resumenSheet.addRow([]);

    const catHeaderRow = resumenSheet.addRow(['Categoría', 'Monto', 'Porcentaje']);
    catHeaderRow.eachCell(cell => { cell.style = headerStyle; });

    Object.entries(resumen).sort((a, b) => b[1] - a[1]).forEach(([cat, monto]) => {
      const porcentaje = (monto / totalGastado) * 100;
      resumenSheet.addRow([cat, monto.toFixed(2), `${porcentaje.toFixed(1)}%`]);
    });

    // Ajustar anchos
    resumenSheet.getColumn(1).width = 30;
    resumenSheet.getColumn(2).width = 15;
    resumenSheet.getColumn(3).width = 15;

    // HOJA 2: DETALLE DE GASTOS
    const detalleSheet = workbook.addWorksheet('Detalle de Gastos');

    const detHeaderRow = detalleSheet.addRow(['Fecha', 'Descripción', 'Categoría', 'Monto', 'Notas']);
    detHeaderRow.eachCell(cell => { cell.style = headerStyle; });

    gastos.forEach(gasto => {
      detalleSheet.addRow([
        new Date(gasto.fecha).toLocaleDateString('es-PE'),
        gasto.descripcion,
        gasto.categoria,
        parseFloat(gasto.monto).toFixed(2),
        gasto.notas || ''
      ]);
    });

    // Ajustar anchos
    detalleSheet.getColumn(1).width = 15;
    detalleSheet.getColumn(2).width = 35;
    detalleSheet.getColumn(3).width = 25;
    detalleSheet.getColumn(4).width = 12;
    detalleSheet.getColumn(5).width = 40;

    // Formatear columna de montos
    detalleSheet.getColumn(4).numFmt = '"S/ "0.00';

    // HOJA 3: GRÁFICOS (datos para gráficos)
    if (progresoPresupuesto && progresoPresupuesto.categorias) {
      const graficosSheet = workbook.addWorksheet('Datos Gráficos');

      const grafHeaderRow = graficosSheet.addRow(['Categoría', 'Gastado', 'Presupuesto', '% Usado']);
      grafHeaderRow.eachCell(cell => { cell.style = headerStyle; });

      progresoPresupuesto.categorias.forEach(cat => {
        graficosSheet.addRow([
          cat.categoria,
          cat.gastado.toFixed(2),
          cat.presupuesto.toFixed(2),
          cat.porcentajeGastado.toFixed(1)
        ]);
      });

      graficosSheet.getColumn(1).width = 25;
      graficosSheet.getColumn(2).width = 15;
      graficosSheet.getColumn(3).width = 15;
      graficosSheet.getColumn(4).width = 12;
    }

    return await workbook.xlsx.writeBuffer();
  }

  // Métodos auxiliares
  static obtenerNombreMes(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  }

  static truncarTexto(texto, maxLength) {
    if (!texto) return '';
    return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
  }

  static obtenerColorCategoria(categoria) {
    const colores = {
      'Alimentación': '#10b981',
      'Transporte': '#3b82f6',
      'Vivienda': '#f59e0b',
      'Salud': '#ec4899',
      'Entretenimiento': '#8b5cf6',
      'Educación': '#06b6d4',
      'Ropa y Cuidado Personal': '#f43f5e',
      'Otros': '#6b7280'
    };
    return colores[categoria] || '#6b7280';
  }
}

module.exports = Exportador;