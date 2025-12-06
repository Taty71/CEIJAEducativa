import PropTypes from 'prop-types';

const ResumenEstadisticas = ({ totalRegistros }) => {
  return (
    <div className="resumen-final-compacto">
      <div className="estadisticas-grid">
        <div className="stat-card">
          <span className="stat-numero">{totalRegistros.total}</span>
          <span className="stat-etiqueta">Total</span>
        </div>
        <div className="stat-card activos">
          <span className="stat-numero">{totalRegistros.activos}</span>
          <span className="stat-etiqueta">Activos</span>
        </div>
        <div className="stat-card inactivos">
          <span className="stat-numero">{totalRegistros.inactivos}</span>
          <span className="stat-etiqueta">Inactivos</span>
        </div>
      </div>
    </div>
  );
};

ResumenEstadisticas.propTypes = {
  totalRegistros: PropTypes.shape({
    total: PropTypes.number.isRequired,
    activos: PropTypes.number.isRequired,
    inactivos: PropTypes.number.isRequired
  }).isRequired
};

export default ResumenEstadisticas;