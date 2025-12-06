// Servicio para obtener todos los estudiantes por modalidad y filtros (sin paginación)
import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

const getAllEstudiantesPorModalidad = async (modalidadId, estadoId) => {
    try {
        // Nuevo endpoint dedicado a reportes: devuelve activos e inactivos
        let endpoint = '/reportes-estudiantes?limit=10000'; // Limite alto para traer todos
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
        // No filtro de paginación, ni de activo/inactivo
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error) {
        const message = FormatError(error);
        return { error: message, success: false };
    }
};

export default getAllEstudiantesPorModalidad;
