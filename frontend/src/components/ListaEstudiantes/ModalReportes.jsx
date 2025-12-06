import PropTypes from 'prop-types';
import CloseButton from '../CloseButton';
import { 
  generarAnalisisEstados,
  generarTendenciasPlan,
  generarAnalisisPeriodos,
  generarAnalisisDocumentacion,
  generarDashboardEjecutivo,
  generarReportePorModalidad
} from './ReportesService';

const ModalReportes = ({ 
  mostrarModal, 
  onCerrar, 
  estudiantes, 
  showAlerta, 
  mostrarGrafico,
  setMostrarGrafico 
}) => {
  if (!mostrarModal) return null;

  const reportes = [
    {
      id: 'analisis-estados',
      icon: '�',
      titulo: 'Análisis de Estados de Inscripción',
      descripcion: 'Pendientes, Completas, Anulados con porcentajes y tendencias',
      accion: () => {
        generarAnalisisEstados(estudiantes, showAlerta);
        onCerrar();
      },
      texto: 'Analizar Estados'
    },
    {
      id: 'tendencias-planes',
      icon: '📈',
      titulo: 'Tendencias en Inscripción Modalidad',
      descripcion: 'Distribución por modalidad: Presencial (por curso) y Semipresencial (por plan)',
      accion: () => {
        generarTendenciasPlan(estudiantes, showAlerta, 'todas');
        onCerrar();
      },
      texto: 'Ver Tendencias'
    },
    {
      id: 'periodos-inscripcion',
      icon: '📅',
      titulo: 'Períodos de Inscripción',
      descripcion: 'Análisis temporal: picos, fechas de mayor actividad',
      accion: () => {
        generarAnalisisPeriodos(estudiantes, showAlerta);
        onCerrar();
      },
      texto: 'Analizar Períodos'
    },
    {
      id: 'modalidad',
      icon: '🏫',
      titulo: 'Por Modalidad',
      descripcion: 'Estadísticas por modalidad',
      accion: () => {
        generarReportePorModalidad(estudiantes, showAlerta);
        onCerrar();
      },
      texto: 'Generar Reporte'
    },
    {
      id: 'documentacion-estado',
      icon: '📋',
      titulo: 'Estado Documental',
      descripcion: 'Análisis de completitud documental y documentos faltantes',
      accion: () => {
        generarAnalisisDocumentacion(estudiantes, showAlerta);
        onCerrar();
      },
      texto: 'Analizar Documentos'
    },
    {
      id: 'dashboard-ejecutivo',
      icon: '💼',
      titulo: 'Dashboard Ejecutivo',
      descripcion: 'Resumen integral con KPIs y métricas clave institucionales',
      accion: () => {
        generarDashboardEjecutivo(estudiantes, showAlerta);
        onCerrar();
      },
      texto: 'Dashboard KPIs'
    },
    {
      id: 'graficos-interactivos',
      icon: '�',
      titulo: 'Gráficos Interactivos',
      descripcion: 'Visualización estadística interactiva',
      accion: () => {
        setMostrarGrafico(!mostrarGrafico);
        onCerrar();
      },
      texto: mostrarGrafico ? 'Ocultar Gráficos' : 'Ver Gráficos'
    }
  ];

  return (
    <div className="modal-reportes-overlay" onClick={(e) => {
      if (e.target.className === 'modal-reportes-overlay') {
        onCerrar();
      }
    }}>
      <div className="modal-reportes-contenido">
        <div className="modal-reportes-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, flex: 1 }}>📊 Centro de Análisis Institucional</h3>
          <CloseButton 
            onClose={onCerrar}
            className="boton-small boton-cerrar-lista"
          />
        </div>
        
        <div className="modal-reportes-body">
          <div className="reportes-grid">
            {reportes.map(reporte => (
              <div key={reporte.id} className="reporte-card">
                <div className="reporte-icon">{reporte.icon}</div>
                <h4>{reporte.titulo}</h4>
                <p>{reporte.descripcion}</p>
                <button
                  className="btn-reporte-accion"
                  onClick={reporte.accion}
                  disabled={reporte.disabled}
                >
                  {reporte.texto}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ModalReportes.propTypes = {
  mostrarModal: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired,
  estudiantes: PropTypes.array.isRequired,
  showAlerta: PropTypes.func.isRequired,
  mostrarGrafico: PropTypes.bool.isRequired,
  setMostrarGrafico: PropTypes.func.isRequired
};

export default ModalReportes;