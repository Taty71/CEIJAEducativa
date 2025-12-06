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

const GraficoEstadosInscripcion = ({ 
  isOpen, 
  onClose, 
  estudiantes, 
  modalidadSeleccionada = 'todas'
}) => {
  const [vistaActual, setVistaActual] = useState('barras');

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

  // Mapear estados de inscripción
  const mapearEstadoInscripcion = (estado) => {
    if (!estado) return 'Sin estado';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('pendiente') || estadoLower.includes('1')) return 'Pendiente';
    if (estadoLower.includes('completa') || estadoLower.includes('2')) return 'Completa';
    if (estadoLower.includes('anulada') || estadoLower.includes('anulado') || estadoLower.includes('3')) return 'Anulada';
    
    return estado;
  };

  // Agrupar por estado de inscripción
  const estadosGroup = {};
  estudiantesFiltrados.forEach(estudiante => {
    const estado = mapearEstadoInscripcion(estudiante.estadoInscripcion || estudiante.idEstadoInscripcion);
    estadosGroup[estado] = (estadosGroup[estado] || 0) + 1;
  });

  // Preparar datos ordenados
  const estadosOrdenados = ['Pendiente', 'Completa', 'Anulada', 'Sin estado'];
  const datosEstados = estadosOrdenados
    .filter(estado => estadosGroup[estado] > 0)
    .map(estado => ({
      estado,
      cantidad: estadosGroup[estado],
      porcentaje: calcularPorcentaje(estadosGroup[estado], estudiantesFiltrados.length)
    }));

  // Agregar otros estados no contemplados
  Object.keys(estadosGroup).forEach(estado => {
    if (!estadosOrdenados.includes(estado)) {
      datosEstados.push({
        estado,
        cantidad: estadosGroup[estado],
        porcentaje: calcularPorcentaje(estadosGroup[estado], estudiantesFiltrados.length)
      });
    }
  });

  // Colores para cada estado
  const coloresEstados = {
    'Pendiente': '#f39c12',
    'Completa': '#27ae60',
    'Anulada': '#e74c3c',
    'Sin estado': '#95a5a6'
  };

  // Datos para gráfico de barras
  const datosBarras = {
    labels: datosEstados.map(item => item.estado),
    datasets: [{
      label: 'Cantidad de Inscripciones',
      data: datosEstados.map(item => item.cantidad),
      backgroundColor: datosEstados.map(item => coloresEstados[item.estado] || '#34495e'),
      borderColor: datosEstados.map(item => coloresEstados[item.estado] || '#2c3e50'),
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 80
    }]
  };

  // Datos para gráfico circular
  const datosDonut = {
    labels: datosEstados.map(item => `${item.estado} (${item.porcentaje}%)`),
    datasets: [{
      data: datosEstados.map(item => item.cantidad),
      backgroundColor: datosEstados.map(item => coloresEstados[item.estado] || '#34495e'),
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBackgroundColor: datosEstados.map(item => {
        const color = coloresEstados[item.estado] || '#34495e';
        return color.replace(')', ', 0.8)').replace('rgb', 'rgba');
      })
    }]
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { 
        display: true, 
        text: 'Estados de Inscripción - Vista de Barras', 
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
            const item = datosEstados[context.dataIndex];
            const total = estudiantesFiltrados.length;
            return [
              `📊 Estado: ${item.estado}`,
              `👥 Estudiantes: ${item.cantidad}`,
              `📈 Porcentaje: ${item.porcentaje}%`,
              `📋 Total general: ${total}`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: 'bold', size: 12 },
        formatter: (value, context) => {
          const item = datosEstados[context.dataIndex];
          return `${value}\n${item.porcentaje}%`;
        },
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
        title: { display: true, text: 'Estado de Inscripción', font: { weight: 'bold' } },
        ticks: { font: { size: 11, weight: '600' } },
        grid: { display: false }
      }
    }
  };

  const opcionesDonut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          boxWidth: 15, 
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        } 
      },
      title: { 
        display: true, 
        text: 'Estados de Inscripción - Vista Circular', 
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
            return `Estado: ${tooltipItems[0].label.split(' (')[0]}`;
          },
          label: function(context) {
            const item = datosEstados[context.dataIndex];
            const total = estudiantesFiltrados.length;
            return [
              `📊 Estudiantes: ${item.cantidad}`,
              `📈 Porcentaje: ${item.porcentaje}%`,
              `🎯 Total registrados: ${total}`
            ];
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        font: { weight: 'bold', size: 14 },
        formatter: function(value) {
          const total = datosEstados.reduce((sum, item) => sum + item.cantidad, 0);
          const percentage = calcularPorcentaje(value, total);
          return percentage > 8 ? `${percentage}%` : '';
        }
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
        📊 Estados de Inscripción - {modalidadTexto}
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
                className={`btn-vista ${vistaActual === 'barras' ? 'active' : ''}`}
                onClick={() => setVistaActual('barras')}
                title="Vista de barras"
              >
                <span>📊 Barras</span>
              </button>
              <button 
                className={`btn-vista ${vistaActual === 'circular' ? 'active' : ''}`}
                onClick={() => setVistaActual('circular')}
                title="Vista circular"
              >
                <span>🍩 Circular</span>
              </button>
            </div>
            <CloseButton onClose={onClose} className="btn-close-graficos" />
          </div>
        </div>

        <div className="modal-graficos-content">
          <div className="graficos-estados">
            <div className="grafico-container">
              <div className="grafico-header">
                <h4>
                  {vistaActual === 'barras' ? 
                    '📊 Distribución de Estados - Gráfico de Barras' : 
                    '🍩 Distribución de Estados - Gráfico Circular'
                  }
                </h4>
                <p>
                  {vistaActual === 'barras' ? 
                    'Comparación visual de cantidades por estado de inscripción' : 
                    'Proporción porcentual de estados en el total de inscripciones'
                  }
                </p>
              </div>
              <div className="grafico-canvas" style={{height: '450px'}}>
                {vistaActual === 'barras' ? (
                  <Bar data={datosBarras} options={opcionesBarras} />
                ) : (
                  <Doughnut data={datosDonut} options={opcionesDonut} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-graficos-footer">
          <div className="estadisticas-resumen">
            <div className="stat-item">
              <span className="stat-valor">{estudiantesFiltrados.length}</span>
              <span className="stat-label">Total Estudiantes</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{datosEstados.length}</span>
              <span className="stat-label">Estados Diferentes</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{estadosGroup['Completa'] || 0}</span>
              <span className="stat-label">Inscripciones Completas</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{estadosGroup['Pendiente'] || 0}</span>
              <span className="stat-label">Inscripciones Pendientes</span>
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
          max-width: 1000px;
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

        .graficos-estados {
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

GraficoEstadosInscripcion.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalidadSeleccionada: PropTypes.string
};

export default GraficoEstadosInscripcion;