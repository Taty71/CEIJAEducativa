import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, calcularPorcentaje, crearControlPaginas } from './utils';

// ===== ESTADO DE INSCRIPCIONES ESTUDIANTILES PDF =====
export const generarAnalisisRendimiento = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const analisis = analizarEstadoInscripciones(estudiantes, modalidadSeleccionada);

    const doc = new jsPDF();
    const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);
    let yPos = crearEncabezadoInstitucional(doc, 'Distribución Cuantitativa de Estudiantes por Estado de Actividad');

    // ===== INFORMACIÓN GENERAL =====
    yPos = verificarEspacio(doc, yPos, 40); // Espacio para la sección de información general
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('INFORMACION GENERAL'), 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de estudiantes: ${analisis.total}`, 20, yPos);
    yPos += 6;
    doc.text(`Modalidad analizada: ${modalidadSeleccionada.toUpperCase()}`, 20, yPos);
    yPos += 6;
    doc.text(`Ano lectivo: ${analisis.anioLectivo}`, 20, yPos);
    yPos += 15;

    // ===== RESUMEN DE ESTADOS =====
    yPos = verificarEspacio(doc, yPos, 60); // Espacio para la tabla de resumen
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('RESUMEN DE ESTADOS'), 14, yPos);
    yPos += 15;

    const resumenData = [
      ['Estudiantes activos', analisis.activos.toString(), `${analisis.porcentajeActivos}%`],
      ['Estudiantes inactivos', analisis.inactivos.toString(), `${analisis.porcentajeInactivos}%`]
    ];

    autoTable(doc, {
      head: [['Estado', 'Cantidad', 'Porcentaje']],
      body: resumenData,
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

    // ===== DESGLOSE POR MODALIDAD =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la sección de desglose

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('DESGLOSE POR MODALIDAD'), 14, yPos);
    yPos += 15;

    const modalidadData = Object.entries(analisis.desglosePorModalidad).map(([modalidad, datos]) => [
      modalidad || 'Sin modalidad',
      datos.total.toString(),
      datos.activos.toString(),
      `${datos.porcentajeActivos}%`,
      datos.inactivos.toString(),
      `${datos.porcentajeInactivos}%`
    ]);

    autoTable(doc, {
      head: [['Modalidad', 'Total', 'Activos', '%', 'Inactivos', '%']],
      body: modalidadData,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: [45, 65, 119],
        textColor: 255,
        fontSize: 10,
        font: 'helvetica',
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        font: 'helvetica'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ===== NOTAS ACLARATORIAS =====
    yPos = verificarEspacio(doc, yPos, 50); // Espacio para las notas

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('DEFINICIONES'), 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const notas = [
      `Estudiante ACTIVO: Estudiante con inscripcion vigente en el ano lectivo ${analisis.anioLectivo}`,
      'Estudiante INACTIVO: Estudiante sin inscripcion en el ano lectivo actual'
    ];

    notas.forEach(nota => {
      const textoNota = normalizarTexto(`• ${nota}`);
      const lineasTexto = doc.splitTextToSize(textoNota, 160);
      doc.text(lineasTexto, 20, yPos);
      yPos += lineasTexto.length * 5 + 3;
    });

    // Agregar pie de página antes de guardar
    agregarPiePagina();

    // Guardar el PDF
    doc.save(`Estado_Inscripciones_Estudiantiles_${new Date().toISOString().split('T')[0]}.pdf`);
    if (showAlerta) showAlerta('Estado de inscripciones estudiantiles PDF generado exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar estado de inscripciones estudiantiles:', error);
    if (showAlerta) showAlerta('Error al generar estado de inscripciones estudiantiles: ' + error.message, 'error');
  }
};

// ===== ESTADO PORCENTUAL INSCRIPCIONES ACTIVAS-INACTIVAS EXCEL =====
// ===== ESTADO PORCENTUAL INSCRIPCIONES ACTIVAS-INACTIVAS EXCEL =====
export const generarAnalisisRendimientoExcel = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const analisis = analizarEstadoInscripciones(estudiantes, modalidadSeleccionada);

    // MATRIZ DE DOBLE ENTRADA (INSTITUCIONAL)
    // Filas: Modalidades + Total
    // Columnas: Total Alumnos, Activos (Cant, %), Inactivos (Cant, %)

    const headers = [
      'Modalidad',
      'Total Alumnos',
      'Activos (Cant)', 'Activos (%)',
      'Inactivos (Cant)', 'Inactivos (%)'
    ];

    const matrixData = [];

    if (analisis.desglosePorModalidad) {
      Object.entries(analisis.desglosePorModalidad).forEach(([modName, datos]) => {
        matrixData.push([
          modName.toUpperCase(),
          datos.total,
          datos.activos, `${datos.porcentajeActivos}%`,
          datos.inactivos, `${datos.porcentajeInactivos}%`
        ]);
      });
    }

    // Fila Total
    matrixData.push([
      'TOTAL GENERAL',
      analisis.total,
      analisis.activos, `${analisis.porcentajeActivos}%`,
      analisis.inactivos, `${analisis.porcentajeInactivos}%`
    ]);

    const datosFinales = [
      headers,
      ...matrixData
    ];

    const extraHeaderRows = [];
    const customMerges = [];

    // Agregar NOTAS / ANÁLISIS
    datosFinales.push(['']);

    const analysisTitleIndex = datosFinales.length;
    extraHeaderRows.push(analysisTitleIndex);
    datosFinales.push(['═══ ANÁLISIS DE DATOS ═══']);

    // Merge Título Sección A-D (0-3)
    const titleRowExcelIndex = analysisTitleIndex + 6;
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

    // Definiciones estáticas (como en el PDF)
    const notas = [
      `Estudiante ACTIVO: Estudiante con inscripcion vigente en el ano lectivo ${analisis.anioLectivo}`,
      'Estudiante INACTIVO: Estudiante sin inscripcion en el ano lectivo actual'
    ];

    // Podríamos agregar algo dinámico si hubiera
    if (analisis.porcentajeInactivos > 50) {
      notas.push(`ALERTA: El porcentaje de inactivos (${analisis.porcentajeInactivos}%) es alto. Se sugiere revisar.`);
    }

    notas.forEach((nota, index) => {
      const currentRowIndex = datosFinales.length;
      const excelRowIndex = currentRowIndex + 6;
      datosFinales.push([index + 1, nota, '', '']);

      customMerges.push({
        s: { r: excelRowIndex, c: 1 },
        e: { r: excelRowIndex, c: 3 } // Merge cols B-D (1-3)
      });
    });

    const exito = exportarExcel(
      datosFinales,
      'Estado_Inscripciones_Estudiantiles',
      'ESTADO PORCENTUAL INSCRIPCIONES ACTIVAS-INACTIVAS',
      extraHeaderRows,
      customMerges
    );

    if (exito) {
      showAlerta('Estado porcentual inscripciones Excel generado exitosamente', 'success');
    } else {
      showAlerta('Error al generar estado porcentual inscripciones Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar estado porcentual inscripciones Excel:', error);
    showAlerta('Error al generar estado porcentual inscripciones Excel: ' + error.message, 'error');
  }
};

// ===== FUNCIÓN AUXILIAR PARA ANÁLISIS DE ESTADO DE INSCRIPCIONES =====
// ===== FUNCIÓN AUXILIAR PARA ANÁLISIS DE ESTADO DE INSCRIPCIONES =====
const analizarEstadoInscripciones = (estudiantes, modalidadSeleccionada) => {
  // Filtrar estudiantes por modalidad si es necesario
  let estudiantesFiltrados = estudiantes;
  if (modalidadSeleccionada !== 'todas') {
    estudiantesFiltrados = estudiantes.filter(est =>
      est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
    );
  }

  const total = estudiantesFiltrados.length;
  const anioActual = new Date().getFullYear();
  const desglosePorModalidad = {};

  let activos = 0;
  let inactivos = 0;

  // Funciones robustas para detectar estado
  const esActivo = (valor) => valor === true || valor === 1 || valor === '1' || valor === 'true';
  const esInactivo = (valor) => valor === false || valor === 0 || valor === '0' || valor === 'false';

  // Analizar cada estudiante
  estudiantesFiltrados.forEach(estudiante => {
    const modalidad = estudiante.modalidad || 'Sin modalidad';
    // Inicializar desglose por modalidad si no existe
    if (!desglosePorModalidad[modalidad]) {
      desglosePorModalidad[modalidad] = {
        total: 0,
        activos: 0,
        inactivos: 0
      };
    }
    desglosePorModalidad[modalidad].total++;
    if (esActivo(estudiante.activo)) {
      activos++;
      desglosePorModalidad[modalidad].activos++;
    } else if (esInactivo(estudiante.activo)) {
      inactivos++;
      desglosePorModalidad[modalidad].inactivos++;
    }
  });

  // Calcular porcentajes por modalidad
  Object.keys(desglosePorModalidad).forEach(modalidad => {
    const datos = desglosePorModalidad[modalidad];
    datos.porcentajeActivos = ((datos.activos / datos.total) * 100).toFixed(1);
    datos.porcentajeInactivos = ((datos.inactivos / datos.total) * 100).toFixed(1);
  });

  // Calcular porcentajes generales
  const porcentajeActivos = ((activos / total) * 100).toFixed(1);
  const porcentajeInactivos = ((inactivos / total) * 100).toFixed(1);

  return {
    total,
    activos,
    inactivos,
    porcentajeActivos,
    porcentajeInactivos,
    desglosePorModalidad,
    anioLectivo: anioActual
  };
};