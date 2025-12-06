import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

// Servicio dedicado a las operaciones de la página ListaEstudiantes
// Centraliza paginación, búsqueda, obtención por DNI y generación de comprobante

const getPaginatedAllEstudiantes = async (page, limit, filtroActivo = 'todos', modalidadId, estadoId, apellidoInicial) => {
  try {
    let endpoint = `/listar-estudiantes?page=${page}&limit=${limit}`;
    if (filtroActivo === 'activos') endpoint += '&activo=1';
    else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos') endpoint += '&activo=0';
    if (typeof modalidadId === 'number' && !isNaN(modalidadId)) endpoint += `&modalidadId=${modalidadId}`;
    if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
      const parsed = Number(estadoId);
      if (!isNaN(parsed)) endpoint += `&estadoId=${parsed}`;
    }
    if (apellidoInicial && typeof apellidoInicial === 'string' && apellidoInicial.trim() !== '') {
      const letter = encodeURIComponent(String(apellidoInicial).trim().charAt(0));
      endpoint += `&apellidoInicial=${letter}`;
    }
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en getPaginatedAllEstudiantes:', error);
    const message = FormatError(error);
    return { error: message, success: false };
  }
};

const getPaginatedEstudiantes = async (page, limit, filtroActivo = 'activos', modalidadId, estadoId, apellidoInicial) => {
  try {
    let endpoint = `/consultar-estudiantes?page=${page}&limit=${limit}`;
    if (filtroActivo === 'activos') endpoint += '&activo=1';
    else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos') endpoint += '&activo=0';
    if (typeof modalidadId === 'number' && !isNaN(modalidadId)) endpoint += `&modalidadId=${modalidadId}`;
    if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
      const parsed = Number(estadoId);
      if (!isNaN(parsed)) endpoint += `&estadoId=${parsed}`;
    }
    if (apellidoInicial && typeof apellidoInicial === 'string' && apellidoInicial.trim() !== '') {
      const letter = encodeURIComponent(String(apellidoInicial).trim().charAt(0));
      endpoint += `&apellidoInicial=${letter}`;
    }
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en getPaginatedEstudiantes:', error);
    const message = FormatError(error);
    return { error: message, success: false };
  }
};

const getEstudiantePorDNI = async (dni, modalidadId) => {
  try {
    const endpoint = `/consultar-estudiantes-dni/${encodeURIComponent(dni)}` + (typeof modalidadId !== 'undefined' ? `?modalidadId=${modalidadId}` : '');
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en getEstudiantePorDNI:', error);
    const message = FormatError(error);
    return { error: message, success: false };
  }
};

const buscarEstudiantes = async (q, modalidadId, estadoId, page = 1, limit = 5, filtroActivo) => {
  try {
    let endpoint = `/buscar-estudiantes?q=${encodeURIComponent(q || '')}&page=${page}&limit=${limit}`;
    if (filtroActivo === 'activos') endpoint += '&activo=1';
    else if (filtroActivo === 'desactivados' || filtroActivo === 'inactivos') endpoint += '&activo=0';
    if (typeof modalidadId === 'number' && !isNaN(modalidadId)) endpoint += `&modalidadId=${modalidadId}`;
    if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
      const parsed = Number(estadoId);
      if (!isNaN(parsed)) endpoint += `&estadoId=${parsed}`;
    }
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en buscarEstudiantes:', error);
    const message = FormatError(error);
    return { error: message, success: false };
  }
};

const generarComprobante = async (dni) => {
  try {
    const resp = await axiosInstance.post('/generar-comprobante', { dni }, { responseType: 'blob' });
    return resp.data; // Blob
  } catch (error) {
    console.error('Error en generarComprobante:', error);
    const message = FormatError(error);
    throw new Error(message);
  }
};

export default {
  getPaginatedAllEstudiantes,
  getPaginatedEstudiantes,
  getEstudiantePorDNI,
  buscarEstudiantes,
  generarComprobante
};
