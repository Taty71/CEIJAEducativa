const express = require('express');
const router = express.Router();
const db = require('../db');
const comprobanteService = require('../services/comprobanteService');

// Generar comprobante PDF y devolverlo (POST): { dni, previewBody? }
router.post('/', async (req, res) => {
  try {
    const { dni, previewBody } = req.body || {};
    if (!dni) return res.status(400).json({ success: false, message: 'DNI requerido' });

    const [rows] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    const estudiante = rows[0];

    // Enriquecer con última inscripción (con campos legibles) si existe
    const [inscRows] = await db.query(`
      SELECT i.id AS idInscripcion, i.fechaInscripcion, m.modalidad, a.descripcionAnioPlan AS planAnio, mod.modulo, ei.descripcionEstado AS estadoInscripcion
      FROM inscripciones i
      LEFT JOIN modalidades m ON i.idModalidad = m.id
      LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
      LEFT JOIN modulos mod ON i.idModulos = mod.id
      LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
      WHERE i.idEstudiante = ?
      ORDER BY i.fechaInscripcion DESC LIMIT 1
    `, [estudiante.id]);
    if (inscRows && inscRows.length) {
      estudiante.inscripcion = inscRows[0];
      // map some aliases for compatibility with frontend expected fields
      estudiante.modalidad = estudiante.inscripcion.modalidad;
      estudiante.planAnio = estudiante.inscripcion.planAnio;
      estudiante.modulo = estudiante.inscripcion.modulo;
      estudiante.estadoInscripcion = estudiante.inscripcion.estadoInscripcion;
      estudiante.fechaInscripcion = estudiante.inscripcion.fechaInscripcion;
    }

    // Si hay una inscripción, traer documentación asociada para incluir en el comprobante
    if (estudiante.inscripcion && estudiante.inscripcion.idInscripcion) {
      const [docRows] = await db.query(`
        SELECT d.idDocumentaciones, doc.descripcionDocumentacion, d.estadoDocumentacion, d.fechaEntrega, d.archivoDocumentacion
        FROM detalle_inscripcion d
        JOIN documentaciones doc ON doc.id = d.idDocumentaciones
        WHERE d.idInscripcion = ?
      `, [estudiante.inscripcion.idInscripcion]);
      estudiante.documentacion = (docRows || []).map(r => ({
        idDocumentaciones: r.idDocumentaciones,
        descripcionDocumentacion: r.descripcionDocumentacion,
        estadoDocumentacion: r.estadoDocumentacion,
        fechaEntrega: r.fechaEntrega,
        archivoDocumentacion: r.archivoDocumentacion ? (r.archivoDocumentacion.startsWith('/') ? `http://localhost:5000${r.archivoDocumentacion}` : r.archivoDocumentacion) : null
      }));
    }

    const pdfBuffer = await comprobanteService.generarPDFBuffer(estudiante, { previewBody: previewBody || null });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Comprobante_${estudiante.dni}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en generar/comprobante:', error);
    return res.status(500).json({ success: false, message: 'Error generando comprobante' });
  }
});

module.exports = router;
