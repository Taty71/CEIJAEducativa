import { useState } from 'react';
import PropTypes from 'prop-types';
import { obtenerExplicacionesKPIs } from './ReportesVisualizacionService';

const KPIExplicaciones = ({ kpiActual, valorActual }) => {
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const explicaciones = obtenerExplicacionesKPIs();

  const obtenerExplicacionEspecifica = (kpi, valor) => {
    const valorNum = parseFloat(valor);
    
    switch(kpi) {
      case 'tasaRetencion':
      case 'tasa_retencion':
        if (valorNum >= 85) return { nivel: 'excelente', color: 'text-green-600', descripcion: explicaciones.metricas_principales.tasa_retencion.interpretacion.excelente };
        if (valorNum >= 70) return { nivel: 'buena', color: 'text-blue-600', descripcion: explicaciones.metricas_principales.tasa_retencion.interpretacion.buena };
        if (valorNum >= 50) return { nivel: 'regular', color: 'text-yellow-600', descripcion: explicaciones.metricas_principales.tasa_retencion.interpretacion.regular };
        return { nivel: 'critica', color: 'text-red-600', descripcion: explicaciones.metricas_principales.tasa_retencion.interpretacion.critica };
        
      case 'tasaFinalizacionAdministrativa':
      case 'tasa_finalizacion_administrativa':
        if (valorNum >= 85) return { nivel: 'excelente', color: 'text-green-600', descripcion: explicaciones.metricas_principales.tasa_finalizacion_administrativa.interpretacion.excelente };
        if (valorNum >= 70) return { nivel: 'buena', color: 'text-blue-600', descripcion: explicaciones.metricas_principales.tasa_finalizacion_administrativa.interpretacion.buena };
        if (valorNum >= 50) return { nivel: 'regular', color: 'text-yellow-600', descripcion: explicaciones.metricas_principales.tasa_finalizacion_administrativa.interpretacion.regular };
        return { nivel: 'critica', color: 'text-red-600', descripcion: explicaciones.metricas_principales.tasa_finalizacion_administrativa.interpretacion.critica };
        
      case 'promedioMensual':
      case 'promedio_mensual':
        return { 
          nivel: 'informativo', 
          color: 'text-blue-600', 
          descripcion: `${explicaciones.metricas_principales.promedio_mensual.definicion}. ${explicaciones.metricas_principales.promedio_mensual.utilidad}` 
        };
        
      case 'tendenciaGeneral':
      case 'tendencia': {
        const tendenciaInfo = explicaciones.metricas_principales.tendencia_temporal.valores_posibles[valor] || 'Información no disponible';
        const colorTendencia = valor === 'creciente' ? 'text-green-600' : valor === 'estable' ? 'text-blue-600' : 'text-red-600';
        return { nivel: valor, color: colorTendencia, descripcion: tendenciaInfo };
      }
        
      default:
        return { nivel: 'informativo', color: 'text-gray-600', descripcion: 'Métrica de seguimiento institucional' };
    }
  };

  const explicacionActual = obtenerExplicacionEspecifica(kpiActual, valorActual);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
        className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
        title="¿Qué significa este KPI?"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {mostrarExplicacion && (
        <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-800">¿Qué significa este KPI?</h4>
            <button
              onClick={() => setMostrarExplicacion(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Valor actual: </span>
              <span className={`font-bold ${explicacionActual.color}`}>
                {valorActual} ({explicacionActual.nivel})
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Explicación: </span>
              <p className="text-gray-600 text-sm mt-1">
                {explicacionActual.descripcion}
              </p>
            </div>
            
            {/* Mostrar acciones recomendadas según el KPI */}
            {kpiActual === 'tasaRetencion' && explicaciones.metricas_principales.tasa_retencion.acciones_mejora && (
              <div>
                <span className="font-medium text-gray-700">Acciones para mejorar:</span>
                <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                  {explicaciones.metricas_principales.tasa_retencion.acciones_mejora.slice(0, 2).map((accion, index) => (
                    <li key={index}>{accion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(kpiActual === 'tasaFinalizacionAdministrativa' || kpiActual === 'tasa_finalizacion_administrativa') && explicaciones.metricas_principales.tasa_finalizacion_administrativa.acciones_mejora && (
              <div>
                <span className="font-medium text-gray-700">Acciones para mejorar:</span>
                <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                  {explicaciones.metricas_principales.tasa_finalizacion_administrativa.acciones_mejora.slice(0, 2).map((accion, index) => (
                    <li key={index}>{accion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Validación de props para KPIExplicaciones
KPIExplicaciones.propTypes = {
  kpiActual: PropTypes.string.isRequired,
  valorActual: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

// Componente para mostrar el glosario completo de KPIs
export const GlosarioKPIs = ({ mostrar, onCerrar }) => {
  const explicaciones = obtenerExplicacionesKPIs();

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onCerrar}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📊 Guía Completa de KPIs - CEIJA5</h2>
              <button
                onClick={onCerrar}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Conceptos Generales */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">🎯 ¿Qué son los KPIs?</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Definición:</strong> {explicaciones.conceptosGenerales.que_son_kpis}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Utilidad:</strong> {explicaciones.conceptosGenerales.para_que_sirven}
                </p>
                <p className="text-gray-700">
                  <strong>Interpretación:</strong> {explicaciones.conceptosGenerales.como_interpretarlos}
                </p>
              </div>
            </div>

            {/* Métricas Principales */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-600 mb-4">📈 Métricas Principales</h3>
              
              {/* Tasa de Retención */}
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Tasa de Retención</h4>
                <p className="text-gray-600 mb-3">{explicaciones.metricas_principales.tasa_retencion.definicion}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <strong className="text-green-600">Excelente (≥85%):</strong>
                    <p className="text-sm text-gray-600">{explicaciones.metricas_principales.tasa_retencion.interpretacion.excelente}</p>
                  </div>
                  <div>
                    <strong className="text-blue-600">Buena (70-84%):</strong>
                    <p className="text-sm text-gray-600">{explicaciones.metricas_principales.tasa_retencion.interpretacion.buena}</p>
                  </div>
                  <div>
                    <strong className="text-yellow-600">Regular (50-69%):</strong>
                    <p className="text-sm text-gray-600">{explicaciones.metricas_principales.tasa_retencion.interpretacion.regular}</p>
                  </div>
                  <div>
                    <strong className="text-red-600">Crítica (&lt;50%):</strong>
                    <p className="text-sm text-gray-600">{explicaciones.metricas_principales.tasa_retencion.interpretacion.critica}</p>
                  </div>
                </div>
              </div>

              {/* Tasa de Finalización Administrativa */}
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">📝 Tasa de Finalización Administrativa</h4>
                <p className="text-gray-600 mb-3">{explicaciones.metricas_principales.tasa_finalizacion_administrativa.definicion}</p>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Ejemplo:</strong> Si 100 estudiantes inician su inscripción y 75 completan todo el proceso administrativo, la tasa de finalización es 75%.</p>
                </div>
              </div>
            </div>

            {/* Preguntas Frecuentes */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-600 mb-4">❓ Preguntas Frecuentes</h3>
              <div className="space-y-4">
                {Object.entries(explicaciones.preguntas_frecuentes).map(([pregunta, respuesta], index) => (
                  <div key={index} className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-medium text-gray-800 mb-1">{pregunta}</h4>
                    <p className="text-gray-600 text-sm">{respuesta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas y Recomendaciones */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-orange-600 mb-4">🚨 Interpretando Alertas</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(explicaciones.alertas_y_recomendaciones.como_leer_alertas).map(([tipo, descripcion], index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <strong className="capitalize">{tipo}:</strong>
                    <p className="text-sm text-gray-600 mt-1">{descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validación de props para GlosarioKPIs
GlosarioKPIs.propTypes = {
  mostrar: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired
};

export default KPIExplicaciones;