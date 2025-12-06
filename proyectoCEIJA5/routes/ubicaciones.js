const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Ruta de ubicaciones funcionando!' });
});

// Obtener todas las provincias
router.get('/provincias', async (req, res) => {
    try {
        const [provincias] = await db.query('SELECT * FROM provincias ORDER BY nombre');
        res.status(200).json({ success: true, data: provincias });
    } catch (error) {
        console.error('Error al obtener provincias:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Obtener localidades por provincia
router.get('/localidades/:idProvincia', async (req, res) => {
    try {
        const { idProvincia } = req.params;
        const [localidades] = await db.query(
            'SELECT * FROM localidades WHERE idProvincia = ? ORDER BY nombre',
            [idProvincia]
        );
        res.status(200).json({ success: true, data: localidades });
    } catch (error) {
        console.error('Error al obtener localidades:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Obtener barrios por localidad
router.get('/barrios/:idLocalidad', async (req, res) => {
    try {
        const { idLocalidad } = req.params;
        const [barrios] = await db.query(
            'SELECT * FROM barrios WHERE idLocalidad = ? ORDER BY nombre',
            [idLocalidad]
        );
        res.status(200).json({ success: true, data: barrios });
    } catch (error) {
        console.error('Error al obtener barrios:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Agregar nueva provincia (solo admin)
router.post('/provincias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const [result] = await db.query('INSERT INTO provincias (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ 
            success: true, 
            data: { id: result.insertId, nombre },
            message: 'Provincia creada exitosamente.' 
        });
    } catch (error) {
        console.error('Error al crear provincia:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Agregar nueva localidad (solo admin)
router.post('/localidades', async (req, res) => {
    try {
        const { nombre, idProvincia } = req.body;
        const [result] = await db.query(
            'INSERT INTO localidades (nombre, idProvincia) VALUES (?, ?)',
            [nombre, idProvincia]
        );
        res.status(201).json({ 
            success: true, 
            data: { id: result.insertId, nombre, idProvincia },
            message: 'Localidad creada exitosamente.' 
        });
    } catch (error) {
        console.error('Error al crear localidad:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Agregar nuevo barrio (solo admin)
router.post('/barrios', async (req, res) => {
    try {
        const { nombre, idLocalidad } = req.body;
        const [result] = await db.query(
            'INSERT INTO barrios (nombre, idLocalidad) VALUES (?, ?)',
            [nombre, idLocalidad]
        );
        res.status(201).json({ 
            success: true, 
            data: { id: result.insertId, nombre, idLocalidad },
            message: 'Barrio creado exitosamente.' 
        });
    } catch (error) {
        console.error('Error al crear barrio:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

module.exports = router;