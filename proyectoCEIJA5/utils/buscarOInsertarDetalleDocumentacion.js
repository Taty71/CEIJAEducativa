const buscarOInsertarDetalleDocumentacion = async (db, idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion) => {
    // Verificar si el detalle ya existe
    const [existente] = await db.query(
        `SELECT id, archivoDocumentacion FROM detalle_inscripcion 
         WHERE idInscripcion = ? AND idDocumentaciones = ?`,
        [idInscripcion, idDocumentaciones]
    );

    if (existente.length) {
        // Si ya existe, actualizar el registro
        const registroExistente = existente[0];
        const archivoFinal = archivoDocumentacion || registroExistente.archivoDocumentacion;
        
        await db.query(
            `UPDATE detalle_inscripcion 
             SET estadoDocumentacion = ?, fechaEntrega = ?, archivoDocumentacion = ?
             WHERE id = ?`,
            [estadoDocumentacion, fechaEntrega, archivoFinal, registroExistente.id]
        );
        
        console.log(`📝 [ACTUALIZADO] Detalle documentación ID: ${registroExistente.id} - Documento: ${idDocumentaciones} - Archivo: ${archivoFinal}`);
        return registroExistente.id;
    }

    // Si no existe, insertar el nuevo detalle
    const [resultado] = await db.query(
        `INSERT INTO detalle_inscripcion 
         (idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion) 
         VALUES (?, ?, ?, ?, ?)`,
        [idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion]
    );

    console.log(`➕ [INSERTADO] Nuevo detalle documentación ID: ${resultado.insertId} - Documento: ${idDocumentaciones} - Archivo: ${archivoDocumentacion}`);
    return resultado.insertId; // Devolver el ID del nuevo registro
};

module.exports = buscarOInsertarDetalleDocumentacion;