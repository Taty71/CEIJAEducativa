import PropTypes from 'prop-types';
import BuscadorDNI from '../BuscadorDNI';

const PanelControles = ({
  filtroActivo,
  setFiltroActivo,
  estadosInscripcion,
  estadoFiltro,
  setEstadoFiltro,
  onBuscarDNI,
  onBuscarGeneral,
  onLimpiarBusqueda,
  modoBusqueda,
  loading,
  showSearch = true,
  showFilters = true,
  onResetFiltros // Nuevo prop para resetear todos los filtros
}) => {
  const handleFiltroChange = (nuevoFiltro) => {
    if (nuevoFiltro !== filtroActivo) {
      setFiltroActivo(nuevoFiltro);
    }
    // Si el usuario presiona "Todos", resetea todos los filtros y búsqueda
    if (nuevoFiltro === 'todos' && typeof onResetFiltros === 'function') {
      onResetFiltros();
    }
  };

  return (
    <div className="panel-controles">
      {/* Filtros de Estado */}
      {showFilters && (
        <div className="grupo-filtros-estado">
        <button
          className={`btn-filtro-small ${filtroActivo === 'todos' ? 'activo' : ''}`}
          onClick={() => handleFiltroChange('todos')}
          disabled={loading}
        >
          📋 Todos
        </button>
        <button
          className={`btn-filtro-small ${filtroActivo === 'activos' ? 'activo' : ''}`}
          onClick={() => handleFiltroChange('activos')}
          disabled={loading}
        >
          ✅ Activos
        </button>
        <button
          className={`btn-filtro-small ${filtroActivo === 'desactivados' ? 'activo' : ''}`}
          onClick={() => handleFiltroChange('desactivados')}
          disabled={loading}
        >
          ❌ Inactivos
        </button>
        </div>
      )}

      {/* Filtro por Estado de Inscripción */}
      {showFilters && (
        <div className="grupo-select-estado">
        
        <select
          className="select-estado-inscripcion"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          disabled={loading}
        >
          <option value="">Todos los estados</option>
          {estadosInscripcion && estadosInscripcion.length > 0 ? (
            estadosInscripcion.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.descripcionEstado}
              </option>
            ))
          ) : (
            <>
              <option value="1">Pendiente</option>
              <option value="2">Completa</option>
              <option value="3">Anulado</option>
            </>
          )}
        </select>
        </div>
      )}

      {/* Filtro por inicial de apellido eliminado (se reemplaza por buscador general) */}

      {/* Buscador DNI */}
      {showSearch && (
        <div className="grupo-buscador">
          <div className="buscador-wrapper">
            <BuscadorDNI
              onBuscar={onBuscarDNI}
              onBuscarGeneral={typeof onBuscarGeneral === 'function' ? onBuscarGeneral : undefined}
              placeholder="Buscar por Nombre, Apellido o DNI..."
              disabled={loading}
            />
          </div>

          {modoBusqueda && (
            <div className="limpiar-debajo">
              <button
                className="btn-limpiar-busqueda"
                onClick={onLimpiarBusqueda}
                disabled={loading}
              >
                🗑️ 
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

PanelControles.propTypes = {
  filtroActivo: PropTypes.string.isRequired,
  setFiltroActivo: PropTypes.func.isRequired,
  estadosInscripcion: PropTypes.array.isRequired,
  estadoFiltro: PropTypes.string.isRequired,
  setEstadoFiltro: PropTypes.func.isRequired,
  onBuscarDNI: PropTypes.func.isRequired,
  onLimpiarBusqueda: PropTypes.func.isRequired,
  modoBusqueda: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onBuscarGeneral: PropTypes.func,
  onResetFiltros: PropTypes.func,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool
};

export default PanelControles;