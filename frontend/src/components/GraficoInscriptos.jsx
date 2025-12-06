import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoInscriptos = ({ estudiantes, estadosInscripcion }) => {
  // Agrupar por estado de inscripción
  const estadoLabels = estadosInscripcion.map(e => e.descripcionEstado);
  const estadoIds = estadosInscripcion.map(e => String(e.id));
  const counts = estadoIds.map(id => estudiantes.filter(e => String(e.idEstadoInscripcion || e.estadoInscripcion || '') === id).length);

  const data = {
    labels: estadoLabels,
    datasets: [
      {
        label: 'Cantidad de inscriptos',
        data: counts,
        backgroundColor: 'rgba(22,160,133,0.7)',
        borderColor: 'rgba(22,160,133,1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Cantidad de inscriptos por estado',
        font: { size: 16 },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Estado de inscripción' } },
      y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true, precision: 0 },
    },
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', marginBottom: 16 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

GraficoInscriptos.propTypes = {
  estudiantes: PropTypes.arrayOf(PropTypes.object).isRequired,
  estadosInscripcion: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    descripcionEstado: PropTypes.string.isRequired,
  })).isRequired,
};

export default GraficoInscriptos;
