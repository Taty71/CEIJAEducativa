const express = require('express');
const router = express.Router();
const db = require('../db');
const obtenerDocumentacionFaltante = require('../utils/obtenerDocumentacionFaltante');

// GET /api/estado-documental/:idInscripcion
router.get('/:idInscripcion', async (req, res) => {
    const { idInscripcion } = req.params;
    if (isNaN(idInscripcion)) {
        return res.status(400).json({ success: false, message: 'ID de inscripción inválido.' });
    }
    try {
        // Traer todos los tipos de documentación
        const [tiposDoc] = await db.query('SELECT id, descripcionDocumentacion FROM documentaciones');
        // Traer el detalle de la inscripción
        const [detalle] = await db.query('SELECT idDocumentaciones, archivoDocumentacion FROM detalle_inscripcion WHERE idInscripcion = ?', [idInscripcion]);
        // Calcular estado documental
        const resultado = obtenerDocumentacionFaltante({ tiposDocumentacion: tiposDoc, detalleInscripcion: detalle });
        res.json({ success: true, ...resultado });
    } catch (err) {
        console.error('Error en estado documental:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

module.exports = router;
