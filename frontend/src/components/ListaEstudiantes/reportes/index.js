// ===== ÍNDICE DE REPORTES MODULARES =====
// Este archivo centraliza todas las exportaciones de los módulos de reportes

// Utilidades compartidas
export * from './utils';

// Reportes de Dashboard y KPIs
export * from './dashboardEjecutivo';

// Análisis de Estados y Tendencias
export * from './analisisEstados';
export * from './analisisPeriodos';
export * from './tendenciasPlan';

// Análisis de Documentación y Rendimiento
export * from './analisisDocumentacion';
export * from './analisisEstadoInstitucional';

// Reportes Básicos y Estadísticos
export * from './reportesBasicos';

// ===== FUNCIONES DE CONVENIENCIA =====

/**
 * Obtiene todas las funciones de generación de reportes disponibles
 * @returns {Object} Objeto con todas las funciones de reporte organizadas por categoría
 */
export const obtenerFuncionesReporte = () => {
  return {
    // Dashboard y KPIs
    dashboard: {
      pdf: 'generarDashboardEjecutivo',
      excel: 'generarDashboardEjecutivoExcel'
    },
    
    // Análisis de Estados
    estados: {
      pdf: 'generarAnalisisEstados',
      excel: 'generarAnalisisEstadosExcel'
    },
    
    // Análisis de Períodos
    periodos: {
      pdf: 'generarAnalisisPeriodos',
      excel: 'generarAnalisisPeriodosExcel'
    },
    
    // Análisis de Documentación
    documentacion: {
      pdf: 'generarAnalisisDocumentacion',
      excel: 'generarAnalisisDocumentacionExcel'
    },
    
    // Tendencias de Plan
    tendencias: {
      pdf: 'generarTendenciasPlan',
      excel: 'generarTendenciasPlanExcel'
    },
    
    // Análisis de Rendimiento
    rendimiento: {
      pdf: 'generarAnalisisRendimiento',
      excel: 'generarAnalisisRendimientoExcel'
    },
    
    // Reportes Básicos
    estadistico: {
      pdf: 'generarReporteEstadisticoPDF',
      excel: 'generarReporteEstadistico'
    },
    
    // Exportación de datos
    exportacion: {
      csv: 'exportarCSV',
      pendientes: 'exportarRegistrosPendientes'
    }
  };
};

/**
 * Lista todos los tipos de reporte disponibles
 * @returns {string[]} Array con los nombres de todos los tipos de reporte
 */
export const obtenerTiposReporte = () => {
  const funciones = obtenerFuncionesReporte();
  return Object.keys(funciones);
};

/**
 * Verifica si un tipo de reporte está disponible
 * @param {string} tipo - Tipo de reporte a verificar
 * @returns {boolean} True si el tipo está disponible
 */
export const esTipoReporteValido = (tipo) => {
  const tipos = obtenerTiposReporte();
  return tipos.includes(tipo);
};

/**
 * Obtiene información sobre un tipo específico de reporte
 * @param {string} tipo - Tipo de reporte
 * @returns {Object|null} Información del reporte o null si no existe
 */
export const obtenerInfoReporte = (tipo) => {
  const funciones = obtenerFuncionesReporte();
  return funciones[tipo] || null;
};