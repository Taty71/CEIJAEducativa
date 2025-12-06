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

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
);

const DashboardVisual = ({ estudiantes, estadosInscripcion }) => {
  // Utilidades
  const calcularPorcentaje = (parte, total) => total > 0 ? ((parte / total) * 100).toFixed(1) : '0.0';
  
  const agruparPor = (array, propiedad) => {
    return array.reduce((acc, item) => {
      const key = item[propiedad] || 'Sin definir';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const obtenerMesAno = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  };

  // 1. KPIs Principales (Cards numéricas)
  const totalEstudiantes = estudiantes.length;
  const activos = estudiantes.filter(e => e.activo !== false).length;
  const modalidades = agruparPor(estudiantes, 'modalidad');
  const semipresencial = modalidades['SEMIPRESENCIAL']?.length || 0;
  const presencial = modalidades['PRESENCIAL']?.length || 0;

  // 2. Gráfico de Estados (Donut)
  const estadosData = {
    labels: estadosInscripcion.map(e => e.descripcionEstado || e.descripcion || e),
    datasets: [{
      data: estadosInscripcion.map(estado => {
        const estadoKey = estado.descripcionEstado || estado.descripcion || estado;
        return estudiantes.filter(e => 
          (e.estadoInscripcion || '').toLowerCase().includes(estadoKey.toLowerCase()) ||
          (e.estado || '').toLowerCase().includes(estadoKey.toLowerCase())
        ).length;
      }),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // 3. Gráfico de Distribución por Planes (Bar Chart)
  const planes = agruparPor(estudiantes, 'cursoPlan');
  const planesOrdenados = Object.entries(planes)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 8); // Top 8 planes más populares

  const distribucionPlanesData = {
    labels: planesOrdenados.map(([plan]) => plan),
    datasets: [{
      label: 'Estudiantes',
      data: planesOrdenados.map(([, estudiantes]) => estudiantes.length),
      backgroundColor: [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
      ],
      borderColor: [
        '#2980b9', '#c0392b', '#27ae60', '#d68910',
        '#8e44ad', '#16a085', '#2c3e50', '#d35400'
      ],
      borderWidth: 1
    }]
  };

  // 4. Tendencia de Inscripciones por Mes (Line Chart)
  const inscripcionesPorMes = {};
  estudiantes.forEach(est => {
    const mesAno = obtenerMesAno(est.fechaInscripcion);
    if (!inscripcionesPorMes[mesAno]) inscripcionesPorMes[mesAno] = 0;
    inscripcionesPorMes[mesAno]++;
  });

  const mesesOrdenados = Object.entries(inscripcionesPorMes)
    .sort(([a], [b]) => {
      const [mesA, anoA] = a.split(' ');
      const [mesB, anoB] = b.split(' ');
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const fechaA = new Date(anoA, meses.indexOf(mesA));
      const fechaB = new Date(anoB, meses.indexOf(mesB));
      return fechaA - fechaB;
    });

  const tendenciaData = {
    labels: mesesOrdenados.map(([mes]) => mes),
    datasets: [{
      label: 'Inscripciones',
      data: mesesOrdenados.map(([, cantidad]) => cantidad),
      borderColor: '#4BC0C0',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  // 5. Modalidad por Plan (Stacked Bar Chart)
  const modalidadPorPlanData = {
    labels: planesOrdenados.slice(0, 5).map(([plan]) => plan), // Top 5 planes
    datasets: [
      {
        label: 'Semipresencial',
        data: planesOrdenados.slice(0, 5).map(([, estudiantes]) => 
          estudiantes.filter(e => e.modalidad === 'SEMIPRESENCIAL').length
        ),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1
      },
      {
        label: 'Presencial',
        data: planesOrdenados.slice(0, 5).map(([, estudiantes]) => 
          estudiantes.filter(e => e.modalidad === 'PRESENCIAL').length
        ),
        backgroundColor: '#e74c3c',
        borderColor: '#c0392b',
        borderWidth: 1
      }
    ]
  };

  // Opciones de gráficos - CA-32: Tooltips con valor absoluto y porcentaje
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      title: { display: true, text: 'Estados de Inscripción', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} estudiantes (${percentage}%)`;
          }
        }
      }
    }
  };

  const distribucionPlanesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Distribución por Plan de Estudios', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${value} estudiantes (${percentage}% del total)`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { ticks: { maxRotation: 45, font: { size: 10 } } }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Tendencia de Inscripciones', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || 0;
            const total = estudiantes.length;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} inscripciones (${percentage}% del total)`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  const modalidadPorPlanOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: { boxWidth: 12, font: { size: 11 } }
      },
      title: { display: true, text: 'Modalidad por Plan de Estudios', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || 0;
            const datasetLabel = context.dataset.label || '';
            const planEstudiantes = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = planEstudiantes > 0 ? ((value / planEstudiantes) * 100).toFixed(1) : '0.0';
            return `${datasetLabel}: ${value} estudiantes (${percentage}% del plan)`;
          },
          afterLabel: function(context) {
            const total = estudiantes.length;
            const value = context.parsed.y || 0;
            const percentageTotal = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${percentageTotal}% del total general`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, stacked: true },
      x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } }
    }
  };

  return (
    <div className="dashboard-visual">
      {/* KPIs Cards */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>{totalEstudiantes}</h3>
            <p>Total Estudiantes</p>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <h3>{activos}</h3>
            <p>Estudiantes Activos</p>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">💻</div>
          <div className="kpi-content">
            <h3>{semipresencial}</h3>
            <p>Semipresencial</p>
            <span className="kpi-percentage">{calcularPorcentaje(semipresencial, totalEstudiantes)}%</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">🏫</div>
          <div className="kpi-content">
            <h3>{presencial}</h3>
            <p>Presencial</p>
            <span className="kpi-percentage">{calcularPorcentaje(presencial, totalEstudiantes)}%</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="graficos-grid">
        {/* Estados Donut */}
        <div className="grafico-container">
          <div className="grafico-chart" style={{ height: '300px' }}>
            <Doughnut data={estadosData} options={donutOptions} />
          </div>
        </div>

        {/* Distribución Planes Bar */}
        <div className="grafico-container">
          <div className="grafico-chart" style={{ height: '300px' }}>
            <Bar data={distribucionPlanesData} options={distribucionPlanesOptions} />
          </div>
        </div>

        {/* Tendencia Line */}
        <div className="grafico-container grafico-wide">
          <div className="grafico-chart" style={{ height: '300px' }}>
            <Line data={tendenciaData} options={lineOptions} />
          </div>
        </div>

        {/* Modalidad por Plan Stacked Bar */}
        <div className="grafico-container">
          <div className="grafico-chart" style={{ height: '300px' }}>
            <Bar data={modalidadPorPlanData} options={modalidadPorPlanOptions} />
          </div>
        </div>

        {/* Análisis de Crecimiento */}
        <div className="grafico-container analisis-crecimiento">
          <h4>📈 Análisis de Crecimiento</h4>
          <div className="crecimiento-stats">
            <div className="stat-item">
              <span className="stat-label">Período más activo:</span>
              <span className="stat-value">
                {mesesOrdenados.length > 0 
                  ? mesesOrdenados.reduce((max, curr) => curr[1] > max[1] ? curr : max)[0]
                  : 'N/A'
                }
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Promedio mensual:</span>
              <span className="stat-value">
                {mesesOrdenados.length > 0 
                  ? Math.round(totalEstudiantes / mesesOrdenados.length)
                  : 0
                } estudiantes
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Modalidad dominante:</span>
              <span className="stat-value">
                {semipresencial > presencial ? 'Semipresencial' : 'Presencial'}
                ({Math.round((Math.max(semipresencial, presencial) / totalEstudiantes) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardVisual.propTypes = {
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  estadosInscripcion: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DashboardVisual;