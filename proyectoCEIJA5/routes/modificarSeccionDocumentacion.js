const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const obtenerDocumentacionPorInscripcion = require('../utils/obtenerDocumentacion');

const UPLOAD_DIR = path.join(__dirname, '../archivosDocumento');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Usar idInscripcion y dni para evitar duplicados y asociar correctamente
    const idInscripcion = req.params.idInscripcion || 'sin_id';
    const dni = req.body.dni || 'sin_dni';
    const campo = file.fieldname;
    const ext = path.extname(file.originalname);
    cb(null, `${idInscripcion}_${dni}_${campo}${ext}`);
  }
});
const upload = multer({ storage });

// Ruta para modificar documentación por idInscripcion
router.put('/documentacion/:idInscripcion', upload.any(), async (req, res) => {
  const idInscripcion = Number(req.params.idInscripcion);
  // LOG: mostrar datos recibidos
  console.log('--- MODIFICAR DOCUMENTACION ---');
  console.log('idInscripcion:', idInscripcion);
  console.log('detalleDocumentacion:', req.body.detalleDocumentacion);
  if (req.files) {
    console.log('Archivos recibidos:', req.files.map(f => f.fieldname + ' -> ' + f.originalname));
  }
  if (!Number.isInteger(idInscripcion)) return res.status(400).json({ success: false, message: 'ID inscripción inválido.' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Mapear archivos subidos
    const archivosMap = {};
    req.files?.forEach(f => {
      archivosMap[f.fieldname] = '/archivosDocumento/' + f.filename;
    });

    // Procesar detalleDocumentacion
    let detalle = [];
    try {
      detalle = JSON.parse(req.body.detalleDocumentacion || '[]');
    } catch {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'detalleDocumentacion mal formado.' });
    }

    for (const doc of detalle) {
      // Asegurar que cada doc tenga el idInscripcion
      doc.idInscripcion = idInscripcion;
      const archivoNuevo = archivosMap[doc.nombreArchivo];
      const [[row]] = await conn.query(
        `SELECT id, archivoDocumentacion FROM detalle_inscripcion
         WHERE idInscripcion=? AND idDocumentaciones=?`,
        [idInscripcion, doc.idDocumentaciones]
      );
      if (row) {
        const urlFinal = archivoNuevo || row.archivoDocumentacion;
        await conn.query(
          `UPDATE detalle_inscripcion
           SET estadoDocumentacion=?, fechaEntrega=?, archivoDocumentacion=?
           WHERE id=?`,
          [doc.estadoDocumentacion, doc.fechaEntrega, urlFinal, row.id]
        );
      } else {
        if (archivoNuevo) {
          await conn.query(
            `INSERT INTO detalle_inscripcion
             (idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion)
             VALUES (?,?,?,?,?)`,
            [idInscripcion, doc.idDocumentaciones, doc.estadoDocumentacion, doc.fechaEntrega, archivoNuevo]
          );
        }
      }
    }

    const documentacionActualizada = await obtenerDocumentacionPorInscripcion(idInscripcion);
    await conn.commit();
    res.json({
      success: true,
      message: 'Documentación actualizada.',
      documentacion: documentacionActualizada
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;