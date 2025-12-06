import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';


// Registrar nueva inscripción Web
const createWebInscription = async (formDataToSend) => {
    try {
        console.log('🌐 [createWebInscription] Enviando datos al endpoint de registros web...');
        const response = await axiosInstance.post('/registros-web', formDataToSend); // Endpoint para registros web JSON
        console.log('🌐 [createWebInscription] Respuesta recibida:', response);
        if (import.meta.env.DEV) {
            console.log('🌐 [createWebInscription] response.data:', response.data);
        }
        return response.data;
    } catch (error) {
        console.error('🌐 [createWebInscription] Error capturado:', error);
        const msg = FormatError(error);
        if (import.meta.env.DEV) {
            console.error('🌐 [createWebInscription] Error formateado:', msg);
            console.error('🌐 [createWebInscription] error.response?.data:', error.response?.data);
        }
        throw new Error(msg); // Lanzar error para manejo consistente
    }
};

// Inscripción Estudiante Adm
// Permite pasar setAlert para mostrar el error en un alert si ocurre
const createEstd = async (formDataToSend, setAlert) => {
    try {
        if (import.meta.env.DEV && formDataToSend instanceof FormData) {
            // Mostrar todos los pares clave-valor enviados, tipo y valor
            const entries = {};
            for (let [key, value] of formDataToSend.entries()) {
                entries[key] = { valor: value, tipo: typeof value };
            }
            console.log('[createEstd] FormData enviado:', entries);
        }
        const response = await axiosInstance.post('/estudiantes/registrar', formDataToSend);
        if (import.meta.env.DEV) {
            console.log('Respuesta del servidor:', response.data);
        }
        return response.data;
    } catch (error) {
        const msg = FormatError(error);
        if (setAlert) setAlert({ text: msg, variant: 'error' });
        if (import.meta.env.DEV) {
            console.error('Error en createEstd - respuesta servidor:', JSON.stringify(error.response?.data, null, 2));
            console.error('Error en createEstd - error completo:', error);
        }
        throw new Error(msg);
    }
};
// Registrar registro web que va a pendientes por criterios no cumplidos
const createWebPendiente = async (formDataToSend) => {
    try {
        console.log('⏰ [createWebPendiente] Enviando a registros pendientes...');
        const response = await axiosInstance.post('/estudiantes/registrar-web-pendiente', formDataToSend);
        console.log('⏰ [createWebPendiente] Respuesta recibida:', response);
        if (import.meta.env.DEV) {
            console.log('⏰ [createWebPendiente] response.data:', response.data);
        }
        return response.data;
    } catch (error) {
        console.error('⏰ [createWebPendiente] Error capturado:', error);
        const msg = FormatError(error);
        if (import.meta.env.DEV) {
            console.error('⏰ [createWebPendiente] Error formateado:', msg);
            console.error('⏰ [createWebPendiente] error.response?.data:', error.response?.data);
        }
        throw new Error(msg);
    }
};

// Registrar registro pendiente del administrador
const createRegistroPendiente = async (formDataToSend) => {
    try {
        console.log('📋 [createRegistroPendiente] Enviando registro pendiente del admin...');
        console.log('📋 [createRegistroPendiente] URL objetivo:', '/registros-pendientes');
        console.log('📋 [createRegistroPendiente] FormData:', formDataToSend);
        
        // Log detallado del FormData
        if (formDataToSend instanceof FormData) {
            console.log('📋 [createRegistroPendiente] Contenido del FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`   ${key}: ${value}`);
            }
        }
        
        const response = await axiosInstance.post('/registros-pendientes', formDataToSend);
        console.log('📋 [createRegistroPendiente] Respuesta recibida exitosamente:', response);
        console.log('📋 [createRegistroPendiente] Status:', response.status);
        console.log('📋 [createRegistroPendiente] Headers:', response.headers);
        
        if (import.meta.env.DEV) {
            console.log('📋 [createRegistroPendiente] response.data:', response.data);
        }
        return response.data;
    } catch (error) {
        console.error('📋 [createRegistroPendiente] Error capturado:', error);
        console.error('📋 [createRegistroPendiente] error.response:', error.response);
        console.error('📋 [createRegistroPendiente] error.response?.status:', error.response?.status);
        console.error('📋 [createRegistroPendiente] error.response?.data:', error.response?.data);
        console.error('📋 [createRegistroPendiente] error.message:', error.message);
        
        const msg = FormatError(error);
        console.error('📋 [createRegistroPendiente] Error formateado:', msg);
        throw new Error(msg);
    }
};

// Marcar registro como completado (eliminar de registros pendientes)
const marcarRegistroCompletado = async (dni) => {
    try {
        console.log(`✅ [marcarRegistroCompletado] Marcando registro como completado para DNI: ${dni}`);
        const response = await axiosInstance.post('/notificaciones/marcar-completado', { dni });
        console.log('✅ [marcarRegistroCompletado] Respuesta recibida:', response);
        
        if (import.meta.env.DEV) {
            console.log('✅ [marcarRegistroCompletado] response.data:', response.data);
        }
        return response.data;
    } catch (error) {
        console.error('✅ [marcarRegistroCompletado] Error capturado:', error);
        const msg = FormatError(error);
        if (import.meta.env.DEV) {
            console.error('✅ [marcarRegistroCompletado] Error formateado:', msg);
            console.error('✅ [marcarRegistroCompletado] error.response?.data:', error.response?.data);
        }
        throw new Error(msg);
    }
};

export default {
    createWebInscription,       
    createEstd,
    createWebPendiente,
    createRegistroPendiente,
    marcarRegistroCompletado,
}