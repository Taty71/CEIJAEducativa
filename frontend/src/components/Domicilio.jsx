import { Field, ErrorMessage, useFormikContext } from 'formik';
import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import FormatError from '../utils/MensajeError';
import SpinnerCeiJa from './SpinnerCeiJa';
import ubicacionesService from '../services/ubicacionesService';
import '../estilos/ModalAgregarBarrio.css';
import axios from 'axios';
import { AlertContext } from '../context/alertContextDefinition';

export const Domicilio = ({ esAdmin = false }) => {
    const { values, setFieldValue } = useFormikContext();
    const { showSuccess, showError } = useContext(AlertContext);

    // Estados para selects dinámicos
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [barrios, setBarrios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModalBarrio, setShowModalBarrio] = useState(false);
    const [nuevoBarrio, setNuevoBarrio] = useState('');
    const [guardandoBarrio, setGuardandoBarrio] = useState(false);
    // Estados para nueva localidad
    const [showModalLocalidad, setShowModalLocalidad] = useState(false);
    const [nuevaLocalidad, setNuevaLocalidad] = useState('');
    const [guardandoLocalidad, setGuardandoLocalidad] = useState(false);

    // Cargar provincias al montar el componente
    useEffect(() => {
        const cargarProvincias = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await ubicacionesService.getProvincias();
                setProvincias(data);
            } catch (error) {
                setError('Error cargando provincias');
                console.error('🚨 Error al cargar provincias:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProvincias();
    }, []); // Dependencias vacías para cargar solo al montar

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
    }, [values.provincia]);

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
    }, [values.localidad]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFieldValue(name, value);
        // Limpiar dependientes
        if (name === 'provincia') {
            setFieldValue('localidad', '');
            setFieldValue('barrio', '');
        } else if (name === 'localidad') {
            setFieldValue('barrio', '');
        }
    };

    const handleAddNew = (tipo) => {
        if (tipo === 'barrio') {
            if (!values.localidad) {
                showError('Primero debe seleccionar una localidad');
                return;
            }
            setShowModalBarrio(true);
            setNuevoBarrio('');
        } else if (tipo === 'localidad') {
            if (!values.provincia) {
                showError('Primero debe seleccionar una provincia');
                return;
            }
            setShowModalLocalidad(true);
            setNuevaLocalidad('');
        } else {
            console.log(`➕ [ADMIN] Agregar nueva ${tipo}`);
            showError(`Funcionalidad "Agregar ${tipo}" en desarrollo`);
        }
    };

    // Función para guardar nuevo barrio
    const guardarNuevoBarrio = async () => {
        if (!nuevoBarrio.trim()) {
            showError('Por favor ingrese un nombre para el barrio');
            return;
        }

        if (!values.localidad) {
            showError('Error: No hay localidad seleccionada');
            return;
        }

        try {
            setGuardandoBarrio(true);
            console.log('💾 Guardando nuevo barrio:', {
                nombre: nuevoBarrio.trim(),
                idLocalidad: values.localidad
            });

            let nuevo;
            // FIX: Verificamos si el método existe en el servicio, si no, usamos axios directo
            if (ubicacionesService.crearBarrio && typeof ubicacionesService.crearBarrio === 'function') {
                nuevo = await ubicacionesService.crearBarrio(nuevoBarrio.trim(), values.localidad);
            } else {
                // Fallback: llamada directa a la API con axios
                const response = await axios.post('http://localhost:5000/api/ubicaciones/barrios', {
                    nombre: nuevoBarrio.trim(),
                    idLocalidad: values.localidad
                });
                nuevo = response.data.barrio || response.data;
            }

            // Recargar la lista de barrios
            const dataBarrios = await ubicacionesService.getBarriosByLocalidad(values.localidad);
            setBarrios(dataBarrios);

            // Seleccionar automáticamente el barrio recién creado
            setFieldValue('barrio', nuevo.id);

            console.log('✅ Barrio creado exitosamente:', nuevo);
            showSuccess(`Barrio "${nuevoBarrio}" creado exitosamente`);

            setShowModalBarrio(false);
            setNuevoBarrio('');
        } catch (error) {
            console.error('❌ Error al crear barrio:', error);
            showError(`Error al crear barrio: ${FormatError(error)}`);
        } finally {
            setGuardandoBarrio(false);
        }
    };

    // Función para guardar nueva localidad
    const guardarNuevaLocalidad = async () => {
        if (!nuevaLocalidad.trim()) {
            showError('Por favor ingrese un nombre para la localidad');
            return;
        }

        if (!values.provincia) {
            showError('Error: No hay provincia seleccionada');
            return;
        }

        try {
            setGuardandoLocalidad(true);
            console.log('💾 Guardando nueva localidad:', {
                nombre: nuevaLocalidad.trim(),
                idProvincia: values.provincia
            });

            let nueva;
            // FIX: Verificamos si el método existe en el servicio, si no, usamos axios directo
            if (ubicacionesService.crearLocalidad && typeof ubicacionesService.crearLocalidad === 'function') {
                nueva = await ubicacionesService.crearLocalidad(nuevaLocalidad.trim(), values.provincia);
            } else {
                // Fallback: llamada directa a la API con axios
                const response = await axios.post('http://localhost:5000/api/ubicaciones/localidades', {
                    nombre: nuevaLocalidad.trim(),
                    idProvincia: values.provincia
                });
                nueva = response.data.localidad || response.data;
            }

            // Recargar la lista de localidades
            const dataLocalidades = await ubicacionesService.getLocalidadesByProvincia(values.provincia);
            setLocalidades(dataLocalidades);

            // Seleccionar automáticamente la localidad recién creada
            setFieldValue('localidad', nueva.id);
            // Limpiar barrio ya que cambió la localidad (aunque sea nueva)
            setFieldValue('barrio', '');
            setBarrios([]);

            console.log('✅ Localidad creada exitosamente:', nueva);
            showSuccess(`Localidad "${nuevaLocalidad}" creada exitosamente`);

            setShowModalLocalidad(false);
            setNuevaLocalidad('');
        } catch (error) {
            console.error('❌ Error al crear localidad:', error);
            showError(`Error al crear localidad: ${FormatError(error)}`);
        } finally {
            setGuardandoLocalidad(false);
        }
    };

    // Estilos en línea para sobrescribir el CSS verde y usar variables del sistema
    const modalBtnCrearStyle = {
        backgroundColor: 'var(--color-acento)',
        color: 'white',
        border: 'none'
    };

    const modalBtnCancelarStyle = {
        backgroundColor: '#e0e0e0',
        color: 'var(--color-texto-principal)',
        border: '1px solid var(--color-borde)'
    };

    const modalHeaderStyle = {
        color: 'var(--color-acento)',
        borderBottom: '2px solid var(--color-acento-claro)'
    };

    return (
        <div className="form-domicilio">
            <h3>
                Domicilio {esAdmin ? '(Administrador)' : ' '}
                {loading && <span style={{ color: 'var(--color-acento)', marginLeft: '10px' }}>⏳</span>}
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
                <Field type="text" name="numero" placeholder="Número o S/N" className="form-control" />
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
                                style={{ backgroundColor: 'var(--color-acento)' }}
                            >
                                ➕
                            </button>
                        )}
                    </div>
                    <ErrorMessage name="provincia" component="div" className="error" />
                    <small style={{ color: 'var(--color-texto-secundario)' }}>
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
                                style={{ backgroundColor: 'var(--color-acento)' }}
                            >
                                ➕
                            </button>
                        )}
                    </div>
                    <ErrorMessage name="localidad" component="div" className="error" />
                    <small style={{ color: 'var(--color-texto-secundario)' }}>
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
                            style={{ backgroundColor: 'var(--color-acento)' }}
                        >
                            ➕
                        </button>
                    )}
                </div>
                <ErrorMessage name="barrio" component="div" className="error" />
                <small style={{ color: 'var(--color-texto-secundario)' }}>
                    {barrios.length} barrios disponibles
                </small>
            </div>

            {/* Modal para agregar nuevo barrio */}
            {showModalBarrio && (
                <div className="modal-agregar-barrio-overlay">
                    <div className="modal-agregar-barrio-container">
                        <h3 className="modal-agregar-barrio-titulo" style={modalHeaderStyle}>
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
                                className="modal-agregar-barrio-btn"
                                style={modalBtnCancelarStyle}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={guardarNuevoBarrio}
                                disabled={guardandoBarrio || !nuevoBarrio.trim()}
                                className="modal-agregar-barrio-btn"
                                style={modalBtnCrearStyle}
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

            {/* Modal para agregar nueva localidad */}
            {showModalLocalidad && (
                <div className="modal-agregar-barrio-overlay">
                    <div className="modal-agregar-barrio-container">
                        <h3 className="modal-agregar-barrio-titulo" style={modalHeaderStyle}>
                            🏙️ Agregar Nueva Localidad
                        </h3>

                        <div className="modal-agregar-barrio-grupo">
                            <label className="modal-agregar-barrio-label">
                                Nombre de la localidad:
                            </label>
                            <input
                                type="text"
                                value={nuevaLocalidad}
                                onChange={(e) => setNuevaLocalidad(e.target.value)}
                                placeholder="Ej: La Calera, Saldán, Villa Allende..."
                                className="modal-agregar-barrio-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        guardarNuevaLocalidad();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="modal-agregar-barrio-botones">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModalLocalidad(false);
                                    setNuevaLocalidad('');
                                }}
                                disabled={guardandoLocalidad}
                                className="modal-agregar-barrio-btn"
                                style={modalBtnCancelarStyle}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={guardarNuevaLocalidad}
                                disabled={guardandoLocalidad || !nuevaLocalidad.trim()}
                                className="modal-agregar-barrio-btn"
                                style={modalBtnCrearStyle}
                            >
                                {guardandoLocalidad ? (
                                    <>
                                        <SpinnerCeiJa size={12} text="" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                                        Guardando...
                                    </>
                                ) : (
                                    <>✅ Crear Localidad</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

Domicilio.propTypes = {
    esAdmin: PropTypes.bool
};