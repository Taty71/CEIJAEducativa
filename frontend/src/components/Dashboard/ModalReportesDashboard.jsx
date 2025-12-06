import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useUserContext } from '../../context/useUserContext';
import CloseButton from '../CloseButton';
import BotonCargando from '../BotonCargando';
import serviceListaEstudiantes from '../../services/serviceListaEstudiantes';
import GraficoTendenciasPlan from '../ListaEstudiantes/reportes/GraficoTendenciasPlan';
import GraficoEstadosInscripcion from '../ListaEstudiantes/reportes/GraficoEstadosInscripcion';
import GraficoPeriodosAcademicos from '../ListaEstudiantes/reportes/GraficoPeriodosAcademicos';
import GraficoActivosInactivos from '../ListaEstudiantes/reportes/GraficoActivosInactivos';
import { 
  analizarEstados,
  analizarTendenciasModalidad,
  analizarPeriodos,
  generarKPIsAvanzados,
  analizarRendimiento
} from './ReportesVisualizacionService';
import {
  generarAnalisisEstados,
  generarTendenciasPlan,
  generarAnalisisPeriodos,
  generarDashboardEjecutivo,
  generarAnalisisRendimiento,
  generarAnalisisEstadosExcel,
  generarDashboardEjecutivoExcel,
  generarTendenciasPlanExcel,
  generarAnalisisPeriodosExcel,
  generarAnalisisRendimientoExcel
} from '../ListaEstudiantes/ReportesService';
import '../../estilos/modalVisualizacionReportes.css';
import '../../estilos/ModalReportesDashboard.css';

const ModalReportesDashboard = ({ 
  mostrarModal, 
  onCerrar, 
  showAlerta 
}) => {
  const { user } = useUserContext();
  
  // Determinar modalidades disponibles según el rol del usuario
  const obtenerModalidadesDisponibles = () => {
    const rol = user?.rol?.toLowerCase();
    
    switch (rol) {
      case 'secretario':
        return {
          modalidades: ['presencial'],
          defaultSelection: 'presencial',
          titulo: 'Modalidad Presencial'
        };
      case 'coordinador':
      case 'coordinador administrativo':
      case 'coordinadoradministrativo':
        return {
          modalidades: ['semipresencial'],
          defaultSelection: 'semipresencial',
          titulo: 'Modalidad Semipresencial'
        };
      case 'admdirector':
      case 'administrador':
      default:
        return {
          modalidades: ['todas', 'presencial', 'semipresencial'],
          defaultSelection: 'todas',
          titulo: 'Todas las Modalidades'
        };
    }
  };

  // Función para obtener contador de modalidad respetando permisos
  const obtenerContadorModalidad = (modalidad) => {
    if (!modalidadesConfig.modalidades.includes('todas') && 
        !modalidadesConfig.modalidades.includes(modalidad)) {
      return '(•••)'; // Ocultar información de modalidades no permitidas
    }
    
    const filtro = modalidad === 'presencial' ? 'presencial' : 'semipresencial';
    return `(${estudiantes.filter(e => 
      (e.activo === true || e.activo === 1) && 
      (e.modalidad || '').toLowerCase().trim() === filtro
    ).length})`;
  };

  const modalidadesConfig = obtenerModalidadesDisponibles();
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState(modalidadesConfig.defaultSelection);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estudiantesCargados, setEstudiantesCargados] = useState(false);
  const [modalGraficosTendencias, setModalGraficosTendencias] = useState(false);
  const [modalGraficosEstados, setModalGraficosEstados] = useState(false);
  const [modalGraficosPeriodos, setModalGraficosPeriodos] = useState(false);
  const [modalGraficosRendimiento, setModalGraficosRendimiento] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);

  const cargarTodosLosEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Cargando estudiantes para reportes...');
      
      // Determinar qué modalidad cargar según los permisos del usuario
      let modalidadParaCargar = 'todos';
      
      if (modalidadesConfig.modalidades.length === 1) {
        // Si el usuario solo tiene acceso a una modalidad, cargar solo esa
        modalidadParaCargar = modalidadesConfig.modalidades[0];
        console.log('🔒 Usuario con acceso restringido. Cargando modalidad:', modalidadParaCargar);
      } else {
        console.log('🔓 Usuario con acceso completo. Cargando todas las modalidades.');
      }
      
      // Solicitar registros según los permisos del usuario
      // IMPORTANTE: Cargar TODOS los estudiantes (activos e inactivos) para análisis de retención
      const response = await serviceListaEstudiantes.getPaginatedAllEstudiantes(
        1, 
        9999, 
        'todos', // Cargar todos los estudiantes (activos e inactivos) para análisis completo
        modalidadParaCargar === 'todos' ? undefined : modalidadParaCargar
      );
      
      if (response.success && response.estudiantes) {
        // Log para ver el tipo de dato de 'activo' que manda el backend
        if (response.estudiantes.length > 0) {
          console.log('🧪 Ejemplo de estudiante recibido del backend:', response.estudiantes[0], 'Tipo de activo:', typeof response.estudiantes[0].activo);
        }
        // Normalizar campo activo a número (0/1) para todos los estudiantes
        const estudiantesNormalizados = response.estudiantes.map(e => ({
          ...e,
          activo: Number(e.activo)
        }));
        console.log('📋 Estudiantes cargados:', estudiantesNormalizados.length, 'de', response.total);
        console.log('🎯 Modalidad cargada:', modalidadParaCargar);
        console.log('📊 Estudiantes ACTIVOS e INACTIVOS cargados para análisis de retención');
        // Verificar distribución activos/inactivos
        const estudiantesActivos = estudiantesNormalizados.filter(e => e.activo === 1);
        const estudiantesInactivos = estudiantesNormalizados.filter(e => e.activo === 0);
        console.log('✅ Activos (normalizados):', estudiantesActivos.length, '❌ Inactivos (normalizados):', estudiantesInactivos.length);
        // Debug: mostrar primeros 5 estudiantes
        console.log('📋 Primeros 5 estudiantes normalizados:', estudiantesNormalizados.slice(0, 5));
        setEstudiantes(estudiantesNormalizados);
        setEstudiantesCargados(true);
      } else {
        console.error('❌ Error en respuesta:', response.error || 'Respuesta inválida');
        showAlerta(response.error || 'Error al cargar los datos de estudiantes', 'error');
        setEstudiantes([]);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar estudiantes:', error);
      showAlerta('Error al cargar los datos de estudiantes', 'error');
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  }, [showAlerta, modalidadesConfig]);

  // Cargar estudiantes cuando se abre el modal
  useEffect(() => {
    if (mostrarModal && !estudiantesCargados) {
      cargarTodosLosEstudiantes();
    }
  }, [mostrarModal, estudiantesCargados, cargarTodosLosEstudiantes]);

  // Limpiar reporte cuando cambie la modalidad seleccionada
  useEffect(() => {
    setReporteSeleccionado(null);
    setDatosReporte(null);
  }, [modalidadSeleccionada]); // Solo se ejecuta cuando cambia la modalidad

  // Filtrar estudiantes según modalidad seleccionada y restricciones por rol
  const obtenerEstudiantesFiltrados = () => {
    let estudiantesFiltrados = estudiantes;
    
    console.log('🔍 Filtrado de estudiantes:');
    console.log('- Total estudiantes:', estudiantes.length);
    console.log('- Modalidad seleccionada:', modalidadSeleccionada);
    console.log('- Rol usuario:', user?.rol?.toLowerCase());
    
    // Aplicar filtro por rol primero (restricción base)
    const rol = user?.rol?.toLowerCase();
    if (rol === 'secretario') {
      // Secretario solo ve modalidad Presencial (INCLUYENDO ACTIVOS E INACTIVOS)
      estudiantesFiltrados = estudiantes.filter(estudiante => {
        const modalidadEst = (estudiante.modalidad || '').trim().toLowerCase();
        return modalidadEst === 'presencial';
      });
    } else if (rol === 'coordinador administrativo' || rol === 'coordinadoradministrativo') {
      // Coordinador Administrativo solo ve modalidad Semipresencial (INCLUYENDO ACTIVOS E INACTIVOS)
      estudiantesFiltrados = estudiantes.filter(estudiante => {
        const modalidadEst = (estudiante.modalidad || '').trim().toLowerCase();
        return modalidadEst === 'semipresencial';
      });
    } else if (modalidadSeleccionada === 'todas') {
      // Administradores pueden ver todos (activos e inactivos)
      return estudiantes;
    } else {
      // Administradores pueden filtrar por modalidad específica (INCLUYENDO ACTIVOS E INACTIVOS)
      estudiantesFiltrados = estudiantes.filter(estudiante => {
        const modalidadEst = (estudiante.modalidad || '').trim().toLowerCase();
        const modalidadFiltro = modalidadSeleccionada.toLowerCase();
        
        // Debug individual
        if (estudiante.id === estudiantes[0]?.id) { // Solo para el primer estudiante
          console.log('📋 Ejemplo de estudiante:', {
            id: estudiante.id,
            modalidad: estudiante.modalidad,
            modalidadEst,
            modalidadFiltro,
            activo: estudiante.activo,
            match: modalidadEst === modalidadFiltro
          });
        }
        
        return modalidadEst === modalidadFiltro;
      });
    }
    
    console.log('- Estudiantes filtrados (activos + inactivos):', estudiantesFiltrados.length);
    console.log('- Activos en filtrado:', estudiantesFiltrados.filter(e => e.activo === 1 || e.activo === true).length);
    console.log('- Inactivos en filtrado:', estudiantesFiltrados.filter(e => e.activo === 0 || e.activo === false).length);
    
    return estudiantesFiltrados;
  };

  const estudiantesFiltrados = obtenerEstudiantesFiltrados();

  // Funciones de visualización
  const generarVisualizacion = async (tipoReporte) => {
    let datos = null;
    
    switch (tipoReporte) {
      case 'estados':
        datos = analizarEstados(estudiantesFiltrados);
        break;
      case 'tendencias':
        datos = analizarTendenciasModalidad(estudiantesFiltrados, modalidadSeleccionada);
        break;
      case 'periodos':
        console.log('=== DEBUGGING PERÍODOS ===');
        console.log('Estudiantes filtrados:', estudiantesFiltrados.length);
        console.log('Modalidad seleccionada:', modalidadSeleccionada);
        
        try {
          datos = await analizarPeriodos(estudiantesFiltrados, modalidadSeleccionada);
          console.log('Datos resultado:', datos);
        } catch (error) {
          console.error('ERROR en analizarPeriodos:', error);
          datos = {
            error: 'Error al analizar períodos: ' + error.message,
            modalidad: modalidadSeleccionada,
            totalInscripciones: 0
          };
        }
        break;
      case 'kpis':
        datos = generarKPIsAvanzados(estudiantesFiltrados, modalidadSeleccionada, user?.rol);
        break;
      case 'rendimiento':
        datos = analizarRendimiento(estudiantesFiltrados);
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
        generarAnalisisEstados(estudiantesFiltrados, showAlerta);
        break;
      case 'tendencias':
        generarTendenciasPlan(estudiantesFiltrados, showAlerta, modalidadSeleccionada);
        break;
      case 'periodos':
        generarAnalisisPeriodos(estudiantesFiltrados, showAlerta, modalidadSeleccionada);
        break;
      case 'kpis':
        generarDashboardEjecutivo(estudiantesFiltrados, showAlerta);
        break;
      case 'rendimiento':
        generarAnalisisRendimiento(estudiantesFiltrados, showAlerta);
        break;
      default:
        showAlerta('Tipo de reporte no reconocido', 'error');
    }
  };

  const generarExcel = (tipoReporte) => {
    switch (tipoReporte) {
      case 'estados':
        generarAnalisisEstadosExcel(estudiantesFiltrados, showAlerta);
        break;
      case 'kpis':
        generarDashboardEjecutivoExcel(estudiantesFiltrados, showAlerta);
        break;
      case 'tendencias':
        generarTendenciasPlanExcel(estudiantesFiltrados, showAlerta, modalidadSeleccionada);
        break;
      case 'periodos':
        generarAnalisisPeriodosExcel(estudiantesFiltrados, showAlerta, modalidadSeleccionada);
        break;
      case 'rendimiento':
        generarAnalisisRendimientoExcel(estudiantesFiltrados, showAlerta);
        break;
      default:
        showAlerta('Tipo de reporte no reconocido', 'error');
    }
  };

  // Función para abrir gráfico específico según el tipo de reporte
  const abrirGraficoEspecifico = (tipoReporte) => {
    switch (tipoReporte) {
      case 'estados':
        setModalGraficosEstados(true);
        break;
      case 'tendencias':
        setModalGraficosTendencias(true);
        break;
      case 'periodos':
        setModalGraficosPeriodos(true);
        break;
      case 'rendimiento':
        setModalGraficosRendimiento(true);
        break;
      default:
        showAlerta('Gráfico no disponible para este reporte', 'info');
    }
  };

  const renderDetalleReporte = () => {
    if (!datosReporte || !reporteSeleccionado) return null;

    switch (reporteSeleccionado) {
      case 'estados':
        return <DetalleEstados datos={datosReporte} />;
      case 'tendencias':
        return <DetalleTendencias datos={datosReporte} />;
      case 'periodos':
        return <DetallePeriodos datos={datosReporte} modalidadesConfig={modalidadesConfig} modalidadSeleccionada={modalidadSeleccionada} />;
      case 'kpis':
        return <DetalleKPIs datos={datosReporte} />;
      case 'rendimiento':
        return <DetalleRendimiento datos={datosReporte} />;
      default:
        return null;
    }
  };

  if (!mostrarModal) return null;

  const reportes = [
    {
      id: 'estados',
      icon: '📊',
      titulo: 'Determinación porcentual de inscripciones por estado',
      descripcion: 'Distribución de estados de inscripciones pendientes, Completas, anulados',
      color: '#3498db'
    },
    {
      id: 'tendencias',
      icon: '📈',
      titulo: 'Distribución cuantitativa inscripciones por Modalidad',
      descripcion: 'Cantidad de inscripciones por modalidad detallando por curso y plan según período',
      color: '#e74c3c'
    },
    {
      id: 'periodos',
      icon: '📅',
      titulo: 'Distribución de Inscriptos por Períodos Académicos',
      descripcion: 'PRESENCIAL: Feb-Mar (ventanas 15 días) | SEMIPRESENCIAL: Feb-Oct (trimestres y semestres)',
      color: '#f39c12'
    },
    {
      id: 'rendimiento',
      icon: '🎓',
      titulo: 'Distribución Cuantitativa de Estudiantes por Estado Institucional',
      descripcion: 'Estudiantes con inscripción activa en el año en curso - Estudiantes con inscripción inactiva',
      color: '#1abc9c'
    },
    {
      id: 'kpis',
      icon: '💼',
      titulo: 'Resumen Ejecutivo de Métricas Institucionales',
      descripcion: 'Dashboard con métricas institucionales clave para toma de decisiones',
      color: '#e67e22'
    }
  ];

  return (
    <div className="modal-viz-overlay" onClick={(e) => {
      if (e.target.className === 'modal-viz-overlay') {
        onCerrar();
      }
    }}>
      <div className="modal-viz-contenido">
        <div className="modal-viz-header">
          <h3>📊 Informes estadísticos</h3>
          <CloseButton onClose={onCerrar} />
        </div>
        
        <div className="modal-viz-body">
          {/* Selector de modalidad - Solo para administradores */}
          {modalidadesConfig.modalidades.length > 1 && (
            <div className="selector-modalidad">
              <h4>🎯 Seleccionar Alcance del Análisis:</h4>
              <div className="selector-buttons">
                {modalidadesConfig.modalidades.includes('todas') && (
                  <button
                    className={`btn-modalidad-selector todas ${modalidadSeleccionada === 'todas' ? 'active' : ''}`}
                    onClick={() => setModalidadSeleccionada('todas')}
                  >
                    🏢 Todas las Modalidades ({estudiantes.length})
                  </button>
                )}
                {modalidadesConfig.modalidades.includes('presencial') && (
                  <button
                    className={`btn-modalidad-selector presencial ${modalidadSeleccionada === 'presencial' ? 'active' : ''}`}
                    onClick={() => setModalidadSeleccionada('presencial')}
                  >
                    🏫 Presencial {obtenerContadorModalidad('presencial')}
                  </button>
                )}
                {modalidadesConfig.modalidades.includes('semipresencial') && (
                  <button
                    className={`btn-modalidad-selector semipresencial ${modalidadSeleccionada === 'semipresencial' ? 'active' : ''}`}
                    onClick={() => setModalidadSeleccionada('semipresencial')}
                  >
                    📚 Semipresencial {obtenerContadorModalidad('semipresencial')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Información para roles con restricciones */}
          {modalidadesConfig.modalidades.length === 1 && (
            <div className="selector-modalidad info-modalidad">
              <h4>📋 Alcance del Análisis:</h4>
              <div className="selector-modalidad-unica">
                {modalidadesConfig.modalidades[0] === 'presencial' ? '🏫 Modalidad Presencial' : '📚 Modalidad Semipresencial'}
                <span className="selector-modalidad-unica-descripcion">
                  ({estudiantesFiltrados.length} estudiantes: {estudiantesFiltrados.filter(e => e.activo === 1 || e.activo === true).length} activos, {estudiantesFiltrados.filter(e => e.activo === 0 || e.activo === false).length} inactivos)
                </span>
              </div>
            </div>
          )}

          {/* Mostrar loading si está cargando */}
          {loading && (
            <div className="loading-center">
              <BotonCargando loading={true} />
              <p>Cargando datos de estudiantes...</p>
            </div>
          )}

          {/* Mostrar reportes solo cuando no está cargando */}
          {!loading && !reporteSeleccionado && (
            <div className="reportes-grid-viz">
              {reportes.map(reporte => (
                <div key={reporte.id} className="reporte-card-viz" style={{ borderLeft: `4px solid ${reporte.color}` }}>
                  <div className="reporte-icon-viz">{reporte.icon}</div>
                  <h4>{reporte.titulo}</h4>
                  <p>{reporte.descripcion}</p>
                  <div className="botones-reporte">
                    <button
                      className="btn-visualizar"
                      onClick={async () => await generarVisualizacion(reporte.id)}
                      disabled={estudiantesFiltrados.length === 0}
                    >
                      👁️ Ver Datos
                    </button>
                    {/* Botón de gráfico específico para reportes con visualización */}
                    {['estados', 'tendencias', 'periodos', 'rendimiento'].includes(reporte.id) && (
                      <button
                        className="btn-grafico-especifico"
                        onClick={() => abrirGraficoEspecifico(reporte.id)}
                        disabled={estudiantesFiltrados.length === 0}
                        title={`Ver gráfico de ${reporte.titulo.toLowerCase()}`}
                      >
                        📊 Gráfico
                      </button>
                    )}
                    <button
                      className="btn-pdf"
                      onClick={() => generarPDF(reporte.id)}
                      disabled={estudiantesFiltrados.length === 0}
                    >
                      📄 PDF
                    </button>
                    <button
                      className="btn-excel"
                      onClick={() => generarExcel(reporte.id)}
                      disabled={estudiantesFiltrados.length === 0}
                    >
                      📊 Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detalle del reporte seleccionado */}
          {!loading && reporteSeleccionado && (
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
                <div className="botones-detalle">
                  <button
                    className="btn-pdf-detalle"
                    onClick={() => generarPDF(reporteSeleccionado)}
                  >
                    📄 PDF
                  </button>
                  <button
                    className="btn-excel-detalle"
                    onClick={() => generarExcel(reporteSeleccionado)}
                  >
                    📊 Excel
                  </button>
                </div>
              </div>
              
              <div className="detalle-contenido">
                {renderDetalleReporte()}
              </div>
            </div>
          )}

          {/* Mensaje si no hay datos */}
          {!loading && estudiantesFiltrados.length === 0 && !reporteSeleccionado && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#6c757d',
              fontSize: '1.1rem'
            }}>
              📊 No se encontraron estudiantes para la modalidad seleccionada
            </div>
          )}
        </div>
      </div>

      {/* Modal de Gráficos de Tendencias por Plan */}
      <GraficoTendenciasPlan
        isOpen={modalGraficosTendencias}
        onClose={() => setModalGraficosTendencias(false)}
        estudiantes={estudiantesFiltrados}
        modalidadSeleccionada={modalidadSeleccionada}
      />

      {/* Modal de Gráficos de Estados de Inscripción */}
      <GraficoEstadosInscripcion
        isOpen={modalGraficosEstados}
        onClose={() => setModalGraficosEstados(false)}
        estudiantes={estudiantesFiltrados}
        modalidadSeleccionada={modalidadSeleccionada}
      />

      {/* Modal de Gráficos de Períodos Académicos */}
      <GraficoPeriodosAcademicos
        isOpen={modalGraficosPeriodos}
        onClose={() => setModalGraficosPeriodos(false)}
        estudiantes={estudiantesFiltrados}
        modalidadSeleccionada={modalidadSeleccionada}
      />

      {/* Modal de Gráficos de Activos/Inactivos */}
      <GraficoActivosInactivos
        isOpen={modalGraficosRendimiento}
        onClose={() => setModalGraficosRendimiento(false)}
        estudiantes={estudiantesFiltrados}
        modalidadSeleccionada={modalidadSeleccionada}
      />
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
          <span className="label">Total Estudiantes</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.resumen.estados}</span>
          <span className="label">Anuladas</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.metricas.tasaAprobacion}%</span>
          <span className="label">Completas</span>
        </div>
        <div className="metrica">
          <span className="valor">{datos.metricas.tasaPendientes}%</span>
          <span className="label">Pendientes</span>
        </div>
      </div>
    </div>

    <div className="seccion-distribucion">
      <h5>📊 Distribución por Estado de  Inscripción</h5>
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

    {/* Desglose detallado por CURSOS PRESENCIALES */}
    {datos.presencial && datos.presencial.cursos.length > 0 && (
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

    {/* Desglose detallado por PLANES SEMIPRESENCIALES */}
    {datos.semipresencial && datos.semipresencial.planes.length > 0 && (
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

const DetallePeriodos = ({ datos, modalidadesConfig, modalidadSeleccionada }) => {
  console.log('DetallePeriodos recibió datos:', datos);
  console.log('DetallePeriodos recibió modalidadesConfig:', modalidadesConfig);
  console.log('DetallePeriodos recibió modalidadSeleccionada:', modalidadSeleccionada);
  
  if (!datos) {
    return (
      <div className="detalle-periodos">
        <div className="seccion-resumen">
          <h5>⚠️ No hay datos disponibles</h5>
          <p>No se pudieron cargar los datos de períodos de inscripción.</p>
        </div>
      </div>
    );
  }

  if (datos.error) {
    return (
      <div className="detalle-periodos">
        <div className="seccion-resumen">
          <h5>❌ Error en el análisis</h5>
          <p>{datos.error}</p>
          <p>Modalidad solicitada: {datos.modalidad}</p>
          <p>Total inscripciones: {datos.totalInscripciones}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-periodos">
    {/* Mostrar análisis específico según modalidad */}
    {(datos.modalidad === 'PRESENCIAL' || (datos.modalidad === 'TODAS' && modalidadSeleccionada === 'presencial')) && (
      <div>
        {(() => {
          // Determinar de dónde obtener los datos según la estructura
          const datosPresencial = datos.modalidad === 'PRESENCIAL' 
            ? datos 
            : datos.analisisPresencial;
          
          console.log('=== DEBUG ESTRUCTURA PRESENCIAL ===');
          console.log('datos.modalidad:', datos.modalidad);
          console.log('modalidadSeleccionada:', modalidadSeleccionada);
          console.log('datosPresencial:', datosPresencial);
          
          return (
            <>
              <div className="seccion-resumen">
                <h5>📅 Modalidad Presencial - Períodos de Inscripción</h5>
                <div className="estadisticas-grid">
                  <div className="estadistica">
                    <span className="valor">{datosPresencial?.periodoCompleto || 'N/A'}</span>
                    <span className="label">Período de Inscripción</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosPresencial?.totalInscripciones || 0}</span>
                    <span className="label">Total Inscripciones</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosPresencial?.resumen?.ventanasPorQuincena || 3}</span>
                    <span className="label">Ventanas (~15 días)</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosPresencial?.resumen?.inscripcionesFueraPeriodo || 0}</span>
                    <span className="label">Fuera de Período</span>
                  </div>
                </div>
              </div>

              <div className="seccion-distribucion">
                <h5>📊 Distribución por Ventanas de 15 Días</h5>
                {(datosPresencial?.distribucion || []).map((ventana, index) => {
                  // Determinar clase CSS según tipo de preinscripción
                  let claseCSS = '';
                  if (ventana.esPreinscripcion) {
                    if (ventana.tipoPreinscripcion === 'historico') {
                      claseCSS = 'preinscripcion-historica';
                    } else if (ventana.tipoPreinscripcion === 'actual') {
                      claseCSS = 'preinscripcion-actual';
                    } else {
                      claseCSS = 'preinscripcion-web'; // Fallback para compatibilidad
                    }
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className={`periodo-item ${claseCSS}`}
                    >
                      <div className="periodo-info">
                        <span className="periodo-fecha">{ventana.periodo}</span>
                        <div className="periodo-stats">
                          <span className="cantidad">{ventana.cantidad} inscripciones</span>
                          <span className="porcentaje">({ventana.porcentaje}%)</span>
                        </div>
                      </div>
                      <div className="barra-progreso">
                        <div 
                          className="barra-fill" 
                          style={{ width: `${Math.min(ventana.porcentaje * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>
    )}

    {(datos.modalidad === 'SEMIPRESENCIAL' || (datos.modalidad === 'TODAS' && modalidadSeleccionada === 'semipresencial')) && (
      <div>
        {(() => {
          // Determinar de dónde obtener los datos según la estructura
          const datosSemipresencial = datos.modalidad === 'SEMIPRESENCIAL' 
            ? datos 
            : datos.analisisSemipresencial;
          
          console.log('=== DEBUG ESTRUCTURA SEMIPRESENCIAL ===');
          console.log('datos.modalidad:', datos.modalidad);
          console.log('modalidadSeleccionada:', modalidadSeleccionada);
          console.log('datosSemipresencial:', datosSemipresencial);
          
          return (
            <>
              <div className="seccion-resumen">
                <h5>📅 Modalidad Semipresencial - Períodos de Inscripción</h5>
                <div className="estadisticas-grid">
                  <div className="estadistica">
                    <span className="valor">{datosSemipresencial?.periodoCompleto || 'N/A'}</span>
                    <span className="label">Período de Inscripción</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosSemipresencial?.totalInscripciones || 0}</span>
                    <span className="label">Total Inscripciones</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosSemipresencial?.resumen?.ventanasTrimestre || 3}</span>
                    <span className="label">Ventanas Trimestrales</span>
                  </div>
                  <div className="estadistica">
                    <span className="valor">{datosSemipresencial?.resumen?.ventanasSemestre || 2}</span>
                    <span className="label">Períodos Semestrales</span>
                  </div>
                </div>
              </div>

              <div className="seccion-distribucion">
                <h5>📊 Distribución por Trimestres</h5>
                {(datosSemipresencial?.distribucionTrimestre || []).map((trimestre, index) => {
                  // Determinar clase CSS según tipo de preinscripción
                  let claseCSS = '';
                  if (trimestre.esPreinscripcion) {
                    if (trimestre.tipoPreinscripcion === 'historico') {
                      claseCSS = 'preinscripcion-historica';
                    } else if (trimestre.tipoPreinscripcion === 'actual') {
                      claseCSS = 'preinscripcion-actual';
                    } else {
                      claseCSS = 'preinscripcion-web'; // Fallback
                    }
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className={`periodo-item ${claseCSS}`}
                    >
                      <div className="periodo-info">
                        <span className="periodo-fecha">{trimestre.periodo}</span>
                        <div className="periodo-stats">
                          <span className="cantidad">{trimestre.cantidad} inscripciones</span>
                          <span className="porcentaje">({trimestre.porcentaje}%)</span>
                        </div>
                      </div>
                      <div className="barra-progreso">
                        <div 
                          className="barra-fill" 
                          style={{ width: `${Math.min(trimestre.porcentaje * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="seccion-distribucion">
                <h5>📅 Distribución Semestral (Feb-Jun / Jul-Oct)</h5>
                {(() => {
                  console.log('=== DEBUG DISTRIBUCIÓN SEMESTRAL ===', datosSemipresencial?.distribucionSemestre);
                  return null;
                })()}
                
                {/* Mostrar SIEMPRE la estructura semestral */}
                {(datosSemipresencial?.distribucionSemestre || []).map((semestre, index) => {
                  // Determinar clase CSS según tipo de preinscripción
                  let claseCSS = '';
                  if (semestre.esPreinscripcion) {
                    if (semestre.tipoPreinscripcion === 'historico') {
                      claseCSS = 'preinscripcion-historica';
                    } else if (semestre.tipoPreinscripcion === 'actual') {
                      claseCSS = 'preinscripcion-actual';
                    } else {
                      claseCSS = 'preinscripcion-web'; // Fallback
                    }
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className={`periodo-item ${claseCSS}`}
                    >
                      <div className="periodo-info">
                        <span className="periodo-fecha">{semestre.periodo}</span>
                        <div className="periodo-stats">
                          <span className="cantidad">{semestre.cantidad} inscripciones</span>
                          <span className="porcentaje">({semestre.porcentaje}%)</span>
                        </div>
                      </div>
                      <div className="barra-progreso">
                        <div 
                          className="barra-fill" 
                          style={{ width: `${Math.min(semestre.porcentaje * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Mensaje si no hay datos semestrales */}
                {(!datosSemipresencial?.distribucionSemestre || datosSemipresencial.distribucionSemestre.length === 0) && (
                  <div className="periodo-item" style={{backgroundColor: '#ffe6e6'}}>
                    <div className="periodo-info">
                      <span className="periodo-fecha">⚠️ No hay datos semestrales disponibles</span>
                      <div className="periodo-stats">
                        <span className="cantidad">Estructura: {JSON.stringify(datosSemipresencial)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    )}

    {datos.modalidad === 'TODAS' && modalidadSeleccionada === 'todas' && modalidadesConfig.modalidades.includes('todas') && (
      <div>
        <div className="seccion-resumen">
          <h5>📅 Valores porcentuales - Ambas Modalidades</h5>
          <div className="estadisticas-grid">
            <div className="estadistica">
              <span className="valor">{datos.resumen.totalEstudiantes}</span>
              <span className="label">Total Estudiantes</span>
            </div>
            <div className="estadistica">
              <span className="valor">{datos.resumen.estudiantesPresencial}</span>
              <span className="label">Presencial ({datos.resumen.porcentajePresencial}%)</span>
            </div>
            <div className="estadistica">
              <span className="valor">{datos.resumen.estudiantesSemipresencial}</span>
              <span className="label">Semipresencial ({datos.resumen.porcentajeSemipresencial}%)</span>
            </div>
          </div>
        </div>

        <div className="seccion-distribucion">
          <h5>📊 Presencial - Ventanas de 15 Días</h5>
          {datos.analisisPresencial.distribucion.map((ventana, index) => (
            <div key={index} className="periodo-item">
              <div className="periodo-info">
                <span className="periodo-fecha">{ventana.periodo}</span>
                <div className="periodo-stats">
                  <span className="cantidad">{ventana.cantidad} inscripciones</span>
                  <span className="porcentaje">({ventana.porcentaje}%)</span>
                </div>
              </div>
              <div className="barra-progreso">
                <div 
                  className="barra-fill" 
                  style={{ width: `${Math.min(ventana.porcentaje * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="seccion-distribucion">
          <h5>📊 Semipresencial - Distribución Trimestral</h5>
          {datos.analisisSemipresencial.distribucionTrimestre.map((trimestre, index) => (
            <div key={index} className="periodo-item">
              <div className="periodo-info">
                <span className="periodo-fecha">{trimestre.periodo}</span>
                <div className="periodo-stats">
                  <span className="cantidad">{trimestre.cantidad} inscripciones</span>
                  <span className="porcentaje">({trimestre.porcentaje}%)</span>
                </div>
              </div>
              <div className="barra-progreso">
                <div 
                  className="barra-fill" 
                  style={{ width: `${Math.min(trimestre.porcentaje * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="seccion-distribucion">
          <h5>📅 Semipresencial - Distribución Semestral (Feb-Jun / Jul-Oct)</h5>
          {datos.analisisSemipresencial.distribucionSemestre && datos.analisisSemipresencial.distribucionSemestre.map((semestre, index) => (
            <div key={index} className="periodo-item">
              <div className="periodo-info">
                <span className="periodo-fecha">{semestre.periodo}</span>
                <div className="periodo-stats">
                  <span className="cantidad">{semestre.cantidad} inscripciones</span>
                  <span className="porcentaje">({semestre.porcentaje}%)</span>
                </div>
              </div>
              <div className="barra-progreso">
                <div 
                  className="barra-fill" 
                  style={{ width: `${Math.min(semestre.porcentaje * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};

const DetalleKPIs = ({ datos }) => (
  <div className="detalle-kpis">
    {/* === KPIs PRINCIPALES PARA TOMA DE DECISIONES === */}
    <div className="seccion-kpis-basicos">
      <h5>📊 KPIs Básicos</h5>
      <div className="kpis-grid">
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.valor}%</span>
          <span className="kpi-label">Inscripciones Tasa Completas</span>
          <small className="kpi-interpretacion">
            {datos.kpisDecisiones.estadoGeneral.tasaEstudiantesActivos.interpretacion}
          </small>
        </div>
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.valor}%</span>
          <span className="kpi-label">Inscripciones Pendientes</span>
          <small className="kpi-interpretacion">
            {datos.kpisDecisiones.procesoInscripcion.tasaInscripcionesPendientes.interpretacion}
          </small>
        </div>
        <div className="kpi-card">
          <span className="kpi-valor">{datos.kpisBasicos.totalEstudiantes}</span>
          <span className="kpi-label">Total Estudiantes Inscriptos</span>
        </div>
      </div>
    </div>

    {/* === KPIs AVANZADOS PARA TOMA DE DECISIONES === */}
    <div className="seccion-kpis-avanzados">
      <h5>🎯 KPIs Avanzados</h5>
      <div className="kpis-avanzados-grid">
        
        {/* Eficiencia del Proceso */}
        <div className="kpi-avanzado">
          <h6>📋 Eficiencia del Proceso en Inscripción</h6>
          <div className="kpi-detalle">
            <span>Tasa Inscripción completa:  {datos.kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.valor}%</span>
            <span>Calidad:  {datos.kpisDecisiones.procesoInscripcion.tasaInscripcionesCompletas.interpretacion}</span>
          </div>
        </div>

        {/* Tendencias Temporales */}
        <div className="kpi-avanzado">
          <h6>📈 Tendencias Temporales en Inscripciones</h6>
          <div className="kpi-detalle">
            <span>Promedio Mensual:  {datos.kpisAvanzados.tendenciasTemporales.promedioMensual}</span>
            <span>Tendencia:  {datos.kpisAvanzados.tendenciasTemporales.tendenciaGeneral}</span>
          </div>
        </div>
      </div>
    </div>

    {/* === EFICIENCIA POR MODALIDADES === */}
    {datos.kpisDecisiones.eficienciaPorModalidad.tasaActividadPorModalidad.length > 0 && (
      <div className="seccion-eficiencia-modalidades">
        <h5>🎯 Tendencias Temporales</h5>
        <div className="modalidades-eficiencia-grid">
          {datos.kpisDecisiones.eficienciaPorModalidad.tasaActividadPorModalidad.map((modalidad, index) => (
            <div key={index} className="modalidad-eficiencia">
              <span className="modalidad-nombre"> {modalidad.modalidad} </span>
              <div className="modalidad-stats">
                <span className="valor"> {modalidad.valor.toFixed(1)}% </span>
                <span className="interpretacion"> {modalidad.interpretacion} </span>
              </div>
              <div className="modalidad-detalle">
                <span>Activos:  {modalidad.estudiantesActivos} </span>
                <span>Total:  {modalidad.totalEstudiantes} </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* === PROMEDIO MENSUAL === */}
    <div className="seccion-promedio-mensual">
      <h5>📊 Promedio Mensual:  15.0</h5>
      <div className="promedio-stats">
        <span>📅 Promedio Mensual de Inscripciones:  {datos.kpisAvanzados.tendenciasTemporales.promedioMensual}   </span>
        <span>📊 Inscripciones Este Año:  {datos.kpisAvanzados.tendenciasTemporales.inscripcionesEsteAno}   </span>
        <span>📈 Tendencia estable  </span>
      </div>
    </div>

    {/* === CALIDAD ADMINISTRATIVA === */}
    <div className="seccion-calidad-educativa">
      <h5>🎓 Calidad: Buena </h5>
      <div className="calidad-stats">
        <div className="calidad-principal">
          <span className="calidad-valor">  {datos.kpisDecisiones.indiceCalidadEducativa.valor}% </span>
          <span className="calidad-interpretacion">  {datos.kpisDecisiones.indiceCalidadEducativa.interpretacion} </span>
        </div>
        <div className="calidad-componentes">
          {Object.entries(datos.kpisDecisiones.indiceCalidadEducativa.componentes).map(([componente, data], index) => (
            <div key={index} className="componente-calidad">
              <span className="componente-nombre"> {componente} </span>
              <span className="componente-valor"> {data.valor.toFixed(1)}% </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* === RECOMENDACIONES ESTRATÉGICAS === */}
    {datos.recomendaciones.length > 0 && (
      <div className="seccion-recomendaciones">
        <h5>💡  Recomendaciones Estratégicas </h5>
        {datos.recomendaciones.map((rec, index) => (
          <div key={index} className={`recomendacion recomendacion-${rec.prioridad}`}>
            <div className="rec-header">
              <span className="rec-area">  {rec.area}  </span>
              <span className="rec-prioridad">  {rec.prioridad}  </span>
            </div>
            <p className="rec-texto">  {rec.recomendacion}  </p>
            <span className="rec-impacto"> 💫   {rec.impactoEstimado}  </span>
          </div>
        ))}
      </div>
    )}

    {/* === RECOMENDACIONES PRIORITARIAS DESDE EL ÍNDICE === */}
    {datos.kpisDecisiones.indiceCalidadEducativa.recomendacionesPrioritarias.length > 0 && (
      <div className="seccion-recomendaciones-prioritarias">
        <h5>⚠️ Recomendaciones Estratégicas </h5>
        <div className="recomendaciones-lista">  
          {datos.kpisDecisiones.indiceCalidadEducativa.recomendacionesPrioritarias.map((recomendacion, index) => (
            <div key={index} className="recomendacion-item">
              <span className="recomendacion-numero"> ALTA </span>
              <span className="recomendacion-texto"> Proceso Administrativo  </span>
              <div className="recomendacion-descripcion">
                 {typeof recomendacion === 'string' ? recomendacion : recomendacion.descripcion || recomendacion}
              </div>
              <div className="recomendacion-impacto">
                 🏆  Reducción del 25-40% en tiempos de procesamiento y mejora en satisfacción estudiantil
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DetalleRendimiento = ({ datos }) => (
  <div className="detalle-rendimiento">
    <div className="seccion-resumen">
      <h5> 🎓 Distribución Cuantitativa de Estudiantes por Estado Institucional</h5>
      <div className="mensaje-explicativo">
        <p><strong>Activos:  </strong> Estudiantes inscriptos</p>
        <p><strong>Inactivos:  </strong> Estudiantes sin renovación de inscripción/incompleta</p>
      </div>
      <div className="rendimiento-grid">
        <div className="rendimiento-card activos">
          <h6>✅ Estudiantes Activos</h6>
          <div className="rendimiento-stats">
            <span className="cantidad">  {datos.resumen.activos} </span>
            <span className="porcentaje">  ({datos.resumen.tasaActividad}%) </span>
          </div>
          <small>Activos en el sistema</small>
        </div>
        <div className="rendimiento-card inactivos">
          <h6>❌ Estudiantes sin renovación de inscripción</h6>
          <div className="rendimiento-stats">
            <span className="cantidad">  {datos.resumen.inactivos} </span>
            <span className="porcentaje">  ({datos.resumen.tasaAbandonoCambio}%) </span>
          </div>
          <small>Inactivos en el sistema</small>
        </div>
      </div>
    </div>

    <div className="seccion-activos">
      <h5 style={{ color: '#27ae60' }}>✅ Estudiantes Activos - Distribución por Modalidad</h5>
      {datos.detalleActivos.distribucionModalidad.map((modalidad, index) => (
        <div key={index} className="modalidad-activos">
          <span className="modalidad-nombre">  {modalidad.modalidad} </span>
          <div className="modalidad-stats">
            <span className="cantidad">  {modalidad.cantidad} activos </span>
            <span className="porcentaje">  ({modalidad.porcentaje}%) </span>
          </div>
        </div>
      ))}
    </div>

    {datos.detalleInactivos.distribucionModalidad.length > 0 && (
      <div className="seccion-inactivos">
        <h5 style={{ color: '#e74c3c' }}>❌ Estudiantes Inactivos - Distribución por Modalidad</h5>
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
            <strong>Razón:</strong>   {datos.detalleInactivos.razon}
        </p>
        {datos.detalleInactivos.distribucionModalidad.map((modalidad, index) => (
          <div key={index} className="causa-inactividad">
            <span className="causa-nombre">  {modalidad.modalidad} </span>
            <div className="causa-stats">
              <span className="cantidad">  {modalidad.cantidad} inactivos </span>
              <span className="porcentaje">  ({modalidad.porcentaje}%) </span>
            </div>
          </div>
        ))}
      </div>
    )}

    {datos.resumen.inactivos === 0 && (
      <div className="mensaje-sin-inactivos" style={{ 
        textAlign: 'center', 
        color: '#27ae60', 
        padding: '20px', 
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        🎉  <strong> ¡Excelente!  </strong> No hay registros de abandono estudiantil.
      </div>
    )}
  </div>
);

// PropTypes para los componentes de detalle
DetalleEstados.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleTendencias.propTypes = {
  datos: PropTypes.object.isRequired
};

DetallePeriodos.propTypes = {
  datos: PropTypes.object.isRequired,
  modalidadesConfig: PropTypes.object.isRequired,
  modalidadSeleccionada: PropTypes.string.isRequired
};

DetalleKPIs.propTypes = {
  datos: PropTypes.object.isRequired
};

DetalleRendimiento.propTypes = {
  datos: PropTypes.object.isRequired
};

ModalReportesDashboard.propTypes = {
  mostrarModal: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired,
  showAlerta: PropTypes.func.isRequired
};

export default ModalReportesDashboard;