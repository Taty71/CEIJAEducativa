const db = require('../db');

/**
 * Obtiene la documentación asociada a una inscripción,
 * incluyendo todos los tipos definidos en la tabla documentaciones.
 * Los faltantes se marcan como "Faltante".
 */
async function obtenerDocumentacionPorInscripcion(idInscripcion) {
  if (isNaN(idInscripcion)) {
    throw new Error('ID de inscripción inválido.');
  }

  // Traer todos los tipos de documentación
  const [tiposDoc] = await db.query(
    `SELECT id, descripcionDocumentacion FROM documentaciones`
  );

  // Traer la documentación entregada para la inscripción
  const [rows] = await db.query(
    `SELECT
       d.idDocumentaciones,
       doc.descripcionDocumentacion,
       d.estadoDocumentacion,
       d.fechaEntrega,
       d.archivoDocumentacion
     FROM detalle_inscripcion d
     JOIN documentaciones doc ON doc.id = d.idDocumentaciones
     WHERE d.idInscripcion = ?`,
    [idInscripcion]
  );

  // Mapear entregados por idDocumentaciones
  const entregadosMap = {};
  rows.forEach(doc => {
    entregadosMap[doc.idDocumentaciones] = doc;
  });

  // Construir el array completo, marcando faltantes
  const documentacionCompleta = tiposDoc.map(tipo => {
    if (entregadosMap[tipo.id]) {
      return entregadosMap[tipo.id];
    }
    return {
      idDocumentaciones: tipo.id,
      descripcionDocumentacion: tipo.descripcionDocumentacion,
      estadoDocumentacion: 'Faltante',
      fechaEntrega: null,
      archivoDocumentacion: null
    };
  });

  return documentacionCompleta;
}

module.exports = obtenerDocumentacionPorInscripcion;
