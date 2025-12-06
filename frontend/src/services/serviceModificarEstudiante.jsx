import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

// Modificar estudiante y domicilio
const modificarEstudiante = async (dni, data) => {
    try {
        const response = await axiosInstance.put(`/modificar-estudiante/${dni}`, data);
        return response.data;
    } catch (error) {
        const msg = FormatError(error);
        return { success: false, message: msg };
    }
};

export default {
    modificarEstudiante
};
