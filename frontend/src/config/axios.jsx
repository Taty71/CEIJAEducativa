import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // Base URL del backend
    timeout: 30000, // Tiempo de espera en milisegundos (30 segundos)
});

// Interceptor para agregar el token JWT
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Obtén el token del almacenamiento local
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
