// Servicio frontend para notificaciones de estudiantes inscriptos
import axiosInstance from '../config/axios';
import FormatError from '../utils/MensajeError';

export const notificacionesEstudiantesService = {
  enviarEmailIndividual: async (dni, options = {}) => {
    try {
      const payload = { dni };
      if (options && typeof options === 'object') {
        if (options.subject) payload.subject = options.subject;
        if (options.body) payload.body = options.body;
        if (options.attachComprobante) payload.attachComprobante = true;
        if (options.documentos) payload.documentos = options.documentos;
      }

      const resp = await axiosInstance.post('/notificaciones-estudiantes/enviar-individual', payload);
      return resp.data;
    } catch (error) {
      console.error('Error en notificacionesEstudiantesService.enviarEmailIndividual:', error);
      throw new Error(FormatError(error));
    }
  }
};
