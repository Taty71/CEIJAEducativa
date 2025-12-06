// ===== ARCHIVO DE COMPATIBILIDAD - REPORTES MODULARES =====
// Este archivo mantiene la compatibilidad con el código existente
// pero ahora utiliza los módulos de reportes refactorizados

// Importar todas las funciones de los módulos de reportes
import {
  // Dashboard Ejecutivo
  generarDashboardEjecutivo,
  generarDashboardEjecutivoExcel,
  
  // Análisis de Estados
  generarAnalisisEstados,
  generarAnalisisEstadosExcel,
  
  // Análisis de Períodos
  generarAnalisisPeriodos,
  generarAnalisisPeriodosExcel,
  
  // Análisis de Documentación
  generarAnalisisDocumentacion,
  generarAnalisisDocumentacionExcel,
  
  // Tendencias de Plan
  generarTendenciasPlan,
  generarTendenciasPlanExcel,
  
  // Análisis de Rendimiento
  generarAnalisisRendimiento,
  generarAnalisisRendimientoExcel,
  
  // Reportes Básicos
  generarReporteEstadisticoPDF,
  generarReporteEstadistico,
  exportarCSV,
  exportarRegistrosPendientes,
  
  // Utilidades
  normalizarTexto,
  crearEncabezadoInstitucional,
  exportarExcel,
  calcularPorcentaje
} from './reportes/index.js';

// ===== EXPORTACIONES PARA COMPATIBILIDAD =====
// Todas las funciones ahora se importan desde los módulos refactorizados

// Re-exportar todas las funciones para mantener compatibilidad
export {
  // Dashboard Ejecutivo
  generarDashboardEjecutivo,
  generarDashboardEjecutivoExcel,
  
  // Análisis de Estados
  generarAnalisisEstados,
  generarAnalisisEstadosExcel,
  
  // Análisis de Períodos
  generarAnalisisPeriodos,
  generarAnalisisPeriodosExcel,
  
  // Análisis de Documentación
  generarAnalisisDocumentacion,
  generarAnalisisDocumentacionExcel,
  
  // Tendencias de Plan
  generarTendenciasPlan,
  generarTendenciasPlanExcel,
  
  // Análisis de Rendimiento
  generarAnalisisRendimiento,
  generarAnalisisRendimientoExcel,
  
  // Reportes Básicos
  generarReporteEstadisticoPDF,
  generarReporteEstadistico,
  exportarCSV,
  exportarRegistrosPendientes,
  
  // Utilidades
  normalizarTexto,
  crearEncabezadoInstitucional,
  exportarExcel,
  calcularPorcentaje
};

// ===== COMENTARIOS SOBRE LA REFACTORIZACIÓN =====
/*
REFACTORIZACIÓN COMPLETADA:

✅ El archivo monolítico ReportesService.js (1662 líneas) ha sido dividido en módulos especializados:

📁 reportes/
  ├── utils.js                    - Utilidades compartidas
  ├── dashboardEjecutivo.js      - Dashboard ejecutivo y KPIs
  ├── analisisEstados.js         - Análisis de estados de inscripción
  ├── analisisPeriodos.js        - Análisis temporal y períodos
  ├── analisisDocumentacion.js   - Análisis de documentación
  ├── tendenciasPlan.js          - Tendencias de planes de estudio
  ├── analisisRendimiento.js     - Análisis de rendimiento académico
  ├── reportesBasicos.js         - Reportes estadísticos básicos
  └── index.js                   - Índice de exportaciones

🎯 BENEFICIOS DE LA REFACTORIZACIÓN:
- ✅ Código más mantenible y organizado
- ✅ Módulos enfocados en responsabilidades específicas  
- ✅ Fácil localización y corrección de bugs
- ✅ Mejor testing y desarrollo colaborativo
- ✅ Reutilización de utilities compartidas
- ✅ Compatibilidad total con el código existente

📚 EDUCACIÓN ESPECÍFICA:
- ✅ Terminología educativa correcta en todos los reportes
- ✅ Referencias específicas a "inscripciones" en lugar de términos genéricos
- ✅ KPIs adaptados al contexto educativo del CEIJA 5

🔧 MANTENIMIENTO:
- Para agregar nuevos reportes: crear módulo en reportes/ y exportar en index.js
- Para modificar reportes existentes: editar el módulo específico
- Utilidades compartidas están centralizadas en utils.js
*/