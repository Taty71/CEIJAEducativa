import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../estilos/modalHerramientas.css';
import SpinnerCeiJa from '../SpinnerCeiJa';

const ModalHerramientas = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState('');

  const ejecutarAnalisis = async () => {
    setLoading(true);
    setTipoOperacion('análisis');
    setResultado(null);

    try {
      const response = await fetch('/api/herramientas/analizar-datos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Error al ejecutar análisis:', error);
      setResultado({
        error: true,
        mensaje: error.message || 'Error al conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const ejecutarLimpieza = async () => {
    setLoading(true);
    setTipoOperacion('limpieza');
    setResultado(null);

    try {
      const response = await fetch('/api/herramientas/limpiar-datos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Error al ejecutar limpieza:', error);
      setResultado({
        error: true,
        mensaje: error.message || 'Error al conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setResultado(null);
    setTipoOperacion('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-herramientas-overlay">
      <div className="modal-herramientas">
        <div className="modal-herramientas-header">
          <h2>🛠️ Herramientas de Base de Datos</h2>
          <button 
            className="modal-herramientas-close"
            onClick={cerrarModal}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="modal-herramientas-content">
          {!resultado && !loading && (
            <div className="herramientas-opciones">
              <div className="herramienta-card">
                <div className="herramienta-icon">🔍</div>
                <h3>Analizar Datos</h3>
                <p>Revisa la integridad de la base de datos, identifica registros problemáticos y genera un reporte completo.</p>
                <button 
                  className="btn-herramienta analizar"
                  onClick={ejecutarAnalisis}
                  disabled={loading}
                >
                  Ejecutar Análisis
                </button>
              </div>

              <div className="herramienta-card">
                <div className="herramienta-icon">🧹</div>
                <h3>Limpiar Datos</h3>
                <p>Elimina registros inconsistentes, estudiantes sin inscripciones y datos problemáticos de la base de datos.</p>
                <button 
                  className="btn-herramienta limpiar"
                  onClick={ejecutarLimpieza}
                  disabled={loading}
                >
                  Ejecutar Limpieza
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="herramientas-loading">
              <SpinnerCeiJa text={`Ejecutando ${tipoOperacion}... Por favor espere.`} />
            </div>
          )}

          {resultado && !loading && (
            <div className="herramientas-resultado">
              <div className={`resultado-header ${resultado.error ? 'error' : 'success'}`}>
                <div className="resultado-icon">
                  {resultado.error ? '❌' : '✅'}
                </div>
                <h3>
                  {resultado.error 
                    ? `Error en ${tipoOperacion}` 
                    : `${tipoOperacion === 'análisis' ? 'Análisis' : 'Limpieza'} Completada`
                  }
                </h3>
              </div>

              <div className="resultado-content">
                {resultado.error ? (
                  <div className="error-message">
                    <p><strong>Error:</strong> {resultado.mensaje}</p>
                  </div>
                ) : (
                  <div className="success-content">
                    {tipoOperacion === 'análisis' ? (
                      <div className="analisis-resultado">
                        <div className="stat-grid">
                          <div className="stat-item">
                            <span className="stat-number">{resultado.totalEstudiantes || 0}</span>
                            <span className="stat-label">Total Estudiantes</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{resultado.estudiantesCompletos || 0}</span>
                            <span className="stat-label">Datos Completos</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{resultado.estudiantesProblematicos || 0}</span>
                            <span className="stat-label">Problemáticos</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{resultado.estudiantesSinInscripciones || 0}</span>
                            <span className="stat-label">Sin Inscripciones</span>
                          </div>
                        </div>

                        <div className="modalidades-info">
                          <h4>📊 Modalidades en uso:</h4>
                          <ul>
                            {resultado.modalidades && resultado.modalidades.map((mod, index) => (
                              <li key={index}>
                                <strong>{mod.modalidad}:</strong> {mod.cantidad_inscripciones} inscripciones
                              </li>
                            ))}
                          </ul>
                        </div>

                        {resultado.estudiantesSinInscripcionesDetalle && resultado.estudiantesSinInscripcionesDetalle.length > 0 && (
                          <div className="problema-detalle">
                            <h4>⚠️ Estudiantes sin inscripciones:</h4>
                            <ul>
                              {resultado.estudiantesSinInscripcionesDetalle.map((est, index) => (
                                <li key={index}>
                                  <strong>{est.nombre} {est.apellido}</strong> (ID: {est.id}, DNI: {est.dni})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="porcentaje-validez">
                          <div className="porcentaje-bar">
                            <div 
                              className="porcentaje-fill"
                              style={{ width: `${resultado.porcentajeValidez || 100}%` }}
                            ></div>
                          </div>
                          <p><strong>Integridad de datos: {resultado.porcentajeValidez || 100}%</strong></p>
                        </div>
                      </div>
                    ) : (
                      <div className="limpieza-resultado">
                        <div className="limpieza-stats">
                          <div className="stat-item">
                            <span className="stat-number">{resultado.estudiantesEliminados || 0}</span>
                            <span className="stat-label">Estudiantes Eliminados</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{resultado.registrosCorregidos || 0}</span>
                            <span className="stat-label">Registros Corregidos</span>
                          </div>
                        </div>

                        {resultado.estudiantesEliminadosDetalle && resultado.estudiantesEliminadosDetalle.length > 0 && (
                          <div className="eliminados-detalle">
                            <h4>🗑️ Estudiantes eliminados:</h4>
                            <ul>
                              {resultado.estudiantesEliminadosDetalle.map((est, index) => (
                                <li key={index}>
                                  <strong>{est.nombre} {est.apellido}</strong> (ID: {est.id}, DNI: {est.dni})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="limpieza-mensaje">
                          <p>✅ <strong>Base de datos limpiada exitosamente</strong></p>
                          <p>Se han eliminado los registros inconsistentes y se ha mejorado la integridad de los datos.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="resultado-actions">
                <button 
                  className="btn-cerrar"
                  onClick={cerrarModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ModalHerramientas.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ModalHerramientas;