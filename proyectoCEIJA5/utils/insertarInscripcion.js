module.exports = async function insertarInscripcion(db, idEstudiante, modalidadId, planAnioId, modulosId, estadoInscripcionId, fechaInscripcion, idDivision = null) {
    const [inscripcionResult] = await db.query(
        `INSERT INTO inscripciones (fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion, idDivision)
         VALUES (${fechaInscripcion}, ?, ?, ?, ?, ?, ?)`,
        [idEstudiante, modalidadId, planAnioId, modulosId, estadoInscripcionId, idDivision]
    );
    return inscripcionResult.insertId;
};