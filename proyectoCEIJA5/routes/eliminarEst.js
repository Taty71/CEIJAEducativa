const express = require('express');
const router = express.Router();
const db = require('../db');

// Desactivar estudiante (eliminación lógica)
router.patch('/desactivar/:dni', async (req, res) => {
  const dni = Number(req.params.dni);
  if (!Number.isInteger(dni)) {
    return res.status(400).json({ success: false, message: 'DNI inválido.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar si el estudiante existe
    const [rows] = await conn.query(
      'SELECT id FROM estudiantes WHERE dni = ?',
      [dni]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
    }

    // Desactivar el estudiante (eliminación lógica)
    await conn.query('UPDATE estudiantes SET activo = 0 WHERE dni = ?', [dni]);
    
    await conn.commit();
    return res.json({ 
      success: true, 
      message: 'Estudiante desactivado exitosamente' 
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    conn.release();
  }
});

// Eliminar estudiante (eliminación física)
router.delete('/:dni', async (req, res) => {
  const dni = Number(req.params.dni);
  if (!Number.isInteger(dni)) {
    return res.status(400).json({ success: false, message: 'DNI inválido.' });
  }

  const conn = await db.getConnection(); // si usas pool
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT id FROM estudiantes WHERE dni = ?',
      [dni]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
    }

    await conn.query('DELETE FROM estudiantes WHERE dni = ?', [dni]);
    await conn.commit();
    return res.sendStatus(204);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    conn.release();
  }
});


module.exports = router;