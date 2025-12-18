
import '../../estilos/listaEstudiantes.css';
import '../../estilos/tablaEstudiantes.css';
import ComprobanteGenerator from '../ComprobanteGenerator';
import serviceListaEstudiantes from '../../services/serviceListaEstudiantes';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import BotonCargando from '../BotonCargando';
import iconVer from '../../assets/logos/ver.svg';
import iconPDF from '../../assets/logos/pdf.svg';
// notificacionesService is not used here directly; keep component focused

const TablaEstudiantes = ({
  estudiantes,
  loading,
  error,
  _onEmitirComprobante,
  onVerEstudiante,
  onPreviewNotificacion,
  onActivarEstudiante,
  formatearFecha,
  limit = 5
}) => {
  const [enviandoMap, _setEnviandoMap] = useState({}); // { [id]: boolean }
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeout = useRef();
  const lista = Array.isArray(estudiantes) ? estudiantes : [];

  useEffect(() => {
    if (loading) {
      setShowLoading(true);
      loadingTimeout.current = setTimeout(() => {
        setShowLoading(false);
      }, 5000); // spinner visible al menos 3s
    } else {
      // Si loading termina antes, esperar el timeout
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
      setTimeout(() => setShowLoading(false), 200); // pequeño delay para evitar parpadeo
    }
    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, [loading]);

  if (showLoading) {
    return (
      <div className="tabla-loading" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0 0 0' }}>
        <BotonCargando loading={true} type="button" className="tabla-cargando-boton">
          Cargando Estudiantes
        </BotonCargando>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tabla-error">
        <div className="error-message">
          <h3>⚠️ Error al cargar datos</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tabla-contenedor">
      <div className="tabla-wrapper">
        <table className="tabla-estudiantes">
          <thead>
            <tr>
              <th className="col-id"><div className="th-text">ID</div></th>
              <th className="col-dni"><div className="th-text">DNI</div></th>
              <th className="col-nombre"><div className="th-text">Nombre<br />Apellido</div></th>
              <th className="col-email"><div className="th-text">Email</div></th>
              <th className="col-estado-activo"><div className="th-text">Estado</div></th>
              <th className="col-plan"><div className="th-text">Curso/<br />Plan</div></th>
              <th className="col-estado-inscripcion"><div className="th-text">Estado<br />Inscripción</div></th>
              <th className="col-fecha"><div className="th-text">Fecha<br />inscripción</div></th>
              <th className="col-acciones"><div className="th-text">Acciones</div></th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan="10" className="sin-resultados">
                  <div className="mensaje-sin-resultados">
                    <div className="icono-sin-resultados">📝</div>
                    <h3>No se encontraron registros</h3>
                    <p>No hay estudiantes que coincidan con los filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {lista.map((estudiante, index) => (
                  <tr key={estudiante.id || `est-${index}`} className={`fila-estudiante ${index % 2 === 0 ? 'par' : 'impar'}`}>
                    <td className="col-id" data-label="ID">
                      <span className="id-badge">{estudiante.id}</span>
                    </td>
                    <td className="col-dni" data-label="DNI">
                      <strong>{estudiante.dni}</strong>
                    </td>
                    <td className="col-nombre" data-label="Nombre Completo">
                      <div className="nombre-completo">
                        <span className="nombre">{estudiante.nombre}</span>
                        <span className="apellido">{estudiante.apellido}</span>
                      </div>
                    </td>
                    <td className="col-email" data-label="Email">
                      <span className="email-estudiante" title={estudiante.email || 'Sin email registrado'}>
                        {estudiante.email ? (
                          <a href={`mailto:${estudiante.email}`} className="link-email">
                            {estudiante.email}
                          </a>
                        ) : (
                          <span className="sin-email">Sin email</span>
                        )}
                      </span>
                    </td>
                    <td className="col-estado-activo" data-label="Estado">
                      <span className={`badge-estado ${estudiante.activo ? 'activo' : 'inactivo'}`}>
                        {estudiante.activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td className="col-plan" data-label="Curso/Plan">
                      <span className="plan-info">
                        {estudiante.cursoPlan || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="col-estado-inscripcion" data-label="Estado Inscripción">
                      <span className={`badge-inscripcion estado-${(estudiante.estadoInscripcion || '').toLowerCase().replace(/\s+/g, '-')}`}>
                        {estudiante.estadoInscripcion || 'Sin estado'}
                      </span>
                    </td>
                    <td className="col-fecha" data-label="Fecha Inscripción">
                      <span className="fecha-inscripcion">
                        {typeof formatearFecha === 'function' ? formatearFecha(estudiante.fechaInscripcion) : (estudiante.fechaInscripcion || '')}
                      </span>
                    </td>
                    <td className="col-acciones">
                      <div className="acciones-contenedor">
                        {/* Notificar (color según estado activo/inactivo) */}
                        <div className="accion-notificar-wrap">
                          <BotonCargando
                            loading={!!enviandoMap[estudiante.id]}
                            className={`btn-accion btn-accion-notificar ${estudiante.activo ? 'normal' : 'inactivo'}`}
                            onClick={() => typeof onPreviewNotificacion === 'function' && onPreviewNotificacion({ ...estudiante, documentos: estudiante.documentos || [] })}
                            aria-label="Notificar"
                            data-tooltip="Notificar"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.19 14,4.29 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
                            </svg>

                          </BotonCargando>
                        </div>

                        {/* Emitir comprobante para activos */}
                        {estudiante.activo ? (
                          <button
                            className="btn-accion btn-accion-comprobante"
                            onClick={async () => {
                              // Traer datos completos del estudiante antes de generar el comprobante
                              try {
                                const resp = await serviceListaEstudiantes.getEstudiantePorDNI(estudiante.dni);
                                // El backend puede devolver { estudiante, inscripcion, documentacion, ... }
                                let estudianteCompleto = { ...estudiante };
                                if (resp && resp.success && resp.estudiante) {
                                  estudianteCompleto = {
                                    ...resp.estudiante,
                                    ...resp.inscripcion,
                                    documentacion: resp.documentacion || resp.estudiante.documentacion || [],
                                    modulo: resp.inscripcion?.modulo || resp.estudiante.modulo || '',
                                    planAnio: resp.inscripcion?.planAnio || resp.estudiante.planAnio || '',
                                    cursoPlan: resp.inscripcion?.cursoPlan || resp.estudiante.cursoPlan || '',
                                    estadoInscripcion: resp.inscripcion?.estadoInscripcion || resp.estudiante.estadoInscripcion || '',
                                  };
                                }
                                ComprobanteGenerator.generar(estudianteCompleto);
                              } catch {
                                alert('No se pudo obtener la información completa del estudiante para el comprobante.');
                              }
                            }}
                            aria-label="Comprobante"
                            data-tooltip="Comprobante"
                          >
                            <img src={iconPDF} alt="Comprobante" />
                          </button>
                        ) : (
                          /* Botón de Reactivación para inactivos */
                          <button
                            className="btn-accion btn-accion-activar"
                            onClick={() => {
                              typeof onActivarEstudiante === 'function' && onActivarEstudiante(estudiante);
                            }}
                            aria-label="Reactivar Estudiante"
                            data-tooltip="Reactivar Estudiante"
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#28a745' }}>
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                          </button>
                        )}

                        {/* Ver detalles */}
                        <button
                          className="btn-accion btn-accion-ver"
                          onClick={() => typeof onVerEstudiante === 'function' && onVerEstudiante(estudiante)}

                          aria-label="Ver"
                          data-tooltip="Ver"
                        >
                          <img src={iconVer} alt="Ver" />

                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Render placeholder empty rows so the table keeps a fixed height */}
                {(() => {
                  const visible = estudiantes.length;
                  const toFill = Math.max(0, limit - visible);
                  const placeholders = [];
                  for (let i = 0; i < toFill; i++) {
                    placeholders.push(
                      <tr key={`empty-${i}`} className={`fila-estudiante fila-vacia`}>
                        <td className="col-id">&nbsp;</td>
                        <td className="col-dni">&nbsp;</td>
                        <td className="col-nombre">&nbsp;</td>
                        <td className="col-email">&nbsp;</td>
                        <td className="col-estado-activo">&nbsp;</td>

                        <td className="col-plan">&nbsp;</td>
                        <td className="col-estado-inscripcion">&nbsp;</td>
                        <td className="col-fecha">&nbsp;</td>
                        <td className="col-acciones">&nbsp;</td>
                      </tr>
                    );
                  }
                  return placeholders;
                })()}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TablaEstudiantes.propTypes = {
  estudiantes: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  _onEmitirComprobante: PropTypes.func.isRequired,
  onVerEstudiante: PropTypes.func,
  formatearFecha: PropTypes.func.isRequired,
  modoBusqueda: PropTypes.bool,
  onLimpiarBusqueda: PropTypes.func,
  onRecargar: PropTypes.func,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  limit: PropTypes.number,
  onPreviewNotificacion: PropTypes.func,
  onActivarEstudiante: PropTypes.func
};

export default TablaEstudiantes;