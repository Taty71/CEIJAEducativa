const express = require('express');
const router = express.Router();
const db = require('../db');

// Documentos requeridos por plan/año
const docsPrimario = [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'CUIL' },
    { id: 3, nombre: 'Partida de Nacimiento' },
    { id: 4, nombre: 'Ficha Médica' },
    { id: 5, nombre: 'Certificado Nivel Primario' }
];
const docsAnalitico = [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'CUIL' },
    { id: 3, nombre: 'Partida de Nacimiento' },
    { id: 4, nombre: 'Ficha Médica' },
    { id: 6, nombre: 'Analítico Parcial' }
];

// Utilidad para obtener requeridos según plan
function getDocsRequeridos(planAnio) {
    const val = String(planAnio).toLowerCase();
    if (val.includes('a') || val === '1' || val === '4') return docsPrimario;
    if (val.includes('b') || val.includes('c') || val === '2' || val === '3' || val === '5' || val === '6') return docsAnalitico;
    return docsPrimario;
}

router.get('/:dni', async (req, res) => {
    try {
        const dni = req.params.dni;
        // 1. Buscar estudiante y su inscripción
        const [[estudiante]] = await db.query('SELECT id FROM estudiantes WHERE dni = ?', [dni]);
        if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });

        const [[inscripcion]] = await db.query('SELECT id, idAnioPlan FROM inscripciones WHERE idEstudiante = ?', [estudiante.id]);
        if (!inscripcion) return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });

        // 2. Buscar documentos presentados en detalle_inscripcion (por nombre)
        const [detalles] = await db.query(
            `SELECT di.idDocumentaciones, di.archivoDocumentacion, d.descripcionDocumentacion AS nombre
             FROM detalle_inscripcion di
             JOIN documentaciones d ON di.idDocumentaciones = d.id
             WHERE di.idInscripcion = ?`,
            [inscripcion.id]
        );

        // 3. Determinar requeridos según plan
        const requeridos = getDocsRequeridos(inscripcion.idAnioPlan);

        // 4. Filtrar faltantes por nombre
        const presentadosNombres = detalles.filter(d => d.archivoDocumentacion).map(d => d.nombre);
        const documentosFaltantes = requeridos
            .filter(doc => !presentadosNombres.includes(doc.nombre))
            .map(doc => doc.nombre);

        res.json({
            success: true,
            documentosFaltantes
        });
    } catch (error) {
        console.error('Error al obtener documentos faltantes:', error);
        res.status(500).json({ success: false, message: 'Error interno al obtener documentos faltantes.' });
    }
});

module.exports = router;
