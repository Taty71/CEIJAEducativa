const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const guardarDetalleDocumentacion = require('../utils/guardarDetalleDocumentacion');
const buscarOInsertarProvincia = require('../utils/buscarOInsertarProvincia');
const buscarOInsertarLocalidad = require('../utils/buscarOInsertarLocalidad');
const buscarOInsertarBarrio = require('../utils/buscarOInsertarBarrio');
const obtenerRutaFoto = require('../utils/obtenerRutaFoto');



router.get('/buscar/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        const modalidadId = Number(req.query.modalidadId); // <-- recibe modalidadId

        if (isNaN(dni)) {
            return res.status(400).json({ success: false, message: 'DNI inválido.' });
        }

        const [estudiante] = await db.query('SELECT *, email, telefono FROM estudiantes WHERE dni = ? AND activo = 1', [dni]);
        if (estudiante.length === 0) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado o inactivo.' });
        }

        const [domicilio] = await db.query(`
            SELECT 
                d.calle,
                d.numero,
                b.nombre AS barrio,
                l.nombre AS localidad,
                p.nombre AS provincia
            FROM domicilios d
            LEFT JOIN barrios b ON d.idBarrio = b.id
            LEFT JOIN localidades l ON d.idLocalidad = l.id
            LEFT JOIN provincias p ON d.idProvincia = p.id
            WHERE d.id = ?
        `, [estudiante[0].idDomicilio]);

        // Filtrar inscripción por modalidadId
        let inscripcionQuery = `
            SELECT 
                i.id AS idInscripcion,
                i.fechaInscripcion, 
                m.modalidad, 
                a.descripcionAnioPlan AS cursoPlan
            FROM inscripciones i
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
            WHERE i.idEstudiante = ?
        `;
        const queryParams = [estudiante[0].id];

        if (modalidadId) {
            inscripcionQuery += ' AND i.idModalidad = ?';
            queryParams.push(modalidadId);
        }

        const [inscripcion] = await db.query(inscripcionQuery, queryParams);

        // Si no hay inscripción para esa modalidad, devuelve error
        if (!inscripcion.length) {
            return res.status(404).json({ success: false, message: 'No existe inscripción en la modalidad seleccionada.' });
        }

        // Buscar documentación asociada a la inscripción (si existe)
        let documentacion = [];
        if (inscripcion[0] && inscripcion[0].idInscripcion) {
            const [docs] = await db.query(
                `SELECT
                    d.idDocumentaciones,
                    doc.descripcionDocumentacion,
                    d.estadoDocumentacion,
                    d.fechaEntrega,
                    d.archivoDocumentacion
                 FROM detalle_inscripcion d
                 JOIN documentaciones doc ON doc.id = d.idDocumentaciones
                 WHERE d.idInscripcion = ?`,
                [inscripcion[0].idInscripcion]
            );
            documentacion = docs;
        }
        res.status(200).json({
            success: true,
            estudiante: estudiante[0],
            domicilio: domicilio[0],
            inscripcion: inscripcion[0],
            documentacion
        });
    } catch (error) {
        console.error('Error al obtener estudiante por DNI:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, activo, modalidadId, estadoId } = req.query; // Recibe los parámetros de paginación, filtro, modalidad y estado
        const offset = (page - 1) * limit;

        console.log('🔍 Parámetros recibidos:', { page, limit, activo, modalidadId });

        // Manejar filtro por modalidadId: si se pide modalidad, usar INNER JOIN para asegurar solo estudiantes con inscripción en esa modalidad
        let joinInscripciones = 'LEFT JOIN inscripciones i ON e.id = i.idEstudiante';
        const joinParams = [];
        if (modalidadId !== undefined && !isNaN(Number(modalidadId))) {
            joinInscripciones = 'INNER JOIN inscripciones i ON e.id = i.idEstudiante AND i.idModalidad = ?';
            joinParams.push(Number(modalidadId));
            console.log('📋 Filtrando por modalidadId:', modalidadId);
        }

        // Construir la cláusula WHERE según el filtro (después de join params)
        let whereClause = '';
        const whereParams = [];

        if (activo !== undefined) {
            // Si se especifica activo (0 o 1), filtrar por ese valor
            whereClause = 'WHERE e.activo = ?';
            whereParams.push(parseInt(activo));
            console.log('📋 Filtrando por activo:', activo);
        } else {
            // Por defecto, mostrar solo activos
            whereClause = 'WHERE e.activo = 1';
            console.log('📋 Mostrando todos los estudiantes (por defecto activos)');
        }

        // Filtrar también por estado de inscripción si se pasó estadoId
        if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
            // Agregamos la condición para i.idEstadoInscripcion
            whereClause += ' AND i.idEstadoInscripcion = ?';
            whereParams.push(Number(estadoId));
            console.log('📋 Filtrando por estadoId:', estadoId);
        }

        // Filtrar por inicial de apellido si se pasó apellidoInicial -> moved down to conditions block

        // --- Nueva estrategia: aplicar LIMIT/OFFSET sobre la lista de estudiantes (ids) primero ---
        // Construir condiciones sobre la tabla estudiantes y posibles EXISTS sobre inscripciones
        const conditions = [];
        const paramsForConditions = [];

        // activo
        if (activo !== undefined) {
            conditions.push('e.activo = ?');
            paramsForConditions.push(Number(activo));
        } else {
            // por defecto mostrar solo activos
            conditions.push('e.activo = 1');
        }

        // apellidoInicial ya añadido a whereClause antes? usamos req.query.apellidoInicial
        const apellidoInicial = req.query.apellidoInicial ? String(req.query.apellidoInicial).trim() : null;
        if (apellidoInicial) {
            conditions.push('e.apellido LIKE ?');
            paramsForConditions.push(`${apellidoInicial}%`);
        }

        // Si se requiere filtrar por modalidadId / estadoId en la inscripción, usamos EXISTS para asegurar que el estudiante tenga al menos una inscripción coincidiente
        const insConditions = [];
        if (modalidadId !== undefined && !isNaN(Number(modalidadId))) {
            insConditions.push('i2.idModalidad = ?');
            paramsForConditions.push(Number(modalidadId));
        }
        if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
            insConditions.push('i2.idEstadoInscripcion = ?');
            paramsForConditions.push(Number(estadoId));
        }
        if (insConditions.length > 0) {
            conditions.push(`EXISTS (SELECT 1 FROM inscripciones i2 WHERE i2.idEstudiante = e.id AND ${insConditions.join(' AND ')})`);
        }

        const whereForIds = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total de estudiantes (sin LIMIT)
        const [totalRes] = await db.query(`SELECT COUNT(*) AS total FROM estudiantes e ${whereForIds}`, paramsForConditions.slice());
        const total = totalRes[0]?.total || 0;

        // Obtener los IDs de estudiantes para la página actual (aplicar orden y limit/offset sobre e.id)
        const idsParams = paramsForConditions.slice();
        idsParams.push(parseInt(limit));
        idsParams.push(parseInt(offset));
        const [idsRows] = await db.query(`SELECT e.id FROM estudiantes e ${whereForIds} ORDER BY e.id ASC LIMIT ? OFFSET ?`, idsParams);
        const ids = idsRows.map(r => Number(r.id)).filter(id => !isNaN(id));

        // Si no hay ids, devolver respuesta vacía
        if (!ids.length) {
            return res.status(200).json({ success: true, estudiantes: [], total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
        }

        // Ahora traer los datos completos para esos ids (manteniendo joins para domicilios, inscripciones filtradas si corresponde)
        // Si necesitamos unir inscripciones filtradas, aplicamos las condiciones en la ON
        let insJoinOn = 'e.id = i.idEstudiante';
        const insJoinParams = [];
        if (modalidadId !== undefined && !isNaN(Number(modalidadId))) {
            insJoinOn += ' AND i.idModalidad = ?';
            insJoinParams.push(Number(modalidadId));
        }
        if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
            insJoinOn += ' AND i.idEstadoInscripcion = ?';
            insJoinParams.push(Number(estadoId));
        }

        // Asegurar que todos los ids sean números (evitar strings con backticks u otro contenido)
        const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id));
        const finalParams = [...insJoinParams, ...numericIds];

        // Construir los placeholders correctamente para el IN (...)
        const placeholders = numericIds.map(() => '?').join(',');
        console.log('🔎 Final query placeholders and params', { placeholders, finalParams });
        const [result] = await db.query(`
            SELECT 
                e.id, e.nombre, e.apellido, e.dni, e.cuil, e.fechaNacimiento, e.activo, e.email, e.telefono,
                d.calle, d.numero, b.nombre AS barrio, l.nombre AS localidad, p.nombre AS provincia,
                i.fechaInscripcion, 
                m.modalidad, 
                a.descripcionAnioPlan AS cursoPlan,
                ei.id AS idEstadoInscripcion,
                ei.descripcionEstado AS estadoInscripcion
            FROM estudiantes e
            LEFT JOIN domicilios d ON e.idDomicilio = d.id
            LEFT JOIN barrios b ON d.idBarrio = b.id
            LEFT JOIN localidades l ON d.idLocalidad = l.id
            LEFT JOIN provincias p ON d.idProvincia = p.id
            LEFT JOIN inscripciones i ON ${insJoinOn}
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
            LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
            WHERE e.id IN (${placeholders})
            ORDER BY e.id ASC
        `, finalParams);

        console.log('📊 Resultados:', {
            total: total,
            estudiantes: result.length,
            filtro: activo !== undefined ? `activo=${activo}` : 'todos',
            modalidad: modalidadId !== undefined ? modalidadId : 'todas'
        });

        res.status(200).json({
            success: true,
            estudiantes: Array.isArray(result) ? result.map(estudiante => ({
                ...estudiante,
                fechaInscripcion: estudiante.fechaInscripcion || 'Sin inscripción',
                modalidad: estudiante.modalidad || 'Sin modalidad',
                cursoPlan: estudiante.cursoPlan || 'Sin curso/plan',
                estadoInscripcion: estudiante.estadoInscripcion || 'Sin estado',
            })) : [],
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Error al obtener estudiantes inscritos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});
module.exports = router;