const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint específico para generar listados usados por los reportes PDF.
// Esta ruta no altera la lógica de las rutas existentes y devuelve
// estudiantes tanto activos como inactivos (no impone filtro por `activo`).
// Parámetros opcionales:
// - modalidadId: number
// - estadoId: number
// - apellidoInicial: string (opcional)
// - limit: number (opcional)

router.get('/', async (req, res) => {
  try {
    const { modalidadId, estadoId } = req.query;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    // Construir condiciones para estudiantes (sin filtrar por activo)
    const conditions = [];
    const params = [];

    const apellidoInicial = req.query.apellidoInicial ? String(req.query.apellidoInicial).trim() : null;
    if (apellidoInicial) {
      conditions.push('e.apellido LIKE ?');
      params.push(`${apellidoInicial}%`);
    }

    // Si se especifica modalidadId o estadoId, garantizar existencia de inscripción correspondiente
    const insConditions = [];
    if (modalidadId !== undefined && modalidadId !== null && String(modalidadId).trim() !== '') {
      insConditions.push('i2.idModalidad = ?');
      params.push(Number(modalidadId));
    }
    if (estadoId !== undefined && estadoId !== null && String(estadoId).trim() !== '') {
      insConditions.push('i2.idEstadoInscripcion = ?');
      params.push(Number(estadoId));
    }

    if (insConditions.length > 0) {
      conditions.push(`EXISTS (SELECT 1 FROM inscripciones i2 WHERE i2.idEstudiante = e.id AND ${insConditions.join(' AND ')})`);
    }

    const whereForIds = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Obtener IDs que cumplan condiciones (aplicar limit si se pidió)
    const idsParams = params.slice();
    let idsQuery = `SELECT e.id FROM estudiantes e ${whereForIds} ORDER BY e.id ASC`;
    if (limit && !isNaN(limit)) {
      idsQuery += ' LIMIT ?';
      idsParams.push(Number(limit));
    }

    const [idsRows] = await db.query(idsQuery, idsParams);
    const ids = idsRows.map(r => Number(r.id)).filter(id => !isNaN(id));

    if (!ids.length) {
      return res.status(200).json({ success: true, estudiantes: [] });
    }

    // Traer datos completos para esos ids
    const numericIds = ids.map(id => Number(id));
    const placeholders = numericIds.map(() => '?').join(',');

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
      LEFT JOIN inscripciones i ON i.idEstudiante = e.id
      LEFT JOIN modalidades m ON i.idModalidad = m.id
      LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
      LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
      WHERE e.id IN (${placeholders})
      ORDER BY e.id ASC
    `, numericIds);

    res.status(200).json({
      success: true,
      estudiantes: Array.isArray(result) ? result.map(est => ({
        ...est,
        fechaInscripcion: est.fechaInscripcion || 'Sin inscripción',
        modalidad: est.modalidad || 'Sin modalidad',
        cursoPlan: est.cursoPlan || 'Sin curso/plan',
        estadoInscripcion: est.estadoInscripcion || 'Sin estado',
      })) : [],
    });
  } catch (error) {
    console.error('Error en reportes-estudiantes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

module.exports = router;
