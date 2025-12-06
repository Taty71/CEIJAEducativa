import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

// Obtener datos del domicilio por ID
const getDomicilioById = async (idDomicilio) => {
    try {
        const response = await axiosInstance.get(`/datos-domicilio/${idDomicilio}`);
        return response.data.domicilio;
    } catch (error) {
        console.error('Error al obtener el domicilio:', error);
        const message = FormatError(error);
        return { error: message };
    }
};

// Obtener información académica por ID de estudiante
const getInscripcionByEstudianteId = async (idEstudiante, modalidadId) => {
    try {
        // Agrega modalidadId como query param
        const response = await axiosInstance.get(`/datos-inscripcion/${idEstudiante}?modalidadId=${modalidadId}`);
        return response.data.inscripcion;
    } catch (error) {
        console.error('Error al obtener la inscripción:', error);
        const message = FormatError(error);
        return { error: message };
    }
};

// Obtener datos completos del estudiante por DNI
// Permite pasar setAlert para mostrar el error en un alert si ocurre
const getEstudianteCompletoByDni = async (dni, modalidadId, setAlert) => {
    if (!dni || !/^[\d]{7,8}$/.test(String(dni))) {
        if (setAlert) setAlert({ text: 'DNI no válido.', variant: 'error' });
        return { error: 'DNI no válido.' };
    }
    try {
        // Agrega modalidadId como query param
        const { data } = await axiosInstance.get(`/consultar-estudiantes-dni/${dni}?modalidadId=${modalidadId}`);
        return data;
    } catch (error) {
        // Intentar extraer el mensaje específico del backend
        let message = 'Error al buscar el estudiante.';
        
        if (error.response && error.response.data) {
            const backendData = error.response.data;
            // El backend devuelve { success: false, message: "mensaje específico" }
            if (backendData.message) {
                message = backendData.message;
            } else if (backendData.mensaje) {
                message = backendData.mensaje;
            } else if (typeof backendData === 'string') {
                message = backendData;
            } else {
                // Fallback a FormatError solo si no encontramos mensaje específico
                message = FormatError(error);
            }
        } else {
            message = FormatError(error);
        }
        
        if (setAlert) setAlert({ text: message, variant: 'error' });
        return { error: message };
    }
};

export default {
    getDomicilioById,
    getInscripcionByEstudianteId,
    getEstudianteCompletoByDni,
};