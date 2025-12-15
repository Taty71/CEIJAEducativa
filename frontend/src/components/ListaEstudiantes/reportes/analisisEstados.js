import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { analizarEstados } from '../../Dashboard/ReportesVisualizacionService';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, crearControlPaginas } from './utils';

// ===== DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES PDF =====
export const generarAnalisisEstados = (estudiantes, showAlerta) => {
  try {
    const analisis = analizarEstados(estudiantes);

    const doc = new jsPDF();
    const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);
    let yPos = crearEncabezadoInstitucional(doc, 'DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES');

    // Título del reporte (Centrado, Tamaño 13, 2 líneas de separación del encabezado)
    yPos += 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES'), doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 8;

    // ===== RESUMEN GENERAL =====
    yPos = verificarEspacio(doc, yPos, 40); // Espacio para el resumen general
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('RESUMEN GENERAL'), 14, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de inscripciones analizadas: ${analisis.resumen.total}`, 20, yPos);
    yPos += 6;
    doc.text(`Estados diferentes encontrados: ${analisis.resumen.estados}`, 20, yPos);
    yPos += 6;
    doc.text(`Fecha de análisis: ${analisis.resumen.fechaAnalisis}`, 20, yPos);
    yPos += 15;

    // ===== MÉTRICAS CLAVE =====
    yPos = verificarEspacio(doc, yPos, 60); // Espacio para las métricas clave
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('METRICAS CLAVE'), 14, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Estado más frecuente: ${analisis.metricas.estadoMasFrecuente}`, 20, yPos);
    yPos += 6;
    doc.text(`Tasa de inscripciones completas: ${analisis.metricas.tasaAprobacion}%`, 20, yPos);
    yPos += 6;
    doc.text(`Tasa de inscripciones pendientes: ${analisis.metricas.tasaPendientes}%`, 20, yPos);
    yPos += 6;

    // Calcular y mostrar inscripciones anuladas si existen
    const estadoAnulado = analisis.distribucion.find(d => d.estado && d.estado.toLowerCase().includes('anulad'));
    if (estadoAnulado) {
      doc.text(`Tasa de inscripciones anuladas: ${estadoAnulado.porcentaje}%`, 20, yPos);
      yPos += 6;
    }
    yPos += 10;

    // ===== DISTRIBUCIÓN DETALLADA POR ESTADO =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la distribución detallada

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('DISTRIBUCION POR ESTADO'), 14, yPos);
    yPos += 10;

    // Crear tabla con los datos de distribución
    const tableData = analisis.distribucion.map(estado => [
      estado.estado,
      estado.cantidad.toString(),
      `${estado.porcentaje}%`,
      estado.estudiantes.slice(0, 3).map(e => e.nombre).join(', ') + (estado.estudiantes.length > 3 ? '...' : '')
    ]);

    autoTable(doc, {
      head: [['Estado', 'Cantidad', 'Porcentaje', 'Ejemplos de Estudiantes']],
      body: tableData,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: [45, 65, 119],
        textColor: 255,
        fontSize: 11,
        font: 'helvetica',
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 11,
        font: 'helvetica'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 80 }
      },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ===== DISTRIBUCIÓN POR MODALIDAD =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la distribución por modalidad
    if (analisis.distribucionPorModalidad && Object.keys(analisis.distribucionPorModalidad).length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DESGLOSE POR MODALIDAD'), 14, yPos);
      yPos += 10;

      // Crear tabla con desglose por modalidad
      const modalidadData = Object.entries(analisis.distribucionPorModalidad).map(([modalidad, datos]) => [
        modalidad || 'Sin modalidad',
        datos.total.toString(),
        datos.completas.toString(),
        `${datos.porcentajeCompletas}%`,
        datos.pendientes.toString(),
        `${datos.porcentajePendientes}%`,
        datos.anuladas.toString(),
        `${datos.porcentajeAnuladas}%`
      ]);

      autoTable(doc, {
        head: [['Modalidad', 'Total', 'Completas', '%', 'Pendientes', '%', 'Anuladas', '%']],
        body: modalidadData,
        startY: yPos,
        theme: 'striped',
        headStyles: {
          fillColor: [45, 65, 119],
          textColor: 255,
          fontSize: 11,
          font: 'helvetica',
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 11,
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // ===== ALERTAS Y RECOMENDACIONES =====
    yPos = verificarEspacio(doc, yPos, 50); // Espacio para alertas y recomendaciones
    if (analisis.metricas.alertas.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('ALERTAS Y RECOMENDACIONES'), 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      analisis.metricas.alertas.forEach(alerta => {
        const textoAlerta = normalizarTexto(`• ${alerta.mensaje}`);
        const lineasTexto = doc.splitTextToSize(textoAlerta, 160);
        doc.text(lineasTexto, 20, yPos);
        yPos += lineasTexto.length * 6 + 3;
      });
    }

    // Agregar pie de página antes de guardar
    agregarPiePagina();

    // Guardar el PDF
    doc.save(`Determinacion_Porcentual_Inscripciones_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlerta('Determinación porcentual de inscripciones PDF generado exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar determinación porcentual de inscripciones:', error);
    showAlerta('Error al generar determinación porcentual de inscripciones: ' + error.message, 'error');
  }
};

// ===== DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES EXCEL =====
// ===== DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES EXCEL =====
export const generarAnalisisEstadosExcel = (estudiantes, showAlerta) => {
  try {
    const analisis = analizarEstados(estudiantes);

    // Preparar la MATRIZ DE DOBLE ENTRADA
    // Filas: Modalidades (Presencial, Semipresencial, Total)
    // Columnas: Métricas por Estado (Inscriptos, Completas, Pendientes, Anuladas)

    const modalidades = ['PRESENCIAL', 'SEMIPRESENCIAL'];

    // Encabezados de la tabla matriz
    const headers = [
      'Modalidad',
      'Total Inscriptos',
      'Completas (Cant)', 'Completas (%)',
      'Pendientes (Cant)', 'Pendientes (%)',
      'Anuladas (Cant)', 'Anuladas (%)'
    ];

    const matrixData = [];

    // Llenar datos por cada modalidad
    if (analisis.distribucionPorModalidad) {
      modalidades.forEach(mod => {
        const dataMod = analisis.distribucionPorModalidad[mod] || {
          total: 0, completas: 0, porcentajeCompletas: '0.0',
          pendientes: 0, porcentajePendientes: '0.0',
          anuladas: 0, porcentajeAnuladas: '0.0'
        };

        matrixData.push([
          mod,
          dataMod.total,
          dataMod.completas, `${dataMod.porcentajeCompletas}%`,
          dataMod.pendientes, `${dataMod.porcentajePendientes}%`,
          dataMod.anuladas, `${dataMod.porcentajeAnuladas}%`
        ]);
      });
    }

    // Agregar Fila de TOTAL GENERAL (Resumen)
    const resumen = analisis.resumen || {};
    // Para el total, necesitamos sumar los contadores o usar los generales si coinciden
    // Usaremos los datos generales del análisis para la fila "TOTAL"

    // Recalcular métricas globales si no están explícitas en formato plano
    let totalCompletas = 0;
    let totalPendientes = 0;
    let totalAnuladas = 0;

    if (analisis.distribucionPorModalidad) {
      Object.values(analisis.distribucionPorModalidad).forEach(d => {
        totalCompletas += d.completas;
        totalPendientes += d.pendientes;
        totalAnuladas += d.anuladas;
      });
    }

    const pctCompletas = ((totalCompletas / resumen.total) * 100).toFixed(1);
    const pctPendientes = ((totalPendientes / resumen.total) * 100).toFixed(1);
    const pctAnuladas = ((totalAnuladas / resumen.total) * 100).toFixed(1);

    matrixData.push([
      'TOTAL GENERAL',
      resumen.total,
      totalCompletas, `${pctCompletas}%`,
      totalPendientes, `${pctPendientes}%`,
      totalAnuladas, `${pctAnuladas}%`
    ]);

    // Combinar todo para exportar
    // La función exportarExcel espera los datos empezando con los encabezados de la tabla
    const datosFinales = [
      headers,
      ...matrixData
    ];

    const extraHeaderRows = [];
    const customMerges = [];

    // Agregar SECCIÓN DE SUGERENCIAS / ANÁLISIS
    datosFinales.push(['']); // Espacio

    const sugerenciasTitleIndex = datosFinales.length;
    extraHeaderRows.push(sugerenciasTitleIndex);
    datosFinales.push(['═══ ANÁLISIS DE DATOS ═══']);

    // Merge del Título de Sección A-D (0-3)
    const titleRowExcelIndex = sugerenciasTitleIndex + 6;
    customMerges.push({
      s: { r: titleRowExcelIndex, c: 0 },
      e: { r: titleRowExcelIndex, c: 3 }
    });

    const obsHeaderIndex = datosFinales.length;
    extraHeaderRows.push(obsHeaderIndex);
    datosFinales.push(['#', 'Detalle', '', '']);

    // Merge Header Row ("Detalle") B-D (1-3)
    const headerRowExcelIndex = obsHeaderIndex + 6;
    customMerges.push({
      s: { r: headerRowExcelIndex, c: 1 },
      e: { r: headerRowExcelIndex, c: 3 }
    });

    if (analisis.metricas && analisis.metricas.alertas && analisis.metricas.alertas.length > 0) {
      analisis.metricas.alertas.forEach((alerta, index) => {
        const currentRowIndex = datosFinales.length;
        const excelRowIndex = currentRowIndex + 6; // +6 offset por headers institucionales
        datosFinales.push([index + 1, alerta.mensaje, '', '']);

        // Merge cols B-D (1-3)
        customMerges.push({
          s: { r: excelRowIndex, c: 1 },
          e: { r: excelRowIndex, c: 3 }
        });
      });
    } else {
      const currentRowIndex = datosFinales.length;
      const excelRowIndex = currentRowIndex + 6;
      datosFinales.push(['-', 'No hay alertas críticas detectadas.', '', '']);
      // Merge cols B-D (1-3)
      customMerges.push({
        s: { r: excelRowIndex, c: 1 },
        e: { r: excelRowIndex, c: 3 }
      });
    }

    const exito = exportarExcel(datosFinales, 'Determinacion_Porcentual_Inscripciones', 'DETERMINACIÓN PORCENTUAL DE INSCRIPCIONES', extraHeaderRows, customMerges);

    if (exito) {
      showAlerta('Determinación porcentual de inscripciones Excel generada exitosamente', 'success');
    } else {
      showAlerta('Error al generar determinación porcentual de inscripciones Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar determinación porcentual de inscripciones Excel:', error);
    showAlerta('Error al generar determinación porcentual de inscripciones Excel: ' + error.message, 'error');
  }
};