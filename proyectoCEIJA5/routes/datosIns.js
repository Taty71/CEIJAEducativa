const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener inscripción completa por ID de estudiante
router.get('/inscripciones/:idEstudiante', async (req, res) => {
    try {
        const { idEstudiante } = req.params;
        const modalidadId = Number(req.query.modalidadId); // <-- recibe modalidadId

        // Consulta para obtener los datos completos de inscripción
        let sql = `
            SELECT 
                inscripciones.fechaInscripcion,
                modalidades.modalidad AS modalidad,
                anio_plan.descripcionAnioPlan AS plan,
                modulos.modulo AS modulo,
                divisiones.division AS division,
                inscripciones.idDivision,
                estado_inscripciones.descripcionEstado AS estado
            FROM inscripciones
            INNER JOIN modalidades ON inscripciones.idModalidad = modalidades.id
            INNER JOIN anio_plan ON inscripciones.idAnioPlan = anio_plan.id
            INNER JOIN modulos ON inscripciones.idModulos = modulos.id
            LEFT JOIN divisiones ON inscripciones.idDivision = divisiones.id
            INNER JOIN estado_inscripciones ON inscripciones.idEstadoInscripcion = estado_inscripciones.id
            WHERE inscripciones.idEstudiante = ?
        `;
        const params = [idEstudiante];

        if (modalidadId) {
            sql += ' AND inscripciones.idModalidad = ?';
            params.push(modalidadId);
        }

        const [result] = await db.query(sql, params);

        if (result.length > 0) {
            res.status(200).json({ success: true, inscripcion: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'Inscripción no encontrada para la modalidad seleccionada.' });
        }
    } catch (error) {
        console.error('Error al obtener inscripción:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Obtener datos completos del estudiante por DNI
router.get('/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        const modalidadId = req.query.modalidadId ? Number(req.query.modalidadId) : null; // <-- recibe modalidadId

        // Validar que modalidadId sea un número válido si se proporciona
        if (req.query.modalidadId && (isNaN(modalidadId) || modalidadId <= 0)) {
            return res.status(400).json({ success: false, message: 'modalidadId debe ser un número válido mayor que 0.' });
        }

        // Consulta para obtener los datos del estudiante (no filtrar por activo: queremos permitir ver inactivos)
        const [estudianteResult] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
        if (estudianteResult.length === 0) {
            console.log(`[BUSQUEDA DNI] No se encontró estudiante para DNI: ${dni}`);
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
        }
        const estudiante = estudianteResult[0];
        console.log(`[BUSQUEDA DNI] idEstudiante: ${estudiante.id}, modalidadId: ${modalidadId}`);

        // Consulta para obtener los datos completos del domicilio
        const [domicilioResult] = await db.query(`
            SELECT 
                domicilios.calle,
                domicilios.numero,
                barrios.nombre AS barrio,
                localidades.nombre AS localidad,
                provincias.nombre AS provincia
            FROM domicilios
            INNER JOIN barrios ON domicilios.idBarrio = barrios.id
            INNER JOIN localidades ON domicilios.idLocalidad = localidades.id
            INNER JOIN provincias ON domicilios.idProvincia = provincias.id
            WHERE domicilios.id = ?
        `, [estudiante.idDomicilio]);

        const domicilio = domicilioResult.length > 0 ? domicilioResult[0] : null;

        // Consulta para obtener la inscripción filtrada por modalidad
        let inscripcionQuery = `
            SELECT 
                inscripciones.id AS idInscripcion,
                inscripciones.fechaInscripcion,
                modalidades.modalidad AS modalidad,
                anio_plan.descripcionAnioPlan AS plan,
                modulos.modulo AS modulo,
                divisiones.division AS division,
                inscripciones.idDivision,
                estado_inscripciones.descripcionEstado AS estado
            FROM inscripciones
            LEFT JOIN modalidades ON inscripciones.idModalidad = modalidades.id
            LEFT JOIN anio_plan ON inscripciones.idAnioPlan = anio_plan.id
            LEFT JOIN modulos ON inscripciones.idModulos = modulos.id
            LEFT JOIN divisiones ON inscripciones.idDivision = divisiones.id
            LEFT JOIN estado_inscripciones ON inscripciones.idEstadoInscripcion = estado_inscripciones.id
            WHERE inscripciones.idEstudiante = ?
        `;
        const queryParams = [estudiante.id];

        if (modalidadId && modalidadId > 0) {
            inscripcionQuery += ' AND inscripciones.idModalidad = ?';
            queryParams.push(modalidadId);
        }

        const [inscripcionResult] = await db.query(inscripcionQuery, queryParams);
        console.log(`[BUSQUEDA DNI] Inscripciones encontradas:`, inscripcionResult);

        // Si no hay inscripción para la modalidad solicitada, no fallar: devolver la info del estudiante y dejar inscripcion null
        let inscripcion = null;
        if (inscripcionResult && inscripcionResult.length) {
            inscripcion = inscripcionResult[0];
        }

        // Consulta para obtener la documentación si existe inscripción
        let documentacion = [];
        if (inscripcion && inscripcion.idInscripcion) {
            // Traer todos los tipos de documentación
            const [tiposDoc] = await db.query(`
                SELECT id, descripcionDocumentacion
                FROM documentaciones
            `);
            console.log('[DOCS] Tipos de documentación:', tiposDoc);

            // Traer la documentación entregada
            console.log(`[DOCS DEBUG] Buscando documentación para idInscripcion: ${inscripcion.idInscripcion}, estudiante: ${estudiante.nombre} ${estudiante.apellido}, DNI: ${estudiante.dni}`);

            const [documentacionResult] = await db.query(`
                SELECT
                    d.idDocumentaciones,
                    doc.descripcionDocumentacion,
                    d.estadoDocumentacion,
                    d.fechaEntrega,
                    d.archivoDocumentacion
                FROM detalle_inscripcion d
                JOIN documentaciones doc ON doc.id = d.idDocumentaciones
                WHERE d.idInscripcion = ?
            `, [inscripcion.idInscripcion]);
            console.log('[DOCS] Documentación entregada:', documentacionResult);

            // Mapear entregados por idDocumentaciones
            const entregadosMap = {};
            documentacionResult.forEach(doc => {
                // Verificar si el nombre del archivo coincide con el estudiante buscado
                if (doc.archivoDocumentacion) {
                    const archivoNombre = doc.archivoDocumentacion.split('/').pop();
                    const expectedPrefix = `${estudiante.nombre}_${estudiante.apellido}_${estudiante.dni}`;
                    if (!archivoNombre.includes(estudiante.dni)) {
                        console.log(`[DOCS MISMATCH] ⚠️  Archivo no coincide - Estudiante: ${estudiante.nombre} ${estudiante.apellido} (${estudiante.dni}), Archivo: ${archivoNombre}`);
                    }
                }

                entregadosMap[doc.idDocumentaciones] = {
                    ...doc,
                    archivoDocumentacion: doc.archivoDocumentacion
                        ? (doc.archivoDocumentacion.startsWith('/') ? `http://localhost:5000${doc.archivoDocumentacion}` : doc.archivoDocumentacion)
                        : null
                };
            });
            console.log('[DOCS] Mapeo entregados:', entregadosMap);

            // Construir el array completo, marcando faltantes
            documentacion = tiposDoc.map(tipo => {
                if (entregadosMap[tipo.id]) {
                    return entregadosMap[tipo.id];
                }
                return {
                    idDocumentaciones: tipo.id,
                    descripcionDocumentacion: tipo.descripcionDocumentacion,
                    estadoDocumentacion: 'Faltante',
                    fechaEntrega: null,
                    archivoDocumentacion: null
                };
            });
            console.log('[DOCS] Array final de documentación:', documentacion);
        }

        // Respuesta combinada
        res.status(200).json({
            success: true,
            estudiante,
            domicilio,
            inscripcion,
            documentacion
        });
    } catch (error) {
        console.error('Error al obtener datos completos del estudiante:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Listar estudiantes filtrados por modalidadId (y paginación)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, activo, modalidadId } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE e.activo = 1';
        let params = [];
        if (activo !== undefined) {
            whereClause = 'WHERE e.activo = ?';
            params.push(Number(activo));
        }

        // Si modalidadId está definido, usar INNER JOIN en inscripciones y filtrar por modalidad
        let joinInscripciones = 'LEFT JOIN inscripciones i ON e.id = i.idEstudiante';
        let modalidadFilter = '';
        if (modalidadId !== undefined && !isNaN(Number(modalidadId))) {
            joinInscripciones = 'INNER JOIN inscripciones i ON e.id = i.idEstudiante AND i.idModalidad = ?';
            params.push(Number(modalidadId));
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        // Consulta principal
        const [result] = await db.query(`
            SELECT 
                e.id, e.nombre, e.apellido, e.dni, e.cuil, e.fechaNacimiento, e.activo, e.email, e.foto,
                d.calle, d.numero, b.nombre AS barrio, l.nombre AS localidad, p.nombre AS provincia,
                i.idModalidad, i.fechaInscripcion, i.idDivision,
                m.modalidad, 
                div.division,
                a.descripcionAnioPlan AS cursoPlan,
                ei.id AS idEstadoInscripcion,
                ei.descripcionEstado AS estadoInscripcion
            FROM estudiantes e
            LEFT JOIN domicilios d ON e.idDomicilio = d.id
            LEFT JOIN barrios b ON d.idBarrio = b.id
            LEFT JOIN localidades l ON d.idLocalidad = l.id
            LEFT JOIN provincias p ON d.idProvincia = p.id
            ${joinInscripciones}
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
            LEFT JOIN divisiones div ON i.idDivision = div.id
            LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
            ${whereClause}
            ORDER BY i.fechaInscripcion DESC, e.id ASC
            LIMIT ? OFFSET ?
        `, params);

        // Contar total de estudiantes según el filtro
        let countJoinInscripciones = joinInscripciones;
        let countParams = params.slice(0, params.length - 2); // sin limit/offset
        const [total] = await db.query(`SELECT COUNT(*) AS total FROM estudiantes e LEFT JOIN domicilios d ON e.idDomicilio = d.id ${countJoinInscripciones} ${whereClause}`, countParams);

        res.status(200).json({
            success: true,
            estudiantes: Array.isArray(result) ? result.map(estudiante => ({
                ...estudiante,
                fechaInscripcion: estudiante.fechaInscripcion || 'Sin inscripción',
                modalidad: estudiante.modalidad || 'Sin modalidad',
                cursoPlan: estudiante.cursoPlan || 'Sin curso/plan',
                estadoInscripcion: estudiante.estadoInscripcion || 'Sin estado',
                division: estudiante.division || null,
            })) : [],
            total: total[0]?.total || 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil((total[0]?.total || 0) / parseInt(limit)),
        });
    } catch (error) {
        console.error('Error al obtener estudiantes por modalidad:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

module.exports = router;