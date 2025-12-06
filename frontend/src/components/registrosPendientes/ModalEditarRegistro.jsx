import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import registrosPendientesService from '../../services/serviceRegistrosPendientes';
import { obtenerDocumentosRequeridos } from '../../utils/registroSinDocumentacion';
import { useAlerts } from '../../hooks/useAlerts';
import useGestionDocumentacion from '../../hooks/useGestionDocumentacion';

// Importar componentes y estilos del formulario de registro
import CloseButton from '../CloseButton';
import { DatosPersonales } from '../DatosPersonales';
import { Domicilio } from '../Domicilio';
import ModalidadSelection from '../ModalidadSelection';
import FormDocumentacion from '../FormDocumentacion';
import EstadoInscripcion from '../EstadoInscripcion';
import BotonCargando from '../BotonCargando';
import AlertaMens from '../AlertaMens';

// Importar estilos del formulario original
import '../../estilos/estilosInscripcion.css';
import '../../estilos/botones.css';
import '../../estilos/RegistroEstd.css';
import '../../estilos/FormularioMejorado.css';
import '../../estilos/ModalEditarRegistroCompleto.css';

const ModalEditarRegistro = ({ registro, onClose, onGuardado, onEliminado }) => {
        const { 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo, 
        confirmAction,
        alerts,
        modal,
        removeAlert,
        closeModal: closeConfirmModal
    } = useAlerts();
    const [guardando, setGuardando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Usar el hook de gestión de documentación
    const {
        previews,
        setPreviews,
        handleFileChange: gestionHandleFileChange
    } = useGestionDocumentacion();

    // Estados iniciales para Formik
    const initialValues = {
        tipoDocumento: 'DNI',
        dni: registro.datos?.dni || registro.dni || '',
        nombre: registro.datos?.nombre || registro.nombre || '',
        apellido: registro.datos?.apellido || registro.apellido || '',
        cuil: registro.datos?.cuil || registro.cuil || '',
        email: registro.datos?.email || registro.email || '',
        telefono: registro.datos?.telefono || registro.telefono || '',
        fechaNacimiento: registro.datos?.fechaNacimiento || registro.fechaNacimiento || '',
        paisEmision: registro.datos?.paisEmision || registro.paisEmision || '',
        calle: registro.datos?.calle || registro.calle || '',
        numero: registro.datos?.numero || registro.numero || '',
        barrio: registro.datos?.barrio || registro.barrio || '',
        localidad: registro.datos?.localidad || registro.localidad || '',
        provincia: registro.datos?.provincia || registro.provincia || '',
        modalidad: registro.datos?.modalidad || registro.modalidad || '',
        modalidadId: (() => {
            const modalidad = registro.datos?.modalidad || registro.modalidad || '';
            const modalidadIdExistente = registro.datos?.modalidadId || registro.modalidadId;
            
            // Si ya existe modalidadId, convertir a número
            if (modalidadIdExistente) {
                return parseInt(modalidadIdExistente, 10);
            }
            
            // Mapear modalidad a ID si no existe
            switch (modalidad) {
                case 'Presencial': return 1;
                case 'Semipresencial': return 2;
                default: return '';
            }
        })(),
        planAnio: registro.datos?.planAnio || registro.planAnio || null,
        modulos: (() => {
            const planAnio = registro.datos?.planAnio || registro.planAnio;
            const modalidad = registro.datos?.modalidad || registro.modalidad;
            const dni = registro.datos?.dni || registro.dni;
            
            console.log('🔍 [INIT] ===== CALCULANDO MODULOS =====', { 
                dni, 
                modalidad, 
                planAnio,
                modulosExistente: registro.datos?.modulos || registro.modulos,
                idModulo: registro.datos?.idModulo,
                registroCompleto: registro
            });
            
            // Si ya tiene modulos explícito y no está vacío, usarlo
            const modulosExistente = registro.datos?.modulos || registro.modulos;
            console.log('🔍 [INIT] Verificando modulosExistente:', `"${modulosExistente}"`, 'length:', modulosExistente?.length, 'tipo:', typeof modulosExistente);
            
            if (modulosExistente && modulosExistente !== '' && modulosExistente !== null && modulosExistente.trim() !== '') {
                console.log('✅ [INIT] Usando modulos existente:', modulosExistente);
                return modulosExistente;
            } else {
                console.log('❌ [INIT] modulosExistente está vacío o nulo, continuando con idModulo array');
            }
            
            // Si tiene idModulo array, usar el primer elemento válido
            const idModuloArray = registro.datos?.idModulo;
            console.log('🔍 [INIT] Verificando idModulo array:', idModuloArray, 'isArray:', Array.isArray(idModuloArray));
            
            if (idModuloArray && Array.isArray(idModuloArray)) {
                console.log('🔍 [INIT] Elementos del array idModulo:', idModuloArray.map((id, i) => `[${i}]: "${id}" (${typeof id})`));
                
                const moduloValido = idModuloArray.find(id => id && id !== '' && id !== null);
                if (moduloValido) {
                    console.log('✅ [INIT] ¡ÉXITO! Usando idModulo válido:', moduloValido, 'de array:', idModuloArray);
                    return moduloValido;
                } else {
                    console.log('❌ [INIT] No se encontró módulo válido en array:', idModuloArray);
                }
            } else {
                console.log('❌ [INIT] idModulo no es array o no existe:', idModuloArray);
            }
            
            // Para Semipresencial, verificar si necesitamos hacer algo especial
            if (modalidad === 'Semipresencial' && planAnio) {
                console.log('⚠️ [INIT] Modalidad Semipresencial detectada - módulo debe ser específico');
                console.log('🔍 [INIT] PlanAnio:', planAnio, 'debería tener módulos disponibles 6,7,8,9 para Plan C');
            }
            
            console.log('❌ [INIT] ===== NO SE PUDO DETERMINAR MODULOS =====');
            return null;
        })(),
        idEstadoInscripcion: 1 // Estado por defecto para completar
    };

    // Función para manejar cambios de archivos
    const handleFileChange = (e, field, setFieldValueFunc) => {
        // Usar la gestión de documentación del hook
        gestionHandleFileChange(e, field, setFieldValueFunc);
    };

    // Cerrar modal de documentación
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Función para proceder al registro (no necesaria aquí)
    const handleProceedToRegister = () => {
        closeModal();
    };

    // Función principal de envío
    const handleSubmit = async (formValues, { setSubmitting }) => {
        try {
            setGuardando(true);
            
            console.log('� Completando registro pendiente:', formValues);

            // Validación de seguridad: planAnio no puede estar vacío
            if (!formValues.planAnio || formValues.planAnio === '' || formValues.planAnio === null) {
                showError('Debes seleccionar un plan/año antes de continuar.');
                setGuardando(false);
                if (setSubmitting) setSubmitting(false);
                return;
            }

            // Preparar FormData
            const formData = new FormData();

            // Procesar campos para envío al backend
            const valoresProcesados = { ...formValues };
            
            // ModalidadId
            if (valoresProcesados.modalidadId !== undefined && valoresProcesados.modalidadId !== null) {
                valoresProcesados.modalidadId = parseInt(valoresProcesados.modalidadId, 10);
            }
            
            // PlanAnio (ID del plan)
            if (valoresProcesados.planAnio !== undefined && valoresProcesados.planAnio !== null) {
                valoresProcesados.planAnio = parseInt(valoresProcesados.planAnio, 10);
            }
            
                // CRÍTICO: El backend espera 'idModulo' como array
                // Mapear 'modulos' frontend → 'idModulo' backend
                let modulosArray = [];
                
                // Procesar modulos del formulario
                if (valoresProcesados.modulos !== undefined && valoresProcesados.modulos !== null) {
                    const mod = parseInt(valoresProcesados.modulos, 10);
                    if (!isNaN(mod)) {
                        modulosArray = [mod];
                    }
                }                // Si no hay módulos del formulario, buscar en idModulo del registro original
                if (modulosArray.length === 0 && registro.datos?.idModulo) {
                    if (Array.isArray(registro.datos.idModulo)) {
                        const mod = parseInt(registro.datos.idModulo[0], 10);
                        if (!isNaN(mod)) {
                            modulosArray = [mod];
                        }
                    } else if (registro.datos.idModulo !== '') {
                        const mod = parseInt(registro.datos.idModulo, 10);
                        if (!isNaN(mod)) {
                            modulosArray = [mod];
                        }
                    }
                }

                // Asignar el array de módulos
                if (modulosArray.length > 0) {
                    valoresProcesados.idModulo = modulosArray;
                    console.log(`✅ [BACKEND MAPPING] Módulos procesados:`, {
                        original: valoresProcesados.modulos,
                        procesado: modulosArray,
                        fuente: 'formulario o registro'
                    });
                } else if (valoresProcesados.modalidad === 'Semipresencial') {
                    console.error('❌ [BACKEND MAPPING] No se encontraron módulos válidos para modalidad Semipresencial');
                } else {
                    console.log('ℹ️ [BACKEND MAPPING] No se encontraron módulos (normal para modalidad no-Semipresencial)');
                }
                
                // Eliminar 'modulos' ya que el backend no lo usa
                delete valoresProcesados.modulos;            console.log('📤 [BACKEND] Valores procesados para envío:', {
                modalidadId: valoresProcesados.modalidadId,
                planAnio: valoresProcesados.planAnio,
                idModulo: valoresProcesados.idModulo,
                idEstadoInscripcion: valoresProcesados.idEstadoInscripcion
            });

            // Validación previa de modalidad y planAnio
            const modalidadValid = valoresProcesados.modalidad && valoresProcesados.modalidad !== '';
            const planAnioValid = valoresProcesados.planAnio && !isNaN(valoresProcesados.planAnio);
            if (!modalidadValid || !planAnioValid) {
                showError('Debes seleccionar modalidad y plan/año antes de continuar.');
                setGuardando(false);
                if (setSubmitting) setSubmitting(false);
                return;
            }

            // Validación específica para modalidad Semipresencial - idModulo es requerido
            if (valoresProcesados.modalidad === 'Semipresencial' || valoresProcesados.modalidadId === 2) {
                console.log('🔍 [VALIDACION] Verificando idModulo para Semipresencial:', {
                    idModulo: valoresProcesados.idModulo,
                    planAnio: valoresProcesados.planAnio,
                    modalidad: valoresProcesados.modalidad,
                    modalidadId: valoresProcesados.modalidadId
                });
                
                const moduloValid = valoresProcesados.idModulo && 
                                   valoresProcesados.idModulo !== '' && 
                                   valoresProcesados.idModulo !== null && 
                                   !isNaN(valoresProcesados.idModulo);
                
                if (!moduloValid) {
                    console.log('❌ [VALIDACION] Campo idModulo inválido para Semipresencial');
                    console.log('🔍 [VALIDACION] Datos disponibles:', {
                        idModulo: valoresProcesados.idModulo,
                        planAnio: valoresProcesados.planAnio,
                        idModuloOriginal: registro.datos?.idModulo,
                        modulosOriginal: formValues.modulos
                    });
                    
                    // Para Semipresencial, idModulo es obligatorio y debe ser específico
                    showError('❌ Para modalidad Semipresencial, debe seleccionar un módulo específico. Verifique que el módulo esté seleccionado correctamente.');
                    setGuardando(false);
                    if (setSubmitting) setSubmitting(false);
                    return;
                } else {
                    console.log('✅ [VALIDACION] idModulo válido para Semipresencial:', valoresProcesados.idModulo);
                }
            }

            // No enviar objetos completos (archivos, previews) en el FormData
            Object.keys(valoresProcesados).forEach(key => {
                if (
                    valoresProcesados[key] !== null &&
                    valoresProcesados[key] !== undefined &&
                    typeof valoresProcesados[key] !== 'object'
                ) {
                    formData.append(key, valoresProcesados[key]);
                }
            });

            // Agregar archivos nuevos (no existentes)
            Object.keys(previews).forEach(tipoDoc => {
                const previewData = previews[tipoDoc];
                if (previewData && previewData.file && !previewData.existente) {
                    // Solo agregar archivos nuevos (no existentes)
                    formData.append(tipoDoc, previewData.file);
                    console.log(`📎 Agregando archivo nuevo: ${tipoDoc}`);
                }
            });

            // Verificar documentación completa
            console.log('[DEBUG] Llamando a obtenerDocumentosRequeridos desde ModalEditarRegistro.jsx con:', {
                modalidad: formValues.modalidad || formValues.modalidadId,
                planAnio: formValues.planAnio,
                modulos: formValues.modulos
            });
            const documentosRequeridos = obtenerDocumentosRequeridos(
                formValues.modalidad || formValues.modalidadId,
                formValues.planAnio,
                formValues.modulos
            );

            // Verificar qué archivos están presentes (existentes o nuevos)
            const archivosPresentes = Object.keys(previews).filter(field => {
                const preview = previews[field];
                return preview && (preview.url || preview.file);
            });

            // El frontend ya no decide si está completa o no - eso lo decide el backend
            console.log('📋 Documentos requeridos:', documentosRequeridos.documentos);
            console.log('📎 Archivos presentes:', archivosPresentes);
            console.log('🔍 [DEBUG SUBMIT] previews:', Object.keys(previews));
            console.log('🔍 [DEBUG SUBMIT] formValues.modalidad:', formValues.modalidad);
            console.log('🔍 [DEBUG SUBMIT] formValues.planAnio:', formValues.planAnio);
            console.log('🔍 [DEBUG SUBMIT] formValues.modulos:', formValues.modulos);

            formData.append('registroPendienteId', registro.dni);
            
            let resultado;
            
            console.log('🎯 FLUJO: Llamando SIEMPRE a completarRegistro (el backend decide si está completa)');
            
            // SIEMPRE llamar al endpoint /procesar - el backend decide el estado final
            // 1. Subir archivos nuevos (si hay) usando PUT
            if (Object.keys(previews).length > 0) {
                console.log('📎 Subiendo archivos nuevos antes del procesamiento...');
                await registrosPendientesService.actualizarRegistroPendiente(registro.dni, formValues, previews);
            }
            
            // 2. Procesar registro (migrar y guardar en BD)
            resultado = await registrosPendientesService.completarRegistro(formData);

                console.log('✅ Respuesta de completar registro:', resultado);

            // Verificar la respuesta del backend según el estado
            if (resultado && resultado.estado === 'PROCESADO') {
                // CASO 1: Documentación COMPLETA - estudiante creado en BD
                const mensaje = resultado.mensaje || '✅ Registro procesado exitosamente - Estudiante creado en base de datos';
                showSuccess(mensaje);
                
                console.log('✅ [PROCESADO] Estudiante creado en BD:', {
                    idEstudiante: resultado.idEstudiante,
                    estado: resultado.estado,
                    mensaje: resultado.mensaje
                });
                
                onGuardado && onGuardado(registro, 'completado', resultado);
                
            } else if (resultado && resultado.estado === 'PENDIENTE') {
                // CASO 2: Documentación INCOMPLETA - registro actualizado en JSON
                const progreso = resultado.progreso || 'N/A';
                const mensaje = `⚠️ Documentación incompleta (${progreso}) - Registro actualizado\n\n${resultado.motivoPendiente || 'Faltan documentos requeridos'}`;
                
                showWarning(mensaje);
                
                console.log('⚠️ [PENDIENTE] Documentación incompleta:', {
                    progreso: resultado.progreso,
                    archivosActualizados: resultado.archivosActualizados,
                    faltantes: resultado.detalles?.faltantesBasicos,
                    motivoPendiente: resultado.motivoPendiente
                });
                
                // No cerrar modal - permitir que usuario suba archivos faltantes
                // Actualizar lista de registros
                onGuardado && onGuardado(registro, 'actualizado_incompleto', resultado);
                return; // NO cerrar el modal
                
            } else if (resultado && resultado.yaExistia === true) {
                // CASO 3: Estudiante ya existía en BD - registro sincronizado
                const mensaje = resultado.mensaje || 'Estudiante ya registrado - sincronizado correctamente';
                showSuccess(`✅ ${mensaje}`);
                onGuardado && onGuardado(registro, 'ya_procesado', resultado);
                console.log('✅ Registro sincronizado (ya existía):', resultado);
                
            } else if (resultado && resultado.success === false) {
                // CASO 4: Error explícito del backend
                showError(resultado.message || 'Error al completar el registro');
                throw new Error(resultado.message || 'Error al completar el registro');
                
            } else if (resultado && (resultado.insertId || resultado.insertId === 0)) {
                // CASO 5: Respuesta legacy (compatibilidad)
                const mensaje = resultado.message || '✅ Registro procesado exitosamente';
                showSuccess(mensaje);
                onGuardado && onGuardado(registro, 'completado', resultado);
                
            } else {
                // CASO 6: Respuesta inesperada
                showError('❌ Error: No se pudo completar el registro. Verifique la respuesta del servidor.');
                console.warn('❌ [INESPERADO] Respuesta de completarRegistro:', resultado);
                return; // NO cerrar modal
            }

            onClose();

        } catch (error) {
            console.error('❌ Error al procesar registro:', error);
            
            // Manejo específico para errores HTTP de Axios
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                console.log('🔍 [AXIOS ERROR] Status:', status, 'Data:', errorData);
                
                // Error 409 - Estudiante ya existe con inscripción activa
                if (status === 409) {
                    const mensajeBackend = errorData?.message || 'El estudiante ya existe en la base de datos';
                    const idEstudiante = errorData?.idEstudiante;
                    
                    console.log('⚠️ [409] Estudiante ya existe con inscripción activa:', {
                        dni: registro.dni,
                        idEstudiante,
                        mensaje: mensajeBackend
                    });
                    
                    // Mostrar mensaje detallado al usuario
                    showWarning(`⚠️ ${mensajeBackend}`);
                    showInfo('ℹ️ El registro se marcará como procesado y se eliminará de pendientes.');
                    
                    // Marcar como procesado y cerrar modal
                    if (onGuardado) {
                        onGuardado(registro, 'ya_procesado', {
                            idEstudiante,
                            yaExistia: true,
                            mensaje: mensajeBackend,
                            estado: 'PROCESADO'
                        });
                    }
                    onClose();
                    return;
                }
                
                // Error 400 - Bad Request (puede incluir validaciones de modulos)
                if (status === 400) {
                    const mensaje = errorData?.mensaje || errorData?.message || 'Error de validación';
                    console.log('❌ [400] Error de validación:', mensaje);
                    showError(`❌ Error de validación: ${mensaje}`);
                    return;
                }
                
                // Error 500 - Error interno del servidor
                if (status === 500) {
                    const mensaje = errorData?.mensaje || errorData?.message || 'Error interno del servidor';
                    console.log('❌ [500] Error interno del servidor:', mensaje);
                    showError(`❌ Error del servidor: ${mensaje}`);
                    return;
                }
                
                // Otros errores HTTP
                const mensajeGenerico = errorData?.mensaje || errorData?.message || `Error HTTP ${status}`;
                showError(`❌ Error: ${mensajeGenerico}`);
                return;
            }
            
            // Manejo de errores sin response (red, timeout, etc.)
            if (error.request) {
                console.log('🌐 [AXIOS NETWORK] Error de red o timeout:', error.request);
                showError('❌ Error de conexión. Verifique su conexión a internet e intente nuevamente.');
                return;
            }
            
            // Error en la configuración de la request
            const errorMessage = error.message || error.toString();
            console.log('⚙️ [AXIOS CONFIG] Error de configuración:', errorMessage);
            
            // Verificar si el "error" en realidad contiene un mensaje de éxito (caso raro)
            if (errorMessage.includes('actualizado exitosamente') || 
                errorMessage.includes('completado exitosamente') ||
                (errorMessage.includes('exitosamente') && !errorMessage.toLowerCase().includes('error al')) ||
                errorMessage.includes('correctamente')) {
                console.log('🔄 [UNUSUAL] Mensaje de éxito detectado en catch, mostrando como éxito');
                showSuccess('✅ Cambios guardados en pendientes');
                onGuardado && onGuardado(registro, 'actualizado');
                onClose();
                return;
            }
            
            // Error genérico
            showError(`❌ Error al procesar el registro: ${errorMessage}`);
        } finally {
            setGuardando(false);
            if (setSubmitting) setSubmitting(false);
        }
    };

    // Función para eliminar registro
    const handleEliminar = async () => {
        const confirmado = await confirmAction('¿Está seguro de que desea eliminar este registro permanentemente?');
        
        if (!confirmado) {
            return;
        }

        try {
            setGuardando(true);
            const resultado = await registrosPendientesService.eliminarRegistroPendiente(registro.dni);
            
            if (resultado.success) {
                showSuccess('🗑️ Registro eliminado de pendientes');
                onEliminado && onEliminado(registro);
                onClose();
            } else {
                throw new Error(resultado.message || 'Error al eliminar el registro');
            }
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            showError(`❌ Error: ${error.message}`);
        } finally {
            setGuardando(false);
        }
    };



    // Cargar archivos existentes en sessionStorage para que el hook los procese
    useEffect(() => {
        if (registro.archivos || registro.datos || registro.modalidad) {
            const planAnio = registro.datos?.planAnio || registro.planAnio;
            const modalidad = registro.datos?.modalidad || registro.modalidad;
            
            // Calcular modulos correcto para sessionStorage
            let modulosCalculado = registro.datos?.modulos || registro.modulos;
            
            // Si modulos está vacío pero hay idModulo array, usar el primer elemento válido
            if ((!modulosCalculado || modulosCalculado === '') && registro.datos?.idModulo && Array.isArray(registro.datos.idModulo)) {
                const moduloValido = registro.datos.idModulo.find(id => id && id !== '' && id !== null);
                if (moduloValido) {
                    modulosCalculado = moduloValido;
                    console.log('🔧 [SESSION] Calculando modulos desde idModulo:', moduloValido);
                }
            }
            
            // Para Semipresencial, NO auto-calcular modulos desde planAnio
            // Los módulos son independientes (planAnio=6 → módulos pueden ser 6,7,8,9)
            if ((!modulosCalculado || modulosCalculado === '') && modalidad === 'Semipresencial') {
                console.log('⚠️ [SESSION] Modalidad Semipresencial sin módulo específico');
                console.log('� [SESSION] PlanAnio', planAnio, 'requiere selección de módulo específico por el usuario');
                // Dejar modulosCalculado vacío para que el usuario seleccione
            }
            
            // Guardar todos los datos del registro en sessionStorage para que los componentes los procesen
            const datosRegistroPendiente = {
                archivosExistentes: registro.archivos || {},
                // Agregar datos para que PlanAnioSelector pueda acceder al módulo
                modalidad: modalidad,
                modalidadId: initialValues.modalidadId,
                planAnio: planAnio,
                modulos: modulosCalculado,
                idModulo: registro.datos?.idModulo || registro.idModulo || (modulosCalculado ? [modulosCalculado] : [])
            };
            
            console.log('💾 [SESSION] Guardando datos en sessionStorage para modal:', datosRegistroPendiente);
            console.log('🔍 [SESSION] Valores calculados:', {
                dni: registro.dni,
                modalidad: modalidad,
                planAnio: planAnio,
                modulosOriginal: registro.datos?.modulos || registro.modulos,
                modulosCalculado: modulosCalculado,
                idModuloOriginal: registro.datos?.idModulo
            });
            sessionStorage.setItem('datosRegistroPendiente', JSON.stringify(datosRegistroPendiente));
            
            // Procesar archivos existentes manualmente
            const previewsExistentes = {};
            Object.entries(registro.archivos).forEach(([tipoDocumento, rutaArchivo]) => {
                if (rutaArchivo) {
                    const rutaLimpia = rutaArchivo.replace(/\\/g, '/');
                    const nombreArchivo = rutaLimpia.split('/').pop();
                    const urlArchivo = `http://localhost:5000${rutaArchivo}`;
                    
                    const extension = nombreArchivo.split('.').pop().toLowerCase();
                    const tipoArchivo = extension === 'pdf' ? 'application/pdf' : 
                                      ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? `image/${extension}` : 
                                      'application/octet-stream';
                    
                    previewsExistentes[tipoDocumento] = {
                        url: urlArchivo,
                        type: tipoArchivo,
                        file: null,
                        existente: true,
                        uploaded: true,
                        rutaOriginal: rutaArchivo,
                        nombreArchivo: nombreArchivo
                    };
                }
            });
            
            // Actualizar previews con archivos existentes
            setPreviews(prevPreviews => ({
                ...prevPreviews,
                ...previewsExistentes
            }));
            
            console.log('📋 Archivos existentes cargados en modal:', previewsExistentes);
        }
    }, [registro, setPreviews, initialValues.modalidadId]);

    // Esquema de validación
    const validationSchema = Yup.object({
        nombre: Yup.string().required('Nombre es requerido'),
        apellido: Yup.string().required('Apellido es requerido'),
        dni: Yup.string()
            .matches(/^\d{8}$/, 'DNI debe tener 8 dígitos')
            .required('DNI es requerido'),
        email: Yup.string()
            .email('Email inválido')
            .required('Email es requerido'),
        telefono: Yup.string().required('Teléfono es requerido'),
        modalidad: Yup.string().required('Modalidad es requerida')
    });

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container registro-modal-grande">
                
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (formValues, { setSubmitting }) => {
                        await handleSubmit(formValues, { setSubmitting });
                    }}
                    enableReinitialize={true}
                >
                    {({ values: formikValues, setFieldValue: formikSetFieldValue, isSubmitting }) => (
                        <Form encType="multipart/form-data">
                            
                            {/* Header igual que RegistroEstd */}
                            <div className="registro-header-container">
                                <div className="registro-header-row">
                                    <div className="registro-nav-left">
                                        {/* Volver está vacío aquí */}
                                    </div>
                                    <h2 className="modal-title-registro">
                                        📝 Completar Registro Pendiente
                                    </h2>
                                    <div className="registro-nav-right">
                                        <CloseButton onClose={onClose} variant="modal" />
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje informativo sobre el registro */}
                            <div className="mensaje-registro-pendiente">
                                <h4>🔄 Completando Registro Pendiente</h4>
                                <p>
                                    Los datos del registro pendiente han sido cargados. 
                                    Complete o verifique la información y documentación para finalizar la inscripción.
                                </p>
                            </div>

                            {/* Estructura de formulario igual que RegistroEstd */}
                            <div className="formd">
                                <div className="form-datos">
                                    <DatosPersonales />
                                </div>
                                
                                <div className="form-domicilio">
                                    <Domicilio esAdmin={true} />
                                </div>
                                
                                <div className="form-eleccion">
                                    <ModalidadSelection
                                        modalidad={formikValues.modalidad}
                                        modalidadId={formikValues.modalidadId}
                                        setFieldValue={formikSetFieldValue}
                                        values={formikValues}
                                        showMateriasList={formikValues.planAnio !== '' && formikValues.modalidad !== ''}
                                        handleChange={(e) => {
                                            const { name, value } = e.target;
                                            formikSetFieldValue(name, value);
                                            
                                            // Para Semipresencial, NO auto-actualizar modulos desde planAnio
                                            // Los módulos deben ser seleccionados específicamente por el usuario
                                            if (name === 'planAnio' && formikValues.modalidad === 'Semipresencial') {
                                                // Limpiar modulos para que el usuario seleccione el correcto
                                                formikSetFieldValue('modulos', '');
                                                console.log(`🔄 Plan cambió en Semipresencial - limpiando módulos para nueva selección`);
                                            }
                                            
                                            // Si cambia a modalidad Semipresencial, limpiar modulos para selección manual
                                            if (name === 'modalidad' && value === 'Semipresencial') {
                                                formikSetFieldValue('modulos', '');
                                                console.log(`🔄 Cambio a Semipresencial - módulos debe ser seleccionado manualmente`);
                                            }
                                            
                                            // Si cambia desde Semipresencial, limpiar modulos
                                            if (name === 'modalidad' && formikValues.modalidad === 'Semipresencial' && value !== 'Semipresencial') {
                                                formikSetFieldValue('modulos', '');
                                                console.log(`🧹 Limpiando modulos al cambiar desde Semipresencial a ${value}`);
                                            }
                                        }}
                                        editMode={{}}
                                        formData={{}}
                                        setFormData={() => {}}
                                    />
                                </div>
                                
                                <div className="left-container button-stack">
                                    <h4>Acciones</h4>
                                    
                                    <button 
                                        type="button" 
                                        className="boton-principal" 
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Adjuntar Documentación
                                    </button>
                                    
                                    {guardando || isSubmitting ? (
                                        <BotonCargando loading={true}>
                                            Completando Registro...
                                        </BotonCargando>
                                    ) : (
                                        <button type="submit" className="boton-principal">
                                            ✅ Completar Registro
                                        </button>
                                    )}
                                    
                                    <EstadoInscripcion
                                        value={formikValues.idEstadoInscripcion}
                                        handleChange={e => formikSetFieldValue('idEstadoInscripcion', e.target.value)}
                                    />
                                    
                                    <button
                                        type="button"
                                        onClick={handleEliminar}
                                        disabled={guardando || isSubmitting}
                                        className="boton-eliminar"
                                    >
                                        🗑️ Eliminar Registro
                                    </button>
                                </div>
                                
                                {/* Modal de documentación igual que RegistroEstd */}
                                {isModalOpen && (
                                    <FormDocumentacion
                                        onClose={closeModal}
                                        previews={previews}
                                        handleFileChange={(e, field) => handleFileChange(e, field, formikSetFieldValue)}
                                        setFieldValue={formikSetFieldValue}
                                        onProceedToRegister={handleProceedToRegister}
                                    />
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            
            {/* Sistema de Alertas y Modales de Confirmación */}
            <AlertaMens
                mode="floating"
                alerts={alerts}
                modal={modal}
                onCloseAlert={removeAlert}
                onCloseModal={closeConfirmModal}
            />
        </div>
    );
};

ModalEditarRegistro.propTypes = {
    registro: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onGuardado: PropTypes.func,
    onEliminado: PropTypes.func
};

export default ModalEditarRegistro;