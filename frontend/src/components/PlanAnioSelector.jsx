import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../estilos/estilosDocumentacion.css';
import AlertaMens from './AlertaMens';
import Input from './Input';
import service from '../services/serviceObtenerAcad'; // Asegúrate de que la ruta es correcta
import AreaEstudioSelector from './AreaEstudioSelector';

const PlanAnioSelector = ({ modalidad, handleChange, value, modalidadId, setFieldValue, division, isAdmin, estadoInscripcion }) => {
    const [alerta, setAlerta] = useState(false);
    const [idModulo, setIdModulo] = useState('');
    const [modulos, setModulos] = useState([]); // Aquí almacenamos los módulos
    const [divisiones, setDivisiones] = useState([]); // Estada para divisiones
    const [loadingDivisiones, setLoadingDivisiones] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [moduloInicialEstablecido, setModuloInicialEstablecido] = useState(false);

    const handleSelection = (event) => {
        const newValue = event.target.value;
        console.log('[DEBUG] Seleccionado en PlanAnioSelector:', newValue);
        setFieldValue('planAnio', newValue || ''); // Siempre string
        if (typeof handleChange === 'function') {
            handleChange(event);
        }
        setAlerta(newValue === "");

        // Solo resetear módulo si NO estamos en modo de registro pendiente
        const datosRegistroPendiente = sessionStorage.getItem('datosRegistroPendiente');
        if (!datosRegistroPendiente) {
            console.log('🔄 [PLAN CHANGE] Reseteando módulo (no es registro pendiente)');
            setIdModulo('');
            setFieldValue('modulos', '');
        } else {
            console.log('🔒 [PLAN CHANGE] Manteniendo módulo (es registro pendiente)');
        }
    };

    const handleModuloChange = (event) => {
        setIdModulo(event.target.value);
        setFieldValue('modulos', event.target.value);
        // Actualiza el campo "modulos" en Formik
        if (typeof setFieldValue === 'function') {
            setFieldValue('modulos', event.target.value);
        }
    };

    // Efecto para obtener los módulos cuando la modalidad cambia
    useEffect(() => {
        const isSemipresencial = modalidad && String(modalidad).trim().toUpperCase() === 'SEMIPRESENCIAL';
        if (!isSemipresencial && modalidadId !== 2) return;
        // Si value es un objeto (Formik), extraer el id numérico
        let planId = value;
        if (value && typeof value === 'object') {
            planId = value.planAnio || value.planAnioId || '';
        }
        if (!planId) return;
        const fetchModulos = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await service.getModulos(planId);
                if (response && Array.isArray(response)) {
                    setModulos(response);
                } else if (response.data && Array.isArray(response.data)) {
                    setModulos(response.data);
                } else {
                    setError('La respuesta no es un array de módulos');
                }
            } catch (error) {
                console.error("Error en la carga de módulos:", error);
                setError('Error al cargar los módulos');
            } finally {
                setLoading(false);
            }
        };
        fetchModulos();
    }, [modalidadId, modalidad, value]);

    // Efecto para obtener divisiones si es Presencial
    useEffect(() => {
        const isPresencial = modalidad && String(modalidad).trim().toUpperCase() === 'PRESENCIAL';
        if (!isPresencial) {
            setDivisiones([]);
            return;
        }

        let planId = value;
        if (value && typeof value === 'object') {
            planId = value.planAnio || value.planAnioId || '';
        }

        if (!planId) {
            setDivisiones([]);
            return;
        }

        const fetchDivisiones = async () => {
            setLoadingDivisiones(true);
            try {
                const response = await service.getDivisiones(planId);
                // Si la respuesta es un array, asignarla. Si tiene error, ignorar o loguear.
                if (response && Array.isArray(response)) {
                    setDivisiones(response);
                } else {
                    console.error("Respuesta inválida de divisiones:", response);
                    setDivisiones([]);
                }
            } catch (err) {
                console.error("Error cargando divisiones:", err);
            } finally {
                setLoadingDivisiones(false);
            }
        };
        fetchDivisiones();
    }, [modalidad, value]);

    // Efecto para establecer módulo inicial desde registro pendiente
    useEffect(() => {
        // Solo ejecutar si no se ha establecido ya el módulo inicial y tenemos módulos cargados
        if (moduloInicialEstablecido || modulos.length === 0) {
            return;
        }

        // Buscar si hay un idModulo desde sessionStorage (registro pendiente)
        const datosRegistroPendiente = sessionStorage.getItem('datosRegistroPendiente');

        if (datosRegistroPendiente) {
            try {
                const datos = JSON.parse(datosRegistroPendiente);
                console.log('📋 Datos desde sessionStorage para módulo:', datos);

                if (datos.idModulo && Array.isArray(datos.idModulo)) {
                    // idModulo viene como array ["1", ""], tomar el primer elemento válido
                    const moduloId = datos.idModulo.find(id => id && id !== '' && id !== null);
                    console.log('🎯 ModuloId encontrado:', moduloId, 'de array:', datos.idModulo);

                    if (moduloId) {
                        // Verificar que el módulo existe en la lista de módulos disponibles
                        const moduloExiste = modulos.find(mod => mod.id.toString() === moduloId.toString());
                        if (moduloExiste) {
                            console.log('🎓 Estableciendo módulo desde registro pendiente:', moduloId, '- Módulo:', moduloExiste.modulo);
                            setIdModulo(moduloId);
                            setFieldValue('modulos', moduloId);
                            setFieldValue('idModulo', datos.idModulo); // Mantener array original también
                            setModuloInicialEstablecido(true); // Marcar como establecido
                            console.log('✅ [INIT MÓDULO] Estado actualizado - idModulo local:', moduloId, 'formik modulos:', moduloId);
                        } else {
                            console.warn('⚠️ Módulo no encontrado en lista disponible:', moduloId);
                            console.log('📋 Módulos disponibles:', modulos);
                        }
                    }
                } else if (datos.modulos && datos.modulos !== '') {
                    // Fallback: usar el campo modulos si existe
                    console.log('🔄 Usando campo modulos como fallback:', datos.modulos);
                    setIdModulo(datos.modulos);
                    setFieldValue('modulos', datos.modulos);
                    setModuloInicialEstablecido(true);
                }
            } catch (error) {
                console.error('Error al procesar idModulo desde registro pendiente:', error);
            }
        }
    }, [modulos, setFieldValue, idModulo, moduloInicialEstablecido]);

    // Helper para verificar modalidad insensible a mayúsculas
    const isPresencial = modalidad && String(modalidad).trim().toUpperCase() === 'PRESENCIAL';
    const isSemipresencial = modalidad && String(modalidad).trim().toUpperCase() === 'SEMIPRESENCIAL';

    return (
        <div>
            {isPresencial && (
                <div className="form-group">
                    <Input
                        className="selectPlanAnio"
                        label="Año"
                        name="planAnio"
                        type="select"
                        options={[
                            { value: '', label: 'Seleccionar Año' },
                            { value: 1, label: '1er Año' },
                            { value: 2, label: '2do Año' },
                            { value: 3, label: '3er Año' },
                        ]}
                        registro={{
                            value: (typeof value === 'object' ? value.planAnio : value) || '',
                            onChange: handleSelection
                        }}
                        error={alerta && <AlertaMens text="Por favor, selecciona un año." variant="error" />}
                    />
                </div>
            )}
            {/* Selector de División para Presencial - Solo visible para Admin */}
            {isPresencial && value && isAdmin && (
                <div className="form-group">
                    <label htmlFor="division"><strong>División:</strong></label>
                    {loadingDivisiones ? (
                        <p>Cargando divisiones...</p>
                    ) : (
                        <select
                            className="selectPlanAnio"
                            name="idDivision"
                            id="division"
                            value={division || ''}
                            onChange={(e) => setFieldValue('idDivision', e.target.value)}
                        >
                            <option value="">Seleccionar División</option>
                            {divisiones.map((div) => (
                                <option key={div.id} value={div.id}>
                                    {div.division}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}
            {isSemipresencial && (
                <div className="form-group">
                    <Input
                        className="selectPlanAnio"
                        label="Plan"
                        name="planAnio"
                        type="select"
                        options={[
                            { value: '', label: 'Seleccionar Plan' },
                            { value: 4, label: 'Plan A' },
                            { value: 5, label: 'Plan B' },
                            { value: 6, label: 'Plan C' },
                        ]}
                        registro={{
                            value: (typeof value === 'object' ? value.planAnio : value) || '',
                            onChange: handleSelection
                        }}
                        error={alerta && <AlertaMens text="Por favor, selecciona un plan." variant="error" />}
                    />
                </div>
            )}
            {modalidadId === 2 && value && (
                <div className="form-group">
                    <label htmlFor="modulo"><strong>📚 Módulo:</strong></label>
                    {loading ? (
                        <p>Cargando módulos...</p> // Muestra un mensaje mientras carga
                    ) : error ? (
                        <p>{error}</p> // Muestra un mensaje de error si ocurre un problema
                    ) : (

                        <select
                            className="selectPlanAnio"
                            name="modulos"
                            id="modulo"
                            value={idModulo}
                            onChange={e => {
                                setFieldValue('modulos', e.target.value);
                                setIdModulo(e.target.value);
                            }}
                        >
                            <option value="">Seleccionar Módulo</option>
                            {modulos && Array.isArray(modulos) && modulos.length > 0 ? (
                                modulos.map((modulo) => (
                                    <option key={modulo.id} value={modulo.id}>
                                        {modulo.modulo}
                                    </option>
                                ))
                            ) : (
                                <option value="">No hay módulos disponibles</option>
                            )}
                        </select>

                    )}
                </div>

            )}
            {idModulo && (() => {
                // No mostrar AreaEstudioSelector si estamos completando un registro pendiente
                const esRegistroPendiente = sessionStorage.getItem('datosRegistroPendiente');
                if (esRegistroPendiente) {
                    console.log('🚫 Ocultando AreaEstudioSelector porque es registro pendiente');
                    return null;
                }

                console.log('✅ Mostrando AreaEstudioSelector para nuevo registro');
                return (
                    <AreaEstudioSelector
                        idModulo={idModulo}
                        modalidadId={modalidadId}
                        handleAreaEstudioChange={handleModuloChange}
                        value={value.planAnio}
                    />
                );
            })()}
        </div>
    );
};

PlanAnioSelector.propTypes = {
    modalidad: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.number
    ]).isRequired,
    modalidadId: PropTypes.number.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool,
    estadoInscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PlanAnioSelector;