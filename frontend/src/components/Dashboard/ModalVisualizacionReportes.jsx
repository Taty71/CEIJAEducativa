import { useState } from 'react';
import PropTypes from 'prop-types';
import CloseButton from '../CloseButton';
import { 
  analizarEstados,
  analizarTendenciasModalidad,
  analizarPeriodos,
  analizarDocumentacion,
  generarKPIsAvanzados,
  analizarModalidades,
  analizarRendimiento
} from './ReportesVisualizacionService';
import {
  generarAnalisisEstados,
  generarTendenciasPlan,
  generarAnalisisPeriodos,
  generarAnalisisDocumentacion,
  generarDashboardEjecutivo,
  generarReportePorModalidad,
  generarAnalisisRendimiento
} from '../ListaEstudiantes/ReportesService';
import '../../estilos/modalVisualizacionReportes.css';

const ModalVisualizacionReportes = ({ 
  mostrarModal, 
  onCerrar, 
  estudiantes, 
  showAlerta 
}) => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);

  if (!mostrarModal) return null;

  const generarVisualizacion = (tipoReporte) => {
    let datos = null;
    
    switch (tipoReporte) {
      case 'estados':
        datos = analizarEstados(estudiantes);
        break;
      case 'tendencias':
        datos = analizarTendenciasModalidad(estudiantes, 'todas');
        break;
      case 'periodos':
        datos = analizarPeriodos(estudiantes);
        break;
      case 'documentacion':
        datos = analizarDocumentacion(estudiantes);
        break;
      case 'kpis':
        datos = generarKPIsAvanzados(estudiantes);
        break;
      case 'modalidades':
        datos = analizarModalidades(estudiantes);
        break;
      case 'rendimiento':
        datos = analizarRendimiento(estudiantes);
        break;
      default:
        datos = null;
    }
    
    setDatosReporte(datos);
    setReporteSeleccionado(tipoReporte);
  };

  const generarPDF = (tipoReporte) => {
    switch (tipoReporte) {
      case 'estados':
        generarAnalisisEstados(estudiantes, showAlerta);
        break;
      case 'tendencias':
        generarTendenciasPlan(estudiantes, showAlerta, 'todas');
        break;
      case 'periodos':
        generarAnalisisPeriodos(estudiantes, showAlerta);
        break;
      case 'documentacion':
        generarAnalisisDocumentacion(estudiantes, showAlerta);
        break;
      case 'kpis':
        generarDashboardEjecutivo(estudiantes, showAlerta);
        break;
      case 'modalidades':
        generarReportePorModalidad(estudiantes, showAlerta);
        break;
      case 'rendimiento':
        generarAnalisisRendimiento(estudiantes, showAlerta);
        break;
      default:
        showAlerta('Tipo de reporte no reconocido', 'error');
    }
  };

  const reportes = [
    {
      id: 'estados',
      icon: '📊',
      titulo: 'Análisis de Estados',
      descripcion: 'Distribución de inscripciones: pendientes, completas, anuladas',
      color: '#3498db'
    },
    {
      id: 'tendencias',
      icon: '📈',
      titulo: 'Tendencias de Inscripciones por Modalidad',
      descripcion: 'Presencial vs Semipresencial por planes y cursos',
      color: '#e74c3c'
    },
    {
      id: 'periodos',
      icon: '📅',
      titulo: 'Períodos de Inscripción',
      descripcion: 'Análisis temporal y estacional',
      color: '#f39c12'
    },
    {
      id: 'modalidades',
      icon: '🏫',
      titulo: 'Análisis por Modalidad',
      descripcion: 'Estadísticas detalladas por modalidad',
      color: '#9b59b6'
    },
    {
      id: 'rendimiento',
      icon: '⚡',
      titulo: 'Activos vs Inactivos',
      descripcion: 'Análisis de rendimiento estudiantil',
      color: '#1abc9c'
    },
    {
      id: 'documentacion',
      icon: '📋',
      titulo: 'Estado Documental',
      descripcion: 'Completitud y documentos faltantes',
      color: '#34495e'
    },
    {
      id: 'kpis',
      icon: '💼',
      titulo: 'Resumen Ejecutivo de Métricas Institucionales',
      descripcion: 'Dashboard con métricas institucionales avanzadas',
      color: '#e67e22'
    }
  ];

  const renderDetalleReporte = () => {
    if (!datosReporte || !reporteSeleccionado) return null;

    switch (reporteSeleccionado) {
      case 'estados':
        return <DetalleEstados datos={datosReporte} />;
      case 'tendencias':
        return <DetalleTendencias datos={datosReporte} />;
      case 'periodos':
        return <DetallePeriodos datos={datosReporte} />;
      case 'documentacion':
        return <DetalleDocumentacion datos={datosReporte} />;
      case 'kpis':
        return <DetalleKPIs datos={datosReporte} />;
      case 'modalidades':
        return <DetalleModalidades datos={datosReporte} />;
      case 'rendimiento':
        return <DetalleRendimiento datos={datosReporte} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-viz-overlay" onClick={(e) => {
      if (e.target.className === 'modal-viz-overlay') {
        onCerrar();
      }
    }}>
      <div className="modal-viz-contenido">
        <div className="modal-viz-header">
          <h3>📊 Centro de Análisis y Visualización</h3>
          <CloseButton onClose={onCerrar} />
        </div>
        
        <div className="modal-viz-body">
          {!reporteSeleccionado ? (
            <div className="reportes-grid-viz">
              {reportes.map(reporte => (
                <div key={reporte.id} className="reporte-card-viz" style={{ borderLeft: `4px solid ${reporte.color}` }}>
                  <div className="reporte-icon-viz">{reporte.icon}</div>
                  <h4>{reporte.titulo}</h4>
                  <p>{reporte.descripcion}</p>
                  <div className="botones-reporte">
                    <button
                      className="btn-visualizar"
                      onClick={() => generarVisualizacion(reporte.id)}
                    >
                      👁️ Ver Análisis
                    </button>
                    <button
                      className="btn-pdf"
                      onClick={() => generarPDF(reporte.id)}
                    >
                      📄 Emitir PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="detalle-reporte">
              <div className="detalle-header">
                <button 
                  className="btn-volver"
                  onClick={() => {
                    setReporteSeleccionado(null);
                    setDatosReporte(null);
                  }}
                >
                  ← Volver
                </button>
                <h4>{reportes.find(r => r.id === reporteSeleccionado)?.titulo}</h4>
                <button
                  className="btn-pdf-detalle"
                  onClick={() => generarPDF(reporteSeleccionado)}
                >
                  📄 Emitir PDF
                </button>
              </div>
              
              <div className="detalle-contenido">
                {renderDetalleReporte()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTES DE DETALLE PARA CADA TIPO DE REPORTE
// ===================================================================

const DetalleEstados = ({ datos }) => (
  <div className="detalle-estados">
    <div className="seccion-resumen">
      <h5>📋 Resumen General</h5>
      <div className="metricas-grid">
        <div className="metrica">
          <span className="valor">{datos.resumen.total}</span>
          <span className="label">Total Inscripciones</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.resumen.estados}</span>
          <span className="label">Estados Diferentes</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.metricas.tasaAprobacion}%</span>
          <span className="label">Tasa Inscripciones Completas</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.metricas.tasaPendientes}%</span>
          <span className="label">Inscripciones Pendientes</span>
        </div>
      </div>
    </div>

    <div className="seccion-distribucion">
      <h5>📊 Distribución por Estado</h5>
      <div className="estados-lista">
        {datos.distribucion.map((estado, index) => (
          <div key={index} className="estado-item">
            <div className="estado-info">
              <span className="estado-nombre">{estado.estado}</span>
              <div className="estado-stats">
                <span className="cantidad">{estado.cantidad} estudiantes</span>
                <span className="porcentaje">({estado.porcentaje}%)</span>
              </div>
            </div>
            <div className="barra-progreso">
              <div 
                className="barra-fill" 
                style={{ width: `${estado.porcentaje}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {datos.metricas.alertas.length > 0 && (
      <div className="seccion-alertas">
        <h5>⚠️ Alertas del Sistema</h5>
        {datos.metricas.alertas.map((alerta, index) => (
          <div key={index} className={`alerta alerta-${alerta.tipo}`}>
            {alerta.mensaje}
          </div>
        ))}
      </div>
    )}
  </div>
);

const DetalleTendencias = ({ datos }) => (
  <div className="detalle-tendencias">
    <div className="seccion-resumen">
      <h5>📈 Distribución de Inscripciones por Modalidad</h5>
      <div className="modalidades-grid">
        <div className="modalidad-card presencial">
          <h6>🏛️ PRESENCIAL</h6>
          <p style={{fontSize: '0.8rem', margin: '4px 0', color: '#1565c0', fontWeight: '500'}}>
            Período: 20 Feb - 31 Mar
          </p>
          <div className="modalidad-stats">
            <span className="cantidad">{datos.resumen.totalPresencial}</span>
            <span className="porcentaje">
              ({((datos.resumen.totalPresencial / datos.resumen.total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="modalidad-card semipresencial">
          <h6>💻 SEMIPRESENCIAL</h6>
          <p style={{fontSize: '0.8rem', margin: '4px 0', color: '#6c757d', fontWeight: '500'}}>
            Período: 20 Feb - 31 Oct
          </p>
          <div className="modalidad-stats">
            <span className="cantidad">{datos.resumen.totalSemipresencial}</span>
            <span className="porcentaje">
              ({((datos.resumen.totalSemipresencial / datos.resumen.total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    {datos.presencial.cursos.length > 0 && (
      <div className="seccion-presencial">
        <h5 style={{ color: '#0066cc' }}>🏛️ INSCRIPCIONES PRESENCIALES - Detalle por Curso</h5>
        <p style={{fontSize: '0.9rem', margin: '0 0 16px 0', color: '#374151', fontStyle: 'italic'}}>
          📅 Período de inscripción limitado: 20 febrero - 31 marzo
        </p>
        {datos.presencial.cursos.map((curso, index) => (
          <div key={index} className="curso-item">
            <div className="curso-header">
              <span className="curso-nombre">{curso.curso}</span>
              <span className="curso-cantidad">{curso.cantidad} estudiantes</span>
            </div>
            <div className="curso-stats">
              <span>Del total presencial: {curso.porcentajePresencial}%</span>
              <span>Del total general: {curso.porcentajeTotal}%</span>
            </div>
          </div>
        ))}
      </div>
    )}

    {datos.semipresencial.planes.length > 0 && (
      <div className="seccion-semipresencial">
        <h5 style={{ color: '#8b4513' }}>💻 INSCRIPCIONES SEMIPRESENCIALES - Detalle por Plan</h5>
        <p style={{fontSize: '0.9rem', margin: '0 0 16px 0', color: '#374151', fontStyle: 'italic'}}>
          📅 Período extendido de inscripción: 20 febrero - 31 octubre
        </p>
        {datos.semipresencial.planes.map((plan, index) => (
          <div key={index} className="plan-item">
            <div className="plan-header">
              <span className="plan-nombre">{plan.plan}</span>
              <span className="plan-cantidad">{plan.cantidad} estudiantes</span>
            </div>
            <div className="plan-stats">
              <span>Del total semipresencial: {plan.porcentajeSemipresencial}%</span>
              <span>Del total general: {plan.porcentajeTotal}%</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DetallePeriodos = ({ datos }) => (
  <div className="detalle-periodos">
    <div className="seccion-resumen">
      <h5>📅 Análisis Temporal</h5>
      <div className="estadisticas-grid">
        <div className="estadistica">
          <span className="valor">{datos.estadisticas.promedio}</span>
          <span className="label">Promedio Mensual de Inscripciones</span>
        </div>
        <div className="estadistica">
          <span className="valor">{datos.estadisticas.maximo}</span>
          <span className="label">Pico Máximo</span>
        </div>
        <div className="estadistica">
          <span className="valor">{datos.estadisticas.minimo}</span>
          <span className="label">Mínimo</span>
        </div>
        <div className="estadistica">
          <span className="valor">{datos.estadisticas.tendencia}</span>
          <span className="label">Tendencia de Inscripciones</span>
        </div>
      </div>
    </div>

    <div className="seccion-distribucion">
      <h5>📊 Distribución por Período</h5>
      {datos.distribucion.map((periodo, index) => (
        <div key={index} className="periodo-item">
          <div className="periodo-info">
            <span className="periodo-fecha">{periodo.periodo}</span>
            <div className="periodo-stats">
              <span className="cantidad">{periodo.cantidad} inscripciones</span>
              <span className="porcentaje">({periodo.porcentaje}%)</span>
            </div>
          </div>
          <div className="barra-progreso">
            <div 
              className="barra-fill" 
              style={{ width: `${Math.min(periodo.porcentaje * 2, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetalleDocumentacion = ({ datos }) => (
  <div className="detalle-documentacion">
    <div className="seccion-resumen">
      <h5>📋 Estado Documental General</h5>
      <div className="metricas-grid">
        <div className="metrica">
          <span className="valor">{datos.resumen.completitudPromedio}%</span>
          <span className="label">Completitud Promedio</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.resumen.tiposDocumentos}</span>
          <span className="label">Tipos de Documentos</span>
        </div>
      </div>
    </div>

    <div className="seccion-distribucion">
      <h5>📊 Distribución por Estado</h5>
      {datos.distribucion.map((estado, index) => (
        <div key={index} className="doc-estado-item">
          <div className="estado-info">
            <span className="estado-nombre">{estado.estado.replace('_', ' ')}</span>
            <div className="estado-stats">
              <span className="cantidad">{estado.cantidad} estudiantes</span>
              <span className="porcentaje">({estado.porcentaje}%)</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="seccion-faltantes">
      <h5>⚠️ Documentos Más Faltantes</h5>
      {datos.documentosFaltantes.slice(0, 5).map((doc, index) => (
        <div key={index} className="documento-faltante">
          <span className="doc-tipo">{doc.tipo}</span>
          <div className="doc-stats">
            <span className="faltantes">{doc.faltantes} faltantes</span>
            <span className="porcentaje">({doc.porcentajeFaltante}%)</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetalleKPIs = ({ datos }) => (
  <div className="detalle-kpis">
    <div className="seccion-kpis-basicos">
      <h5>📊 KPIs Básicos</h5>
      <div className="kpis-grid">
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisBasicos.totalEstudiantes}</span>
          <span className="kpi-label">Total Inscripciones</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisBasicos.tasaAprobacion}%</span>
          <span className="kpi-label">Tasa Inscripciones Completas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisBasicos.tasaPendientes}%</span>
          <span className="kpi-label">Inscripciones Pendientes</span>
        </div>
      </div>
    </div>

    <div className="seccion-kpis-avanzados">
      <h5>🎯 KPIs Avanzados</h5>
      <div className="kpis-avanzados-grid">
        <div className="kpi-avanzado">
          <h6>Eficiencia del Proceso de Inscripciones</h6>
          <div className="kpi-detalle">
            <span>Tasa Finalización Administrativa: {datos.kpisAvanzados.eficienciaProceso.tasaFinalizacionAdministrativa}%</span>
            <span>Calidad del Proceso de Inscripciones: {datos.kpisAvanzados.eficienciaProceso.indicadorCalidad}</span>
          </div>
        </div>
        <div className="kpi-avanzado">
          <h6>Tendencias Temporales</h6>
          <div className="kpi-detalle">
            <span>Promedio Mensual: {datos.kpisAvanzados.tendenciasTemporales.promedioMensual}</span>
            <span>Tendencia: {datos.kpisAvanzados.tendenciasTemporales.tendenciaGeneral}</span>
          </div>
        </div>
      </div>
    </div>

    {datos.recomendaciones.length > 0 && (
      <div className="seccion-recomendaciones">
        <h5>💡 Recomendaciones Estratégicas</h5>
        {datos.recomendaciones.map((rec, index) => (
          <div key={index} className={`recomendacion recomendacion-${rec.prioridad}`}>
            <div className="rec-header">
              <span className="rec-area">{rec.area}</span>
              <span className="rec-prioridad">{rec.prioridad}</span>
            </div>
            <p className="rec-texto">{rec.recomendacion}</p>
            <span className="rec-impacto">💫 {rec.impactoEstimado}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DetalleModalidades = ({ datos }) => (
  <div className="detalle-modalidades">
    <div className="seccion-resumen">
      <h5>🏫 Análisis por Modalidad</h5>
      <div className="modalidades-stats">
        <div className="stat">
          <span className="valor">{datos.resumen.totalEstudiantes}</span>
          <span className="label">Total Inscripciones</span>
        </div>
        <div className="stat">
          <span className="valor">{datos.resumen.modalidadesDetectadas}</span>
          <span className="label">Modalidades</span>
        </div>
        <div className="stat">
          <span className="valor">{datos.metricas.modalidadPrincipal}</span>
          <span className="label">Principal</span>
        </div>
      </div>
    </div>

    <div className="seccion-distribucion">
      <h5>📊 Distribución Detallada</h5>
      {datos.distribucion.map((modalidad, index) => (
        <div key={index} className="modalidad-detalle">
          <div className="modalidad-header">
            <h6>{modalidad.modalidad}</h6>
            <div className="modalidad-stats">
              <span className="cantidad">{modalidad.cantidad} estudiantes</span>
              <span className="porcentaje">({modalidad.porcentaje}%)</span>
            </div>
          </div>
          
          <div className="estados-modalidad">
            {modalidad.estados.map((estado, eIndex) => (
              <div key={eIndex} className="estado-en-modalidad">
                <span className="estado-nombre">{estado.estado}</span>
                <span className="estado-cantidad">{estado.cantidad} ({estado.porcentaje}%)</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetalleRendimiento = ({ datos }) => (
  <div className="detalle-rendimiento">
    <div className="seccion-resumen">
      <h5>⚡ Análisis de Rendimiento</h5>
      <div className="rendimiento-grid">
        <div className="rendimiento-card activos">
          <h6>✅ ACTIVOS</h6>
          <div className="rendimiento-stats">
            <span className="cantidad">{datos.resumen.activos}</span>
            <span className="porcentaje">({datos.resumen.tasaActividad}%)</span>
          </div>
        </div>
        <div className="rendimiento-card inactivos">
          <h6>❌ INACTIVOS</h6>
          <div className="rendimiento-stats">
            <span className="cantidad">{datos.resumen.inactivos}</span>
            <span className="porcentaje">({(100 - parseFloat(datos.resumen.tasaActividad)).toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>

    <div className="seccion-activos">
      <h5 style={{ color: '#27ae60' }}>✅ Estudiantes Activos</h5>
      {datos.detalleActivos.distribucionModalidad.map((modalidad, index) => (
        <div key={index} className="modalidad-activos">
          <span className="modalidad-nombre">{modalidad.modalidad}</span>
          <div className="modalidad-stats">
            <span className="cantidad">{modalidad.cantidad} activos</span>
            <span className="porcentaje">({modalidad.porcentaje}%)</span>
          </div>
        </div>
      ))}
    </div>

    <div className="seccion-inactivos">
      <h5 style={{ color: '#e74c3c' }}>❌ Causas de Inactividad</h5>
      {datos.detalleInactivos.causasInactividad.map((causa, index) => (
        <div key={index} className="causa-inactividad">
          <span className="causa-nombre">{causa.causa}</span>
          <div className="causa-stats">
            <span className="cantidad">{causa.cantidad} estudiantes</span>
            <span className="porcentaje">({causa.porcentaje}%)</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

ModalVisualizacionReportes.propTypes = {
  mostrarModal: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired,
  estudiantes: PropTypes.array.isRequired,
  showAlerta: PropTypes.func.isRequired
};

DetalleEstados.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleTendencias.propTypes = {
  datos: PropTypes.object.isRequired
};

DetallePeriodos.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleDocumentacion.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleKPIs.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleModalidades.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleRendimiento.propTypes = {
  datos: PropTypes.object.isRequired
};

export default ModalVisualizacionReportes;