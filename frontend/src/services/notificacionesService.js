// Servicio para manejar notificaciones por email
export const notificacionesService = {
    // Obtener registros pendientes desde el backend
    obtenerRegistrosPendientes: async () => {
        try {
            const response = await fetch('/api/notificaciones/registros-pendientes');
            
            if (!response.ok) {
                throw new Error('Error al obtener registros pendientes');
            }
            
            const data = await response.json();
            return data.registros || [];
        } catch (error) {
            console.error('Error al obtener registros pendientes:', error);
            throw error;
        }
    },

    // Enviar email individual
    enviarEmailIndividual: async (dni, options = {}) => {
        try {
            const payload = { dni };
            if (options && typeof options === 'object') {
                if (options.subject) payload.subject = options.subject;
                if (options.body) payload.body = options.body;
                if (options.attachComprobante) payload.attachComprobante = true;
            }

            const response = await fetch('/api/notificaciones/enviar-individual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar email');
            }
            
            return data;
        } catch (error) {
            console.error('Error al enviar email individual:', error);
            throw error;
        }
    },

    // Enviar emails masivos
    enviarEmailsMasivos: async () => {
        try {
            const response = await fetch('/api/notificaciones/enviar-masivo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar emails');
            }
            
            return data;
        } catch (error) {
            console.error('Error al enviar emails masivos:', error);
            throw error;
        }
    },

    // Enviar emails urgentes
    enviarEmailsUrgentes: async (diasUmbral = 3) => {
        try {
            const response = await fetch('/api/notificaciones/enviar-urgentes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ diasUmbral })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar emails urgentes');
            }
            
            return data;
        } catch (error) {
            console.error('Error al enviar emails urgentes:', error);
            throw error;
        }
    },

    // Eliminar registro pendiente
    eliminarRegistro: async (dni) => {
        try {
            const response = await fetch(`/api/notificaciones/eliminar-registro/${dni}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar registro');
            }
            
            return data;
        } catch (error) {
            console.error('Error al eliminar registro:', error);
            throw error;
        }
    },

    // Completar registro pendiente
    completarRegistro: async (dni) => {
        try {
            const response = await fetch('/api/notificaciones/completar-registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dni })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al completar registro');
            }
            
            return data;
        } catch (error) {
            console.error('Error al completar registro:', error);
            throw error;
        }
    }
};