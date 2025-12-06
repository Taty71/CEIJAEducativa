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

const GraficoTendenciasPlan = ({ 
  isOpen, 
  onClose, 
  estudiantes, 
  modalidadSeleccionada = 'todas'
}) => {
  const [vistaActual, setVistaActual] = useState('modalidades');

  if (!isOpen) return null;

  // Utilidades
  const calcularPorcentaje = (parte, total) => total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';

  // Función para mapear planAnioId a descripción
  const mapearPlanAnioId = (planAnioId, modalidad) => {
    const id = parseInt(planAnioId);
    
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

  // Función para extraer plan/año de los datos del estudiante
  const extraerPlanAnio = (estudiante, modalidad) => {
    if (estudiante.planAnioId && estudiante.planAnioId !== '' && estudiante.planAnioId !== null) {
      return mapearPlanAnioId(estudiante.planAnioId, modalidad);
    }
    
    const planTexto = estudiante.planAnio || estudiante.cursoPlan || estudiante.plan || estudiante.modulos || '';
    
    if (planTexto && planTexto !== '') {
      const planTextoLower = planTexto.toLowerCase();
      
      if (modalidad === 'PRESENCIAL') {
        if (planTextoLower.includes('1') || planTextoLower.includes('primer') || planTextoLower.includes('primero') ||
            planTextoLower.includes('1er') || planTextoLower.includes('i año') || planTextoLower.includes('año 1')) {
          return '1er Año';
        }
        if (planTextoLower.includes('2') || planTextoLower.includes('segundo') || planTextoLower.includes('2do') ||
            planTextoLower.includes('ii año') || planTextoLower.includes('año 2')) {
          return '2do Año';
        }
        if (planTextoLower.includes('3') || planTextoLower.includes('tercer') || planTextoLower.includes('tercero') ||
            planTextoLower.includes('3er') || planTextoLower.includes('iii año') || planTextoLower.includes('año 3')) {
          return '3er Año';
        }
      } else if (modalidad === 'SEMIPRESENCIAL') {
        if (planTextoLower.includes('plan a') || planTextoLower.includes(' a ') || planTextoLower === 'a') return 'Plan A';
        if (planTextoLower.includes('plan b') || planTextoLower.includes(' b ') || planTextoLower === 'b') return 'Plan B';
        if (planTextoLower.includes('plan c') || planTextoLower.includes(' c ') || planTextoLower === 'c') return 'Plan C';
      }
      
      return planTexto.trim();
    }
    
    if (modalidad === 'PRESENCIAL') return 'Sin año especificado';
    else if (modalidad === 'SEMIPRESENCIAL') return 'Sin plan especificado';
    else return 'Sin categoría especificada';
  };

  // Función para detectar modalidad real según el plan/año
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

  // Filtrar estudiantes por modalidad
  let estudiantesFiltrados = estudiantes;
  if (modalidadSeleccionada !== 'todas') {
    estudiantesFiltrados = estudiantes.filter(est => 
      est.modalidad && est.modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())
    );
  }

  // Agrupar por modalidad CORREGIDA
  const grupos = {};
  estudiantesFiltrados.forEach(estudiante => {
    const modalidadReal = detectarModalidadReal(estudiante);
    if (!grupos[modalidadReal]) grupos[modalidadReal] = [];
    grupos[modalidadReal].push(estudiante);
  });

  // Procesar datos por modalidad
  const modalidades = [];
  const detalleModalidad = {};

  Object.entries(grupos).forEach(([modalidad, estudiantes]) => {
    modalidades.push({
      nombre: modalidad,
      cantidad: estudiantes.length
    });
    
    const detalle = {};
    estudiantes.forEach(est => {
      const categoria = extraerPlanAnio(est, modalidad);
      detalle[categoria] = (detalle[categoria] || 0) + 1;
    });
    detalleModalidad[modalidad] = detalle;
  });

  // Colores para gráficos
  const coloresModalidad = {
    'PRESENCIAL': ['#3b82f6', '#60a5fa', '#93c5fd'],
    'SEMIPRESENCIAL': ['#10b981', '#34d399', '#6ee7b7']
  };

  // Datos para gráfico de modalidades generales
  const dataModalidades = {
    labels: modalidades.map(m => `${m.nombre} (${calcularPorcentaje(m.cantidad, estudiantesFiltrados.length)}%)`),
    datasets: [{
      data: modalidades.map(m => m.cantidad),
      backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBackgroundColor: ['#7c3aed', '#059669', '#d97706', '#dc2626']
    }]
  };

  const optionsModalidades = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          boxWidth: 15, 
          font: { size: 12, weight: 'bold' },
          padding: 15
        } 
      },
      title: { 
        display: true, 
        text: 'Distribución por Modalidad', 
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
            const label = modalidades[context.dataIndex]?.nombre || '';
              const value = context.parsed || 0;
              const total = estudiantesFiltrados.length;
              const percentage = calcularPorcentaje(value, total);
            return [
              `📊 Modalidad: ${label}`,
              `👥 Estudiantes: ${value}`,
              `📈 Porcentaje: ${percentage}%`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: 'bold', size: 14 },
        formatter: (value) => {
          const percentage = calcularPorcentaje(value, estudiantesFiltrados.length);
          return percentage > 5 ? `${percentage}%` : '';
        }
      }
    }
  };

  // Función para crear datos de detalle por modalidad
  const crearDatosDetalle = (modalidad, detalle) => {
    const categorias = Object.keys(detalle);
    const valores = Object.values(detalle);
    const colores = coloresModalidad[modalidad] || ['#6b7280', '#9ca3af', '#d1d5db'];
    
    return {
      labels: categorias.map((cat, index) => {
        const valor = valores[index];
        const total = valores.reduce((a, b) => a + b, 0);
        const percentage = calcularPorcentaje(valor, total);
        return `${cat} (${percentage}%)`;
      }),
      datasets: [{
        data: valores,
        backgroundColor: colores.slice(0, categorias.length),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBackgroundColor: colores.map(c => c.replace('1)', '0.8)')),
        maxBarThickness: 60
      }]
    };
  };

  const crearOpcionesDetalle = (modalidad, tipo) => {
    const esPresencial = modalidad === 'PRESENCIAL';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: tipo === 'doughnut',
          position: 'bottom', 
          labels: { 
            boxWidth: 15, 
            font: { size: 11, weight: 'bold' },
            padding: 12
          } 
        },
        title: { 
          display: true, 
          text: `${modalidad} - ${esPresencial ? 'Distribución por Año' : 'Distribución por Plan'}`, 
          font: { size: 16, weight: 'bold' },
          padding: 20,
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
              const categorias = Object.keys(detalleModalidad[modalidad]);
              const categoria = categorias[context.dataIndex];
              const value = context.parsed?.y || context.parsed || 0;
              const total = Object.values(detalleModalidad[modalidad]).reduce((a, b) => a + b, 0);
              const percentage = calcularPorcentaje(value, total);
              return [
                `📚 ${esPresencial ? 'Año' : 'Plan'}: ${categoria}`,
                `👥 Estudiantes: ${value}`,
                `📈 Porcentaje: ${percentage}%`
              ];
            }
          }
        },
        datalabels: {
          display: true,
          color: tipo === 'doughnut' ? '#ffffff' : '#374151',
          font: { weight: 'bold', size: 12 },
          formatter: (value, context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = calcularPorcentaje(value, total);
            return value > 0 ? (tipo === 'doughnut' ? `${percentage}%` : `${value}\n${percentage}%`) : '';
          }
        }
      },
      ...(tipo === 'bar' && {
        scales: {
          y: { 
            beginAtZero: true,
            title: { display: true, text: 'Cantidad de Estudiantes' },
            ticks: { precision: 0 }
          },
          x: { 
            title: { display: true, text: esPresencial ? 'Años Académicos' : 'Planes de Estudios' }
          }
        }
      })
    };
  };

  const getTituloModal = () => {
    const modalidadTexto = modalidadSeleccionada === 'todas' ? 'Todas las Modalidades' :
                          modalidadSeleccionada === 'presencial' ? 'Modalidad Presencial' :
                          modalidadSeleccionada === 'semipresencial' ? 'Modalidad Semipresencial' :
                          modalidadSeleccionada;
    
    return (
      <h2 className="modal-titulo">
        📊 Tendencias por Plan - {modalidadTexto}
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
                className={`btn-vista ${vistaActual === 'modalidades' ? 'active' : ''}`}
                onClick={() => setVistaActual('modalidades')}
                title="Vista modalidades generales"
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
          {vistaActual === 'modalidades' ? (
            <div className="graficos-grid">
              <div className="grafico-container">
                <div className="grafico-header">
                  <h4>📊 Distribución General por Modalidad</h4>
                  <p>Comparación entre modalidades de estudio</p>
                </div>
                <div className="grafico-canvas" style={{height: '400px'}}>
                  <Doughnut data={dataModalidades} options={optionsModalidades} />
                </div>
              </div>
            </div>
          ) : (
            <div className="graficos-detalle">
              {Object.entries(detalleModalidad).map(([modalidad, detalle]) => {
                if (modalidadSeleccionada === 'todas' || modalidad.toLowerCase().includes(modalidadSeleccionada.toLowerCase())) {
                  return (
                    <div key={modalidad} className="grafico-container">
                      <div className="grafico-header">
                        <h4>
                          {modalidad === 'PRESENCIAL' ? '🏫 PRESENCIAL - Por Año Académico' : '💻 SEMIPRESENCIAL - Por Plan'}
                        </h4>
                        <p>
                          {modalidad === 'PRESENCIAL' ? 
                            'Distribución de estudiantes por año de cursado' : 
                            'Distribución de estudiantes por plan de estudios'
                          }
                        </p>
                      </div>
                      <div className="graficos-modalidad">
                        {/* Gráfico de barras */}
                        <div className="grafico-canvas" style={{height: '350px', width: '48%'}}>
                          <Bar 
                            data={crearDatosDetalle(modalidad, detalle)} 
                            options={crearOpcionesDetalle(modalidad, 'bar')} 
                          />
                        </div>
                        {/* Gráfico de dona */}
                        <div className="grafico-canvas" style={{height: '350px', width: '48%'}}>
                          <Doughnut 
                            data={crearDatosDetalle(modalidad, detalle)} 
                            options={crearOpcionesDetalle(modalidad, 'doughnut')} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
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
              <span className="stat-valor">{modalidades.length}</span>
              <span className="stat-label">Modalidades Activas</span>
            </div>
            {detalleModalidad['PRESENCIAL'] && (
              <div className="stat-item">
                <span className="stat-valor">{Object.keys(detalleModalidad['PRESENCIAL']).length}</span>
                <span className="stat-label">Años Presenciales</span>
              </div>
            )}
            {detalleModalidad['SEMIPRESENCIAL'] && (
              <div className="stat-item">
                <span className="stat-valor">{Object.keys(detalleModalidad['SEMIPRESENCIAL']).length}</span>
                <span className="stat-label">Planes Semipresenciales</span>
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
          font-size: 24px;
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

        .graficos-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
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
          font-size: 18px;
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

        .graficos-modalidad {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 24px;
        }

        .modal-graficos-footer {
          padding: 10px 18px;
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

GraficoTendenciasPlan.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalidadSeleccionada: PropTypes.string
};

export default GraficoTendenciasPlan;