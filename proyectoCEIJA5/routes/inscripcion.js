const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que `db` esté configurado correctamente

// Endpoint para crear una inscripción
router.post('/inscripcion', async (req, res) => {
    try {
        const { nombre, apellido, dni, modalidad, planAnio } = req.body;

        if (!nombre || !apellido || !dni || !modalidad || !planAnio) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios: nombre, apellido, dni, modalidad, planAnio.'
            });
        }

        const query = `
            INSERT INTO inscripciones (nombre, apellido, dni, modalidad, planAnio)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [nombre, apellido, dni, modalidad, planAnio];

        const [result] = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Inscripción creada exitosamente',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al crear inscripción',
            error: error.message
        });
    }
});

// Endpoint para obtener una inscripción por ID
router.get('/inscripcion/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM inscripciones WHERE id = ?';
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener inscripción',
            error: error.message
        });
    }
});

// Endpoint para actualizar una inscripción
router.put('/inscripcion/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, modalidad, planAnio } = req.body;

        const query = `
            UPDATE inscripciones
            SET nombre = ?, apellido = ?, dni = ?, modalidad = ?, planAnio = ?
            WHERE id = ?
        `;
        const values = [nombre, apellido, dni, modalidad, planAnio, id];

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inscripción actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al actualizar inscripción',
            error: error.message
        });
    }
});

// Endpoint para eliminar una inscripción
router.delete('/inscripcion/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM inscripciones WHERE id = ?';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inscripción eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al eliminar inscripción',
            error: error.message
        });
    }
});

module.exports = router;
