import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../estilos/SelectUbicacion.css';

const API_BASE_URL = 'http://localhost:5000/api';

const SelectUbicacion = ({ 
  tipo, 
  value, 
  onChange, 
  dependeDe, 
  valorDependencia,
  esAdmin = false,
  placeholder,
  className = "form-control",
  name,
  disabled = false
}) => {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoValor, setNuevoValor] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Configuración para cada tipo
  const configuracion = {
    provincia: {
      endpoint: '/ubicaciones/provincias',
      labelSingular: 'Provincia',
      labelPlural: 'Provincias'
    },
    localidad: {
      endpoint: `/ubicaciones/localidades/${valorDependencia}`,
      labelSingular: 'Localidad',
      labelPlural: 'Localidades',
      requiereDependencia: true
    },
    barrio: {
      endpoint: `/ubicaciones/barrios/${valorDependencia}`,
      labelSingular: 'Barrio',
      labelPlural: 'Barrios',
      requiereDependencia: true
    }
  };

  const config = configuracion[tipo];

  // Cargar opciones
  useEffect(() => {
    const cargarOpciones = async () => {
      // Si requiere dependencia y no la tiene, limpiar opciones
      if (config.requiereDependencia && !valorDependencia) {
        setOpciones([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}${config.endpoint}`);
        const data = await response.json();
        
        if (data.success) {
          setOpciones(data.data || []);
        } else {
          console.error(`Error al cargar ${config.labelPlural}:`, data.message);
          setOpciones([]);
        }
      } catch (error) {
        console.error(`Error al cargar ${config.labelPlural}:`, error);
        setOpciones([]);
      } finally {
        setLoading(false);
      }
    };

    cargarOpciones();
  }, [valorDependencia, config.endpoint, config.labelPlural, config.requiereDependencia]);

  // Limpiar valor cuando cambia la dependencia
  useEffect(() => {
    if (config.requiereDependencia && dependeDe) {
      onChange({ target: { name, value: '' } });
    }
  }, [valorDependencia, config.requiereDependencia, dependeDe, onChange, name]);

  const handleAgregarNuevo = async () => {
    if (!nuevoValor.trim()) return;

    setGuardando(true);
    try {
      const payload = { nombre: nuevoValor.trim() };
      
      // Agregar ID de dependencia según el tipo
      if (tipo === 'localidad') {
        payload.idProvincia = valorDependencia;
      } else if (tipo === 'barrio') {
        payload.idLocalidad = valorDependencia;
      }

      const response = await fetch(`${API_BASE_URL}/ubicaciones/${tipo}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Agregar la nueva opción a la lista
        const nuevaOpcion = data.data;
        setOpciones(prev => [...prev, nuevaOpcion]);
        
        // Seleccionar automáticamente la nueva opción
        onChange({ target: { name, value: nuevaOpcion.id } });
        
        // Resetear formulario
        setNuevoValor('');
        setMostrarFormulario(false);
        
        alert(`${config.labelSingular} creada exitosamente`);
      } else {
        alert(`Error al crear ${config.labelSingular}: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error al crear ${config.labelSingular}:`, error);
      alert(`Error al crear ${config.labelSingular}`);
    } finally {
      setGuardando(false);
    }
  };

  const isDisabled = disabled || loading || (config.requiereDependencia && !valorDependencia);

  return (
    <div className="select-ubicacion-container">
      <div className="select-con-boton">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={className}
          disabled={isDisabled}
        >
          <option value="">
            {loading ? 'Cargando...' : placeholder || `Seleccione ${config.labelSingular}`}
          </option>
          {opciones.map(opcion => (
            <option key={opcion.id} value={opcion.id}>
              {opcion.nombre}
            </option>
          ))}
        </select>
        
        {esAdmin && !isDisabled && (
          <button
            type="button"
            className="btn-agregar-ubicacion"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            title={`Agregar nueva ${config.labelSingular}`}
          >
            +
          </button>
        )}
      </div>

      {mostrarFormulario && esAdmin && (
        <div className="formulario-nueva-ubicacion">
          <div className="input-group">
            <input
              type="text"
              value={nuevoValor}
              onChange={(e) => setNuevoValor(e.target.value)}
              placeholder={`Nueva ${config.labelSingular}`}
              className="form-control-small"
              onKeyPress={(e) => e.key === 'Enter' && handleAgregarNuevo()}
            />
            <button
              type="button"
              onClick={handleAgregarNuevo}
              disabled={guardando || !nuevoValor.trim()}
              className="btn-confirmar-pequeno"
            >
              {guardando ? '...' : '✓'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(false);
                setNuevoValor('');
              }}
              className="btn-cancelar-pequeno"
            >
              ✗
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

SelectUbicacion.propTypes = {
  tipo: PropTypes.oneOf(['provincia', 'localidad', 'barrio']).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  dependeDe: PropTypes.string,
  valorDependencia: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  esAdmin: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

export default SelectUbicacion;