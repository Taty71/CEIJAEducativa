const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las divisiones
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM divisiones');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener divisiones' });
    }
});

// Obtener divisiones por año/plan
router.get('/anio/:idAnioPlan', async (req, res) => {
    try {
        const { idAnioPlan } = req.params;
        const [rows] = await db.query('SELECT * FROM divisiones WHERE idAnioPlan = ? ORDER BY division ASC', [idAnioPlan]);

        // Reglas de negocio: Divisiones permitidas por año
        const allowedMap = {
            1: ['A', 'B', 'C'], // 1ro
            2: ['A', 'B'],      // 2do
            3: ['A']            // 3ro
        };

        const allowed = allowedMap[idAnioPlan] || [];

        // Filtrar y eliminar duplicados (usando la primera ocurrencia)
        const uniqueDivisions = [];
        const seen = new Set();

        for (const row of rows) {
            if (allowed.includes(row.division) && !seen.has(row.division)) {
                uniqueDivisions.push(row);
                seen.add(row.division);
            }
        }

        res.json(uniqueDivisions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener divisiones por año' });
    }
});

module.exports = router;
