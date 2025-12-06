const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener módulos por plan
router.get('/:idPlan', async (req, res) => {
    const { idPlan } = req.params;
    if (!idPlan || isNaN(Number(idPlan))) {
        return res.status(400).json({ message: 'ID de plan inválido.' });
    }
    try {
        const [modulos] = await db.query('SELECT * FROM modulos WHERE idAPlan = ?', [idPlan]);
        res.json(modulos);
    } catch (error) {
        console.error('Error al obtener módulos:', error);
        res.status(500).json({ message: 'Error al obtener módulos.' });
    }
});

module.exports = router;