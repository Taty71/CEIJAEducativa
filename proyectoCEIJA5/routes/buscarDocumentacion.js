const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/documentacion/:idInscripcion
router.get('/:idInscripcion', async (req, res) => {
  const { idInscripcion } = req.params;
  console.log('ID Inscripcion recibido:', idInscripcion); // Verifica el parámetro recibido

  try {
    if (isNaN(idInscripcion)) {
        return res.status(400).json({ success: false, message: 'ID de inscripción inválido.' });
      }

    const [rows] = await db.query(
      `SELECT
         d.idDocumentaciones,
         doc.descripcionDocumentacion,
         d.estadoDocumentacion,
         d.fechaEntrega,
         d.archivoDocumentacion
       FROM detalle_inscripcion d
       JOIN documentaciones doc ON doc.id = d.idDocumentaciones
       WHERE d.idInscripcion = ?`,
      [idInscripcion]
    );

    console.log('Resultados de la consulta:', rows); // Verifica los resultados de la consulta

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró documentación para esta inscripción.'
      });
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error al obtener documentación:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

module.exports = router;
