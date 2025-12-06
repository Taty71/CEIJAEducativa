const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los estados de inscripción
router.get('/', async (req, res) => {
    try {
        const [estados] = await db.query('SELECT id, descripcionEstado FROM estado_inscripciones');
        res.json(estados);
    } catch (error) {
        console.error('Error al obtener estados de inscripción:', error);
        res.status(500).json({ message: 'Error al obtener estados de inscripción.' });
    }
});

module.exports = router;