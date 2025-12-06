import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, calcularPorcentaje, crearControlPaginas } from './utils';

// ===== ANÁLISIS DE DOCUMENTACIÓN PDF =====
export const generarAnalisisDocumentacion = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    // Análisis de documentación por estudiante
    const analisisDocumentacion = analizarDocumentacionEstudiantes(estudiantes);

    const doc = new jsPDF();
    const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);
    let yPos = crearEncabezadoInstitucional(doc, `ANÁLISIS DE DOCUMENTACIÓN - ${modalidadSeleccionada.toUpperCase()}`);

    // ===== INFORMACIÓN GENERAL =====
    yPos = verificarEspacio(doc, yPos, 40); // Espacio para la información general
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('INFORMACION GENERAL'), 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de estudiantes analizados: ${analisisDocumentacion.total}`, 20, yPos);
    yPos += 6;
    doc.text(`Modalidad seleccionada: ${modalidadSeleccionada}`, 20, yPos);
    yPos += 6;
    doc.text(`Fecha del análisis: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    yPos += 15;

    // ===== ESTADÍSTICAS DE DOCUMENTACIÓN =====
    yPos = verificarEspacio(doc, yPos, 50); // Espacio para las estadísticas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('ESTADISTICAS DE DOCUMENTACION'), 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Inscripciones con documentación completa: ${analisisDocumentacion.completa} (${analisisDocumentacion.porcentajeCompleta}%)`, 20, yPos);
    yPos += 6;
    doc.text(`Inscripciones con documentación incompleta: ${analisisDocumentacion.incompleta} (${analisisDocumentacion.porcentajeIncompleta}%)`, 20, yPos);
    yPos += 6;
    doc.text(`Promedio de documentos por estudiante: ${analisisDocumentacion.promedioDocumentos}`, 20, yPos);
    yPos += 15;

    // ===== DISTRIBUCIÓN POR TIPO DE DOCUMENTO =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la distribución
    if (analisisDocumentacion.tiposDocumento && Object.keys(analisisDocumentacion.tiposDocumento).length > 0) {
      // yPos ya verificado


      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DISTRIBUCION POR TIPO DE DOCUMENTO'), 14, yPos);
      yPos += 15;

      const tiposData = Object.entries(analisisDocumentacion.tiposDocumento).map(([tipo, cantidad]) => [
        tipo,
        cantidad.toString(),
        calcularPorcentaje(cantidad, analisisDocumentacion.total)
      ]);

      autoTable(doc, {
        head: [['Tipo de Documento', 'Cantidad', 'Porcentaje']],
        body: tiposData,
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
          fontSize: 10,
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // ===== DOCUMENTOS FALTANTES MÁS FRECUENTES =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para documentos faltantes
    if (analisisDocumentacion.documentosFaltantes && analisisDocumentacion.documentosFaltantes.length > 0) {
      // yPos ya verificado


      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DOCUMENTOS FALTANTES MAS FRECUENTES'), 14, yPos);
      yPos += 15;

      const faltantesData = analisisDocumentacion.documentosFaltantes.map(doc => [
        doc.tipo,
        doc.cantidad.toString(),
        calcularPorcentaje(doc.cantidad, analisisDocumentacion.incompleta)
      ]);

      autoTable(doc, {
        head: [['Tipo de Documento', 'Estudiantes Afectados', '% del Total Incompleto']],
        body: faltantesData.slice(0, 10), // Mostrar solo los 10 más frecuentes
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
          fontSize: 10,
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 50, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // ===== RECOMENDACIONES =====
    yPos = verificarEspacio(doc, yPos, 50); // Espacio para las recomendaciones
    if (analisisDocumentacion.recomendaciones && analisisDocumentacion.recomendaciones.length > 0) {
      // yPos ya verificado


      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(normalizarTexto('RECOMENDACIONES'), 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      analisisDocumentacion.recomendaciones.forEach((recomendacion, index) => {
        const texto = normalizarTexto(`${index + 1}. ${recomendacion}`);
        const lineasTexto = doc.splitTextToSize(texto, 160);
        doc.text(lineasTexto, 20, yPos);
        yPos += lineasTexto.length * 5 + 3;
      });
    }

    // Agregar pie de página antes de guardar
    agregarPiePagina();

    // Guardar el PDF
    doc.save(`Analisis_Documentacion_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlerta('Análisis de documentación PDF generado exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar análisis de documentación:', error);
    showAlerta('Error al generar análisis de documentación: ' + error.message, 'error');
  }
};

// ===== ANÁLISIS DE DOCUMENTACIÓN EXCEL =====
export const generarAnalisisDocumentacionExcel = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const analisisDocumentacion = analizarDocumentacionEstudiantes(estudiantes);

    const datos = [
      // Información general
      ['=== INFORMACIÓN GENERAL ==='],
      ['Métrica', 'Valor'],
      ['Total estudiantes', analisisDocumentacion.total],
      ['Modalidad analizada', modalidadSeleccionada],
      ['Fecha análisis', new Date().toLocaleDateString('es-ES')],
      [''],
      // Estadísticas generales
      ['=== ESTADÍSTICAS DE DOCUMENTACIÓN ==='],
      ['Métrica', 'Cantidad', 'Porcentaje'],
      ['Inscripciones con documentación completa', analisisDocumentacion.completa, analisisDocumentacion.porcentajeCompleta + '%'],
      ['Inscripciones con documentación incompleta', analisisDocumentacion.incompleta, analisisDocumentacion.porcentajeIncompleta + '%'],
      ['Promedio documentos por estudiante', analisisDocumentacion.promedioDocumentos, ''],
      [''],
      // Distribución por tipo
      ['=== DISTRIBUCIÓN POR TIPO DE DOCUMENTO ==='],
      ['Tipo de Documento', 'Cantidad', 'Porcentaje'],
      ...(analisisDocumentacion.tiposDocumento ? Object.entries(analisisDocumentacion.tiposDocumento).map(([tipo, cantidad]) => [
        tipo,
        cantidad,
        calcularPorcentaje(cantidad, analisisDocumentacion.total)
      ]) : [['Sin datos', 0, '0%']]),
      [''],
      // Documentos faltantes
      ['=== DOCUMENTOS FALTANTES MÁS FRECUENTES ==='],
      ['Tipo de Documento', 'Estudiantes Afectados', '% del Total Incompleto'],
      ...(analisisDocumentacion.documentosFaltantes ? analisisDocumentacion.documentosFaltantes.map(doc => [
        doc.tipo,
        doc.cantidad,
        calcularPorcentaje(doc.cantidad, analisisDocumentacion.incompleta)
      ]) : [['Sin datos', 0, '0%']]),
      [''],
      // Recomendaciones
      ['=== RECOMENDACIONES ==='],
      ['Número', 'Recomendación'],
      ...(analisisDocumentacion.recomendaciones ? analisisDocumentacion.recomendaciones.map((rec, index) => [
        index + 1,
        rec
      ]) : [['Sin recomendaciones', '']])
    ];

    const exito = exportarExcel(datos, 'Analisis_Documentacion', `ANÁLISIS DE DOCUMENTACIÓN - ${modalidadSeleccionada.toUpperCase()}`);

    if (exito) {
      showAlerta('Análisis de documentación Excel generado exitosamente', 'success');
    } else {
      showAlerta('Error al generar análisis de documentación Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar análisis de documentación Excel:', error);
    showAlerta('Error al generar análisis de documentación Excel: ' + error.message, 'error');
  }
};

// ===== FUNCIÓN AUXILIAR PARA ANÁLISIS DE DOCUMENTACIÓN =====
const analizarDocumentacionEstudiantes = (estudiantes) => {
  const tiposDocumento = {};
  const documentosFaltantes = {};
  let totalConCompleta = 0;
  let totalDocumentos = 0;

  const tiposDocumentosRequeridos = [
    'documento_dni',
    'documento_cuil',
    'documento_partidaNacimiento',
    'documento_analiticoParcial',
    'documento_certificadoNivelPrimario',
    'documento_fichaMedica',
    'documento_solicitudPase'
  ];

  estudiantes.forEach(estudiante => {
    let documentosCompletos = 0;
    let tieneDocumentacionCompleta = true;

    tiposDocumentosRequeridos.forEach(tipoDoc => {
      if (estudiante[tipoDoc] && estudiante[tipoDoc] !== null && estudiante[tipoDoc] !== '') {
        documentosCompletos++;
        const tipoLimpio = tipoDoc.replace('documento_', '');
        tiposDocumento[tipoLimpio] = (tiposDocumento[tipoLimpio] || 0) + 1;
      } else {
        tieneDocumentacionCompleta = false;
        const tipoLimpio = tipoDoc.replace('documento_', '');
        documentosFaltantes[tipoLimpio] = (documentosFaltantes[tipoLimpio] || 0) + 1;
      }
    });

    totalDocumentos += documentosCompletos;
    if (tieneDocumentacionCompleta) {
      totalConCompleta++;
    }
  });

  const total = estudiantes.length;
  const incompleta = total - totalConCompleta;

  // Convertir documentos faltantes a array ordenado
  const documentosFaltantesArray = Object.entries(documentosFaltantes)
    .map(([tipo, cantidad]) => ({ tipo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Generar recomendaciones
  const recomendaciones = generarRecomendacionesDocumentacion({
    total,
    completa: totalConCompleta,
    incompleta,
    documentosFaltantes: documentosFaltantesArray
  });

  return {
    total,
    completa: totalConCompleta,
    incompleta,
    porcentajeCompleta: calcularPorcentaje(totalConCompleta, total),
    porcentajeIncompleta: calcularPorcentaje(incompleta, total),
    promedioDocumentos: (totalDocumentos / total).toFixed(1),
    tiposDocumento,
    documentosFaltantes: documentosFaltantesArray,
    recomendaciones
  };
};

// ===== FUNCIÓN PARA GENERAR RECOMENDACIONES =====
const generarRecomendacionesDocumentacion = (analisis) => {
  const recomendaciones = [];

  if (analisis.incompleta > analisis.total * 0.3) {
    recomendaciones.push('Alto porcentaje de inscripciones con documentación incompleta. Implementar seguimiento automático.');
  }

  if (analisis.documentosFaltantes.length > 0) {
    const documentoMasFaltante = analisis.documentosFaltantes[0];
    recomendaciones.push(`El documento "${documentoMasFaltante.tipo}" es el más faltante (${documentoMasFaltante.cantidad} casos). Priorizar su seguimiento.`);
  }

  if (analisis.incompleta > 0) {
    recomendaciones.push('Establecer recordatorios automáticos para estudiantes con documentación pendiente.');
  }

  if (analisis.porcentajeCompleta > 80) {
    recomendaciones.push('Excelente nivel de completitud documental. Mantener los procesos actuales.');
  } else if (analisis.porcentajeCompleta < 60) {
    recomendaciones.push('Nivel crítico de completitud documental. Revisar y mejorar procesos de recolección.');
  }

  return recomendaciones;
};