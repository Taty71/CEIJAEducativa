import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

// Obtener todas las inscripciones
const getAll = async () => {
    try {
        const { data } = await axiosInstance.get('/consultar-estudiantes');
        if (data.success) return data.estudiantes;
        return { error: data.message || 'Error al obtener estudiantes.' };
    } catch (error) {
        const message = FormatError(error);
        return { error: message };
    }
};

// Obtener estudiantes paginados y filtrados por modalidadId y estado
const getPaginatedEstudiantes = async (page, limit, filtroActivo = 'activos', modalidadId, estadoId, apellidoInicial) => {
    try {
        let endpoint = `/consultar-estudiantes?page=${page}&limit=${limit}`;
        // Agregar parámetro de filtro según el estado
        if (filtroActivo === 'activos') {
            endpoint += '&activo=1';
        } else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos') {
            endpoint += '&activo=0';
        } else if (filtroActivo === 'todos') {
            // NO agregar filtro por activo - traer todos los estudiantes
            console.log('📊 Solicitando TODOS los estudiantes (activos e inactivos)');
        }
        // Agregar modalidadId si está definido
        if (typeof modalidadId === 'number' && !isNaN(modalidadId)) {
            endpoint += `&modalidadId=${modalidadId}`;
        }
        // Agregar estadoId (id de estado_inscripciones) si está definido
        if (typeof estadoId === 'string' && estadoId !== '') {
            // estadoId viene como string desde el select; convertir a número si es posible
            const parsed = Number(estadoId);
            if (!isNaN(parsed)) {
                endpoint += `&estadoId=${parsed}`;
            }
        } else if (typeof estadoId === 'number' && !isNaN(estadoId)) {
            endpoint += `&estadoId=${estadoId}`;
        }
        // Agregar filtro por inicial de apellido si está definido
        if (apellidoInicial && typeof apellidoInicial === 'string' && apellidoInicial.trim() !== '') {
            const letter = encodeURIComponent(String(apellidoInicial).trim().charAt(0));
            endpoint += `&apellidoInicial=${letter}`;
        }
        console.log('🌐 Llamando al endpoint:', endpoint);
        console.log('📋 Parámetros:', { page, limit, filtroActivo, modalidadId, estadoId, apellidoInicial });
        const response = await axiosInstance.get(endpoint);
        console.log('🔄 Respuesta del backend:', response.data);
        return response.data;
    } catch (error) {
        console.error('🚨 Error en getPaginatedEstudiantes:', error);
        const message = FormatError(error);
        return { error: message, success: false };
    }
};

// Obtener estudiantes paginados usando la nueva ruta /listar-estudiantes
const getPaginatedAllEstudiantes = async (page, limit, filtroActivo = 'todos', modalidadId, estadoId, apellidoInicial) => {
    try {
        let endpoint = `/listar-estudiantes?page=${page}&limit=${limit}`;
        // Sólo pasar parametro activo si se especifica (activos o desactivados)
        if (filtroActivo === 'activos') {
            endpoint += '&activo=1';
        } else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos') {
            endpoint += '&activo=0';
        } // si es 'todos' no añadimos parametro activo

        if (typeof modalidadId === 'number' && !isNaN(modalidadId)) {
            endpoint += `&modalidadId=${modalidadId}`;
        }
        if (typeof estadoId === 'string' && estadoId !== '') {
            const parsed = Number(estadoId);
            if (!isNaN(parsed)) {
                endpoint += `&estadoId=${parsed}`;
            }
        } else if (typeof estadoId === 'number' && !isNaN(estadoId)) {
            endpoint += `&estadoId=${estadoId}`;
        }
        if (apellidoInicial && typeof apellidoInicial === 'string' && apellidoInicial.trim() !== '') {
            const letter = encodeURIComponent(String(apellidoInicial).trim().charAt(0));
            endpoint += `&apellidoInicial=${letter}`;
        }
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('🚨 Error en getPaginatedAllEstudiantes:', error);
        const message = FormatError(error);
        return { error: message, success: false };
    }
};

// Obtener documentos faltantes por DNI
const getDocumentosFaltantes = async (dni) => {
    try {
        console.log('📋 Consultando documentos faltantes para DNI:', dni);
        
        const response = await axiosInstance.get(`/documentos-faltantes/${dni}`);
        console.log('📄 Respuesta documentos faltantes:', response.data);
        
        if (response.data.success) {
            return response.data.documentosFaltantes || [];
        } else {
            console.warn('⚠️ No se pudieron obtener documentos faltantes:', response.data.message);
            return [];
        }
    } catch (error) {
        console.error('🚨 Error al obtener documentos faltantes:', error);
        // Si hay error, devolver lista genérica de documentos que podrían faltar
        return [
            'Documento Nacional de Identidad (DNI)',
            'Constancia de CUIL',
            'Certificado de Nacimiento',
            'Ficha Médica',
            'Analítico Parcial'
        ];
    }
};

// Obtener estudiante específico por DNI
const getEstudiantePorDNI = async (dni) => {
    try {
        console.log('🔍 [LOG] Buscando estudiante por DNI:', dni);
        const response = await axiosInstance.get(`/consultar-estudiantes-dni/${dni}`);
        console.log('👤 [LOG] Respuesta búsqueda por DNI:', response.data);
        if (response.data && response.data.estudiante) {
            console.log('📦 [LOG] Datos completos recibidos:', JSON.stringify(response.data.estudiante, null, 2));
            if (response.data.estudiante.inscripcion) {
                console.log('🎓 [LOG] Datos de inscripción:', JSON.stringify(response.data.estudiante.inscripcion, null, 2));
            }
            if (response.data.estudiante.documentacion) {
                console.log('📄 [LOG] Documentación:', JSON.stringify(response.data.estudiante.documentacion, null, 2));
            }
        }
        return response.data;
    } catch (error) {
        console.error('🚨 [LOG] Error al buscar estudiante por DNI:', error);
        const message = FormatError(error);
        return { error: message, success: false };
    }
};

const updateEstd = async (data, dni, config = {}) => {
    try {
        // Dump de FormData si corresponde
        if (data instanceof FormData) {
            console.log('🔄 [LOG] Enviando FormData al backend para DNI:', dni);
            for (const pair of data.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`📎 [LOG] Archivo adjunto: ${pair[0]} -> nombre: ${pair[1].name}, tipo: ${pair[1].type}`);
                } else {
                    console.log(`📦 [LOG] Campo: ${pair[0]} =`, pair[1]);
                }
            }
        } else {
            console.log('🔄 [LOG] Enviando datos (no FormData) al backend:', { dni, data });
        }
        const response = await axiosInstance.put(`/modificar-estudiante/${dni}`, data, config);
        console.log('✅ [LOG] Respuesta del backend:', response.data);
        return response.data;
    } catch (error) {
        const message = FormatError(error);
        console.error('🚨 [LOG] Error al actualizar estudiante:', message);
        throw new Error(message); 
    }
};


// Eliminar inscripción Adm (eliminación física)
const deleteEstd = async (dni) => {
    try {
        const response = await axiosInstance.delete(`/eliminar-estudiante/${dni}`);
        return response.data;
    } catch (error) {
        const message = FormatError(error);
        return { error: message };
    }
};

// Desactivar estudiante (eliminación lógica)
const deactivateEstd = async (dni) => {
    try {
        const response = await axiosInstance.patch(`/eliminar-estudiante/desactivar/${dni}`);
        return response.data;
    } catch (error) {
        const message = FormatError(error);
        return { error: message };
    }
};

// Obtener estado documental por idInscripcion
const getEstadoDocumental = async (idInscripcion) => {
    try {
        const response = await axiosInstance.get(`/estado-documental/${idInscripcion}`);
        // Normalize backend shape to { success, data: { subidos, faltantes } }
        if (response && response.data) {
            const resp = response.data;
            if (resp.success) {
                // backend may return { requeridos, presentados, faltantes } or { subidos, faltantes }
                const subidos = resp.presentados || resp.subidos || [];
                const faltantes = resp.faltantes || [];
                return { success: true, data: { subidos, faltantes, requeridos: resp.requeridos || [] } };
            }
            return resp;
        }
        return { success: false, error: 'Respuesta inválida del servidor' };
    } catch (error) {
        return { success: false, error: error.message || 'Error al consultar estado documental.' };
    }
};

// Actualizar solo el estado de inscripción
const updateEstadoInscripcion = async (dni, estadoInscripcionId, estadoAnterior) => {
    try {
        console.log('🎯 Actualizando estado de inscripción:', { dni, estadoInscripcionId, estadoAnterior });
        const response = await axiosInstance.put(`/actualizar-estado-inscripcion/${dni}`, {
            estadoInscripcionId,
            estadoAnterior
        });
        console.log('✅ Respuesta actualización estado:', response.data);
        return response.data;
    } catch (error) {
        console.error('🚨 Error al actualizar estado de inscripción:', error);
        const message = FormatError(error);
        return { error: message, success: false };
    }
};

export default {
    updateEstd,
    deleteEstd,
    deactivateEstd,
    getAll,
    getPaginatedEstudiantes,
    getPaginatedAllEstudiantes,
    getDocumentosFaltantes,
    getEstudiantePorDNI,
    getEstadoDocumental,
    updateEstadoInscripcion,
    // Server-side search endpoint
    buscarEstudiantes: async (q, modalidadId, estadoId, page = 1, limit = 5, filtroActivo) => {
        try {
            let endpoint = `/buscar-estudiantes?q=${encodeURIComponent(q || '')}&page=${page}&limit=${limit}`;
            // Pasar filtroActivo si está definido (activos/desactivados)
            if (filtroActivo === 'activos' || filtroActivo === 'activo' || filtroActivo === 1 || filtroActivo === '1') {
                endpoint += '&activo=1';
            } else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos' || filtroActivo === 'desactivado' || filtroActivo === 0 || filtroActivo === '0') {
                endpoint += '&activo=0';
            }
            if (typeof modalidadId === 'number' && !isNaN(modalidadId)) endpoint += `&modalidadId=${modalidadId}`;
            if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
                const parsed = Number(estadoId);
                if (!isNaN(parsed)) endpoint += `&estadoId=${parsed}`;
            }
            const response = await axiosInstance.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('🚨 Error en buscarEstudiantes:', error);
            const message = FormatError(error);
            return { error: message, success: false };
        }
    }
};