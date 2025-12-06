import { useState } from 'react';
import PropTypes from 'prop-types';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CloseButton from '../CloseButton';
import '../../estilos/modalGraficosInteractivos.css';

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

const ModalGraficosInteractivos = ({ 
  isOpen, 
  onClose, 
  estudiantes, 
  modalidadSeleccionada,
  userRole 
}) => {
  const [vistaActual, setVistaActual] = useState('grid');
  const [graficoActivo, setGraficoActivo] = useState(0);

  if (!isOpen) return null;

  // Utilidades
  const calcularPorcentaje = (parte, total) => total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';
  
  // Agrupar datos
  const agruparPor = (array, campo) => {
    return array.reduce((grupos, item) => {
      const valor = item[campo] || 'Sin definir';
      if (!grupos[valor]) grupos[valor] = [];
      grupos[valor].push(item);
      return grupos;
    }, {});
  };

  // Datos para gráficos
  const estadosGroup = agruparPor(estudiantes, 'estadoInscripcion');
  const planesGroup = agruparPor(estudiantes, 'planAnio');
  const semipresencial = estudiantes.filter(e => e.modalidad === 'SEMIPRESENCIAL').length;
  const presencial = estudiantes.filter(e => e.modalidad === 'PRESENCIAL').length;

  // Configuración de gráficos
  const graficos = [
    {
      id: 'estados',
      titulo: '📊 Estados de Inscripción',
      descripcion: 'Distribución de estudiantes por estado',
      tipo: 'doughnut',
      data: {
        labels: Object.keys(estadosGroup).map(estado => {
          const cantidad = estadosGroup[estado].length;
          const porcentaje = calcularPorcentaje(cantidad, estudiantes.length);
          return `${estado} (${porcentaje}%)`;
        }),
        datasets: [{
          data: Object.values(estadosGroup).map(grupo => grupo.length),
          backgroundColor: [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBackgroundColor: [
            '#2563eb', '#dc2626', '#059669', '#d97706',
            '#7c3aed', '#db2777', '#0891b2', '#65a30d'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              boxWidth: 15, 
              font: { size: 11, weight: 'bold' },
              padding: 12,
              color: '#374151'
            } 
          },
          title: { 
            display: true, 
            text: 'Estados de Inscripción', 
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
                const label = Object.keys(estadosGroup)[context.dataIndex] || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = calcularPorcentaje(value, total);
                return [
                  `📊 Estado: ${label}`,
                  `👥 Cantidad: ${value} estudiantes`,
                  `📈 Porcentaje: ${percentage}% del total`
                ];
              }
            }
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: (value) => {
              const percentage = calcularPorcentaje(value, estudiantes.length);
              return percentage > 5 ? `${percentage}%` : '';
            }
          }
        }
      }
    },
    {
      id: 'planes',
      titulo: '📈 Distribución por Plan',
      descripcion: 'Estudiantes por plan de estudios',
      tipo: 'bar',
      data: (() => {
        const planesTop = Object.entries(planesGroup)
          .sort(([,a], [,b]) => b.length - a.length)
          .slice(0, 6);
        
        return {
          labels: planesTop.map(([plan]) => {
            return plan.length > 15 ? `${plan.substring(0, 15)}...` : plan;
          }),
          datasets: [{
            label: 'Estudiantes por Plan',
            data: planesTop.map(([, listaEstudiantes]) => listaEstudiantes.length),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(6, 182, 212, 0.8)'
            ],
            borderColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
            ],
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 80,
            minBarLength: 2,
            hoverBackgroundColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(6, 182, 212, 1)'
            ]
          }]
        };
      })(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        plugins: {
          legend: { display: false },
          title: { 
            display: true, 
            text: 'Top 6 Planes de Estudios', 
            font: { size: 16, weight: 'bold' },
            padding: 25,
            color: '#1f2937'
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#f9fafb',
            bodyColor: '#f9fafb',
            borderColor: '#3b82f6',
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                return `📚 Plan: ${tooltipItems[0].label}`;
              },
              label: function(context) {
                const value = context.parsed.y || 0;
                const total = estudiantes.length;
                const percentage = calcularPorcentaje(value, total);
                const ranking = context.dataIndex + 1;
                return [
                  `👥 Estudiantes: ${value}`,
                  `📊 Porcentaje: ${percentage}% del total`,
                  `🏆 Ranking: #${ranking} de ${Object.keys(planesGroup).length}`,
                  `📈 Total general: ${total}`
                ];
              }
            }
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: (value) => {
              const percentage = calcularPorcentaje(value, estudiantes.length);
              return value > 0 ? `${value}\n${percentage}%` : '';
            },
            align: 'center',
            anchor: 'center',
            backgroundColor: function(context) {
              return context.dataset.borderColor[context.dataIndex] + '20';
            },
            borderColor: function(context) {
              return context.dataset.borderColor[context.dataIndex];
            },
            borderRadius: 4,
            borderWidth: 1,
            padding: 6
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            suggestedMax: Math.max(...Object.values(planesGroup).map(p => p.length)) * 1.2,
            ticks: { 
              precision: 0,
              color: '#6b7280',
              font: { size: 11 },
              callback: function(value) {
                return value + ' est.';
              }
            },
            grid: { 
              color: 'rgba(229, 231, 235, 0.6)',
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Cantidad de Estudiantes',
              color: '#374151',
              font: { size: 12, weight: 'bold' }
            }
          },
          x: { 
            ticks: { 
              maxRotation: 30,
              minRotation: 0,
              font: { size: 10, weight: '600' },
              color: '#6b7280',
              maxTicksLimit: 6
            },
            grid: { display: false },
            title: {
              display: true,
              text: 'Planes de Estudios',
              color: '#374151',
              font: { size: 12, weight: 'bold' }
            }
          }
        },
        categoryPercentage: 0.8,
        barPercentage: 0.7,
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    },
    {
      id: 'modalidades',
      titulo: '🏫 Modalidades',
      descripcion: 'Comparación entre modalidades',
      tipo: 'doughnut',
      data: {
        labels: ['Semipresencial', 'Presencial'].map((label, index) => {
          const values = [semipresencial, presencial];
          const total = values.reduce((a, b) => a + b, 0);
          const percentage = calcularPorcentaje(values[index], total);
          return `${label} (${percentage}%)`;
        }),
        datasets: [{
          data: [semipresencial, presencial],
          backgroundColor: [
            '#8b5cf6',
            '#10b981'
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBackgroundColor: [
            '#7c3aed',
            '#059669'
          ],
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              boxWidth: 15, 
              font: { size: 13, weight: '600' },
              padding: 18,
              usePointStyle: true,
              pointStyle: 'circle'
            } 
          },
          title: { 
            display: true, 
            text: 'Distribución por Modalidad', 
            font: { size: 16, weight: 'bold' },
            padding: 20,
            color: '#374151'
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#f9fafb',
            bodyColor: '#f9fafb',
            borderColor: '#6b7280',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                return `Modalidad: ${tooltipItems[0].label.split(' (')[0]}`;
              },
              label: function(context) {
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = calcularPorcentaje(value, total);
                return [
                  `📊 Estudiantes: ${value}`,
                  `📈 Porcentaje: ${percentage}%`,
                  `🎯 Total registrados: ${total}`
                ];
              }
            }
          },
          datalabels: {
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: function(value, context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = calcularPorcentaje(value, total);
              return `${percentage}%`;
            },
            display: function(context) {
              return context.parsed > 0;
            }
          }
        }
      }
    },
    {
      id: 'tendencias',
      titulo: '📅 Tendencias Temporales',
      descripcion: 'Inscripciones por mes',
      tipo: 'line',
      data: (() => {
        const inscripcionesPorMes = {};
        estudiantes.forEach(est => {
          if (est.fechaInscripcion) {
            const fecha = new Date(est.fechaInscripcion);
            const mesAno = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            if (!inscripcionesPorMes[mesAno]) inscripcionesPorMes[mesAno] = 0;
            inscripcionesPorMes[mesAno]++;
          }
        });
        
        const mesesOrdenados = Object.entries(inscripcionesPorMes)
          .sort(([a], [b]) => {
            const [mesA, anoA] = a.split('/');
            const [mesB, anoB] = b.split('/');
            return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
          })
          .slice(-6);

        const datosDelMes = mesesOrdenados.map(([, cantidad]) => cantidad);

        return {
          labels: mesesOrdenados.map(([mes]) => {
            const [mesNum, ano] = mes.split('/');
            const nombreMes = new Date(ano, mesNum - 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
          }),
          datasets: [{
            label: 'Inscripciones por Mes',
            data: datosDelMes,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 8,
            pointHoverRadius: 10,
            pointHoverBackgroundColor: '#1d4ed8',
            pointHoverBorderWidth: 4
          }]
        };
      })(),
      options: {
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
              pointStyle: 'line'
            }
          },
          title: { 
            display: true, 
            text: 'Tendencia de Inscripciones por Período', 
            font: { size: 16, weight: 'bold' },
            padding: 20,
            color: '#374151'
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#f9fafb',
            bodyColor: '#f9fafb',
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
                const total = estudiantes.length;
                const percentage = calcularPorcentaje(value, total);
                const dataset = context.dataset.data;
                const maxValue = Math.max(...dataset);
                const isMax = value === maxValue;
                return [
                  `📊 Inscripciones: ${value}${isMax ? ' 🏆 (Pico máximo)' : ''}`,
                  `📈 Del total anual: ${percentage}%`,
                  `📋 Total estudiantes: ${total}`,
                  `🎯 Promedio: ${(total / dataset.length).toFixed(1)} por período`
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
              size: 11
            },
            formatter: function(value) {
              const total = estudiantes.length;
              const percentage = calcularPorcentaje(value, total);
              return `${percentage}%`;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#3b82f6',
            borderRadius: 4,
            borderWidth: 1,
            padding: 4
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
              font: { size: 11 },
              color: '#6b7280',
              maxRotation: 45
            },
            grid: { 
              display: false 
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            hoverRadius: 12
          }
        }
      }
    }
  ];

  const renderGrafico = (grafico) => {
    const GraficoComponent = grafico.tipo === 'doughnut' ? Doughnut : 
                           grafico.tipo === 'bar' ? Bar : Line;
                           
    return (
      <div key={grafico.id} className="grafico-container">
        <div className="grafico-header">
          <h4>{grafico.titulo}</h4>
          <p>{grafico.descripcion}</p>
        </div>
        <div className="grafico-canvas">
          <GraficoComponent data={grafico.data} options={grafico.options} />
        </div>
      </div>
    );
  };

  const getTituloModal = () => {
    const modalidadTexto = modalidadSeleccionada === 'todas' ? 'Todas las Modalidades' :
                          modalidadSeleccionada === 'presencial' ? 'Modalidad Presencial' :
                          modalidadSeleccionada === 'semipresencial' ? 'Modalidad Semipresencial' :
                          modalidadSeleccionada;
    
    const colorClase = userRole === 'secretario' ? 'titulo-secretario' :
                      userRole === 'coordinador' ? 'titulo-coordinador' :
                      'titulo-administrador';

    return (
      <h2 className={`modal-titulo ${colorClase}`}>
        📊 Gráficos Interactivos - {modalidadTexto}
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
                className={`btn-vista ${vistaActual === 'grid' ? 'active' : ''}`}
                onClick={() => setVistaActual('grid')}
                title="Vista en cuadrícula"
              >
                <span>⊞</span>
              </button>
              <button 
                className={`btn-vista ${vistaActual === 'individual' ? 'active' : ''}`}
                onClick={() => setVistaActual('individual')}
                title="Vista individual"
              >
                <span>⊡</span>
              </button>
            </div>
            <CloseButton onClose={onClose} className="btn-close-graficos" />
          </div>
        </div>

        <div className="modal-graficos-content">
          {vistaActual === 'grid' ? (
            <div className="graficos-grid">
              {graficos.map(renderGrafico)}
            </div>
          ) : (
            <div className="graficos-individual">
              <div className="navegacion-graficos">
                {graficos.map((grafico, index) => (
                  <button
                    key={grafico.id}
                    className={`btn-navegacion ${index === graficoActivo ? 'active' : ''}`}
                    onClick={() => setGraficoActivo(index)}
                  >
                    {grafico.titulo}
                  </button>
                ))}
              </div>
              <div className="grafico-individual-container">
                {renderGrafico(graficos[graficoActivo])}
              </div>
            </div>
          )}
        </div>

        <div className="modal-graficos-footer">
          <div className="estadisticas-resumen">
            <div className="stat-item">
              <span className="stat-valor">{estudiantes.length}</span>
              <span className="stat-label">Total Estudiantes</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{Object.keys(estadosGroup).length}</span>
              <span className="stat-label">Estados Únicos</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{Object.keys(planesGroup).length}</span>
              <span className="stat-label">Planes Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-valor">{calcularPorcentaje(semipresencial > presencial ? semipresencial : presencial, estudiantes.length)}%</span>
              <span className="stat-label">Modalidad Dominante</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalGraficosInteractivos.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalidadSeleccionada: PropTypes.string.isRequired,
  userRole: PropTypes.string
};

export default ModalGraficosInteractivos;