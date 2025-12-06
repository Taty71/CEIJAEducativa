const express = require('express');
const router = express.Router();
const db = require('../db');
const obtenerDocumentacionFaltante = require('../utils/obtenerDocumentacionFaltante');

// Endpoint: GET /api/faltantes/:idEstudiante
router.get('/:idEstudiante', async (req, res) => {
    try {
        const idEstudiante = parseInt(req.params.idEstudiante);
        if (isNaN(idEstudiante)) {
            return res.status(400).json({ message: 'ID de estudiante inválido.' });
        }

        const faltantes = await obtenerDocumentacionFaltante(idEstudiante, db);

        res.status(200).json({
            success: true,
            message: 'Documentación faltante obtenida con éxito.',
            faltantes
        });
    } catch (error) {
        console.error('Error al obtener documentación faltante:', error);
        res.status(500).json({ message: 'Error interno al obtener documentación faltante.' });
    }
});

module.exports = router;
