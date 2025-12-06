const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las materias
router.get('/', async (req, res) => {
try {
        const [materias] = await db.query('SELECT * FROM materias');
        res.json(materias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener materias.' });
    }
});

// Obtener materias por área de estudio
router.get('/:idArea', async (req, res) => {
    const { idArea } = req.params;
    try {
        const [materias] = await db.query(`
            SELECT DISTINCT m.* 
            FROM materias m
            JOIN materia_plan mp ON m.id = mp.idMat
            WHERE mp.idAEs = ?
        `, [idArea]);
        res.json(materias);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ message: 'Error al obtener materias.' });
    }
});

module.exports = router;