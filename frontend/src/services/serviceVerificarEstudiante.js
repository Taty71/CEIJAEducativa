const API_URL = 'http://localhost:5000';

/**
 * Verifica si un estudiante existe por DNI y obtiene su documentación completa
 * @param {string} dni - DNI del estudiante
 * @returns {Promise<Object>} Información del estudiante si existe
 */
export const verificarEstudiante = async (dni) => {
    try {
        console.log(`🔍 Verificando estudiante con DNI ${dni}...`);

        const response = await fetch(`${API_URL}/api/verificar-estudiante/${dni}`);

        if (!response.ok) {
            if (response.status === 404) {
                // Estudiante no encontrado - esto es normal para nuevos registros
                console.log(`ℹ️ Estudiante con DNI ${dni} no encontrado en BD (normal para nuevos registros)`);
                return { existe: false, message: 'DNI no encontrado en la base de datos' };
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        console.log(`✅ Verificación completada:`, resultado.existe ? 'Estudiante encontrado' : 'Estudiante no encontrado');

        return resultado;

    } catch (error) {
        console.error('❌ Error al verificar estudiante:', error);
        throw error;
    }
};

/**
 * Enriquece un registro pendiente con información de la BD
 * SIEMPRE verifica BD independientemente del estado del registro
 * @param {Object} registro - Registro pendiente del JSON
 * @returns {Promise<Object>} Registro enriquecido con documentación de BD
 */
export const enriquecerRegistroProcesado = async (registro) => {
    try {
        const dni = registro.datos?.dni || registro.dni;
        if (!dni) {
            console.warn('⚠️ Registro sin DNI, no se puede enriquecer');
            return registro;
        }

        const infoEstudiante = await verificarEstudiante(dni);

        if (!infoEstudiante.existe) {
            // No existe en BD - devolver registro sin modificar
            return {
                ...registro,
                estudianteEnBD: false
            };
        }

        // Enriquecer el registro con la documentación de la BD
        const registroEnriquecido = {
            ...registro,
            estudianteEnBD: true,
            idEstudiante: infoEstudiante.estudiante.id_estudiante,
            inscripcionesBD: infoEstudiante.inscripciones,
            // Tomar la documentación de TODAS las inscripciones combinadas
            documentacionBD: infoEstudiante.inscripciones.reduce((docs, insc) => {
                return [...docs, ...(insc.documentacion || [])];
            }, [])
        };

        console.log(`✅ Registro ${dni} enriquecido con documentación de BD:`, 
            registroEnriquecido.documentacionBD.length, 'documentos desde',
            infoEstudiante.inscripciones.length, 'inscripción(es)');

        return registroEnriquecido;

    } catch (error) {
        if (error.message === 'Error HTTP: 404') {
            // No es realmente un error, solo significa que el estudiante no está en BD
            return {
                ...registro,
                estudianteEnBD: false
            };
        }
        console.error(`❌ Error al enriquecer registro ${registro.dni}:`, error);
        return {
            ...registro,
            estudianteEnBD: false
        }; // Devolver con flag false si falla
    }
};
