import PropTypes from 'prop-types';

const PaginacionControles = ({
  page,
  totalPages,
  loading,
  limit,
  totalRegistros,
  onPreviousPage,
  onNextPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="seccion-paginacion-profesional">
      <div className="paginacion-contenedor">
        <button
          className="btn-paginacion-small anterior"
          onClick={onPreviousPage}
          disabled={page === 1 || loading}
        >
          ⬅️ Anterior
        </button>
        
        <div className="info-paginacion-compacta">
          <span className="pagina-info">
            <strong>{page}</strong> de <strong>{totalPages}</strong>
          </span>
          <span className="registros-info">
            {Math.min(limit, totalRegistros)} registros
          </span>
        </div>
        
        <button
          className="btn-paginacion-small siguiente"
          onClick={onNextPage}
          disabled={page >= totalPages || loading}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  );
};

PaginacionControles.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  limit: PropTypes.number.isRequired,
  totalRegistros: PropTypes.number.isRequired,
  onPreviousPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired
};

export default PaginacionControles;