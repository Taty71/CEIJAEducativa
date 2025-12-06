const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const db = require('../db');

// Configurar multer para archivos
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../archivosDocumento'));
    },
    filename: (req, file, cb) => {
        const nombre = (req.body.nombre || 'sin_nombre').trim().replace(/\s+/g, '_');
        const apellido = (req.body.apellido || 'sin_apellido').trim().replace(/\s+/g, '_');
        const dni = (req.body.dni || req.params.dni || 'sin_dni');
        const campo = file.fieldname;
        const ext = path.extname(file.originalname);
        
        const filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
        console.log(`📁 [ACTUALIZAR] Guardando archivo: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({ storage });

/**
 * POST /api/actualizar-documentacion-existente/:dni/:idInscripcion
 * Actualiza la documentación de un estudiante existente agregando o reemplazando archivos
 */
router.post('/:dni/:idInscripcion', upload.any(), async (req, res) => {
    try {
        const { dni, idInscripcion } = req.params;
        console.log(`📝 [ACTUALIZAR] Iniciando actualización de documentación para DNI: ${dni}, Inscripción: ${idInscripcion}`);
        
        // Verificar que el estudiante existe
        const [estudianteRows] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
        if (!estudianteRows || estudianteRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Estudiante con DNI ${dni} no encontrado`
            });
        }
        
        const estudiante = estudianteRows[0];
        console.log(`✅ [ACTUALIZAR] Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido} (ID: ${estudiante.id})`);
        
        // Verificar que la inscripción existe y pertenece al estudiante
        const [inscripcionRows] = await db.query(
            'SELECT * FROM inscripciones WHERE idInscripcion = ? AND idEstudiante = ?',
            [idInscripcion, estudiante.id]
        );
        
        if (!inscripcionRows || inscripcionRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Inscripción ${idInscripcion} no encontrada para este estudiante`
            });
        }
        
        console.log(`📋 [ACTUALIZAR] Inscripción válida encontrada`);
        
        // Procesar archivos nuevos
        const archivosNuevos = {};
        const archivosActualizados = [];
        
        if (req.files && req.files.length > 0) {
            console.log(`📎 [ACTUALIZAR] Procesando ${req.files.length} archivo(s) nuevo(s)`);
            
            for (const file of req.files) {
                const rutaArchivo = `/archivosDocumento/${file.filename}`;
                archivosNuevos[file.fieldname] = rutaArchivo;
                
                // Obtener id de documentación por el fieldname
                const [docRows] = await db.query(
                    'SELECT id FROM documentaciones WHERE descripcionDocumentacion = ?',
                    [file.fieldname]
                );
                
                if (docRows && docRows.length > 0) {
                    const idDocumentacion = docRows[0].id;
                    
                    // Verificar si ya existe un registro en detalle_inscripcion para esta documentación
                    const [detalleRows] = await db.query(
                        'SELECT * FROM detalle_inscripcion WHERE idInscripcion = ? AND idDocumentaciones = ?',
                        [idInscripcion, idDocumentacion]
                    );
                    
                    if (detalleRows && detalleRows.length > 0) {
                        // ACTUALIZAR registro existente
                        await db.query(
                            `UPDATE detalle_inscripcion 
                             SET archivoDocumentacion = ?, 
                                 estadoDocumentacion = 'Entregado',
                                 fechaEntrega = NOW()
                             WHERE idInscripcion = ? AND idDocumentaciones = ?`,
                            [rutaArchivo, idInscripcion, idDocumentacion]
                        );
                        console.log(`🔄 [ACTUALIZAR] Documento actualizado: ${file.fieldname}`);
                        archivosActualizados.push({
                            tipo: file.fieldname,
                            accion: 'actualizado',
                            ruta: rutaArchivo
                        });
                    } else {
                        // INSERTAR nuevo registro
                        await db.query(
                            `INSERT INTO detalle_inscripcion 
                             (idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion)
                             VALUES (?, ?, 'Entregado', NOW(), ?)`,
                            [idInscripcion, idDocumentacion, rutaArchivo]
                        );
                        console.log(`➕ [ACTUALIZAR] Documento nuevo agregado: ${file.fieldname}`);
                        archivosActualizados.push({
                            tipo: file.fieldname,
                            accion: 'agregado',
                            ruta: rutaArchivo
                        });
                    }
                    
                    // También actualizar tabla archivos_estudiantes si es necesario
                    const [archivoEstRows] = await db.query(
                        'SELECT * FROM archivos_estudiantes WHERE idEstudiante = ? AND tipoArchivo = ?',
                        [estudiante.id, file.fieldname]
                    );
                    
                    if (archivoEstRows && archivoEstRows.length > 0) {
                        await db.query(
                            'UPDATE archivos_estudiantes SET ruta = ?, fechaSubida = NOW() WHERE idEstudiante = ? AND tipoArchivo = ?',
                            [rutaArchivo, estudiante.id, file.fieldname]
                        );
                    } else {
                        await db.query(
                            'INSERT INTO archivos_estudiantes (idEstudiante, tipoArchivo, ruta, fechaSubida) VALUES (?, ?, ?, NOW())',
                            [estudiante.id, file.fieldname, rutaArchivo]
                        );
                    }
                }
            }
        }
        
        // Actualizar Registro_Web.json si corresponde
        try {
            const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');
            const rawWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
            let registrosWeb = JSON.parse(rawWeb || '[]');
            
            const indiceWeb = registrosWeb.findIndex(rw => rw.datos?.dni === dni);
            if (indiceWeb !== -1) {
                registrosWeb[indiceWeb] = {
                    ...registrosWeb[indiceWeb],
                    estado: 'PROCESADO_Y_Completa',
                    fechaActualizacion: new Date().toISOString(),
                    archivos: { ...registrosWeb[indiceWeb].archivos, ...archivosNuevos },
                    observaciones: (registrosWeb[indiceWeb].observaciones || '') + `\nDocumentación actualizada el ${new Date().toLocaleDateString('es-AR')}`
                };
                await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registrosWeb, null, 2));
                console.log(`🔄 [ACTUALIZAR] Registro_Web.json actualizado para DNI ${dni}`);
            }
        } catch (fileErr) {
            console.warn('⚠️ No se pudo actualizar Registro_Web.json:', fileErr.message);
        }
        
        return res.status(200).json({
            success: true,
            message: `Documentación actualizada exitosamente para ${estudiante.nombre} ${estudiante.apellido}`,
            archivosActualizados,
            cantidadArchivos: archivosActualizados.length
        });
        
    } catch (error) {
        console.error('❌ [ACTUALIZAR] Error al actualizar documentación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar documentación',
            userMessage: 'No se pudo actualizar la documentación. Contacte al equipo técnico.',
            technical: error.message
        });
    }
});

module.exports = router;
