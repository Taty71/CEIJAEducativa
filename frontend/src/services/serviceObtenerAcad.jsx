import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';


//obtener curso/plan estudio

/// Obtener módulos por plan
const getModulos = async (idPlan) => {
    try {
        const response = await axiosInstance.get(`/modulos/${idPlan}`); // Ruta correcta
        return response.data;
    } catch (error) {
        console.error('Error al obtener los módulos:', error);
        return { error: FormatError(error) };
    }
};

// Obtener áreas de estudio por módulo
const getAreasEstudio = async (idModulo) => {
    try {
        const response = await axiosInstance.get(`/areas/${idModulo}`); // Ruta correcta
        return response.data;
    } catch (error) {
        console.error('Error al obtener las áreas de estudio:', error);
        return { error: FormatError(error) };
    }
};

// Obtener materias por área de estudio
const getMateriasPorArea = async (idAreaEstudio) => {
    try {
        const response = await axiosInstance.get(`/materias/${idAreaEstudio}`); // Ruta correcta
        return response.data;
    } catch (error) {
        console.error('Error al obtener materias:', error);
        return { error: FormatError(error) };
    }
};
const getEstadosInscripcion = async () => {
    try {
        const response = await axiosInstance.get('/estados-inscripcion');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los estados de inscripción:', error);
        return { error: FormatError(error) };
    }
};

// Obtener divisiones por año/plan
const getDivisiones = async (idAnioPlan) => {
    try {
        const response = await axiosInstance.get(`/divisiones/anio/${idAnioPlan}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener divisiones:', error);
        return { error: FormatError(error) };
    }
};

// Exportar los servicios
export default {
    getModulos,
    getAreasEstudio,
    getMateriasPorArea,
    getEstadosInscripcion,
    getDivisiones,
};