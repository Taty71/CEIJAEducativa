import { Field, ErrorMessage, useFormikContext } from 'formik';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AlertaMens from './AlertaMens';
import FormatError from '../utils/MensajeError';
import SpinnerCeiJa from './SpinnerCeiJa';
import ubicacionesService from '../services/ubicacionesService';
import '../estilos/ModalAgregarBarrio.css';

export const Domicilio = ({ esAdmin = false }) => {
    const { values, setFieldValue } = useFormikContext();
    
    // Estados para selects dinámicos
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [barrios, setBarrios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModalBarrio, setShowModalBarrio] = useState(false);
    const [nuevoBarrio, setNuevoBarrio] = useState('');
    const [guardandoBarrio, setGuardandoBarrio] = useState(false);
    const [alerta, setAlerta] = useState({ text: '', variant: '' });

    // Cargar provincias al montar el componente
    useEffect(() => {
        const cargarProvincias = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await ubicacionesService.getProvincias();
                setProvincias(data);

                // Si hay una provincia preseleccionada, cargar localidades
                if (values.provincia) {
                    setFieldValue('localidad', '');
                    setFieldValue('barrio', '');
                }
            } catch (error) {
                setError('Error cargando provincias');
                console.error('🚨 Error al cargar provincias:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProvincias();
    }, [values.provincia, setFieldValue]);

    // Cargar localidades cuando cambia la provincia
    useEffect(() => {
        const cargarLocalidades = async () => {
            if (!values.provincia) {
                setLocalidades([]);
                return;
            }

            try {
                setLoading(true);
                const data = await ubicacionesService.getLocalidadesByProvincia(values.provincia);
                setLocalidades(data);
            } catch (error) {
                setError('Error cargando localidades');
                console.error('🚨 Error al cargar localidades:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarLocalidades();
        setFieldValue('localidad', '');
        setFieldValue('barrio', '');
    }, [values.provincia, setFieldValue]);

    // Cargar barrios cuando cambia la localidad
    useEffect(() => {
        const cargarBarrios = async () => {
            if (!values.localidad) {
                setBarrios([]);
                return;
            }

            try {
                setLoading(true);
                const data = await ubicacionesService.getBarriosByLocalidad(values.localidad);
                setBarrios(data);
            } catch (error) {
                setError('Error cargando barrios');
                console.error('🚨 Error al cargar barrios:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarBarrios();
        setFieldValue('barrio', '');
    }, [values.localidad, setFieldValue]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFieldValue(name, value);
    };

    const handleAddNew = (tipo) => {
        if (tipo === 'barrio') {
            if (!values.localidad) {
                setAlerta({ text: 'Primero debe seleccionar una localidad', variant: 'error' });
                return;
            }
            setShowModalBarrio(true);
            setNuevoBarrio('');
        } else {
            // TODO: Implementar modales para agregar provincia y localidad
            console.log(`➕ [ADMIN] Agregar nueva ${tipo}`);
            setAlerta({ text: `Funcionalidad "Agregar ${tipo}" en desarrollo`, variant: 'info' });
        }
    };

    // Función para guardar nuevo barrio
    const guardarNuevoBarrio = async () => {
        if (!nuevoBarrio.trim()) {
            setAlerta({ text: 'Por favor ingrese un nombre para el barrio', variant: 'error' });
            return;
        }

        if (!values.localidad) {
            setAlerta({ text: 'Error: No hay localidad seleccionada', variant: 'error' });
            return;
        }

        try {
            setGuardandoBarrio(true);
            console.log('💾 Guardando nuevo barrio:', {
                nombre: nuevoBarrio.trim(),
                idLocalidad: values.localidad
            });

            const nuevo = await ubicacionesService.crearBarrio(nuevoBarrio.trim(), values.localidad);

            // Recargar la lista de barrios
            const dataBarrios = await ubicacionesService.getBarriosByLocalidad(values.localidad);
            setBarrios(dataBarrios);

            // Seleccionar automáticamente el barrio recién creado
            setFieldValue('barrio', nuevo.id);

            console.log('✅ Barrio creado exitosamente:', nuevo);
            setAlerta({ text: `Barrio "${nuevoBarrio}" creado exitosamente`, variant: 'success' });
            
            setShowModalBarrio(false);
            setNuevoBarrio('');
        } catch (error) {
            console.error('❌ Error al crear barrio:', error);
            setAlerta({ text: `Error al crear barrio: ${FormatError(error)}`, variant: 'error' });
        } finally {
            setGuardandoBarrio(false);
        }
    };

    return (
        <div className="form-domicilio">
            <h3>
                Domicilio {esAdmin ? '(Administrador)' : ' '}
                {loading && <span style={{ color: 'blue', marginLeft: '10px' }}>⏳</span>}
            </h3>
            
            {error && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '14px'
                }}>
                    ❌ {error}
                </div>
            )}

            <div className="form-group">
                <label>Calle:</label>
                <Field type="text" name="calle" placeholder="Calle" className="form-control" />
                <ErrorMessage name="calle" component="div" className="error" />
            </div>
            
            <div className="form-group">
                <label>Número:</label>
                <Field type="number" name="numero" placeholder="Número" className="form-control" />
                <ErrorMessage name="numero" component="div" className="error" />
            </div>
            
            <div className="localprovincia">
                <div className="form-group">
                    <label>Provincia:</label>
                    <div className="domicilio-input-con-boton">
                        <select
                            name="provincia"
                            value={values.provincia || ''}
                            onChange={handleSelectChange}
                            className="form-control domicilio-select-flex"
                            disabled={loading}
                        >
                            <option value="">Seleccione Provincia</option>
                            {provincias.map(provincia => (
                                <option key={provincia.id} value={provincia.id}>
                                    {provincia.nombre}
                                </option>
                            ))}
                        </select>
                        {esAdmin && (
                            <button
                                type="button"
                                onClick={() => handleAddNew('provincia')}
                                className="btn-add-location btn-add-provincia"
                                title="Agregar nueva provincia"
                            >
                                ➕
                            </button>
                        )}
                    </div>
                    <ErrorMessage name="provincia" component="div" className="error" />
                    <small style={{ color: 'gray' }}>
                        {provincias.length} provincias disponibles
                    </small>
                </div>
                
                <div className="form-group">
                    <label>Localidad:</label>
                    <div className="domicilio-input-con-boton">
                        <select
                            name="localidad"
                            value={values.localidad || ''}
                            onChange={handleSelectChange}
                            className="form-control domicilio-select-flex"
                            disabled={!values.provincia || loading}
                        >
                            <option value="">
                                {!values.provincia ? 'Primero seleccione provincia' : 'Seleccione Localidad'}
                            </option>
                            {localidades.map(localidad => (
                                <option key={localidad.id} value={localidad.id}>
                                    {localidad.nombre}
                                </option>
                            ))}
                        </select>
                        {esAdmin && values.provincia && (
                            <button
                                type="button"
                                onClick={() => handleAddNew('localidad')}
                                className="btn-add-location btn-add-localidad"
                                title="Agregar nueva localidad"
                            >
                                ➕
                            </button>
                        )}
                    </div>
                    <ErrorMessage name="localidad" component="div" className="error" />
                    <small style={{ color: 'gray' }}>
                        {localidades.length} localidades disponibles
                    </small>
                </div>
            </div>
            
            <div className="form-group">
                <label>Barrio:</label>
                <div className="domicilio-input-con-boton">
                    <select
                        name="barrio"
                        value={values.barrio || ''}
                        onChange={handleSelectChange}
                        className="form-control domicilio-select-flex"
                        disabled={!values.localidad || loading}
                    >
                        <option value="">
                            {!values.localidad ? 'Primero seleccione localidad' : 'Seleccione Barrio'}
                        </option>
                        {barrios.map(barrio => (
                            <option key={barrio.id} value={barrio.id}>
                                {barrio.nombre}
                            </option>
                        ))}
                    </select>
                    {esAdmin && values.localidad && (
                        <button
                            type="button"
                            onClick={() => handleAddNew('barrio')}
                            className="btn-add-location btn-add-barrio"
                            title="Agregar nuevo barrio"
                        >
                            ➕
                        </button>
                    )}
                </div>
                <ErrorMessage name="barrio" component="div" className="error" />
                <small style={{ color: 'gray' }}>
                    {barrios.length} barrios disponibles
                </small>
            </div>

            {/* Modal para agregar nuevo barrio */}
            {showModalBarrio && (
                <div className="modal-agregar-barrio-overlay">
                    <div className="modal-agregar-barrio-container">
                        <h3 className="modal-agregar-barrio-titulo">
                            🏠 Agregar Nuevo Barrio
                        </h3>
                        
                        <div className="modal-agregar-barrio-grupo">
                            <label className="modal-agregar-barrio-label">
                                Nombre del barrio:
                            </label>
                            <input
                                type="text"
                                value={nuevoBarrio}
                                onChange={(e) => setNuevoBarrio(e.target.value)}
                                placeholder="Ej: Centro, San José, Villa María..."
                                className="modal-agregar-barrio-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        guardarNuevoBarrio();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="modal-agregar-barrio-botones">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModalBarrio(false);
                                    setNuevoBarrio('');
                                }}
                                disabled={guardandoBarrio}
                                className="modal-agregar-barrio-btn modal-agregar-barrio-btn-cancelar"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={guardarNuevoBarrio}
                                disabled={guardandoBarrio || !nuevoBarrio.trim()}
                                className={`modal-agregar-barrio-btn modal-agregar-barrio-btn-crear ${
                                    guardandoBarrio ? 'modal-agregar-barrio-guardando' : ''
                                }`}
                            >
                                {guardandoBarrio ? (
                                    <>
                                        <SpinnerCeiJa size={12} text="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                                        Guardando...
                                    </>
                                ) : (
                                    <>✅ Crear Barrio</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado informativo 
            <div style={{
                background: esAdmin ? '#e8f5e8' : '#e3f2fd',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '10px',
                fontSize: '13px',
                color: esAdmin ? '#2e7d2e' : '#1976d2'
            }}>
                {esAdmin ? (
                    <>✅ <strong>Modo Admin:</strong> Selects dinámicos con botones para agregar ubicaciones</>
                ) : (
                    <>🌐 <strong>Usuario Web:</strong> Selects dinámicos cargados desde base de datos</>
                )}
                <br />
                📊 {provincias.length} provincias, {localidades.length} localidades, {barrios.length} barrios
            </div>*/}

            {/* Alertas */}
            {alerta.text && (
                <AlertaMens 
                    text={alerta.text} 
                    variant={alerta.variant}
                    onClose={() => setAlerta({ text: '', variant: '' })}
                />
            )}
        </div>
    );
};

Domicilio.propTypes = {
    esAdmin: PropTypes.bool
};