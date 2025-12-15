import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generarKPIsAvanzados } from '../../Dashboard/ReportesVisualizacionService';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, crearControlPaginas } from './utils';

// ===== DASHBOARD EJECUTIVO PDF =====
export const generarDashboardEjecutivo = (estudiantes, showAlerta) => {
  try {
    const doc = new jsPDF();

    // Usar funciones centralizadas de control de páginas
    const { agregarPiePagina, verificarEspacio } = crearControlPaginas(doc);

    // Crear encabezado
    let yPos = crearEncabezadoInstitucional(doc, 'INFORME DE GESTION - INSCRIPCION ESTUDIANTES');

    // Título del reporte (Centrado, Tamaño 13, 2 líneas de separación del encabezado)
    yPos += 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('INFORME DE GESTION - INSCRIPCION ESTUDIANTES'), doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 8;

    // ===== RESUMEN EJECUTIVO EDUCATIVO =====
    doc.setFontSize(12); // Reducido de 16 a 14 para que quepa
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119); // Azul Institucional
    doc.text(normalizarTexto('RESUMEN EJECUTIVO'), 14, yPos);
    yPos += 7; // Espacio entre líneas del título
    doc.text(normalizarTexto('INDICADORES DEL PROCESO DE INSCRIPCION'), 14, yPos);
    yPos += 15;

    // Generar KPIs avanzados
    const { kpisAvanzados, kpisDecisiones, alertas, recomendaciones } = generarKPIsAvanzados(estudiantes);

    // === KPIs OPTIMIZADOS PARA TOMA DE DECISIONES ===
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11); // Tamaño estándar 11
    doc.setTextColor(0, 0, 0); // Negro para texto base

    // Estado General
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(45, 65, 119); // Azul Institucional
    doc.text(`1. SITUACION ACTUAL DE ESTUDIANTES:`, 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`• Estudiantes Activos: ${kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.valor}% (${kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.interpretacion})`, 25, yPos);
    yPos += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`   Indica qué porcentaje de estudiantes continua activamente sus estudios`, 27, yPos);
    doc.setFontSize(11); // Volver a 11
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.text(`• Estudiantes Inactivos: ${kpisDecisiones.estadoGeneral.tasaEstudiantesInactivos.valor}%`, 25, yPos);
    yPos += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`   Estudiantes que necesitan reactivacion o seguimiento especial`, 27, yPos);
    doc.setFontSize(11);
    doc.setTextColor(45, 65, 119); // Azul para siguiente título
    yPos += 10;

    // Proceso de Inscripción
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`2. PROCESO DE MATRICULACION:`, 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const pendienteValor = kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.valor;
    doc.setTextColor(0, 0, 0);

    doc.text(`• Inscripciones Pendientes: ${pendienteValor}% - ${kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.interpretacion}`, 25, yPos);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    yPos += 6;
    doc.text(`   Estudiantes que iniciaron pero no completaron su inscripcion`, 27, yPos);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.text(`• Inscripciones Completas: ${kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.valor}%`, 25, yPos);
    yPos += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`   Estudiantes con documentacion completa y matricula finalizada`, 27, yPos);
    doc.setFontSize(11);
    doc.setTextColor(45, 65, 119); // Azul para siguiente título
    yPos += 10;

    // ===== DISTRIBUCIÓN POR MODALIDADES EDUCATIVAS =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizarTexto('3. MODALIDADES EDUCATIVAS Y RENDIMIENTO:'), 20, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    // Mostrar distribución de matrícula con detalles claros
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119); // Azul Institucional
    doc.text('Distribución de Estudiantes:', 25, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');

    // Tabla Distribución
    const distData = kpisDecisiones.distribucionMatricula.porcentajeMatriculaPorModalidad.map(m => [
      m.modalidad, m.cantidad, `${m.valor}%`
    ]);

    autoTable(doc, {
      head: [['Modalidad', 'Estudiantes', '% Total']],
      body: distData,
      startY: yPos,
      margin: { left: 25 },
      tableWidth: 160,
      theme: 'grid',
      headStyles: { fillColor: [45, 65, 119], textColor: 255, fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { textColor: 0, fontSize: 11 },
      styles: { cellPadding: 2 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Tabla Eficiencia
    yPos = verificarEspacio(doc, yPos, 40);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text('Eficiencia (Actividad) por Modalidad:', 25, yPos);
    yPos += 6;

    const eficData = kpisDecisiones.eficienciaPorModalidad.tasaActividadPorModalidad.map(m => [
      m.modalidad, `${m.valor}%`, m.interpretacion
    ]);

    autoTable(doc, {
      head: [['Modalidad', 'Tasa Actividad', 'Interpretación']],
      body: eficData,
      startY: yPos,
      margin: { left: 25 },
      tableWidth: 160,
      theme: 'grid',
      headStyles: { fillColor: [45, 65, 119], textColor: 255, fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { textColor: 0, fontSize: 11 },
      styles: { cellPadding: 2 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ===== INDICE DE CALIDAD EDUCATIVA CEIJA 5 =====
    yPos = verificarEspacio(doc, yPos, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('4. INDICE DE CALIDAD ADMINISTRATIVA (ICA):'), 20, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // Negro
    doc.setFont('helvetica', 'normal');
    doc.text(`Valor General del ICA: ${kpisDecisiones.indiceCalidadEducativa.valor}%`, 25, yPos);
    yPos += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Interpretación: ${kpisDecisiones.indiceCalidadEducativa.interpretacion}`, 25, yPos);
    yPos += 8;

    // Tabla componentes ICA
    const compData = Object.entries(kpisDecisiones.indiceCalidadEducativa.componentes).map(([key, val]) => [
      key, `${val.valor.toFixed(1)}%`, `${val.peso}%`, val.descripcion
    ]);

    autoTable(doc, {
      head: [['Componente', 'Valor', 'Peso', 'Descripción']],
      body: compData,
      startY: yPos,
      margin: { left: 25 },
      tableWidth: 160,
      theme: 'grid',
      headStyles: { fillColor: [45, 65, 119], textColor: 255, fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { textColor: 0, fontSize: 11 },
      styles: { cellPadding: 2 },
      columnStyles: { 3: { cellWidth: 70 } }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ===== RECOMENDACIONES PRIORITARIAS =====
    yPos = verificarEspacio(doc, yPos, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 65, 119);
    doc.text(normalizarTexto('5. ACCIONES PRIORITARIAS RECOMENDADAS:'), 20, yPos);
    yPos += 10;

    kpisDecisiones.indiceCalidadEducativa.recomendacionesPrioritarias.forEach((rec, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Prioridad ${i + 1}:`, 25, yPos);

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(rec, 150);
      doc.text(lines, 50, yPos);
      yPos += (lines.length * 6) + 4;
    });

    yPos += 5;

    // ===== ALERTAS DE SISTEMA =====
    // Filtrar alertas válidas
    const alertasValidas = alertas.filter(a => a && a.mensaje);

    if (alertasValidas.length > 0) {
      yPos = verificarEspacio(doc, yPos, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text('⚠ ALERTAS CRÍTICAS DEL SISTEMA:', 20, yPos);
      yPos += 10;

      alertasValidas.forEach(alerta => {
        const tipo = alerta.tipo || 'Sistema';
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`• [${tipo}] ${alerta.mensaje}`, 25, yPos);
        yPos += 5;

        if (alerta.accion) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(`  Acción: ${alerta.accion}`, 25, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += 8;
        } else {
          yPos += 3;
        }
      });
    }

    // ===== RECOMENDACIONES ESTRATÉGICAS =====
    if (recomendaciones.length > 0) {
      yPos = verificarEspacio(doc, yPos, 60); // Aumentado espacio necesario
      yPos += 10; // Extra separacion
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119); // Azul para títulos principales
      doc.text(normalizarTexto('RECOMENDACIONES ESTRATEGICAS:'), 25, yPos);
      yPos += 15; // Más espacio después del título

      recomendaciones.forEach(rec => {
        yPos = verificarEspacio(doc, yPos, 30);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${rec.area}:`, 25, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        const textoRecomendacion = normalizarTexto(rec.recomendacion);
        const lineasTexto = doc.splitTextToSize(textoRecomendacion, 160);
        doc.text(lineasTexto, 25, yPos);
        yPos += lineasTexto.length * 6 + 5;
      });
    }

    // Agregar pie de página al final
    agregarPiePagina();

    // Guardar PDF
    doc.save(`Dashboard_Ejecutivo_CEIJA5_${new Date().toISOString().split('T')[0]}.pdf`);

    if (showAlerta) showAlerta('Dashboard Ejecutivo PDF generado exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar dashboard ejecutivo PDF:', error);
    if (showAlerta) showAlerta('Error al generar dashboard PDF: ' + error.message, 'error');
  }
};

// ===== DASHBOARD EJECUTIVO EXCEL =====
export const generarDashboardEjecutivoExcel = (estudiantes, showAlerta) => {
  try {
    const { kpisDecisiones, alertas, recomendaciones } = generarKPIsAvanzados(estudiantes);

    // Configuración para el generador de filas y merges
    const excelRows = [];
    const extraHeaderRows = []; // Indices relativos a datos
    const spacerRows = [];      // Indices de filas vacias para quitar bordes
    const customMerges = [];

    // Offset inicial: 6 filas de encabezado institucional (0-5)
    // La primera fila de datos será la fila 7 en Excel (índice 6)
    const INITIAL_ROW_OFFSET = 6;
    let currentRow = INITIAL_ROW_OFFSET;

    // Helper para añadir filas y gestionar merges automáticamente
    const addRow = (dataArray, merges = [], isHeader = false, isSpacer = false) => {
      excelRows.push(dataArray);

      const relativeIndex = currentRow - INITIAL_ROW_OFFSET;

      // Si hay merges, ajustarlos al índice real actual
      if (merges && merges.length > 0) {
        merges.forEach(merge => {
          customMerges.push({
            s: { r: currentRow, c: merge.s },
            e: { r: currentRow, c: merge.e }
          });
        });
      }

      if (isHeader) {
        extraHeaderRows.push(relativeIndex);
      }

      if (isSpacer) {
        spacerRows.push(relativeIndex);
      }

      currentRow++;
    };

    // Helper para añadir Títulos de Sección
    const addSectionTitle = (title, mergeEndCol = 2, isStyled = true) => {
      addRow([title], [{ s: 0, e: mergeEndCol }], isStyled, !isStyled);
    };

    // Helper para spacer
    const addSpacer = () => {
      addRow([''], [], false, true); // true indicates spacer row
    };

    // 1. KPIS OPTIMIZADOS (A:H - Sin Borde)
    addSectionTitle('=== KPIS OPTIMIZADOS PARA TOMA DE DECISIONES ===', 7, false);
    addSpacer();

    // 2. ESTADO GENERAL (A:C)
    addSectionTitle('ESTADO GENERAL', 2);
    // Header
    addRow(
      ['KPI', 'Valor', 'Calculo', 'Justificacion', '', '', '', ''],
      [{ s: 3, e: 7 }],
      true
    );
    // Data: Activos
    let justActivos = kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.justificacion || '';
    justActivos = justActivos.replace(/salud/gi, 'estado');

    addRow(
      [
        'Tasa de Estudiantes Activos',
        `${kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.valor}%`,
        kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.calculo,
        justActivos, '', '', '', ''
      ],
      [{ s: 3, e: 7 }]
    );
    // Data: Inactivos
    let justInactivos = kpisDecisiones.estadoGeneral.tasaEstudiantesInactivos.justificacion || '';
    justInactivos = justInactivos.replace(/salud/gi, 'estado');

    addRow(
      [
        'Tasa de Estudiantes Inactivos',
        `${kpisDecisiones.estadoGeneral.tasaEstudiantesInactivos.valor}%`,
        kpisDecisiones.estadoGeneral.tasaEstudiantesInactivos.calculo,
        justInactivos, '', '', '', ''
      ],
      [{ s: 3, e: 7 }]
    );

    addSpacer();

    // 3. PROCESO DE INSCRIPCION (A:C)
    addSectionTitle('PROCESO DE INSCRIPCION', 2);
    // Header
    addRow(
      ['KPI', 'Valor', 'Interpretacion', '', 'Accion Requerida', '', '', ''],
      [{ s: 2, e: 3 }, { s: 4, e: 6 }],
      true
    );
    // Data: Pendientes
    addRow(
      [
        'Tasa de Inscripciones Pendientes',
        `${kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.valor}%`,
        kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.interpretacion, '',
        kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.accionRequerida, '', ''
      ],
      [{ s: 2, e: 3 }, { s: 4, e: 6 }]
    );
    // Data: Completas
    addRow(
      [
        'Tasa de Inscripciones Completas',
        `${kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.valor}%`,
        kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.interpretacion, '',
        kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.accionRequerida, '', ''
      ],
      [{ s: 2, e: 3 }, { s: 4, e: 6 }]
    );

    addSpacer();

    // 4. DISTRIBUCION DE MATRICULA (A:C)
    addSectionTitle('DISTRIBUCION DE MATRICULA POR MODALIDAD', 2);
    // Header
    addRow(['Modalidad', 'Estudiantes', 'Porcentaje', 'Activos', 'Inactivos'], [], true);
    // Data
    kpisDecisiones.distribucionMatricula.porcentajeMatriculaPorModalidad.forEach(modalidad => {
      addRow([
        modalidad.modalidad,
        modalidad.cantidad,
        `${modalidad.valor}%`,
        modalidad.estudiantesActivos,
        modalidad.estudiantesInactivos
      ]);
    });

    addSpacer();

    // 5. EFICIENCIA POR MODALIDAD (A:C)
    addSectionTitle('EFICIENCIA POR MODALIDAD', 2);
    // Header
    addRow(
      ['Modalidad', 'Tasa Actividad', 'Interpretacion', '', 'Accion Requerida', '', '', ''],
      [{ s: 2, e: 3 }, { s: 4, e: 6 }],
      true
    );
    // Data
    kpisDecisiones.eficienciaPorModalidad.tasaActividadPorModalidad.forEach(modalidad => {
      addRow(
        [
          modalidad.modalidad,
          `${modalidad.valor}%`,
          modalidad.interpretacion, '',
          modalidad.accionRequerida, '', ''
        ],
        [{ s: 2, e: 3 }, { s: 4, e: 6 }]
      );
    });

    addSpacer();

    // 6. INDICE DE CALIDAD ADMINISTRATIVA (A:C)
    addSectionTitle('INDICE DE CALIDAD ADMINISTRATIVA', 2);
    // Header
    addRow(
      ['Componente', 'Valor', 'Peso', 'Descripcion', '', '', ''],
      [{ s: 3, e: 6 }],
      true
    );
    // General
    addRow(
      [
        'Indice General',
        `${kpisDecisiones.indiceCalidadEducativa.valor}%`,
        '',
        kpisDecisiones.indiceCalidadEducativa.interpretacion, '', '', ''
      ],
      [{ s: 3, e: 6 }]
    );
    // Componentes
    Object.entries(kpisDecisiones.indiceCalidadEducativa.componentes).forEach(([componente, data]) => {
      addRow(
        [
          componente,
          `${data.valor.toFixed(1)}%`,
          `${data.peso}%`,
          data.descripcion, '', '', ''
        ],
        [{ s: 3, e: 6 }]
      );
    });

    addSpacer();

    // 7. RECOMENDACIONES PRIORITARIAS (A:C)
    addSectionTitle('RECOMENDACIONES PRIORITARIAS', 2);
    addRow(
      ['Area', 'Accion Recomendada', '', ''],
      [{ s: 1, e: 2 }],
      true
    );
    kpisDecisiones.indiceCalidadEducativa.recomendacionesPrioritarias.forEach((rec, index) => {
      addRow(
        [`Prioridad ${index + 1}`, rec, '', ''],
        [{ s: 1, e: 2 }]
      );
    });

    addSpacer();

    // 8. ALERTAS DEL SISTEMA (A:C)
    addSectionTitle('ALERTAS DEL SISTEMA', 2);
    addRow(
      ['Tipo', 'Mensaje', '', '', 'Accion', '', ''],
      [{ s: 1, e: 3 }, { s: 4, e: 6 }],
      true
    );
    if (alertas.length > 0) {
      alertas.forEach(alerta => {
        addRow(
          [alerta.tipo, alerta.mensaje, '', '', alerta.accion, '', ''],
          [{ s: 1, e: 3 }, { s: 4, e: 6 }]
        );
      });
    } else {
      addRow(
        ['INFO', 'No hay alertas críticas en este momento.', '', '', 'Ninguna acción requerida.', '', ''],
        [{ s: 1, e: 3 }, { s: 4, e: 6 }]
      );
    }

    addSpacer();

    // 9. RECOMENDACIONES ESTRATEGICAS (A:C)
    addSectionTitle('RECOMENDACIONES ESTRATEGICAS', 2);
    addRow(
      ['Prioridad', 'Area', 'Recomendacion', '', '', '', '', 'Impacto Estimado', '', '', '', '', '', ''],
      [{ s: 2, e: 6 }, { s: 7, e: 13 }],
      true
    );
    recomendaciones.forEach(rec => {
      addRow(
        [
          rec.prioridad,
          rec.area,
          rec.recomendacion, '', '', '', '',
          rec.impactoEstimado, '', '', '', '', '', ''
        ],
        [{ s: 2, e: 6 }, { s: 7, e: 13 }]
      );
    });

    const exito = exportarExcel(
      excelRows,
      'Dashboard_Ejecutivo_Calidad_Educativa',
      'DASHBOARD EJECUTIVO - INDICADORES DE CALIDAD EDUCATIVA CEIJA 5',
      extraHeaderRows,
      customMerges,
      spacerRows // Pasamos los índices de filas vacías
    );

    if (exito) {
      showAlerta('Informe de Calidad Educativa Excel generado exitosamente', 'success');
    } else {
      showAlerta('Error al generar informe de calidad educativa Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar informe de calidad educativa Excel:', error);
    showAlerta('Error al generar informe de calidad educativa Excel: ' + error.message, 'error');
  }
};