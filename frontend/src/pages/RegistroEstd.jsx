import { Form } from 'formik';
import { useState, useMemo } from 'react';
// (Eliminado import duplicado de useEffect)
import CloseButton from '../components/CloseButton';
import VolverButton from '../components/VolverButton';
import ModalidadSelection from '../components/ModalidadSelection';
import FormDocumentacion from '../components/FormDocumentacion';
import VerificadorRegistroPendiente from '../components/VerificadorRegistroPendiente';
import { DatosPersonales } from '../components/DatosPersonales';
import { Domicilio } from '../components/Domicilio';
import PropTypes from 'prop-types';
import '../estilos/estilosInscripcion.css';
import '../estilos/botones.css';
import '../estilos/RegistroEstd.css';
import '../estilos/FormularioMejorado.css';
import EstadoInscripcion from '../components/EstadoInscripcion';
import BotonCargando from '../components/BotonCargando';
import { useContext } from 'react';
import { AlertContext } from '../context/alertContextDefinition';
import BotEncuestaSatisfaccion from '../components/BotEncuestaSatisfaccion';

const RegistroEstd = ({
    previews,
    handleFileChange,
    handleChange,
    handleSubmit,
    submitForm,
    validateForm,
    submitHandler,
    isSubmitting,
    accion,
    values,
    setFieldValue,
    isAdmin,
    isWebUser, // Nuevo prop para usuario web
    onClose,
    onVolver,
    completarRegistro // Nuevo prop para detectar si se está completando un registro
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para controlar el bot de encuestas
    const [showEncuesta, setShowEncuesta] = useState(false);

    // Limpiar archivos/documentos y sessionStorage justo ANTES de abrir el modal de documentación para un registro nuevo
    const handleAbrirModalDocumentacion = () => {
        if ((isWebUser || isAdmin) && accion === 'Registrar') {
            if (typeof setFieldValue === 'function') {
                setFieldValue('archivos', {});
                setFieldValue('previews', {});
            }
            // Limpieza extra: eliminar posibles archivos/previews de la sesión
            sessionStorage.removeItem('datosRegistroWeb');
            sessionStorage.removeItem('datosRegistroPendiente');
            // Limpieza extra: si existen variables globales o en window
            if (window.archivos) window.archivos = {};
            if (window.previews) window.previews = {};
        }
        // Refuerzo: limpiar previews y archivos en el objeto values si existen
        if (values && values.previews) values.previews = {};
        if (values && values.archivos) values.archivos = {};
        setIsModalOpen(false); // Cierra primero por si quedó abierto
        setTimeout(() => setIsModalOpen(true), 0); // Reabre limpio
    };
    // Estado requerido por ModalidadSelection (solo formData)
    const [formData, setFormData] = useState({});
    // Estados para manejo de registros pendientes - No mostrar si se está completando un registro desde URL
    const [showVerificador, setShowVerificador] = useState(!completarRegistro);
    const { showError } = useContext(AlertContext);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Funciones para manejo de registro pendiente
    const handleRegistroCompleto = (registroData) => {
        console.log('🔄 Completando registro pendiente:', registroData);
        setShowVerificador(false);
        // Pre-llenar TODOS los campos del formulario con los datos del registro pendiente/web
        if (registroData) {
            // Datos personales
            setFieldValue('dni', registroData.dni || '');
            setFieldValue('nombre', registroData.nombre || '');
            setFieldValue('apellido', registroData.apellido || '');
            setFieldValue('modalidad', registroData.modalidad || '');
            setFieldValue('modalidadId', registroData.modalidadId || '');
            setFieldValue('tipoDocumento', registroData.tipoDocumento || 'DNI');
            setFieldValue('cuil', registroData.cuil || '');
            setFieldValue('email', registroData.email || '');
            setFieldValue('telefono', registroData.telefono || '');
            setFieldValue('fechaNacimiento', registroData.fechaNacimiento || '');
            setFieldValue('paisEmision', registroData.paisEmision || '');
            // Sexo / género (varios posibles nombres en datos externos)
            setFieldValue('sexo', registroData.sexo || registroData.genero || registroData.gender || '');
            // Domicilio
            setFieldValue('calle', registroData.calle || '');
            setFieldValue('numero', registroData.numero || '');
            setFieldValue('provincia', registroData.provincia || '');
            setFieldValue('localidad', registroData.localidad || '');
            setFieldValue('barrio', registroData.barrio || '');
        }
        // Registro completado silenciosamente, sin mensaje molesto
    };

    const handleSinRegistro = () => {
        console.log('✨ Sin registro pendiente, formulario nuevo');
        setShowVerificador(false);
    };

    // Memoizar el cálculo para evitar re-renders innecesarios
    const showMateriasList = useMemo(() => {
        return values.planAnio !== '' && values.modalidad !== '';
    }, [values.planAnio, values.modalidad]);

    // Función para cerrar el modal de documentación (solo cerrar, no procesar)
    const handleProceedToRegister = () => {
        closeModal(); // Solo cerrar el modal, el registro se hará con el botón "Registrar"
    };

    const customHandleSubmit = async (e) => {
        e.preventDefault();

        if (!values.idEstadoInscripcion) {
            showError('Debe seleccionar un estado de inscripción.');
            return;
        }

        // Antes de enviar, pedimos a Formik que valide el formulario
        // `handleSubmit` que tenemos en props viene de Formik (función que dispara submit)
        // Validar primero y sólo permitir submit cuando no haya errores
        if (typeof validateForm === 'function') {
            const formErrors = await validateForm();
            const hasErrors = formErrors && Object.keys(formErrors).length > 0;
            if (hasErrors) {
                // Mostrar errores en UI para corrección inmediata
                // Mostrar el primer mensaje de error específico si existe (por ejemplo CUIL inválido)
                const firstKey = Object.keys(formErrors)[0];
                const firstMsg = formErrors[firstKey];
                if (firstMsg) {
                    showError(firstMsg);
                } else {
                    showError('Corrige los errores del formulario antes de continuar.');
                }
                return;
            }
        }

        // Si no hay errores, delegar en Formik para que invoque el onSubmit definido en el padre
        if (typeof submitForm === 'function') {
            console.log('🔄 Ejecutando submitForm...');

            const result = await submitForm();

            console.log('📊 Resultado de submitForm:', result);
            console.log('📊 isWebUser:', isWebUser, 'isAdmin:', isAdmin);

            // Si el registro fue exitoso y es usuario web, mostrar encuesta después de 1 segundo
            if (result && result.success && isWebUser && !isAdmin) {
                console.log('✅ Condiciones cumplidas para mostrar encuesta');
                setTimeout(() => {
                    console.log('🎯 Mostrando encuesta ahora');
                    setShowEncuesta(true);
                }, 1000);
            } else {
                console.log('❌ No se mostró encuesta. result:', result, 'isWebUser:', isWebUser, 'isAdmin:', isAdmin);
            }

            return;
        }

        // Fallback: si no tenemos submitForm (por compatibilidad), intentar llamar handleSubmit
        if (typeof handleSubmit === 'function') {
            console.log('🔄 Ejecutando handleSubmit (fallback)...');

            const result = await handleSubmit(values, {
                setSubmitting: () => { },
                resetForm: () => { }
            }, accion, isAdmin, isWebUser, completarRegistro, values.modalidad, null);

            console.log('📊 Resultado de handleSubmit:', result);

            // Mostrar encuesta para usuarios web después de registro exitoso
            if (result && result.success && isWebUser && !isAdmin) {
                console.log('✅ Condiciones cumplidas para mostrar encuesta (fallback)');
                setTimeout(() => {
                    console.log('🎯 Mostrando encuesta ahora (fallback)');
                    setShowEncuesta(true);
                }, 1000);
            } else {
                console.log('❌ No se mostró encuesta (fallback). result:', result);
            }

            return;
        }

        // Nota: el feedback y las redirecciones las maneja la función onSubmit definida
        // en el padre (GestionEstudiante). Aquí solo nos aseguramos de validar y disparar submit.
    };

    const handleCerrarEncuesta = () => {
        setShowEncuesta(false);
    };

    return (
        <>
            <Form encType="multipart/form-data" onSubmit={customHandleSubmit}>
                {/* Header con título y botones bien organizados */}
                <div className="registro-header-container">
                    <div className="registro-header-row">
                        <div className="registro-nav-left">
                            {onVolver && <VolverButton onClick={onVolver} />}
                        </div>
                        <h2 className="modal-title-registro">
                            {accion === 'Eliminar' ? 'Eliminar Estudiante' : accion === 'Modificar' ? 'Modificar Estudiante' : 'Registro de Estudiante'}
                        </h2>
                        <div className="registro-nav-right">
                            {onClose && <CloseButton onClose={onClose} variant="modal" />}
                        </div>
                    </div>
                </div>

                {/* Verificador de registros pendientes - Solo para nuevos registros */}
                {accion !== 'Eliminar' && accion !== 'Modificar' && showVerificador && (
                    <VerificadorRegistroPendiente
                        dni={values.dni}
                        onRegistroCompleto={handleRegistroCompleto}
                        onSinRegistro={handleSinRegistro}
                    />
                )}

                {/* Mensaje informativo cuando se está completando un registro */}
                {completarRegistro && (
                    <div className="mensaje-registro-pendiente">
                        <h4>🔄 Completando Registro Pendiente</h4>
                        <p>
                            Los datos del registro pendiente han sido cargados automáticamente.
                            Complete la documentación faltante para finalizar la inscripción.
                        </p>
                    </div>
                )}

                <div className="formd">
                    <div className="form-datos">
                        <DatosPersonales />
                    </div>
                    <div className="form-domicilio">
                        <Domicilio esAdmin={isAdmin} />
                    </div>
                    <div className="form-eleccion">
                        <ModalidadSelection
                            modalidad={values.modalidad}
                            modalidadId={values.modalidadId}
                            setFieldValue={setFieldValue}
                            values={values}
                            division={values.idDivision} // Pasar valor de división
                            showMateriasList={showMateriasList}
                            handleChange={handleChange}
                            editMode={{}}
                            formData={formData}
                            setFormData={setFormData}
                            isAdmin={isAdmin}
                            estadoInscripcion={values.idEstadoInscripcion}
                        />
                    </div>
                    <div className="left-container button-stack">
                        <h4>Acciones</h4>
                        <button type="button" className="boton-principal" onClick={handleAbrirModalDocumentacion}>
                            Adjuntar Documentación
                        </button>
                        {accion === "Eliminar" ? (
                            <button
                                type="button"
                                className="boton-principal"
                                onClick={async () => {
                                    // Para eliminación usamos el submitHandler si está disponible
                                    if (typeof submitHandler === 'function') {
                                        await submitHandler(values, { setSubmitting: () => { } }, accion, isAdmin, isWebUser, null, values.modalidad);
                                    } else if (typeof handleSubmit === 'function') {
                                        // Fallback (antiguo) - puede no funcionar si handleSubmit es Formik's handleSubmit
                                        await handleSubmit(values, { setSubmitting: () => { } }); // Llama a la función de eliminación
                                    } else {
                                        showError('No se encontró el manejador de eliminación');
                                    }
                                }}
                            >
                                Confirmar eliminación
                            </button>
                        ) : isSubmitting ? (
                            <BotonCargando loading={true}>{accion || "Registrando..."}</BotonCargando>
                        ) : (
                            <button type="submit" className="boton-principal">{accion || "Registrar"}</button>
                        )}
                        {/* Solo mostrar EstadoInscripcion para admins y NO para usuarios web */}
                        {isAdmin && !isWebUser && (
                            <EstadoInscripcion
                                value={values.idEstadoInscripcion}
                                handleChange={e => setFieldValue('idEstadoInscripcion', e.target.value)}
                            />
                        )}
                    </div>
                    {isModalOpen && (
                        <FormDocumentacion
                            onClose={closeModal}
                            previews={previews}
                            handleFileChange={(e, field) => handleFileChange(e, field, setFieldValue)}
                            setFieldValue={setFieldValue}
                            onProceedToRegister={handleProceedToRegister}
                        />
                    )}
                </div>
            </Form>

            {/* Bot de encuesta de satisfacción - Solo para usuarios web DESPUÉS del registro exitoso */}
            {isWebUser && !isAdmin && showEncuesta && (
                <BotEncuestaSatisfaccion
                    isOpen={showEncuesta}
                    onClose={handleCerrarEncuesta}
                    dniEstudiante={values.dni}
                    modalidad={values.modalidad}
                />
            )}
        </>
    );
};

RegistroEstd.propTypes = {
    previews: PropTypes.object.isRequired,
    handleFileChange: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitForm: PropTypes.func,
    validateForm: PropTypes.func,
    submitHandler: PropTypes.func,
    values: PropTypes.object.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    accion: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
    isWebUser: PropTypes.bool, // Indicar si es usuario web
    isSubmitting: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onVolver: PropTypes.func,
    completarRegistro: PropTypes.string, // DNI del registro a completar
};

export default RegistroEstd;