import { useState } from 'react';
import PropTypes from 'prop-types';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CloseButton from '../../CloseButton';

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  ChartDataLabels
);

const GraficoActivosInactivos = ({ 
  isOpen, 
  onClose, 
  estudiantes, 
  modalidadSeleccionada = 'todas'
}) => {
  const [vistaActual, setVistaActual] = useState('general');

  if (!isOpen) return null;

  // Utilidades
  const calcularPorcentaje = (parte, total) => total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';

  // Filtrar estudiantes por modalidad
  let estudiantesFiltrados = estudiantes;
  if (modalidadSeleccionada !== 'todas') {
    estudiantesFiltrados = estudiantes.filter(est => 
      est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
    );
  }

  // Función para extraer plan/año de los datos del estudiante
  const extraerPlanAnio = (estudiante, modalidad) => {
    if (estudiante.planAnioId && estudiante.planAnioId !== '' && estudiante.planAnioId !== null) {
      const id = parseInt(estudiante.planAnioId);
      
      if (modalidad === 'PRESENCIAL') {
        switch (id) {
          case 1: return '1er Año';
          case 2: return '2do Año';
          case 3: return '3er Año';
          default: return 'Sin año especificado';
        }
      }
      
      if (modalidad === 'SEMIPRESENCIAL') {
        switch (id) {
          case 4: return 'Plan A';
          case 5: return 'Plan B';
          case 6: return 'Plan C';
          default: return 'Sin plan especificado';
        }
      }
    }
    
    const planTexto = estudiante.planAnio || estudiante.cursoPlan || estudiante.plan || '';
    if (planTexto) {
      const planTextoLower = planTexto.toLowerCase();
      
      if (modalidad === 'PRESENCIAL') {
        if (planTextoLower.includes('1') || planTextoLower.includes('primer')) return '1er Año';
        if (planTextoLower.includes('2') || planTextoLower.includes('segundo')) return '2do Año';
        if (planTextoLower.includes('3') || planTextoLower.includes('tercer')) return '3er Año';
      } else if (modalidad === 'SEMIPRESENCIAL') {
        if (planTextoLower.includes('plan a') || planTextoLower === 'a') return 'Plan A';
        if (planTextoLower.includes('plan b') || planTextoLower === 'b') return 'Plan B';
        if (planTextoLower.includes('plan c') || planTextoLower === 'c') return 'Plan C';
      }
      
      return planTexto.trim();
    }
    
    if (modalidad === 'PRESENCIAL') return 'Sin año especificado';
    else if (modalidad === 'SEMIPRESENCIAL') return 'Sin plan especificado';
    else return 'Sin categoría especificada';
  };

  // Detectar modalidad real según el plan/año
  const detectarModalidadReal = (estudiante) => {
    const modalidadOriginal = estudiante.modalidad || 'SIN MODALIDAD';
    const planAnio = extraerPlanAnio(estudiante, modalidadOriginal);
    
    if (planAnio === '1er Año' || planAnio === '2do Año' || planAnio === '3er Año') {
      return 'PRESENCIAL';
    }
    
    if (planAnio === 'Plan A' || planAnio === 'Plan B' || planAnio === 'Plan C') {
      return 'SEMIPRESENCIAL';
    }
    
    return modalidadOriginal;
  };

  // Analizar datos generales (Activos vs Inactivos)
  const activos = estudiantesFiltrados.filter(est => est.activo === true || est.activo === 1);
  const inactivos = estudiantesFiltrados.filter(est => est.activo === false || est.activo === 0);

  // Datos para gráfico general
  const datosGenerales = {
    labels: [`Activos (${calcularPorcentaje(activos.length, estudiantesFiltrados.length)}%)`, 
             `Inactivos (${calcularPorcentaje(inactivos.length, estudiantesFiltrados.length)}%)`],
    datasets: [{
      data: [activos.length, inactivos.length],
      backgroundColor: ['#27ae60', '#e74c3c'],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBackgroundColor: ['#219a52', '#c0392b']
    }]
  };

  // Análisis detallado por modalidad y plan/curso
  const analisisDetallado = () => {
    const resultado = {};
    
    // Agrupar por modalidad real
    const grupos = {};
    estudiantesFiltrados.forEach(estudiante => {
      const modalidadReal = detectarModalidadReal(estudiante);
      if (!grupos[modalidadReal]) grupos[modalidadReal] = [];
      grupos[modalidadReal].push(estudiante);
    });

    Object.entries(grupos).forEach(([modalidad, estudiantes]) => {
      if (modalidadSeleccionada === 'todas' || modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())) {
        const detalle = {};
        
        estudiantes.forEach(est => {
          const categoria = extraerPlanAnio(est, modalidad);
          if (!detalle[categoria]) {
            detalle[categoria] = { activos: 0, inactivos: 0 };
          }
          
          if (est.activo === true || est.activo === 1) {
            detalle[categoria].activos++;
          } else {
            detalle[categoria].inactivos++;
          }
        });
        
        resultado[modalidad] = detalle;
      }
    });
    
    return resultado;
  };

  const detalleModalidades = analisisDetallado();

  // Crear datos para gráfico detallado
  const crearDatosDetalle = (modalidad, detalle) => {
    const categorias = Object.keys(detalle);
    const activosData = categorias.map(cat => detalle[cat].activos);
    const inactivosData = categorias.map(cat => detalle[cat].inactivos);
    
    return {
      labels: categorias,
      datasets: [
        {
          label: 'Activos',
          data: activosData,
          backgroundColor: '#27ae60',
          borderColor: '#27ae60',
          borderWidth: 2,
          borderRadius: 4
        },
        {
          label: 'Inactivos',
          data: inactivosData,
          backgroundColor: '#e74c3c',
          borderColor: '#e74c3c',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    };
  };

  const opcionesGenerales = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          boxWidth: 15, 
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true
        } 
      },
      title: { 
        display: true, 
        text: 'Distribución General: Activos vs Inactivos', 
        font: { size: 18, weight: 'bold' },
        padding: 25,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const estado = context.dataIndex === 0 ? 'Activos' : 'Inactivos';
            const value = context.parsed;
            const total = estudiantesFiltrados.length;
            const percentage = calcularPorcentaje(value, total);
            return [
              `📊 Estado: ${estado}`,
              `👥 Estudiantes: ${value}`,
              `📈 Porcentaje: ${percentage}%`,
              `📋 Total: ${total}`
            ];
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        font: { weight: 'bold', size: 14 },
        formatter: function(value) {
          const percentage = calcularPorcentaje(value, estudiantesFiltrados.length);
          return `${percentage}%`;
        }
      }
    }
  };

  const opcionesDetalle = (modalidad) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { font: { size: 11 } }
      },
      title: { 
        display: true, 
        text: `${modalidad} - Activos/Inactivos por ${modalidad === 'PRESENCIAL' ? 'Año' : 'Plan'}`,
        font: { size: 16, weight: 'bold' },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          title: function(tooltipItems) {
            return `${modalidad === 'PRESENCIAL' ? 'Año' : 'Plan'}: ${tooltipItems[0].label}`;
          },
          label: function(context) {
            const categoria = context.label;
            const value = context.parsed.y;
            const detalle = detalleModalidades[modalidad][context.label];
            const total = detalle.activos + detalle.inactivos;
            const percentage = calcularPorcentaje(value, total);
            return [
              `📊 ${categoria}: ${value}`,
              `📈 Del total en esta categoría: ${percentage}%`,
              `📋 Total en categoría: ${total}`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: 'bold', size: 10 },
        formatter: (value) => value > 0 ? value : ''
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        title: { display: true, text: 'Cantidad de Estudiantes' },
        ticks: { precision: 0 }
      },
      x: { 
        title: { display: true, text: modalidad === 'PRESENCIAL' ? 'Años Académicos' : 'Planes de Estudios' }
      }
    }
  });

  const getTituloModal = () => {
    const modalidadTexto = modalidadSeleccionada === 'todas' ? 'Todas las Modalidades' :
                          modalidadSeleccionada === 'presencial' ? 'Modalidad Presencial' :
                          modalidadSeleccionada === 'semipresencial' ? 'Modalidad Semipresencial' :
                          modalidadSeleccionada;
    
    return (
      <h2 className="modal-titulo">
        🎓 Estudiantes Activos/Inactivos - {modalidadTexto}
      </h2>
    );
  };

  return (
    <div className="modal-graficos-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-graficos-container">
        <div className="modal-graficos-header">
          {getTituloModal()}
          <div className="header-controls">
            <div className="vista-selector">
              <button 
                className={`btn-vista ${vistaActual === 'general' ? 'active' : ''}`}
                onClick={() => setVistaActual('general')}
                title="Vista general"
              >
                <span>📊 General</span>
              </button>
              <button 
                className={`btn-vista ${vistaActual === 'detalle' ? 'active' : ''}`}
                onClick={() => setVistaActual('detalle')}
                title="Vista detallada por modalidad"
              >
                <span>📈 Detalle</span>
              </button>
            </div>
            <CloseButton onClose={onClose} className="btn-close-graficos" />
          </div>
        </div>

        <div className="modal-graficos-content">
          {vistaActual === 'general' ? (
            <div className="graficos-general">
              <div className="grafico-container">
                <div className="grafico-header">
                  <h4>🎯 Distribución General de Estudiantes</h4>
                  <p>Comparación entre estudiantes activos e inactivos en el sistema</p>
                </div>
                <div className="grafico-canvas" style={{height: '400px'}}>
                  <Doughnut data={datosGenerales} options={opcionesGenerales} />
                </div>
              </div>
            </div>
          ) : (
            <div className="graficos-detalle">
              {Object.entries(detalleModalidades).map(([modalidad, detalle]) => (
                <div key={modalidad} className="grafico-container">
                  <div className="grafico-header">
                    <h4>
                      {modalidad === 'PRESENCIAL' ? '🏫 PRESENCIAL - Activos/Inactivos por Año' : '💻 SEMIPRESENCIAL - Activos/Inactivos por Plan'}
                    </h4>
                    <p>
                      {modalidad === 'PRESENCIAL' ? 
                        'Distribución de estudiantes activos e inactivos por año académico' : 
                        'Distribución de estudiantes activos e inactivos por plan de estudios'
                      }
                    </p>
                  </div>
                  <div className="grafico-canvas" style={{height: '350px'}}>
                    <Bar 
                      data={crearDatosDetalle(modalidad, detalle)} 
                      options={opcionesDetalle(modalidad)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-graficos-footer">
          <div className="estadisticas-resumen">
            <div className="stat-item">
              <span className="stat-valor">{estudiantesFiltrados.length}</span>
              <span className="stat-label">Total Estudiantes</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{activos.length}</span>
              <span className="stat-label">Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{inactivos.length}</span>
              <span className="stat-label">Inactivos</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{calcularPorcentaje(activos.length, estudiantesFiltrados.length)}%</span>
              <span className="stat-label">% Activos</span>
            </div>
            {Object.keys(detalleModalidades).length > 0 && (
              <div className="stat-item">
                <span className="stat-valor">{Object.keys(detalleModalidades).length}</span>
                <span className="stat-label">Modalidades</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-graficos-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-graficos-container {
          background: white;
          border-radius: 16px;
          width: 95%;
          max-width: 1200px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .modal-graficos-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px 16px 0 0;
        }

        .modal-titulo {
          margin: 0;
          color: #1f2937;
          font-size: 22px;
          font-weight: bold;
        }

        .header-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .vista-selector {
          display: flex;
          gap: 8px;
          background: white;
          border-radius: 8px;
          padding: 4px;
          border: 1px solid #d1d5db;
        }

        .btn-vista {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.2s;
        }

        .btn-vista.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
        }

        .modal-graficos-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .graficos-general {
          display: flex;
          justify-content: center;
        }

        .graficos-detalle {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .grafico-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .grafico-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e5e7eb;
        }

        .grafico-header h4 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: bold;
        }

        .grafico-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .grafico-canvas {
          padding: 24px;
          background: white;
        }

        .modal-graficos-footer {
          padding: 12px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 0 0 16px 16px;
        }

        .estadisticas-resumen {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
          min-width: 80px;
        }

        .stat-valor {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #3b82f6;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 10px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        .btn-close-graficos {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-close-graficos:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
};

GraficoActivosInactivos.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalidadSeleccionada: PropTypes.string
};

export default GraficoActivosInactivos;