import axios from 'axios';

// Servicio para operaciones de extensión de inscripción (reinicio de alarma)
const API_URL = '/api/registros-pendientes';

const extensionInscripcionService = {
  // Obtener todos los registros con extensión activa
  async getRegistrosConExtension() {
    const { data } = await axios.get(`${API_URL}?alarmaReiniciada=true`);
    return data;
  },

  // Solicitar extensión para un registro (requiere autorización director)
  async solicitarExtension({ dni, dias, motivo }) {
    const { data } = await axios.post(`${API_URL}/extension`, {
      dni,
      dias,
      motivo,
    });
    return data;
  },

  // Descargar reporte PDF desde backend (opcional, si se implementa en backend)
  async descargarReporteExtension() {
    const response = await axios.get(`${API_URL}/reporte-extension`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default extensionInscripcionService;
