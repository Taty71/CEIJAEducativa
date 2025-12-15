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
    // Función de saneamiento: NFD para separar acentos, removemos rango acentos, y reemplazamos no-alfanum con _
    const sanitizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_") : '';

    const nombre = sanitizeStr(req.body.nombre);
    const apellido = sanitizeStr(req.body.apellido);
    const campo = file.fieldname;
    const ext = path.extname(file.originalname);

    let filename = `${idInscripcion}_${dni}_${campo}${ext}`;
    // Prefer Name_Surname_DNI naming if available to match existing convention
    if (nombre && apellido && dni !== 'sin_dni') {
      filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
    }
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG y PNG.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

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
    let nuevaFoto = null; // Initialize variable for photo URL
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

      let urlFinal = null;

      if (archivoNuevo) {
        urlFinal = archivoNuevo;
      } else if (doc.archivoDocumentacion !== undefined) {
        // Si viene explícitamente en el JSON (puede ser null si se borró)
        urlFinal = doc.archivoDocumentacion;
      } else if (row) {
        // Si no viene en JSON pero existe en BD, mantener (legacy behavior fallback)
        urlFinal = row.archivoDocumentacion;
      }

      if (row) {
        await conn.query(
          `UPDATE detalle_inscripcion
           SET estadoDocumentacion=?, fechaEntrega=?, archivoDocumentacion=?
           WHERE id=?`,
          [doc.estadoDocumentacion, doc.fechaEntrega, urlFinal, row.id]
        );
      } else {
        // Solo insertar si hay un archivo o se declara explícitamente documento (aunque sea faltante)
        await conn.query(
          `INSERT INTO detalle_inscripcion
             (idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion)
             VALUES (?,?,?,?,?)`,
          [idInscripcion, doc.idDocumentaciones, doc.estadoDocumentacion, doc.fechaEntrega, urlFinal]
        );
      }

      // ─── Actualizar FOTO en tabla estudiantes ───
      // Si el documento es FOTO (ID 8 según DocumentacionNameToId, o chequeamos description si no tenemos ID fijo aqui)
      // Mejor chequear description si viene, o asumir ID 8.
      // ModificarEstd envía  nombreArchivo = descripcionDocumentacion.
      // Pero 'doc.nombreArchivo' es la clave del archivo en el input form.
      // Chequeamos si es tipo 'Foto'

      if (doc.nombreArchivo === 'foto' || doc.nombreArchivo === 'Foto' || Number(doc.idDocumentaciones) === 8) {
        if (urlFinal && urlFinal !== row?.archivoDocumentacion) {
          console.log('📸 [FOTO] Actualizando en tabla estudiantes:', urlFinal);
          nuevaFoto = urlFinal; // Capture for response
          // Necesitamos idEstudiante
          const [[ins]] = await conn.query('SELECT idEstudiante FROM inscripciones WHERE id=?', [idInscripcion]);
          if (ins) {
            await conn.query('UPDATE estudiantes SET foto=? WHERE id=?', [urlFinal, ins.idEstudiante]);
          }
        }
      }
    }



    const documentacionActualizada = await obtenerDocumentacionPorInscripcion(idInscripcion);
    await conn.commit();
    res.json({
      success: true,
      message: 'Documentación actualizada.',
      documentacion: documentacionActualizada,
      nuevaFoto // Return the new photo URL if updated
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;