import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { crearEncabezadoInstitucional, normalizarTexto, exportarExcel, calcularPorcentaje, crearControlPaginas } from './utils';

// ===== DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD PDF =====
export const generarTendenciasPlan = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  console.log('🔧 EJECUTANDO FUNCIÓN CORREGIDA: generarTendenciasPlan desde tendenciasPlan.js');
  console.log('📊 Título correcto: DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD');
  try {
    const distribucion = analizarDistribucionPorModalidad(estudiantes, modalidadSeleccionada);

    const doc = new jsPDF();
    const { verificarEspacio, agregarPiePagina } = crearControlPaginas(doc);
    // Título más corto para evitar desbordamiento
    const tituloReporte = modalidadSeleccionada === 'todas' ?
      'DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD' :
      `DISTRIBUCIÓN INSCRIPCIONES - ${modalidadSeleccionada.toUpperCase()}`;

    let yPos = crearEncabezadoInstitucional(doc, tituloReporte);

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
    doc.text(`Total de inscripciones analizadas: ${distribucion.total}`, 20, yPos);
    yPos += 6;
    doc.text(`Modalidad analizada: ${modalidadSeleccionada}`, 20, yPos);
    yPos += 6;
    doc.text(`Fecha del análisis: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    yPos += 15;

    // ===== DISTRIBUCIÓN CUANTITATIVA POR MODALIDAD =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la tabla de distribución
    if (modalidadSeleccionada === 'todas') {
      // ADMINISTRADOR - Ver ambas modalidades
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119);
      doc.text(normalizarTexto('DISTRIBUCION POR MODALIDAD'), 14, yPos);
      yPos += 15;

      const modalidadData = distribucion.modalidades.map(modalidad => [
        modalidad.nombre,
        modalidad.cantidad.toString(),
        calcularPorcentaje(modalidad.cantidad, distribucion.total)
      ]);

      autoTable(doc, {
        head: [['Modalidad', 'Inscripciones', 'Porcentaje']],
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
          fontSize: 10,
          font: 'helvetica',
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 20;
    }

    // ===== DISTRIBUCIÓN ESPECÍFICA SEGÚN MODALIDAD =====
    yPos = verificarEspacio(doc, yPos, 80); // Espacio para la distribución específica
    if (distribucion.detalleModalidad && Object.keys(distribucion.detalleModalidad).length > 0) {
      // yPos ya verificado


      Object.entries(distribucion.detalleModalidad).forEach(([modalidad, detalle]) => {
        if (modalidadSeleccionada === 'todas' || modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(45, 65, 119);

          if (modalidad === 'PRESENCIAL') {
            doc.text(normalizarTexto('PRESENCIAL - DISTRIBUCION POR AÑO/CURSO'), 14, yPos);
          } else {
            doc.text(normalizarTexto('SEMIPRESENCIAL - DISTRIBUCION POR PLAN'), 14, yPos);
          }
          yPos += 15;

          const detalleData = Object.entries(detalle).map(([categoria, cantidad]) => [
            categoria || 'Sin especificar',
            cantidad.toString(),
            calcularPorcentaje(cantidad, distribucion.totalPorModalidad[modalidad] || cantidad)
          ]);

          autoTable(doc, {
            head: [['División', 'Inscripciones', 'Porcentaje']],
            body: detalleData,
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
              font: 'helvetica',
              textColor: [0, 0, 0]
            },
            columnStyles: {
              0: { cellWidth: 80 },
              1: { cellWidth: 40, halign: 'center' },
              2: { cellWidth: 40, halign: 'center' }
            },
            margin: { left: 14, right: 14 }
          });

          yPos = doc.lastAutoTable.finalY + 20;
        }
      });
    }

    // ===== OBSERVACIONES (sin color rojo) =====
    yPos = verificarEspacio(doc, yPos, 40); // Espacio para las observaciones
    if (distribucion.observaciones && distribucion.observaciones.length > 0) {
      // yPos ya verificado


      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 65, 119); // Azul en lugar de rojo
      doc.text(normalizarTexto('OBSERVACIONES'), 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Negro en lugar de rojo

      distribucion.observaciones.forEach((observacion, index) => {
        const texto = normalizarTexto(`${index + 1}. ${observacion}`);
        const lineasTexto = doc.splitTextToSize(texto, 160);
        doc.text(lineasTexto, 20, yPos);
        yPos += lineasTexto.length * 5 + 3;
      });
    }

    // Agregar pie de página antes de guardar
    agregarPiePagina();

    // Guardar el PDF
    doc.save(`Distribucion_Modalidad_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlerta('Distribución cuantitativa por modalidad PDF generada exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar distribución por modalidad:', error);
    showAlerta('Error al generar distribución por modalidad: ' + error.message, 'error');
  }
};

// ===== DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD EXCEL =====
// ===== DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD EXCEL =====
export const generarTendenciasPlanExcel = async (estudiantes, showAlerta, modalidadSeleccionada = 'todas') => {
  try {
    const distribucion = analizarDistribucionPorModalidad(estudiantes, modalidadSeleccionada);
    const datosExcel = [];
    const extraHeaderRows = [];
    const customMerges = [];

    // Título General
    const titulo = modalidadSeleccionada === 'todas'
      ? 'DISTRIBUCIÓN INSCRIPCIONES POR MODALIDAD'
      : `DISTRIBUCIÓN INSCRIPCIONES - ${modalidadSeleccionada.toUpperCase()}`;

    // 1. Matriz PRESENCIAL
    if (modalidadSeleccionada === 'todas' || modalidadSeleccionada.toUpperCase() === 'PRESENCIAL') {
      const modalName = 'PRESENCIAL';
      const categorias = ['1er Año', '2do Año', '3er Año'];

      // Título de Sección (Row index relative to data start)
      const titleRowIndex = datosExcel.length;
      extraHeaderRows.push(titleRowIndex); // Style as header
      datosExcel.push([`═══ ${modalName} ═══`]);

      const headerRowIndex = datosExcel.length;
      extraHeaderRows.push(headerRowIndex); // Style as header

      datosExcel.push(['Año/Curso', 'Inscripciones', 'Porcentaje']);

      const detalle = distribucion.detalleModalidad?.[modalName] || {};
      const totalMod = distribucion.totalPorModalidad?.[modalName] || 0;

      categorias.forEach(cat => {
        const cant = detalle[cat] || 0;
        const pct = calcularPorcentaje(cant, totalMod);
        datosExcel.push([cat, cant, pct]);
      });

      datosExcel.push([
        'TOTAL PRESENCIAL',
        totalMod,
        '100.0%'
      ]);

      datosExcel.push(['']); // Espacio
    }

    // 2. Matriz SEMIPRESENCIAL
    if (modalidadSeleccionada === 'todas' || modalidadSeleccionada.toUpperCase() === 'SEMIPRESENCIAL') {
      const modalName = 'SEMIPRESENCIAL';
      const categorias = ['Plan A', 'Plan B', 'Plan C'];

      const titleRowIndex = datosExcel.length;
      extraHeaderRows.push(titleRowIndex); // Style as header
      datosExcel.push([`═══ ${modalName} ═══`]);

      const headerRowIndex = datosExcel.length;
      extraHeaderRows.push(headerRowIndex); // Style as header

      datosExcel.push(['Plan de Estudio', 'Inscripciones', 'Porcentaje']);

      const detalle = distribucion.detalleModalidad?.[modalName] || {};
      const totalMod = distribucion.totalPorModalidad?.[modalName] || 0;

      categorias.forEach(cat => {
        const cant = detalle[cat] || 0;
        const pct = calcularPorcentaje(cant, totalMod);
        datosExcel.push([cat, cant, pct]);
      });

      datosExcel.push([
        'TOTAL SEMIPRESENCIAL',
        totalMod,
        '100.0%'
      ]);

      datosExcel.push(['']);
    }

    // 3. Matriz TOTAL GENERAL (Resumen)
    if (modalidadSeleccionada === 'todas') {
      const modalName = 'RESUMEN GENERAL';

      const titleRowIndex = datosExcel.length;
      extraHeaderRows.push(titleRowIndex); // Style as header
      datosExcel.push([`═══ ${modalName} ═══`]);

      const headerRowIndex = datosExcel.length;
      extraHeaderRows.push(headerRowIndex); // Style as header

      datosExcel.push(['Modalidad', 'Inscripciones', 'Porcentaje']);

      distribucion.modalidades.forEach(mod => {
        const pct = calcularPorcentaje(mod.cantidad, distribucion.total);
        datosExcel.push([mod.nombre, mod.cantidad, pct]);
      });

      datosExcel.push(['TOTAL GENERAL', distribucion.total, '100.0%']);
      datosExcel.push(['']);
    }

    // OBSERVACIONES / SUGERENCIAS
    const sugerenciasTitleIndex = datosExcel.length;
    extraHeaderRows.push(sugerenciasTitleIndex); // Style as header
    datosExcel.push(['═══ ANÁLISIS DE DATOS ═══']);

    // Merge Título Sección A-C (0-2)
    const titleRowExcelIndex = sugerenciasTitleIndex + 6;
    customMerges.push({
      s: { r: titleRowExcelIndex, c: 0 },
      e: { r: titleRowExcelIndex, c: 2 }
    });

    const obsHeaderIndex = datosExcel.length;
    extraHeaderRows.push(obsHeaderIndex); // Style as header
    datosExcel.push(['#', 'Detalle', '']);

    // Merge Header Row ("Detalle") B-C (1-2)
    const headerRowExcelIndex = obsHeaderIndex + 6;
    customMerges.push({
      s: { r: headerRowExcelIndex, c: 1 },
      e: { r: headerRowExcelIndex, c: 2 }
    });

    if (distribucion.observaciones && distribucion.observaciones.length > 0) {
      distribucion.observaciones.forEach((obs, index) => {
        const currentRowIndex = datosExcel.length;
        // Calculation: 6 header rows (indices 0-5) in final Excel + currentRowIndex
        const excelRowIndex = currentRowIndex + 6;

        datosExcel.push([index + 1, obs, '']);

        // Merge Columns B and C (indices 1 and 2) for the detail text
        customMerges.push({
          s: { r: excelRowIndex, c: 1 },
          e: { r: excelRowIndex, c: 2 }
        });
      });
    } else {
      const currentRowIndex = datosExcel.length;
      const excelRowIndex = currentRowIndex + 6;
      datosExcel.push(['-', 'Sin sugerencias particulares.', '']);
      customMerges.push({
        s: { r: excelRowIndex, c: 1 },
        e: { r: excelRowIndex, c: 2 }
      });
    }

    const exito = exportarExcel(datosExcel, 'Distribucion_Inscripciones_Modalidad', titulo, extraHeaderRows, customMerges);

    if (exito) {
      showAlerta('Distribución de inscripciones Excel generada exitosamente', 'success');
    } else {
      showAlerta('Error al generar distribución de inscripciones Excel', 'error');
    }

  } catch (error) {
    console.error('Error al generar distribución de inscripciones Excel:', error);
    showAlerta('Error al generar distribución de inscripciones Excel: ' + error.message, 'error');
  }
};

// ===== FUNCIÓN AUXILIAR PARA ANÁLISIS DE DISTRIBUCIÓN POR MODALIDAD =====
const analizarDistribucionPorModalidad = (estudiantes, modalidadSeleccionada) => {
  // Filtrar estudiantes por modalidad si es necesario
  let estudiantesFiltrados = estudiantes;
  if (modalidadSeleccionada !== 'todas') {
    estudiantesFiltrados = estudiantes.filter(est =>
      est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
    );
  }

  const total = estudiantesFiltrados.length;
  const modalidades = [];
  const detalleModalidad = {};
  const totalPorModalidad = {};

  // Función auxiliar para mapear planAnioId a descripción
  const mapearPlanAnioId = (planAnioId, modalidad) => {
    const id = parseInt(planAnioId);

    // IMPORTANTE: Mapeo corregido según la estructura de datos real
    // IDs 1-3 son PRESENCIAL (1er, 2do, 3er Año)
    // IDs 4-6 son SEMIPRESENCIAL (Plan A, B, C)

    // Si es PRESENCIAL
    if (modalidad === 'PRESENCIAL') {
      switch (id) {
        case 1: return '1er Año';
        case 2: return '2do Año';
        case 3: return '3er Año';
        default: return 'Sin año especificado';
      }
    }

    // Si es SEMIPRESENCIAL
    if (modalidad === 'SEMIPRESENCIAL') {
      switch (id) {
        case 4: return 'Plan A';
        case 5: return 'Plan B';
        case 6: return 'Plan C';
        default: return 'Sin plan especificado';
      }
    }

    // Fallback genérico si la modalidad no está clara
    switch (id) {
      case 1: return '1er Año';
      case 2: return '2do Año';
      case 3: return '3er Año';
      case 4: return 'Plan A';
      case 5: return 'Plan B';
      case 6: return 'Plan C';
      default: return 'Sin categoría especificada';
    }
  };

  // Función auxiliar MEJORADA para extraer plan/año de los datos del estudiante
  const extraerPlanAnio = (estudiante, modalidad) => {
    // Prioridad: planAnioId > planAnio > cursoPlan > plan > modulos
    if (estudiante.planAnioId && estudiante.planAnioId !== '' && estudiante.planAnioId !== null) {
      return mapearPlanAnioId(estudiante.planAnioId, modalidad);
    }

    // Si no hay planAnioId, intentar extraer de los campos de texto
    const planTexto = estudiante.planAnio || estudiante.cursoPlan || estudiante.plan || estudiante.modulos || '';

    if (planTexto && planTexto !== '') {
      const planTextoLower = planTexto.toLowerCase();

      // Para PRESENCIAL: buscar patrones de año con MÚLTIPLES VARIACIONES
      if (modalidad === 'PRESENCIAL') {
        // 1er Año - múltiples patrones
        if (planTextoLower.includes('1') ||
          planTextoLower.includes('primer') ||
          planTextoLower.includes('primero') ||
          planTextoLower.includes('1er') ||
          planTextoLower.includes('i año') ||
          planTextoLower.includes('año 1')) {
          return '1er Año';
        }
        // 2do Año - múltiples patrones
        if (planTextoLower.includes('2') ||
          planTextoLower.includes('segundo') ||
          planTextoLower.includes('2do') ||
          planTextoLower.includes('ii año') ||
          planTextoLower.includes('año 2')) {
          return '2do Año';
        }
        // 3er Año - múltiples patrones
        if (planTextoLower.includes('3') ||
          planTextoLower.includes('tercer') ||
          planTextoLower.includes('tercero') ||
          planTextoLower.includes('3er') ||
          planTextoLower.includes('iii año') ||
          planTextoLower.includes('año 3')) {
          return '3er Año';
        }
      }
      // Para SEMIPRESENCIAL: buscar patrones de plan con MÚLTIPLES VARIACIONES
      else if (modalidad === 'SEMIPRESENCIAL') {
        if (planTextoLower.includes('plan a') || planTextoLower.includes(' a ') || planTextoLower === 'a') return 'Plan A';
        if (planTextoLower.includes('plan b') || planTextoLower.includes(' b ') || planTextoLower === 'b') return 'Plan B';
        if (planTextoLower.includes('plan c') || planTextoLower.includes(' c ') || planTextoLower === 'c') return 'Plan C';
      }

      // Si no se puede mapear pero hay texto, devolver el valor original limpio
      return planTexto.trim();
    }

    // Fallback
    if (modalidad === 'PRESENCIAL') return 'Sin año especificado';
    else if (modalidad === 'SEMIPRESENCIAL') return 'Sin plan especificado';
    else return 'Sin categoría especificada';
  };

  // Función para RECLASIFICAR modalidad según el plan/año detectado
  const detectarModalidadReal = (estudiante) => {
    // Primero intentar extraer el plan/año
    const modalidadOriginal = estudiante.modalidad || 'SIN MODALIDAD';

    // Intentar extraer el plan/año usando la función existente
    const planAnio = extraerPlanAnio(estudiante, modalidadOriginal);

    // Si detectamos un año (1er, 2do, 3er), la modalidad REAL es PRESENCIAL
    if (planAnio === '1er Año' || planAnio === '2do Año' || planAnio === '3er Año') {
      return 'PRESENCIAL';
    }

    // Si detectamos un plan (A, B, C), la modalidad REAL es SEMIPRESENCIAL
    if (planAnio === 'Plan A' || planAnio === 'Plan B' || planAnio === 'Plan C') {
      return 'SEMIPRESENCIAL';
    }

    // Si no podemos determinar, usar la modalidad original
    return modalidadOriginal;
  };

  // Agrupar por modalidad CORREGIDA (basada en plan/año detectado)
  const grupos = {};
  estudiantesFiltrados.forEach(estudiante => {
    const modalidadReal = detectarModalidadReal(estudiante);
    if (!grupos[modalidadReal]) grupos[modalidadReal] = [];
    grupos[modalidadReal].push(estudiante);
  });

  // Procesar cada modalidad
  Object.entries(grupos).forEach(([modalidad, estudiantes]) => {
    modalidades.push({
      nombre: modalidad,
      cantidad: estudiantes.length
    });

    totalPorModalidad[modalidad] = estudiantes.length;

    // Detalle específico según modalidad usando la función mejorada
    const detalle = {};
    estudiantes.forEach(est => {
      const categoria = extraerPlanAnio(est, modalidad);
      detalle[categoria] = (detalle[categoria] || 0) + 1;
    });
    detalleModalidad[modalidad] = detalle;
  });

  // ===== ORDENAR DETALLE POR MODALIDAD EN ORDEN ASCENDENTE =====
  Object.keys(detalleModalidad).forEach(modalidad => {
    const detalle = detalleModalidad[modalidad];
    const ordenado = {};

    // Definir el orden correcto según modalidad
    let ordenCorrecto = [];
    if (modalidad === 'PRESENCIAL') {
      ordenCorrecto = ['1er Año', '2do Año', '3er Año', 'Sin año especificado'];
    } else if (modalidad === 'SEMIPRESENCIAL') {
      ordenCorrecto = ['Plan A', 'Plan B', 'Plan C', 'Sin plan especificado'];
    } else {
      // Para otras modalidades, ordenar alfabéticamente
      ordenCorrecto = Object.keys(detalle).sort();
    }

    // Aplicar el orden
    ordenCorrecto.forEach(clave => {
      if (detalle[clave] !== undefined) {
        ordenado[clave] = detalle[clave];
      }
    });

    // Agregar cualquier clave que no esté en el orden predefinido
    Object.keys(detalle).forEach(clave => {
      if (!ordenado[clave]) {
        ordenado[clave] = detalle[clave];
      }
    });

    detalleModalidad[modalidad] = ordenado;
  });

  // Generar observaciones
  const observaciones = generarObservacionesDistribucion({
    total,
    modalidades,
    detalleModalidad,
    modalidadSeleccionada
  });

  return {
    total,
    modalidades,
    detalleModalidad,
    totalPorModalidad,
    observaciones
  };
};

// ===== FUNCIÓN PARA GENERAR OBSERVACIONES =====
const generarObservacionesDistribucion = (analisis) => {
  const observaciones = [];

  // Observaciones sobre modalidades
  if (analisis.modalidades.length === 1) {
    observaciones.push(`Solo se detecta una modalidad: ${analisis.modalidades[0].nombre}.`);
  } else if (analisis.modalidades.length > 2) {
    observaciones.push(`Se detectan ${analisis.modalidades.length} modalidades diferentes.`);
  }

  // Observaciones sobre distribución
  const modalidadMayoritaria = analisis.modalidades.reduce((max, modal) =>
    modal.cantidad > max.cantidad ? modal : max
  );

  const porcentajeMayoritaria = (modalidadMayoritaria.cantidad / analisis.total) * 100;

  if (porcentajeMayoritaria > 80) {
    observaciones.push(`Alta concentración en modalidad ${modalidadMayoritaria.nombre} (${porcentajeMayoritaria.toFixed(1)}%).`);
  }

  // Observaciones específicas por modalidad
  Object.entries(analisis.detalleModalidad).forEach(([modalidad, detalle]) => {
    const categorias = Object.keys(detalle);

    if (modalidad === 'PRESENCIAL') {
      // Verificar si hay años válidos (1er Año, 2do Año, 3er Año)
      const anosValidos = categorias.filter(cat => cat.includes('Año') && !cat.includes('Sin'));
      if (anosValidos.length === 0 && categorias.some(cat => cat.includes('Sin'))) {
        observaciones.push(`Modalidad ${modalidad}: Falta información de año/curso específico.`);
      } else if (anosValidos.length > 0) {
        observaciones.push(`Modalidad ${modalidad}: Distribuidos en ${anosValidos.join(', ')}.`);
      }
    } else if (modalidad === 'SEMIPRESENCIAL') {
      // Verificar si hay planes válidos (Plan A, Plan B, Plan C)
      const planesValidos = categorias.filter(cat => cat.includes('Plan') && !cat.includes('Sin'));
      if (planesValidos.length === 0 && categorias.some(cat => cat.includes('Sin'))) {
        observaciones.push(`Modalidad ${modalidad}: Falta información de plan específico.`);
      } else if (planesValidos.length > 0) {
        observaciones.push(`Modalidad ${modalidad}: Distribuidos en ${planesValidos.join(', ')}.`);
      }
    } else {
      // Para otras modalidades
      if (categorias.length === 1 && categorias[0].includes('Sin')) {
        observaciones.push(`Modalidad ${modalidad}: Falta información de categorización específica.`);
      }
    }
  });

  // Observaciones sobre la modalidad seleccionada
  if (analisis.modalidadSeleccionada !== 'todas') {
    observaciones.push(`Análisis filtrado para modalidad: ${analisis.modalidadSeleccionada.toUpperCase()}.`);
  }

  return observaciones;
};

// ===== FUNCIÓN PARA MOSTRAR GRÁFICOS INTERACTIVOS =====
export const mostrarGraficosTendenciasPlan = (setModalGraficosPlan) => {
  setModalGraficosPlan(true);
};