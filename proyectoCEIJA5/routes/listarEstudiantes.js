const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/listar-estudiantes
// Query params: q (texto opcional), page, limit, activo (0/1 opcional), modalidadId, estadoId
// Default behavior: if 'activo' param is NOT provided, return all estudiantes (no activo filter)
router.get('/', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10, activo, modalidadId, estadoId } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const baseConds = [];
    const baseParams = [];

    // Search text: match nombre OR apellido OR dni (insensible a mayúsculas/minúsculas)
    const qTrim = String(q || '').trim();
    if (qTrim) {
      baseConds.push('(LOWER(e.nombre) LIKE ? OR LOWER(e.apellido) LIKE ? OR e.dni LIKE ?)');
      const like = `%${qTrim.toLowerCase()}%`;
      baseParams.push(like, like, like);
    }

    // Inscripciones conditions for modalidad/estado via EXISTS
    const insConditions = [];
    if (modalidadId !== undefined && modalidadId !== null && modalidadId !== '') {
      const mid = Number(modalidadId);
      if (!isNaN(mid)) {
        insConditions.push('i2.idModalidad = ?');
        baseParams.push(mid);
      }
    }
    if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
      const eid = Number(estadoId);
      if (!isNaN(eid)) {
        insConditions.push('i2.idEstadoInscripcion = ?');
        baseParams.push(eid);
      }
    }
    if (insConditions.length > 0) {
      baseConds.push(`EXISTS (SELECT 1 FROM inscripciones i2 WHERE i2.idEstudiante = e.id AND ${insConditions.join(' AND ')})`);
    }

    const whereBase = baseConds.length ? `WHERE ${baseConds.join(' AND ')}` : '';

    // totals (without activo filter)
    const [totalRes] = await db.query(`SELECT COUNT(*) AS total FROM estudiantes e ${whereBase}`, baseParams.slice());
    const total = totalRes[0]?.total || 0;

    // activos count
    const activosConds = baseConds.slice();
    const activosParams = baseParams.slice();
    activosConds.push('e.activo = 1');
    const whereAct = `WHERE ${activosConds.join(' AND ')}`;
    const [actRes] = await db.query(`SELECT COUNT(*) AS total FROM estudiantes e ${whereAct}`, activosParams);
    const activos = actRes[0]?.total || 0;

    // inactivos count
    const inactivosConds = baseConds.slice();
    const inactivosParams = baseParams.slice();
    inactivosConds.push('e.activo = 0');
    const whereInact = `WHERE ${inactivosConds.join(' AND ')}`;
    const [inactRes] = await db.query(`SELECT COUNT(*) AS total FROM estudiantes e ${whereInact}`, inactivosParams);
    const inactivos = inactRes[0]?.total || 0;

    // For listing: only add activo condition if the param is explicitly provided
    const listConds = baseConds.slice();
    const listParams = baseParams.slice();
    // IMPORTANT: if a search query is present, ignore the 'activo' filter so
    // search returns matches across activos e inactivos regardless of the filter button.
    if (!qTrim && activo !== undefined && activo !== null && activo !== '') {
      const a = Number(activo);
      if (!isNaN(a)) {
        listConds.push('e.activo = ?');
        listParams.push(a);
      }
    }
    const whereList = listConds.length ? `WHERE ${listConds.join(' AND ')}` : '';

    // Select ids with pagination
    const idsParams = listParams.slice();
    idsParams.push(limitNum, offset);
    const [idsRows] = await db.query(`SELECT e.id FROM estudiantes e ${whereList} ORDER BY e.id ASC LIMIT ? OFFSET ?`, idsParams);
    const ids = idsRows.map(r => Number(r.id)).filter(id => !isNaN(id));

    if (!ids.length) {
      return res.json({ success: true, estudiantes: [], total, activos, inactivos, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
    }

    const placeholders = ids.map(() => '?').join(',');

    // Join params for inscripciones filtering when fetching details
    let insJoinOn = 'e.id = i.idEstudiante';
    const insJoinParams = [];
    if (modalidadId !== undefined && modalidadId !== null && modalidadId !== '') {
      const mid = Number(modalidadId);
      if (!isNaN(mid)) {
        insJoinOn += ' AND i.idModalidad = ?';
        insJoinParams.push(mid);
      }
    }
    if (estadoId !== undefined && estadoId !== null && estadoId !== '') {
      const eid = Number(estadoId);
      if (!isNaN(eid)) {
        insJoinOn += ' AND i.idEstadoInscripcion = ?';
        insJoinParams.push(eid);
      }
    }

    const finalParams = [...insJoinParams, ...ids];

    const [rows] = await db.query(`
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

    return res.json({
      success: true,
      estudiantes: Array.isArray(rows) ? rows.map(r => ({
        ...r,
        fechaInscripcion: r.fechaInscripcion || 'Sin inscripción',
        modalidad: r.modalidad || 'Sin modalidad',
        cursoPlan: r.cursoPlan || 'Sin curso/plan',
        estadoInscripcion: r.estadoInscripcion || 'Sin estado'
      })) : [],
      total,
      activos,
      inactivos,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Error en /listar-estudiantes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

module.exports = router;
