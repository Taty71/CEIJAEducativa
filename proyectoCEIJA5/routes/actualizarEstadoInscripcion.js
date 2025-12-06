const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta para actualizar solo el estado de inscripción
router.put('/:dni', async (req, res) => {
    let conn;
    try {
        console.log('🎯 [ESTADO INSCRIPCIÓN] Solicitud de actualización para DNI:', req.params.dni);
        console.log('🎯 [ESTADO INSCRIPCIÓN] Nuevo estado:', req.body.estadoInscripcionId);

        conn = await db.getConnection();
        
        // Buscar estudiante por DNI
        const [estudianteResult] = await conn.query('SELECT id FROM estudiantes WHERE dni = ?', [req.params.dni]);
        if (estudianteResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
        }
        
        const idEstudiante = estudianteResult[0].id;
        
        // Verificar que el nuevo estado sea válido
        const nuevoEstado = parseInt(req.body.estadoInscripcionId, 10);
        if (isNaN(nuevoEstado) || nuevoEstado < 1 || nuevoEstado > 3) {
            return res.status(400).json({ success: false, message: 'Estado de inscripción inválido.' });
        }

        // Actualizar solo el estado de inscripción
        const [result] = await conn.query(
            'UPDATE inscripciones SET idEstadoInscripcion = ? WHERE idEstudiante = ?',
            [nuevoEstado, idEstudiante]
        );

        console.log('✅ [ESTADO INSCRIPCIÓN] Resultado:', {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró inscripción para este estudiante.' });
        }

        // Verificar el cambio
        const [verificacion] = await conn.query(
            'SELECT idEstadoInscripcion FROM inscripciones WHERE idEstudiante = ?',
            [idEstudiante]
        );

        console.log('🔍 [ESTADO INSCRIPCIÓN] Estado después de actualización:', verificacion[0]);

        res.json({ 
            success: true, 
            message: 'Estado de inscripción actualizado correctamente.',
            estadoAnterior: req.body.estadoAnterior,
            estadoNuevo: nuevoEstado,
            estadoActual: verificacion[0].idEstadoInscripcion
        });

    } catch (error) {
        console.error('❌ [ESTADO INSCRIPCIÓN] Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;