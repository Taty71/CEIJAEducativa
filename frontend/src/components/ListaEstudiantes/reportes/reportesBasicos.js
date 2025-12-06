import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, calcularPorcentaje, crearControlPaginas } from './utils';

// ===== REPORTE ESTADÍSTICO PDF =====
export const generarReporteEstadisticoPDF = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const estadisticas = calcularEstadisticasBasicas(estudiantes, modalidadSeleccionada);

    const doc = new jsPDF();
    const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);
    let yPos = crearEncabezadoInstitucional(doc, `REPORTE ESTADÍSTICO - ${modalidadSeleccionada.toUpperCase()}`);

    // ===== RESUMEN EJECUTIVO =====
    yPos = verificarEspacio(doc, yPos, 40); // Espacio para el resumen ejecutivo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('RESUMEN EJECUTIVO'), 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de inscripciones: ${estadisticas.total}`, 20, yPos);
    yPos += 6;
    doc.text(`Modalidad analizada: ${modalidadSeleccionada}`, 20, yPos);
    yPos += 6;
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    yPos += 6;
    doc.text(`Inscripciones con documentación completa: ${estadisticas.documentacionCompleta} (${estadisticas.porcentajeDocCompleta}%)`, 20, yPos);
    yPos += 15;

    // ===== DISTRIBUCIÓN POR GÉNERO =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la tabla de género
    if (estadisticas.genero && Object.keys(estadisticas.genero).length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DISTRIBUCION POR GENERO'), 14, yPos);
      yPos += 15;

      const generoData = Object.entries(estadisticas.genero).map(([genero, cantidad]) => [
        genero || 'No especificado',
        cantidad.toString(),
        calcularPorcentaje(cantidad, estadisticas.total)
      ]);

      autoTable(doc, {
        head: [['Género', 'Cantidad', 'Porcentaje']],
        body: generoData,
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
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // ===== DISTRIBUCIÓN POR EDAD =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la tabla de edad
    if (estadisticas.edades && Object.keys(estadisticas.edades).length > 0) {
      // yPos ya verificado
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DISTRIBUCION POR RANGOS DE EDAD'), 14, yPos);
      yPos += 15;

      const edadesData = Object.entries(estadisticas.edades).map(([rango, cantidad]) => [
        rango,
        cantidad.toString(),
        calcularPorcentaje(cantidad, estadisticas.total)
      ]);

      autoTable(doc, {
        head: [['Rango de Edad', 'Cantidad', 'Porcentaje']],
        body: edadesData,
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
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // ===== DISTRIBUCIÓN GEOGRÁFICA =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la distribución geográfica
    if (estadisticas.ubicaciones && Object.keys(estadisticas.ubicaciones).length > 0) {
      // yPos ya verificado
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DISTRIBUCION GEOGRAFICA'), 14, yPos);
      yPos += 15;

      const ubicacionesData = Object.entries(estadisticas.ubicaciones)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Mostrar solo las 10 principales
        .map(([ubicacion, cantidad]) => [
          ubicacion,
          cantidad.toString(),
          calcularPorcentaje(cantidad, estadisticas.total)
        ]);

      autoTable(doc, {
        head: [['Localidad/Barrio', 'Cantidad', 'Porcentaje']],
        body: ubicacionesData,
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
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Agregar pie de página antes de guardar
    agregarPiePagina();

    // Guardar el PDF
    doc.save(`Reporte_estadistico_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlerta('Reporte estadístico PDF generado exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar reporte estadístico:', error);
    showAlerta('Error al generar reporte estadístico: ' + error.message, 'error');
  }
};

// ===== REPORTE ESTADÍSTICO EXCEL =====
export const generarReporteEstadistico = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const estadisticas = calcularEstadisticasBasicas(estudiantes, modalidadSeleccionada);

    const datos = [
      // Resumen ejecutivo
      ['=== RESUMEN EJECUTIVO ==='],
      ['Métrica', 'Valor'],
      ['Total inscripciones', estadisticas.total],
      ['Modalidad', modalidadSeleccionada],
      ['Fecha reporte', new Date().toLocaleDateString('es-ES')],
      ['Documentación completa', estadisticas.documentacionCompleta],
      ['% Documentación completa', estadisticas.porcentajeDocCompleta + '%'],
      [''],
      // Distribución por género
      ['=== DISTRIBUCIÓN POR GÉNERO ==='],
      ['Género', 'Cantidad', 'Porcentaje'],
      ...(estadisticas.genero ? Object.entries(estadisticas.genero).map(([genero, cantidad]) => [
        genero || 'No especificado',
        cantidad,
        calcularPorcentaje(cantidad, estadisticas.total)
      ]) : [['Sin datos', 0, '0%']]),
      [''],
      // Distribución por edad
      ['=== DISTRIBUCIÓN POR RANGOS DE EDAD ==='],
      ['Rango de Edad', 'Cantidad', 'Porcentaje'],
      ...(estadisticas.edades ? Object.entries(estadisticas.edades).map(([rango, cantidad]) => [
        rango,
        cantidad,
        calcularPorcentaje(cantidad, estadisticas.total)
      ]) : [['Sin datos', 0, '0%']]),
      [''],
      // Distribución geográfica
      ['=== DISTRIBUCIÓN GEOGRÁFICA (Top 20) ==='],
      ['Localidad/Barrio', 'Cantidad', 'Porcentaje'],
      ...(estadisticas.ubicaciones ? Object.entries(estadisticas.ubicaciones)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([ubicacion, cantidad]) => [
          ubicacion,
          cantidad,
          calcularPorcentaje(cantidad, estadisticas.total)
        ]) : [['Sin datos', 0, '0%']]),
      [''],
      // Estadísticas adicionales
      ['=== ESTADÍSTICAS ADICIONALES ==='],
      ['Métrica', 'Valor'],
      ['Promedio edad', estadisticas.promedioEdad || 'No calculado'],
      ['Modalidades diferentes', estadisticas.modalidadesUnicas || 0],
      ['Planes de estudio únicos', estadisticas.planesUnicos || 0]
    ];

    const exito = exportarExcel(datos, 'Reporte_estadistico', `REPORTE ESTADÍSTICO - ${modalidadSeleccionada.toUpperCase()}`);

    if (exito) {
      showAlerta('Reporte estadístico Excel generado exitosamente', 'success');
    } else {
      showAlerta('Error al generar reporte estadístico Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar reporte estadístico Excel:', error);
    showAlerta('Error al generar reporte estadístico Excel: ' + error.message, 'error');
  }
};

// ===== EXPORTAR DATOS COMPLETOS CSV =====
export const exportarCSV = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    // Filtrar estudiantes por modalidad si es necesario
    let estudiantesFiltrados = estudiantes;
    if (modalidadSeleccionada !== 'todas') {
      estudiantesFiltrados = estudiantes.filter(est =>
        est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
      );
    }

    // Encabezados para el CSV
    const encabezados = [
      'ID', 'Nombre', 'Apellido', 'DNI', 'CUIL', 'Email', 'Teléfono',
      'Fecha Nacimiento', 'Género', 'Modalidad', 'Plan', 'Estado Inscripción',
      'Localidad', 'Barrio', 'Domicilio', 'Fecha Inscripción',
      'Doc DNI', 'Doc CUIL', 'Doc Partida', 'Doc Analítico', 'Doc Certificado', 'Doc Médica', 'Doc Solicitud'
    ];

    // Preparar datos
    const datos = [
      encabezados,
      ...estudiantesFiltrados.map(est => [
        est.id || '',
        est.nombre || '',
        est.apellido || '',
        est.dni || '',
        est.cuil || '',
        est.email || '',
        est.telefono || '',
        est.fecha_nacimiento || '',
        est.genero || '',
        est.modalidad || '',
        est.plan || '',
        est.estado_inscripcion || '',
        est.localidad || '',
        est.barrio || '',
        est.domicilio || '',
        est.fecha_inscripcion || est.created_at || '',
        est.documento_dni ? 'Sí' : 'No',
        est.documento_cuil ? 'Sí' : 'No',
        est.documento_partidaNacimiento ? 'Sí' : 'No',
        est.documento_analiticoParcial ? 'Sí' : 'No',
        est.documento_certificadoNivelPrimario ? 'Sí' : 'No',
        est.documento_fichaMedica ? 'Sí' : 'No',
        est.documento_solicitudPase ? 'Sí' : 'No'
      ])
    ];

    const exito = exportarExcel(datos, 'registros_completos', `REGISTROS COMPLETOS - ${modalidadSeleccionada.toUpperCase()}`, true);

    if (exito) {
      showAlerta(`${estudiantesFiltrados.length} registros exportados exitosamente`, 'success');
    } else {
      showAlerta('Error al exportar registros', 'error');
    }

  } catch (error) {
    console.error('Error al exportar CSV:', error);
    showAlerta('Error al exportar CSV: ' + error.message, 'error');
  }
};

// ===== EXPORTAR REGISTROS PENDIENTES =====
export const exportarRegistrosPendientes = async (estudiantes, showAlerta) => {
  try {
    const registrosPendientes = estudiantes.filter(est => {
      const tieneDocumentacionIncompleta = !est.documento_dni || !est.documento_cuil ||
        !est.documento_partidaNacimiento || !est.documento_analiticoParcial;
      const tieneDatosIncompletos = !est.telefono || !est.email || !est.domicilio;

      return tieneDocumentacionIncompleta || tieneDatosIncompletos;
    });

    const encabezados = [
      'ID', 'Nombre Completo', 'DNI', 'Email', 'Teléfono', 'Estado',
      'Documentos Faltantes', 'Datos Faltantes', 'Fecha Inscripción'
    ];

    const datos = [
      encabezados,
      ...registrosPendientes.map(est => {
        const documentosFaltantes = [];
        const datosFaltantes = [];

        if (!est.documento_dni) documentosFaltantes.push('DNI');
        if (!est.documento_cuil) documentosFaltantes.push('CUIL');
        if (!est.documento_partidaNacimiento) documentosFaltantes.push('Partida Nacimiento');
        if (!est.documento_analiticoParcial) documentosFaltantes.push('Analítico Parcial');
        if (!est.documento_certificadoNivelPrimario) documentosFaltantes.push('Certificado Primario');
        if (!est.documento_fichaMedica) documentosFaltantes.push('Ficha Médica');
        if (!est.documento_solicitudPase) documentosFaltantes.push('Solicitud Pase');

        if (!est.telefono) datosFaltantes.push('Teléfono');
        if (!est.email) datosFaltantes.push('Email');
        if (!est.domicilio) datosFaltantes.push('Domicilio');

        return [
          est.id || '',
          `${est.nombre || ''} ${est.apellido || ''}`.trim(),
          est.dni || '',
          est.email || '',
          est.telefono || '',
          est.estado_inscripcion || '',
          documentosFaltantes.join(', ') || 'Completos',
          datosFaltantes.join(', ') || 'Completos',
          est.fecha_inscripcion || est.created_at || ''
        ];
      })
    ];

    const exito = exportarExcel(datos, 'registros-pendientes', 'REGISTROS PENDIENTES DE COMPLETAR', true);

    if (exito) {
      showAlerta(`${registrosPendientes.length} registros pendientes exportados exitosamente`, 'success');
    } else {
      showAlerta('Error al exportar registros pendientes', 'error');
    }

  } catch (error) {
    console.error('Error al exportar registros pendientes:', error);
    showAlerta('Error al exportar registros pendientes: ' + error.message, 'error');
  }
};

// ===== FUNCIÓN AUXILIAR PARA CALCULAR ESTADÍSTICAS BÁSICAS =====
const calcularEstadisticasBasicas = (estudiantes, modalidadSeleccionada) => {
  // Filtrar estudiantes por modalidad si es necesario
  let estudiantesFiltrados = estudiantes;
  if (modalidadSeleccionada !== 'todas') {
    estudiantesFiltrados = estudiantes.filter(est =>
      est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
    );
  }

  const total = estudiantesFiltrados.length;
  const genero = {};
  const edades = {
    '16-20': 0,
    '21-25': 0,
    '26-30': 0,
    '31-35': 0,
    '36-40': 0,
    '41-45': 0,
    '46-50': 0,
    '51+': 0
  };
  const ubicaciones = {};
  let documentacionCompleta = 0;
  let sumaEdades = 0;
  let contadorEdades = 0;

  const modalidadesUnicas = new Set();
  const planesUnicos = new Set();

  estudiantesFiltrados.forEach(est => {
    // Análisis de género
    const gen = est.genero || 'No especificado';
    genero[gen] = (genero[gen] || 0) + 1;

    // Análisis de edad
    if (est.fecha_nacimiento) {
      const edad = calcularEdad(est.fecha_nacimiento);
      if (edad >= 16 && edad <= 20) edades['16-20']++;
      else if (edad >= 21 && edad <= 25) edades['21-25']++;
      else if (edad >= 26 && edad <= 30) edades['26-30']++;
      else if (edad >= 31 && edad <= 35) edades['31-35']++;
      else if (edad >= 36 && edad <= 40) edades['36-40']++;
      else if (edad >= 41 && edad <= 45) edades['41-45']++;
      else if (edad >= 46 && edad <= 50) edades['46-50']++;
      else if (edad >= 51) edades['51+']++;

      sumaEdades += edad;
      contadorEdades++;
    }

    // Análisis de ubicación
    const ubicacion = est.localidad || est.barrio || 'No especificado';
    ubicaciones[ubicacion] = (ubicaciones[ubicacion] || 0) + 1;

    // Documentación completa
    if (est.documento_dni && est.documento_cuil && est.documento_partidaNacimiento) {
      documentacionCompleta++;
    }

    // Modalidades y planes únicos
    if (est.modalidad) modalidadesUnicas.add(est.modalidad);
    if (est.plan) planesUnicos.add(est.plan);
  });

  return {
    total,
    genero,
    edades,
    ubicaciones,
    documentacionCompleta,
    porcentajeDocCompleta: calcularPorcentaje(documentacionCompleta, total),
    promedioEdad: contadorEdades > 0 ? (sumaEdades / contadorEdades).toFixed(1) : null,
    modalidadesUnicas: modalidadesUnicas.size,
    planesUnicos: planesUnicos.size
  };
};

// ===== FUNCIÓN AUXILIAR PARA CALCULAR EDAD =====
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};

// ===== GENERAR LISTADO DE ESTUDIANTES PDF (ESTANDARIZADO) =====
export const generarListadoEstudiantesPDF = (estudiantes, tituloReporte, nombreArchivoBase) => {
  if (!estudiantes || estudiantes.length === 0) return;

  const doc = new jsPDF();
  const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);

  // Determinar modalidad del primer estudiante (asumiendo homogeneidad o tomando la del primero)
  const modalidad = estudiantes[0]?.modalidad || '';
  const tituloCompleto = modalidad
    ? `${tituloReporte} - ${modalidad.toUpperCase()}`
    : tituloReporte;

  let yPos = crearEncabezadoInstitucional(doc, tituloCompleto);

  // ===== INFORMACION GENERAL =====
  yPos = verificarEspacio(doc, yPos, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(45, 65, 119);
  doc.text(normalizarTexto(tituloReporte), 14, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de estudiantes: ${estudiantes.length}`, 20, yPos);
  if (modalidad) {
    yPos += 6;
    doc.text(`Modalidad: ${modalidad}`, 20, yPos);
  }
  yPos += 6;
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
  yPos += 15;

  // ===== TABLA DE ESTUDIANTES =====
  const tableData = estudiantes.map(e => [
    e.id.toString(),
    e.dni.toString(),
    normalizarTexto(e.apellido || ''),
    normalizarTexto(e.nombre || ''),
    normalizarTexto(e.email || '')
  ]);

  autoTable(doc, {
    head: [['ID', 'DNI', 'Apellido', 'Nombre', 'Email']],
    body: tableData,
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
      font: 'helvetica',
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID reducido
      1: { cellWidth: 25 }, // DNI reducido
      2: { cellWidth: 40 }, // Apellido
      3: { cellWidth: 40 }, // Nombre
      4: { cellWidth: 'auto' } // Email ajustado automáticamente al espacio restante
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // El pie de página se agrega manualmente con nuestra utilidad en el loop final
    }
  });

  // Agregar pie de página a TODAS las paginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Reporte CEIJA5', 14, pageHeight - 10);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const nombreNormalizado = nombreArchivoBase.replace(/\s+/g, '_');
  doc.save(`${nombreNormalizado}_${fechaHoy}.pdf`);
};

// ===== GENERAR LISTADO COMBINADO PDF (ESTANDARIZADO) =====
export const generarListadoCombinadoPDF = (secciones, nombreArchivoBase) => {
  if (!secciones || secciones.length === 0) return;

  const doc = new jsPDF();
  const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);

  const primeraSeccionData = secciones[0].data;
  const modalidad = (primeraSeccionData && primeraSeccionData.length > 0) ? primeraSeccionData[0].modalidad : '';

  secciones.forEach((seccion, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const tituloCompleto = modalidad
      ? `${seccion.titulo} - ${modalidad.toUpperCase()}`
      : seccion.titulo;

    let yPos = crearEncabezadoInstitucional(doc, tituloCompleto);

    yPos = verificarEspacio(doc, yPos, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto(seccion.titulo), 14, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de estudiantes: ${seccion.data.length}`, 20, yPos);
    if (modalidad) {
      yPos += 6;
      doc.text(`Modalidad: ${modalidad}`, 20, yPos);
    }
    yPos += 6;
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    yPos += 15;

    const tableData = seccion.data.map(e => [
      e.id.toString(),
      e.dni.toString(),
      normalizarTexto(e.apellido || ''),
      normalizarTexto(e.nombre || ''),
      normalizarTexto(e.email || '')
    ]);

    if (tableData.length === 0) {
      doc.text("No hay registros para esta sección.", 20, yPos);
    } else {
      autoTable(doc, {
        head: [['ID', 'DNI', 'Apellido', 'Nombre', 'Email']],
        body: tableData,
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
          font: 'helvetica',
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 15 }, // ID reducido
          1: { cellWidth: 25 }, // DNI reducido
          2: { cellWidth: 40 }, // Apellido
          3: { cellWidth: 40 }, // Nombre
          4: { cellWidth: 'auto' } // Email ajustado automáticamente al espacio restante
        },
        margin: { left: 14, right: 14 }
      });
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Reporte CEIJA5', 14, pageHeight - 10);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const nombreNormalizado = nombreArchivoBase.replace(/\s+/g, '_');
  doc.save(`${nombreNormalizado}_${fechaHoy}.pdf`);
};