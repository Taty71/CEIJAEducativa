const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:idModalidad', async (req, res) => {
    const { idModalidad } = req.params;
    try {
        const [planCurso] = await db.query('SELECT * FROM anio_plan WHERE idModalidad = ?', [idModalidad]);
        res.json(planCurso);
    } catch (error) {
        console.error('Error al obtener plan/curso:', error);
        res.status(500).json({ message: 'Error al obtener plan/curso' });
    }
});

module.exports = router;