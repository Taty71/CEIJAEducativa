const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener áreas de estudio por módulo
router.get('/:idModulo', async (req, res) => {
    const { idModulo } = req.params;
    try {
        const [areas] = await db.query(`
            SELECT DISTINCT ae.* 
            FROM area_estudio ae
            JOIN materia_plan mp ON ae.id = mp.idAEs
            WHERE mp.idModul = ?
        `, [idModulo]);
        res.json(areas);
    } catch (error) {
        console.error('Error al obtener áreas de estudio:', error);
        res.status(500).json({ message: 'Error al obtener áreas de estudio.' });
    }
});

module.exports = router;