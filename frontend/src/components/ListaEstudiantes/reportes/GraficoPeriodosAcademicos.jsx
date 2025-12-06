import { useState } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CloseButton from '../../CloseButton';

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ChartDataLabels
);

const GraficoPeriodosAcademicos = ({ 
  isOpen, 
  onClose, 
  estudiantes, 
  modalidadSeleccionada = 'todas'
}) => {
  const [vistaActual, setVistaActual] = useState('linea');

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

  // Agrupar inscripciones por mes
  const inscripcionesPorMes = {};
  estudiantesFiltrados.forEach(est => {
    if (est.fechaInscripcion) {
      try {
        const fecha = new Date(est.fechaInscripcion);
        const mes = fecha.getMonth() + 1;
        const ano = fecha.getFullYear();
        const mesAno = `${mes}/${ano}`;
        
        if (!inscripcionesPorMes[mesAno]) {
          inscripcionesPorMes[mesAno] = {
            fecha: fecha,
            cantidad: 0,
            label: `${fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}`.toUpperCase()
          };
        }
        inscripcionesPorMes[mesAno].cantidad++;
      } catch (fechaError) {
        console.warn('Error al procesar fecha:', est.fechaInscripcion, fechaError);
      }
    }
  });

  // Ordenar por fecha y tomar últimos 12 meses
  const mesesOrdenados = Object.entries(inscripcionesPorMes)
    .sort(([, a], [, b]) => a.fecha - b.fecha)
    .slice(-12)
    .map(([key, value]) => ({ key, ...value }));

  // Preparar datos para gráficos
  const labels = mesesOrdenados.map(item => item.label);
  const valores = mesesOrdenados.map(item => item.cantidad);
  const total = valores.reduce((sum, val) => sum + val, 0);

  // Datos para gráfico de línea
  const datosLinea = {
    labels: labels,
    datasets: [{
      label: 'Inscripciones por Período',
      data: valores,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#1d4ed8',
      pointHoverBorderWidth: 3
    }]
  };

  // Datos para gráfico de barras
  const datosBarras = {
    labels: labels,
    datasets: [{
      label: 'Inscripciones por Mes',
      data: valores,
      backgroundColor: valores.map((_, index) => {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
        return colors[index % colors.length];
      }),
      borderColor: valores.map((_, index) => {
        const colors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669', '#0891b2'];
        return colors[index % colors.length];
      }),
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 60
    }]
  };

  const opcionesLinea = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: { 
        display: true, 
        text: 'Tendencia Temporal de Inscripciones', 
        font: { size: 18, weight: 'bold' },
        padding: 25,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(tooltipItems) {
            return `📅 Período: ${tooltipItems[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y || 0;
            const percentage = calcularPorcentaje(value, total);
            const maxValue = Math.max(...valores);
            const isMax = value === maxValue;
            const promedio = (total / valores.length).toFixed(1);
            
            return [
              `📊 Inscripciones: ${value}${isMax ? ' 🏆 (Pico máximo)' : ''}`,
              `📈 Del total: ${percentage}%`,
              `📋 Total acumulado: ${total}`,
              `🎯 Promedio período: ${promedio}`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        align: 'top',
        anchor: 'end',
        color: '#3b82f6',
        font: {
          weight: 'bold',
          size: 10
        },
        formatter: function(value) {
          return value > 0 ? value : '';
        },
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#3b82f6',
        borderRadius: 4,
        borderWidth: 1,
        padding: 3
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Inscripciones',
          font: { size: 12, weight: '600' },
          color: '#6b7280'
        },
        ticks: { 
          precision: 0,
          font: { size: 11 },
          color: '#6b7280',
          callback: function(value) {
            return value + ' est.';
          }
        },
        grid: { 
          color: 'rgba(229, 231, 235, 0.8)',
          drawBorder: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Período (Mes/Año)',
          font: { size: 12, weight: '600' },
          color: '#6b7280'
        },
        ticks: {
          font: { size: 10, weight: '600' },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 30
        },
        grid: { 
          display: false 
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: 'Distribución de Inscripciones por Período', 
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
          title: function(tooltipItems) {
            return `📅 Período: ${tooltipItems[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y || 0;
            const percentage = calcularPorcentaje(value, total);
            const ranking = valores.filter(v => v > value).length + 1;
            
            return [
              `📊 Inscripciones: ${value}`,
              `📈 Del total: ${percentage}%`,
              `🏆 Ranking: #${ranking} de ${valores.length}`,
              `📋 Total general: ${total}`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: 'bold', size: 11 },
        formatter: (value) => value > 0 ? value : '',
        align: 'center',
        anchor: 'center'
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        title: { display: true, text: 'Cantidad de Estudiantes', font: { weight: 'bold' } },
        ticks: { precision: 0, font: { size: 11 } },
        grid: { color: 'rgba(229, 231, 235, 0.6)' }
      },
      x: { 
        title: { display: true, text: 'Período Académico', font: { weight: 'bold' } },
        ticks: { font: { size: 10, weight: '600' }, maxRotation: 45, minRotation: 30 },
        grid: { display: false }
      }
    }
  };

  const getTituloModal = () => {
    const modalidadTexto = modalidadSeleccionada === 'todas' ? 'Todas las Modalidades' :
                          modalidadSeleccionada === 'presencial' ? 'Modalidad Presencial' :
                          modalidadSeleccionada === 'semipresencial' ? 'Modalidad Semipresencial' :
                          modalidadSeleccionada;
    
    return (
      <h2 className="modal-titulo">
        📅 Períodos Académicos - {modalidadTexto}
      </h2>
    );
  };

  // Calcular estadísticas
  const picoMaximo = Math.max(...valores);
  const mesPico = labels[valores.indexOf(picoMaximo)];
  const promedio = (total / valores.length).toFixed(1);

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
                className={`btn-vista ${vistaActual === 'linea' ? 'active' : ''}`}
                onClick={() => setVistaActual('linea')}
                title="Vista de línea temporal"
              >
                <span>📈 Tendencia</span>
              </button>
              <button 
                className={`btn-vista ${vistaActual === 'barras' ? 'active' : ''}`}
                onClick={() => setVistaActual('barras')}
                title="Vista de barras por período"
              >
                <span>📊 Barras</span>
              </button>
            </div>
            <CloseButton onClose={onClose} className="btn-close-graficos" />
          </div>
        </div>

        <div className="modal-graficos-content">
          <div className="graficos-periodos">
            <div className="grafico-container">
              <div className="grafico-header">
                <h4>
                  {vistaActual === 'linea' ? 
                    '📈 Tendencia Temporal de Inscripciones' : 
                    '📊 Distribución por Períodos Académicos'
                  }
                </h4>
                <p>
                  {vistaActual === 'linea' ? 
                    'Evolución de las inscripciones a lo largo del tiempo (últimos 12 meses)' : 
                    'Comparación de cantidades de inscripciones por período académico'
                  }
                </p>
              </div>
              <div className="grafico-canvas" style={{height: '450px'}}>
                {vistaActual === 'linea' ? (
                  <Line data={datosLinea} options={opcionesLinea} />
                ) : (
                  <Bar data={datosBarras} options={opcionesBarras} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-graficos-footer">
          <div className="estadisticas-resumen">
            <div className="stat-item">
              <span className="stat-valor">{total}</span>
              <span className="stat-label">Total Inscripciones</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{valores.length}</span>
              <span className="stat-label">Períodos Analizados</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{promedio}</span>
              <span className="stat-label">Promedio por Período</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{mesPico}</span>
              <span className="stat-label">Pico Máximo ({picoMaximo})</span>
            </div>
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
          width: 90%;
          max-width: 1100px;
          height: 85vh;
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

        .graficos-periodos {
          display: flex;
          justify-content: center;
        }

        .grafico-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          width: 100%;
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

GraficoPeriodosAcademicos.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalidadSeleccionada: PropTypes.string
};

export default GraficoPeriodosAcademicos;