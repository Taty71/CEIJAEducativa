module.exports = async function insertarInscripcion(db, idEstudiante, modalidadId, planAnioId, modulosId, estadoInscripcionId, fechaInscripcion) {
    const [inscripcionResult] = await db.query(
        `INSERT INTO inscripciones (fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion)
         VALUES (${fechaInscripcion}, ?, ?, ?, ?, ?)`,
        [idEstudiante, modalidadId, planAnioId, modulosId, estadoInscripcionId]
    );
    return inscripcionResult.insertId;
};