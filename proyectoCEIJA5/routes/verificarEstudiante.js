const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/verificar-estudiante/:dni
 * Verifica si un DNI ya existe en la BD y devuelve toda la información del estudiante
 * incluyendo inscripciones y documentación desde detalle_inscripcion
 */
router.get('/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        console.log(`🔍 [VERIFICAR] Consultando estudiante con DNI: ${dni}`);
        
        // Buscar estudiante
        const [estudianteRows] = await db.query(
            'SELECT * FROM estudiantes WHERE dni = ?',
            [dni]
        );
        
        if (!estudianteRows || estudianteRows.length === 0) {
            return res.status(404).json({
                existe: false,
                message: 'DNI no encontrado en la base de datos'
            });
        }
        
        const estudiante = estudianteRows[0];
        console.log(`✅ [VERIFICAR] Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido} (ID: ${estudiante.id})`);
        
        // Buscar inscripciones
        const [inscripcionesRows] = await db.query(`
            SELECT 
                i.id as idInscripcion,
                i.fechaInscripcion,
                i.idEstadoInscripcion,
                m.modalidad as modalidad,
                p.descripcionAnioPlan as plan,
                mo.modulo as modulo,
                e.descripcionEstado as estado
            FROM inscripciones i
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            LEFT JOIN anio_plan p ON i.idAnioPlan = p.id
            LEFT JOIN modulos mo ON i.idModulos = mo.id
            LEFT JOIN estado_inscripciones e ON i.idEstadoInscripcion = e.id
            WHERE i.idEstudiante = ?
            ORDER BY i.fechaInscripcion DESC
        `, [estudiante.id]);
        
        console.log(`📋 [VERIFICAR] ${inscripcionesRows.length} inscripción(es) encontrada(s)`);
        
        // Para cada inscripción, obtener la documentación desde detalle_inscripcion
        const inscripcionesConDocumentacion = [];
        
        for (const inscripcion of inscripcionesRows) {
            const [detalleRows] = await db.query(`
                SELECT 
                    dd.id as idDetalleDocumentacion,
                    dd.idInscripcion,
                    dd.idDocumentaciones,
                    d.descripcionDocumentacion,
                    dd.estadoDocumentacion,
                    dd.fechaEntrega,
                    dd.archivoDocumentacion
                FROM detalle_inscripcion dd
                LEFT JOIN documentaciones d ON dd.idDocumentaciones = d.id
                WHERE dd.idInscripcion = ?
            `, [inscripcion.idInscripcion]);
            
            inscripcionesConDocumentacion.push({
                ...inscripcion,
                documentacion: detalleRows
            });
        }
        
        // Obtener todos los tipos de documentación posibles
        const [tiposDocRows] = await db.query('SELECT * FROM documentaciones ORDER BY id');
        
        return res.status(200).json({
            existe: true,
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                apellido: estudiante.apellido,
                dni: estudiante.dni,
                cuil: estudiante.cuil,
                email: estudiante.email,
                telefono: estudiante.telefono,
                fechaNacimiento: estudiante.fechaNacimiento,
                tipoDocumento: estudiante.tipoDocumento,
                paisEmision: estudiante.paisEmision,
                activo: estudiante.activo
            },
            inscripciones: inscripcionesConDocumentacion,
            tiposDocumentacion: tiposDocRows,
            message: `Estudiante ${estudiante.nombre} ${estudiante.apellido} ya registrado en el sistema`
        });
        
    } catch (error) {
        console.error('❌ [VERIFICAR] Error al verificar estudiante:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar estudiante',
            userMessage: 'No se pudo verificar si el estudiante existe. Contacte al equipo técnico.',
            technical: error.message
        });
    }
});

module.exports = router;
