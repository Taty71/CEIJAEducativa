import { 
    obtenerEstadoDocumentacion, 
    verificarRegistroPendiente,
    eliminarRegistroPendiente,
    guardarRegistroSinDocumentacion
} from '../utils/registroSinDocumentacion';
import serviceRegInscripcion from '../services/serviceRegInscripcion';
import serviceInscripcion from '../services/serviceInscripcion';
import serviceRegistrosWeb from '../services/serviceRegistrosWeb';
import { useAlerts } from './useAlerts';
import { calcularEstadoDocumentacionWeb } from '../utils/calcularEstadoDocumentacionWeb';

/**
 * Hook personalizado para manejar el envío del formulario de registro
 * @param {Object} files - Archivos adjuntos
 * @param {Object} previews - Previsualizaciones de archivos
 * @param {Function} resetArchivos - Función para resetear archivos
 * @param {Function} buildDetalleDocumentacion - Función para construir detalle de documentación
 */
export const useSubmitHandler = (files, previews, resetArchivos, buildDetalleDocumentacion) => {
    const { showSuccess, showError, showWarning } = useAlerts();
    
    const validateRequiredFields = (values) => {
        const camposObligatorios = [
            'nombre', 'apellido', 'dni', 'cuil', 'fechaNacimiento', 
            'calle', 'numero', 'barrio', 'localidad', 'provincia', 
            'email', 'telefono'
        ];
        return camposObligatorios.filter((campo) => !values[campo]);
    };

    const buildFormData = (values, files, detalleDocumentacion, isAdmin) => {
        const formDataToSend = new FormData();

        // Debug logging para usuarios web antes de construir FormData
        if (!isAdmin) {
            console.log('🌐 [DEBUG] Construyendo FormData para usuario web...');
            console.log('🌐 [DEBUG] Values:', values);
            console.log('🌐 [DEBUG] Files:', files);
        }

        // Solo iterar los values, no agregar modalidad manualmente para evitar duplicados
        Object.entries(values).forEach(([key, value]) => {
            // Excluir campos de archivos para evitar conflictos
            const archivosFields = [
                'archivo_dni', 'archivo_cuil', 'archivo_partidaNacimiento', 
                'archivo_fichaMedica', 'archivo_solicitudPase', 'archivo_analiticoParcial', 
                'archivo_certificadoNivelPrimario', 'foto'
            ];
            if (!archivosFields.includes(key)) {
                const campo = key === 'modulos' ? 'idModulo' : key;
                formDataToSend.append(campo, value);
                // Debug logging para usuarios web
                if (!isAdmin && value) {
                    console.log(`🌐 [DEBUG] Agregando al FormData: ${campo} = ${value}`);
                }
            }
        });

        Object.entries(files).forEach(([key, file]) => {
            if (file) {
                formDataToSend.append(key, file);
                if (!isAdmin) {
                    console.log(`🌐 [DEBUG] Agregando archivo: ${key} = ${file.name}`);
                }
            }
        });

        formDataToSend.append('detalleDocumentacion', JSON.stringify(detalleDocumentacion));
        
        // Debug logging final para usuarios web
        if (!isAdmin) {
            console.log('🌐 [DEBUG] FormData construido, enviando al servicio...');
        }

        return formDataToSend;
    };

    const sendRequest = async (formData, accion, isAdmin, values) => {
        let response;
        if (accion === "Registrar") {
            response = isAdmin
                ? await serviceRegInscripcion.createEstd(formData)
                : await serviceRegInscripcion.createWebInscription(formData);
        } else if (accion === "Modificar" && isAdmin) {
            response = await serviceInscripcion.updateEstd(formData, values.dni);
        }
        return response;
    };

    const handleResponse = async (response, values, files, previews, accion, isWebUser, completarWebParam, resetForm, resetArchivos, modalidad, isAdmin, errorBD = false) => {
        if (!response?.message) {
            showWarning('El formulario se envió, pero no hubo respuesta.');
            return;
        }

        // Verificar si este registro viene de completar un pendiente
        const registroPendiente = verificarRegistroPendiente(values.dni);
        const esRegistroPendienteCompletado = registroPendiente && values.dni;

        // Obtener estado completo de la documentación
        const estadoDocumentacion = obtenerEstadoDocumentacion(files, previews);
        const hayDocumentosCompletos = estadoDocumentacion.completo;
        
        if (accion === "Registrar" && (!hayDocumentosCompletos || errorBD) && isAdmin) {
            // Caso especial: registro de admin sin documentación o incompleto → enviar a Registros_Pendientes.json
            try {
                console.log('📋 [DEBUG] Enviando registro pendiente al backend...');
                console.log('📋 [DEBUG] Values:', values);
                console.log('📋 [DEBUG] Files:', files);
                console.log('📋 [DEBUG] Estado documentación:', estadoDocumentacion);
                
                // Crear FormData específico para registros pendientes
                const formDataPendiente = buildFormData(values, files, estadoDocumentacion, true);
                
                // Determinar motivo del registro pendiente
                let motivoPendiente;
                if (errorBD) {
                    motivoPendiente = `Error en base de datos: ${response.errorOriginal || 'Error de integridad de datos'}`;
                } else {
                    motivoPendiente = estadoDocumentacion.mensaje;
                }
                
                formDataPendiente.append('motivoPendiente', motivoPendiente);
                formDataPendiente.append('tipoRegistro', errorBD ? 'ERROR_BD' : (estadoDocumentacion.completo ? 'DOCUMENTACION_INCOMPLETA' : 'SIN_DOCUMENTACION'));
                
                console.log('📋 [DEBUG] FormData pendiente construido');
                
                // Log del contenido del FormData
                console.log('📋 [DEBUG] Contenido FormData:');
                for (let [key, value] of formDataPendiente.entries()) {
                    console.log(`   ${key}: ${value}`);
                }
                
                // Enviar al backend para guardar en Registros_Pendientes.json
                console.log('📋 [DEBUG] Llamando serviceRegInscripcion.createRegistroPendiente...');
                const responsePendiente = await serviceRegInscripcion.createRegistroPendiente(formDataPendiente);
                
                console.log('✅ [DEBUG] Respuesta del backend:', responsePendiente);
                
                const mensajeAlerta = errorBD 
                    ? `📋 Error en BD - Registro guardado como pendiente: ${response.errorOriginal}`
                    : `📋 Registro guardado como pendiente: ${estadoDocumentacion.mensaje}`;
                    
                showWarning(mensajeAlerta);
                console.log('✅ Registro pendiente guardado exitosamente en backend');
                
            } catch (error) {
                console.error('❌ [DEBUG] Error completo al guardar registro pendiente:', error);
                console.error('❌ [DEBUG] error.response:', error.response);
                console.error('❌ [DEBUG] error.response?.data:', error.response?.data);
                console.error('❌ [DEBUG] error.message:', error.message);
                
                // Fallback: guardar en localStorage como respaldo
                try {
                    console.log('⚠️ [DEBUG] Intentando fallback a localStorage...');
                    await guardarRegistroSinDocumentacion({
                        ...values,
                        modalidad,
                        mensaje: response?.message || 'Registro pendiente'
                    }, estadoDocumentacion);
                    
                    showWarning(`⚠️ Error del servidor, guardado localmente: ${estadoDocumentacion.mensaje}`);
                    console.log('✅ [DEBUG] Fallback localStorage exitoso');
                } catch (localError) {
                    console.error('❌ [DEBUG] Error en fallback local:', localError);
                    showError(`❌ Error completo: ${error.message}. No se pudo guardar el registro.`);
                }
            }
        } else if (accion === "Registrar" && !hayDocumentosCompletos && !isAdmin) {
            // Caso usuario web sin documentación → guardar local
            try {
                await guardarRegistroSinDocumentacion({
                    ...values,
                    modalidad,
                    mensaje: response?.message || 'Registro web incompleto'
                }, estadoDocumentacion);
                
                showWarning(estadoDocumentacion.mensaje);
            } catch (error) {
                console.error('Error al guardar registro web local:', error);
                showWarning(estadoDocumentacion.mensaje);
            }
        } else {
            // Caso normal: con documentación completa
            let mensajeExito = response.message;
            
            // Si es usuario web, personalizar mensaje de éxito
            if (isWebUser) {
                mensajeExito = 'Registro realizado con éxito, recuerda finalizar la inscripción de manera presencial para iniciar tus estudios';
            }
            
            // Si se completó un registro pendiente, eliminar de localStorage y del backend
            if (esRegistroPendienteCompletado) {
                eliminarRegistroPendiente(values.dni);
                
                // También notificar al backend para eliminar del archivo JSON
                try {
                    await serviceRegInscripcion.marcarRegistroCompletado(values.dni);
                    console.log(`🎉 Registro pendiente eliminado del backend para DNI ${values.dni}`);
                } catch (error) {
                    console.error('Error al eliminar registro pendiente del backend:', error);
                    // No detener el flujo, el registro ya se completó exitosamente
                }
                
                mensajeExito += ' ✅ Registro pendiente completado exitosamente.';
                console.log(`🎉 Registro pendiente completado para DNI ${values.dni}`);
            }
            
            // Si se completó un registro web, actualizar su estado
            if (completarWebParam) {
                try {
                    await serviceRegistrosWeb.procesarRegistroWeb(completarWebParam);
                    mensajeExito += ' ✅ Registro web procesado exitosamente.';
                    console.log(`🎉 Registro web procesado para ID ${completarWebParam}`);
                } catch (error) {
                    console.error('Error al actualizar estado del registro web:', error);
                    // No detener el flujo, solo log del error
                }
            }
            
            showSuccess(mensajeExito);
        }
        
        // Resetear formulario solo si el registro fue exitoso
        if (accion === "Registrar") {
            // Resetear archivos y previews
            resetArchivos();
            // Resetear campos del formulario a valores iniciales
            resetForm();
            // Limpiar sessionStorage después de un registro exitoso
            sessionStorage.removeItem('datosRegistroPendiente');
            console.log('🧹 SessionStorage limpiado tras registro exitoso');
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }, accion, isAdmin, isWebUser, completarWebParam, modalidad, completarRegistroWeb) => {
        setSubmitting(true);
        try {
            // Detectar si es completar registro web
            const esCompletarRegistroWeb = !!completarRegistroWeb || sessionStorage.getItem('datosRegistroWeb');
            
            if (esCompletarRegistroWeb) {
                console.log('🌐 Completando registro web:', completarRegistroWeb);
                await handleCompletarRegistroWeb(values, resetForm, resetArchivos);
                return;
            }

            // Validar campos obligatorios
            const camposFaltantes = validateRequiredFields(values);
            if (camposFaltantes.length > 0) {
                showError(`Faltan completar: ${camposFaltantes.join(', ')}`);
                return;
            }

            // Construir FormData
            const detalleDocumentacion = buildDetalleDocumentacion();
            const formDataToSend = buildFormData(values, files, detalleDocumentacion, isAdmin);

            let response;
            let errorBD = false;

            // Intentar enviar request - si es admin y falla la BD, ir a pendientes
            try {
                response = await sendRequest(formDataToSend, accion, isAdmin, values);
                console.log('✅ [DEBUG] Request exitoso, procesando respuesta...');
                
                // Debug logging para usuarios web
                if (!isAdmin) {
                    console.log('🌐 [DEBUG] Respuesta para usuario web:', response);
                    console.log('🌐 [DEBUG] ¿Tiene message?', !!response?.message);
                    console.log('🌐 [DEBUG] Message content:', response?.message);
                }

            } catch (requestError) {
                console.error('❌ [DEBUG] Error en sendRequest:', requestError);
                
                // Si es admin y hay error de BD, marcamos para enviar a pendientes
                if (isAdmin && accion === "Registrar") {
                    console.log('⚠️ [DEBUG] Error en BD para admin, enviando a registros pendientes...');
                    errorBD = true;
                    
                    // Crear respuesta ficticia para que no falle el flujo
                    response = {
                        message: 'Error en BD - enviado a registros pendientes',
                        errorBD: true,
                        errorOriginal: requestError.response?.data?.message || requestError.message
                    };
                } else {
                    // Para otros casos, propagar el error
                    throw requestError;
                }
            }

            // Manejar respuesta (incluye lógica para casos de error de BD)
            await handleResponse(response, values, files, previews, accion, isWebUser, completarWebParam, resetForm, resetArchivos, modalidad, isAdmin, errorBD);

        } catch (error) {
            console.error('❌ [DEBUG] Error completo en handleSubmit:', error);
            console.error('❌ [DEBUG] error.response:', error.response);
            console.error('❌ [DEBUG] error.response?.data:', error.response?.data);
            console.error('❌ [DEBUG] error.message:', error.message);
            console.error('❌ [DEBUG] error.stack:', error.stack);
            
            let mensajeError = 'Ocurrió un error al enviar los datos.';
            
            if (error.response?.data?.message) {
                mensajeError = error.response.data.message;
            } else if (error.message) {
                mensajeError = error.message;
            }
            
            console.error('❌ [DEBUG] Mensaje final de error:', mensajeError);
            showError(`❌ Error: ${mensajeError}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompletarRegistroWeb = async (values, resetForm, resetArchivos) => {
        try {
            console.log('🔄 Procesando completar registro web...');
            
            // Obtener datos del registro web desde sessionStorage
            const datosRegistroWeb = JSON.parse(sessionStorage.getItem('datosRegistroWeb') || '{}');
            const idRegistroWeb = datosRegistroWeb.id;
            
            if (!idRegistroWeb) {
                throw new Error('ID de registro web no encontrado');
            }

            console.log('📋 Datos del registro web:', datosRegistroWeb);
            console.log('🎓 Valores del formulario:', values);

            // Usar la nueva función de cálculo de documentación web
            const estadoDocumentacionWeb = calcularEstadoDocumentacionWeb(datosRegistroWeb);
            
            console.log('📊 Estado documentación registro web (NUEVO CALCULO):', estadoDocumentacionWeb);

            // Construir datos completos para envío
            const datosCompletos = {
                ...datosRegistroWeb.datos, // Datos originales del registro web
                ...values,  // Datos actualizados del formulario (sobrescribe los originales)
            };

            console.log('📦 Datos completos a procesar:', datosCompletos);

            // Construir información de documentos
            const documentos = {
                files: files,
                previews: previews,
                detalle: buildDetalleDocumentacion(),
                estado: estadoDocumentacionWeb
            };

            // Decidir si procesar en BD o mover a pendientes
            if (estadoDocumentacionWeb.esCompleto) {
                console.log('✅ Documentación completa - Procesando registro web en BD');
                
                // Procesar en BD y marcar como PROCESADO
                const resultado = await serviceRegistrosWeb.procesarRegistroWeb(idRegistroWeb, datosCompletos, documentos);
                
                showSuccess('Registro web procesado y guardado en la base de datos exitosamente');
                
                console.log('✅ Registro procesado en BD:', resultado);
            } else {
                console.log('⚠️ Documentación incompleta - Moviendo a pendientes');
                
                // Usar el mensaje calculado correctamente
                const motivoPendiente = estadoDocumentacionWeb.mensaje;
                
                // Mover a registros pendientes
                const resultado = await serviceRegistrosWeb.moverRegistroWebAPendientes(idRegistroWeb, motivoPendiente);
                
                showWarning(`⚠️ Registro movido a pendientes. ${motivoPendiente}`);
                
                console.log('⚠️ Registro movido a pendientes:', resultado);
            }

            // Limpiar y resetear
            resetArchivos();
            resetForm();
            sessionStorage.removeItem('datosRegistroWeb');
            
            // Redirigir al dashboard con mensaje
            setTimeout(() => {
                window.location.href = '/dashboard?tab=registros-web';
            }, 3000);

        } catch (error) {
            console.error('❌ Error al completar registro web:', error);
            showError(`Error al procesar registro web: ${error.message}`);
        }
    };

    return { handleSubmit };
};