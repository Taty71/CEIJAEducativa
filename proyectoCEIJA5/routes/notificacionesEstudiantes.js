const express = require('express');
const router = express.Router();
const db = require('../db');
const { enviarEmailEstudianteInscrito } = require('../services/emailServiceEstudiantes');
const obtenerDocumentacionFaltante = require('../utils/obtenerDocumentacionFaltante');

// Enviar email individual a estudiante inscrito (por DNI). Acepta { dni, subject, body, attachComprobante }
router.post('/enviar-individual', async (req, res) => {
  try {
    const { dni, subject, body, attachComprobante, documentos } = req.body || {};
    if (!dni) return res.status(400).json({ success: false, message: 'DNI requerido' });

    // Buscar estudiante en la base de datos (sin filtrar por activo)
    const [rows] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado en base de datos' });
    }
    const estudiante = rows[0];

    // Enriquecer con última inscripción (con campos legibles) si existe
    const [inscRows] = await db.query(`
      SELECT i.id AS idInscripcion, i.fechaInscripcion, m.modalidad, a.descripcionAnioPlan AS planAnio, modu.modulo, ei.descripcionEstado AS estadoInscripcion
      FROM inscripciones i
      LEFT JOIN modalidades m ON i.idModalidad = m.id
      LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
      LEFT JOIN modulos modu ON i.idModulos = modu.id
      LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
      WHERE i.idEstudiante = ?
      ORDER BY i.fechaInscripcion DESC LIMIT 1
    `, [estudiante.id]);
    if (inscRows && inscRows.length) {
      estudiante.inscripcion = inscRows[0];
      estudiante.modalidad = estudiante.inscripcion.modalidad || estudiante.modalidad;
      estudiante.planAnio = estudiante.inscripcion.planAnio || estudiante.planAnio;
      estudiante.cursoPlan = estudiante.inscripcion.planAnio || estudiante.cursoPlan;
      estudiante.modulo = estudiante.inscripcion.modulo || estudiante.modulo;
      estudiante.estadoInscripcion = estudiante.inscripcion.estadoInscripcion || estudiante.estadoInscripcion;
      estudiante.fechaInscripcion = estudiante.inscripcion.fechaInscripcion || estudiante.fechaInscripcion;
    }

    // Preparar opciones para el email
    const opciones = { subject, body, attachComprobante: !!attachComprobante };

    // Calcular y adjuntar la lista de documentos presentados si el frontend no la envió explícitamente.
    // Esto también sirve para que el comprobante adjunto tenga la misma información que se muestra en pantalla.
    if (Array.isArray(documentos) && documentos.length > 0) {
      opciones.documentos = documentos;
    } else if (estudiante.inscripcion && estudiante.inscripcion.idInscripcion) {
      try {
        const idIns = estudiante.inscripcion.idInscripcion;
        // Traer todos los tipos de documentación
        const [tiposDoc] = await db.query('SELECT id, descripcionDocumentacion FROM documentaciones');
        // Traer detalle completo de documentación para la inscripción
        const [detalle] = await db.query(`
          SELECT d.idDocumentaciones, doc.descripcionDocumentacion, d.estadoDocumentacion, d.fechaEntrega, d.archivoDocumentacion
          FROM detalle_inscripcion d
          JOIN documentaciones doc ON d.idDocumentaciones = doc.id
          WHERE d.idInscripcion = ?
        `, [idIns]);
        // Calcular requeridos, presentados y faltantes
        const resultadoDocs = obtenerDocumentacionFaltante({ tiposDocumentacion: tiposDoc, detalleInscripcion: detalle });
        opciones.documentos = resultadoDocs.presentados || [];
        // Exponer arrays en estudiante para el comprobante
        estudiante.requeridos = resultadoDocs.requeridos || [];
        estudiante.presentados = resultadoDocs.presentados || [];
        estudiante.faltantes = resultadoDocs.faltantes || [];
        // Anexar la lista de documentaciones cruda y completa
        estudiante.documentacion = detalle.map(d => ({
          idDocumentaciones: d.idDocumentaciones,
          descripcionDocumentacion: d.descripcionDocumentacion,
          estadoDocumentacion: d.estadoDocumentacion,
          fechaEntrega: d.fechaEntrega,
          archivoDocumentacion: d.archivoDocumentacion ? (d.archivoDocumentacion.startsWith('/') ? `http://localhost:5000${d.archivoDocumentacion}` : d.archivoDocumentacion) : null
        }));
      } catch (err) {
        console.error('Error obteniendo detalle_inscripcion para enviar-individual:', err);
        opciones.documentos = [];
      }
    } else {
      opciones.documentos = [];
    }

    // Si attachComprobante, asegurar que el objeto estudiante tenga los arrays requeridos/presentados/faltantes antes de generar el PDF
    if (opciones.attachComprobante) {
      opciones.attachments = [];
      try {
        // Solo calcular si falta alguno de los arrays o la documentación
        if (
          !Array.isArray(estudiante.requeridos) ||
          !Array.isArray(estudiante.presentados) ||
          !Array.isArray(estudiante.faltantes) ||
          !Array.isArray(estudiante.documentacion) || estudiante.documentacion.length === 0
        ) {
          if (estudiante.inscripcion && estudiante.inscripcion.idInscripcion) {
            const [tiposDoc] = await db.query('SELECT id, descripcionDocumentacion FROM documentaciones');
            const [detalle] = await db.query(`
              SELECT d.idDocumentaciones, doc.descripcionDocumentacion, d.estadoDocumentacion, d.fechaEntrega, d.archivoDocumentacion
              FROM detalle_inscripcion d
              JOIN documentaciones doc ON d.idDocumentaciones = doc.id
              WHERE d.idInscripcion = ?
            `, [estudiante.inscripcion.idInscripcion]);
            const obtenerDocumentacionFaltante = require('../utils/obtenerDocumentacionFaltante');
            const resultadoDocs = obtenerDocumentacionFaltante({ tiposDocumentacion: tiposDoc, detalleInscripcion: detalle });
            estudiante.requeridos = resultadoDocs.requeridos || [];
            estudiante.presentados = resultadoDocs.presentados || [];
            estudiante.faltantes = resultadoDocs.faltantes || [];
            estudiante.documentacion = (detalle || []).map(d => ({
              idDocumentaciones: d.idDocumentaciones,
              descripcionDocumentacion: d.descripcionDocumentacion,
              estadoDocumentacion: d.estadoDocumentacion,
              fechaEntrega: d.fechaEntrega,
              archivoDocumentacion: d.archivoDocumentacion ? (d.archivoDocumentacion.startsWith('/') ? `http://localhost:5000${d.archivoDocumentacion}` : d.archivoDocumentacion) : null
            }));
          }
        }
        const pdfBuffer = await require('../services/comprobanteService').generarPDFBuffer(estudiante, { previewBody: body });
        opciones.attachments.push({ filename: `Comprobante_${estudiante.dni}.pdf`, content: pdfBuffer, contentType: 'application/pdf' });
      } catch (err) {
        console.error('Error generando comprobante para adjuntar en enviar-individual:', err.message);
      }
    }

    // Si el frontend pasó explícitamente una lista de documentos, úsela.
    // De lo contrario, si tenemos una inscripción, obtener detalle_inscripcion y calcular los presentados.
    if (Array.isArray(documentos) && documentos.length > 0) {
      opciones.documentos = documentos;
    } else if (estudiante.inscripcion && estudiante.inscripcion.idInscripcion) {
      try {
        const idIns = estudiante.inscripcion.idInscripcion;
        const [tiposDoc] = await db.query('SELECT id, descripcionDocumentacion FROM documentaciones');
        const [detalle] = await db.query(`
          SELECT d.idDocumentaciones, doc.descripcionDocumentacion, d.codigoDocumentacion, d.archivoDocumentacion, d.estadoDocumentacion
          FROM detalle_inscripcion d
          JOIN documentaciones doc ON d.idDocumentaciones = doc.id
          WHERE d.idInscripcion = ?
        `, [idIns]);
        const resultadoDocs = obtenerDocumentacionFaltante({ tiposDocumentacion: tiposDoc, detalleInscripcion: detalle });
        // resultadoDocs.presentados es array de descripciones; map a lo que backend/email espera
        opciones.documentos = resultadoDocs.presentados || [];
        // Exponer arrays en estudiante para el comprobante
        estudiante.requeridos = resultadoDocs.requeridos || [];
        estudiante.presentados = resultadoDocs.presentados || [];
        estudiante.faltantes = resultadoDocs.faltantes || [];
        // Mapear detalle para que comprobante tenga descripcion y archivo
        estudiante.documentacion = (detalle || []).map(d => ({ descripcionDocumentacion: d.descripcionDocumentacion, archivoDocumentacion: d.archivoDocumentacion || null, estadoDocumentacion: d.estadoDocumentacion }));
      } catch (err) {
        console.error('Error obteniendo detalle_inscripcion para enviar-individual:', err);
        opciones.documentos = [];
      }
    } else {
      opciones.documentos = [];
    }

    const resultado = await enviarEmailEstudianteInscrito(estudiante, opciones);

    if (resultado.success) return res.json({ success: true, message: 'Email enviado (inscrito)', resultado });
    return res.status(500).json({ success: false, message: resultado.error || 'Error enviando email' });
  } catch (error) {
    console.error('Error en notificaciones-estudiantes/enviar-individual:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
