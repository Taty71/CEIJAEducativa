import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

// Registrar usuario
const createU = async (data) => {
    try {
        const token = localStorage.getItem('token'); // Recupera el token de localStorage
        const headers = token
            ? { Authorization: `Bearer ${token}` } // Incluye el token si existe
            : {}; // No incluye el encabezado Authorization si no hay token

        // Usa la constante headers en la configuración de la solicitud
        const response = await axiosInstance.post('/users/register', data, { headers });
        console.log('Respuesta completa del servidor:', response);
        return response.data; // Devuelve solo los datos del servidor
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data
            : 'Error de conexión con el servidor.';
        console.error('Error al enviar:', errorMessage);
        return { success: false, message: errorMessage };
    }
};

// Logueo
const getUser = async (data) => {
    try {
        const response = await axiosInstance.post('/users/login', data); // Nueva ruta
        console.log('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data
            : "Error de conexión con el servidor.";
        console.error('Error obteniendo los datos del usuario:', errorMessage);
        return FormatError(error); // Usa la función para manejar el error
    }
};
export default {
    createU,
    getUser,
}