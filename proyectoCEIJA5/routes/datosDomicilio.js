const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/domicilios/:idDomicilio', async (req, res) => {
    try {
        const { idDomicilio } = req.params;
        const [result] = await db.query('SELECT * FROM domicilios WHERE id = ?', [idDomicilio]);
        if (result.length > 0) {
            res.status(200).json({ success: true, domicilio: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'Domicilio no encontrado.' });
        }
    } catch (error) {
        console.error('Error al obtener domicilio:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});
module.exports = router;
