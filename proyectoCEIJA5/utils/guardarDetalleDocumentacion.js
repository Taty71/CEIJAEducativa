module.exports = async function guardarDetalleDocumentacion(detalleDocumentacion, archivosMap, idInscripcion, db) {
    for (const doc of detalleDocumentacion) {
    try {   
            const archivo = archivosMap[doc.archivoDocumentacion] || null;
        console.log("🔍 Insertando documento:");
            console.log({
                estado: doc.estadoDocumentacion,
                fecha: doc.fechaEntrega,
                idDoc: doc.idDocumentaciones,
                idInscripcion,
                archivo
            });
        await db.query(
            'INSERT INTO detalle_inscripcion (estadoDocumentacion, fechaEntrega, idDocumentaciones, idInscripcion, archivoDocumentacion) VALUES (?, ?, ?, ?, ?)',
            [
                doc.estadoDocumentacion,
                doc.fechaEntrega,
                doc.idDocumentaciones,
                idInscripcion,
                archivosMap[doc.archivoDocumentacion] || null
            ]
        );
    } catch (error) {
            console.error("❌ Error al insertar documento con:", doc);
            console.error("❌ Error específico:", error.sqlMessage || error.message);
            throw error;
        }
    }
};