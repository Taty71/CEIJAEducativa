import { useState } from 'react';
import PropTypes from 'prop-types';
import BotonCargando from './BotonCargando';
import '../estilos/buscadorDNI.css';

const BuscadorDNI = ({
  onBuscar,
  onBuscarGeneral,
  onClear,
  loading = false,
  disabled = false,
  modoBusqueda = false,
  placeholder = "Ingresa el DNI del estudiante (ej: 12345678)",
  suppressGlobalLoading = true
}) => {
  const [term, setTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const handleBuscar = () => {
    if (!term || !term.trim()) return;
    const texto = term.trim();
    // Si es solo dígitos (DNI), usar onBuscar (buscar por DNI). Si no, usar onBuscarGeneral si está disponible.
    const soloDigitos = /^\d+$/.test(texto.replace(/\s+/g, ''));
    try {
      let result;
      if (soloDigitos) {
        if (typeof onBuscar === 'function') result = onBuscar(texto);
      } else {
        if (typeof onBuscarGeneral === 'function') result = onBuscarGeneral(texto);
        else if (typeof onBuscar === 'function') result = onBuscar(texto);
      }

      // If handler returned a promise, show local spinner until it resolves
      if (result && typeof result.then === 'function') {
        setSearching(true);
        result.finally(() => setSearching(false));
      }
    } catch {
      // ignore handler errors here (they'll be handled upstream)
      setSearching(false);
    }
  };

  const handleClear = () => {
    setTerm('');
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  // Nota: la limpieza se renderiza externamente en PanelControles.

  const handleInputChange = (e) => {
    // Permitir texto libre (nombre/apellido/DNI). Limitar longitud a 60
    const valor = e.target.value.slice(0, 60);
    setTerm(valor);
  };

  // Ejecutar búsqueda cuando el usuario presiona Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscar();
    }
  };

  const showSpinner = (!suppressGlobalLoading && loading) || searching;

  return (
    <div className="buscador-dni-container">
      {/* Buscador general por Nombre / Apellido / DNI (solo si se provee handler) */}
      <div className="buscador-dni-input-group">
        <input
          type="text"
          placeholder={placeholder}
          className="buscador-dni-input"
          value={term}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={loading || disabled}
        />
        <BotonCargando
          loading={showSpinner}
          className="btn-buscar-dni"
          onClick={handleBuscar}
          disabled={loading || disabled || !term.trim()}
          title="Buscar estudiante"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </BotonCargando>
        {/*{(modoBusqueda || term) && (
          <button
            className="btn-limpiar-busqueda"
            onClick={handleClear}
            title="Limpiar búsqueda y mostrar todos"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
            Limpiar
          </button>
        )}*/}
      </div>

      {/* Limpieza se mostrará externamente justo debajo del buscador en PanelControles */}
    </div>
  );
};

BuscadorDNI.propTypes = {
  onBuscar: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  modoBusqueda: PropTypes.bool,
  onBuscarGeneral: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  suppressGlobalLoading: PropTypes.bool,
};

export default BuscadorDNI;
