
import axiosInstance from '../config/axios';

const registrosPendientesService = {
    // Obtener todos los registros pendientes
    obtenerRegistrosPendientes: async () => {
        try {
            console.log('📋 Obteniendo registros pendientes...');
            const { data: registros } = await axiosInstance.get('/registros-pendientes');
            console.log(`✅ ${registros.length} registros pendientes obtenidos`);
            return registros;
        } catch (error) {
            console.error('Error al obtener registros pendientes:', error);
            throw error;
        }
    },

    // Crear un nuevo registro pendiente
    crearRegistroPendiente: async (datosRegistro) => {
        try {
            console.log('💾 Creando registro pendiente:', datosRegistro.dni);
            const { data: resultado } = await axiosInstance.post('/registros-pendientes', datosRegistro);
            console.log('✅ Registro pendiente creado exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error al crear registro pendiente:', error);
            throw error;
        }
    },

    // Actualizar un registro pendiente (acepta datos y archivos, siempre guarda en archivosPendientes)
    actualizarRegistroPendiente: async (dni, datos, archivos = null) => {
        try {
            console.log(`🔄 Actualizando registro pendiente: ${dni}`);
            let resultado;
            if (archivos && Object.keys(archivos).length > 0) {
                const formData = new FormData();
                Object.keys(datos).forEach(key => {
                    if (datos[key] !== null && datos[key] !== undefined) {
                        formData.append(key, datos[key]);
                    }
                });
                Object.keys(archivos).forEach(fieldName => {
                    const archivo = archivos[fieldName];
                    if (archivo && archivo.file) {
                        formData.append(fieldName, archivo.file);
                    }
                });
                const { data } = await axiosInstance.put(`/registros-pendientes/${dni}`, formData);
                resultado = data;
            } else {
                const { data } = await axiosInstance.put(`/registros-pendientes/${dni}`, datos);
                resultado = data;
            }
            console.log('✅ Registro pendiente actualizado exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error al actualizar registro pendiente:', error);
            throw error;
        }
    },

    // Eliminar un registro pendiente
    eliminarRegistroPendiente: async (dni) => {
        try {
            console.log(`🗑️ Eliminando registro pendiente: ${dni}`);

            const { data: resultado } = await axiosInstance.delete(`/registros-pendientes/${dni}`);
            console.log('✅ Registro pendiente eliminado exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error al eliminar registro pendiente:', error);
            throw error;
        }
    },

    // Obtener estadísticas de registros pendientes
    obtenerEstadisticas: async () => {
        try {
            console.log('📊 Obteniendo estadísticas de registros pendientes...');
            const { data: stats } = await axiosInstance.get('/registros-pendientes/stats');
            console.log('✅ Estadísticas obtenidas:', stats);
            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    // Procesar un registro pendiente (convertir a registro completo)
    procesarRegistroPendiente: async (dni) => {
        try {
            // Primero actualizar el estado a "PROCESADO"
            await registrosPendientesService.actualizarRegistroPendiente(dni, {
                estado: 'PROCESADO',
                observaciones: `Procesado y convertido a registro completo el ${new Date().toLocaleDateString('es-AR')}`
            });
            console.log(`✅ Registro pendiente ${dni} marcado como procesado`);
            return { success: true, message: 'Registro procesado exitosamente' };
        } catch (error) {
            console.error('Error al procesar registro pendiente:', error);
            throw error;
        }
    },

    // Completar un registro pendiente (procesar y migrar a la BD)
    completarRegistro: async (formData) => {
        try {
            const dni = formData.get('dni') || formData.get('registroPendienteId');
            if (!dni) throw new Error('No se encontró el DNI en el FormData');
            console.log('✅ Procesando registro pendiente y migrando a BD...');
            
            // POST con multipart/form-data para enviar archivos
            const response = await axiosInstance.post(`/registros-pendientes/${dni}/procesar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const resultado = response.data;
            // Si el backend devolvió la versión actualizada del Registro Web, emitir un evento global
            try {
                if (resultado && resultado.registroWebActualizado) {
                    window.dispatchEvent(new CustomEvent('registroWeb:actualizado', { detail: resultado.registroWebActualizado }));
                    console.log('🔔 Evento emitido: registroWeb:actualizado', resultado.registroWebActualizado.id || resultado.registroWebActualizado.datos?.dni);
                }
            } catch (evErr) {
                console.warn('⚠️ No se pudo emitir evento registroWeb:actualizado', evErr.message);
            }
            console.log('✅ Registro pendiente procesado y guardado en BD:', resultado);
            return resultado;
        } catch (error) {
            console.error('Error al procesar registro pendiente:', error);
            throw error;
        }
    },

    // Enviar notificación por email
    // acepta (dni, options) donde options puede incluir { nota, extensionExcepcion }
    enviarNotificacion: async (dni, options = {}) => {
        try {
            console.log(`📧 Enviando notificación por email para DNI: ${dni}`, options);
            const body = Object.assign({ dni }, options || {});
            const { data: resultado } = await axiosInstance.post('/notificaciones/enviar-individual', body);
            console.log('✅ Notificación enviada exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error al enviar notificación:', error);
            throw error;
        }
    },

    // Reiniciar alarma de vencimiento
    reiniciarAlarma: async (dni, diasExtension = 7, motivo = 'Extensión solicitada') => {
        try {
            console.log(`⏰ Reiniciando alarma para DNI: ${dni}, extensión: ${diasExtension} días`);
            const { data: resultado } = await axiosInstance.post(`/registros-pendientes/${dni}/reiniciar-alarma`, {
                diasExtension,
                motivo
            });
            console.log('✅ Alarma reiniciada exitosamente');
            return resultado;
        } catch (error) {
            console.error('Error al reiniciar alarma:', error);
            throw error;
        }
    }
};

export default registrosPendientesService;