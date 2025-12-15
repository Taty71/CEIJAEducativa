const express = require('express');
const router = express.Router();
const db = require('../db');

// Actualizar datos personales por DNI
router.put('/personales/:dni', async (req, res) => {
  const dni = Number(req.params.dni);
  if (!Number.isInteger(dni)) return res.status(400).json({ success: false, message: 'DNI inválido.' });
  // Logging de datos recibidos
  console.log('Datos recibidos para actualización de personales:', req.body);
  // Validación de campos obligatorios
  const camposObligatorios = ['id', 'nombre', 'apellido', 'cuil', 'email', 'fechaNacimiento', 'tipoDocumento', 'paisEmision', 'activo'];
  const faltantes = camposObligatorios.filter(c => !req.body[c]);
  if (faltantes.length > 0) {
    return res.status(400).json({ success: false, message: `Faltan campos obligatorios: ${faltantes.join(', ')}` });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[est]] = await conn.query('SELECT id FROM estudiantes WHERE dni = ?', [dni]);
    if (!est) throw new Error('Estudiante no encontrado');
    const [result] = await conn.query(
      `UPDATE estudiantes SET nombre=?, apellido=?, cuil=?, email=?, fechaNacimiento=?, tipoDocumento=?, paisEmision=?, sexo=?, activo=? WHERE id=?`,
      [req.body.nombre, req.body.apellido, req.body.cuil, req.body.email, req.body.fechaNacimiento, req.body.tipoDocumento, req.body.paisEmision, req.body.sexo, req.body.activo, est.id]
    );
    console.log('Filas actualizadas (personales):', result.affectedRows);
    await conn.commit();
    res.json({ success: true, message: 'Datos personales actualizados.' });
  } catch (err) {
    await conn.rollback();
    console.error('Error al actualizar datos personales:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally { conn.release(); }
});

// Actualizar domicilio por idDomicilio
router.put('/domicilio/:idDomicilio', async (req, res) => {
  const idDomicilio = Number(req.params.idDomicilio);
  if (!Number.isInteger(idDomicilio)) return res.status(400).json({ success: false, message: 'ID domicilio inválido.' });
  // Logging de datos recibidos
  console.log('Datos recibidos para actualización de domicilio:', req.body);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Buscar provincia, localidad, barrio
    const idProvincia = await buscarOInsertarProvincia(conn, req.body.provincia);
    const idLocalidad = await buscarOInsertarLocalidad(conn, req.body.localidad, idProvincia);
    const idBarrio = await buscarOInsertarBarrio(conn, req.body.barrio, idLocalidad);
    const [result] = await conn.query(
      `UPDATE domicilios SET calle=?, numero=?, idBarrio=?, idLocalidad=?, idProvincia=? WHERE id=?`,
      [req.body.calle, req.body.numero, idBarrio, idLocalidad, idProvincia, idDomicilio]
    );
    console.log('Filas actualizadas (domicilio):', result.affectedRows);
    await conn.commit();
    res.json({ success: true, message: 'Domicilio actualizado.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally { conn.release(); }
});

// Actualizar datos académicos por idInscripcion
router.put('/academica/:idInscripcion', async (req, res) => {
  const idInscripcion = Number(req.params.idInscripcion);
  if (!Number.isInteger(idInscripcion)) return res.status(400).json({ success: false, message: 'ID inscripción inválido.' });
  // Logging de datos recibidos
  console.log('Datos recibidos para actualización académica:', req.body);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `UPDATE inscripciones SET idModalidad=?, idAnioPlan=?, idModulos=?, idEstadoInscripcion=?, fechaInscripcion=? WHERE id=?`,
      [req.body.modalidadId, req.body.planAnioId, req.body.modulosId, req.body.estadoInscripcionId, req.body.fechaInscripcion, idInscripcion]
    );
    console.log('Filas actualizadas (academica):', result.affectedRows);
    await conn.commit();
    res.json({ success: true, message: 'Datos académicos actualizados.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally { conn.release(); }
});


module.exports = router;