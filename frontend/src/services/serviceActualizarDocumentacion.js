const API_URL = 'http://localhost:3006';

/**
 * Actualiza la documentación de un estudiante existente
 * @param {string} dni - DNI del estudiante
 * @param {number} idInscripcion - ID de la inscripción a actualizar
 * @param {Array<File>} archivos - Array de archivos a subir
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const actualizarDocumentacionExistente = async (dni, idInscripcion, archivos) => {
    try {
        const formData = new FormData();
        
        // Agregar cada archivo al FormData
        archivos.forEach((archivo, index) => {
            if (archivo && archivo.file) {
                formData.append('archivos', archivo.file);
                console.log(`📎 Agregado archivo ${index + 1}: ${archivo.tipo} (${archivo.file.name})`);
            }
        });

        console.log(`📤 Actualizando documentación para DNI ${dni}, inscripción ${idInscripcion}...`);

        const response = await fetch(
            `${API_URL}/api/actualizar-documentacion-existente/${dni}/${idInscripcion}`,
            {
                method: 'POST',
                body: formData,
                // No establecer Content-Type, el navegador lo hará automáticamente con el boundary correcto
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        console.log(`✅ Documentación actualizada exitosamente:`, resultado);

        // Emitir evento para actualizar la UI
        try {
            window.dispatchEvent(new CustomEvent('registroWeb:actualizado', { 
                detail: { 
                    dni, 
                    idInscripcion,
                    actualizacionDocumentacion: true 
                } 
            }));
            console.log('🔔 Evento emitido: registroWeb:actualizado (actualización de documentación)');
        } catch (evErr) {
            console.warn('⚠️ No se pudo emitir evento', evErr.message);
        }

        return resultado;

    } catch (error) {
        console.error('❌ Error al actualizar documentación:', error);
        throw error;
    }
};

/**
 * Verifica si un estudiante existe por DNI
 * @param {string} dni - DNI del estudiante
 * @returns {Promise<Object>} Información del estudiante si existe
 */
export const verificarEstudiante = async (dni) => {
    try {
        console.log(`🔍 Verificando estudiante con DNI ${dni}...`);

        const response = await fetch(`${API_URL}/api/verificar-estudiante/${dni}`);

        if (!response.ok) {
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
