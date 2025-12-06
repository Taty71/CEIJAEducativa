// utils/obtenerDocumentacionFaltante.js


/**
 * Obtiene el estado documental completo para una inscripción.
 * @param {Object} params
 * @param {Array} params.tiposDocumentacion - Array de objetos {id, descripcionDocumentacion}
 * @param {Array} params.detalleInscripcion - Array de objetos {idDocumentaciones, archivoDocumentacion}
 * @returns {Object} - { requeridos: [...], presentados: [...], faltantes: [...] }
 */
function obtenerDocumentacionFaltante({ tiposDocumentacion, detalleInscripcion }) {
    // Mapear los ids de documentos presentados con archivo
    const presentadosIds = detalleInscripcion
        .filter(doc => doc.archivoDocumentacion)
        .map(doc => doc.idDocumentaciones);

    // Todos los requeridos
    const requeridos = tiposDocumentacion.map(doc => doc.descripcionDocumentacion);

    // Presentados: los requeridos que tienen archivo
    const presentados = tiposDocumentacion
        .filter(doc => presentadosIds.includes(doc.id))
        .map(doc => doc.descripcionDocumentacion);

    // Faltantes: los requeridos que no están en presentados
    const faltantes = requeridos.filter(doc => !presentados.includes(doc));

    return { requeridos, presentados, faltantes };
}

module.exports = obtenerDocumentacionFaltante;

// Este módulo obtiene la documentación faltante para un estudiante dado su ID.
// Realiza una consulta que selecciona las documentaciones que no han sido entregadas por el