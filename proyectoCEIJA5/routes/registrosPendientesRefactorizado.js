const express = require('express');
const router = express.Router();
const { upload } = require('./config');
const {
    obtenerTodosLosRegistros,
    obtenerRegistroPorDni,
    crearRegistroPendiente,
    actualizarRegistroPendiente,
    eliminarRegistroPendiente,
    obtenerEstadisticas,
    procesarRegistroPendiente
} = require('./controllers');

// ================================
// RUTAS DE REGISTROS PENDIENTES
// ================================

// GET /api/registros-pendientes - Obtener todos los registros pendientes
router.get('/', obtenerTodosLosRegistros);

// GET /api/registros-pendientes/:dni - Obtener un registro por DNI
router.get('/:dni', obtenerRegistroPorDni);

// POST /api/registros-pendientes - Crear nuevo registro pendiente
router.post('/', upload.any(), crearRegistroPendiente);

// PUT /api/registros-pendientes/:dni - Actualizar registro pendiente
router.put('/:dni', actualizarRegistroPendiente);

// DELETE /api/registros-pendientes/:dni - Eliminar registro pendiente
router.delete('/:dni', eliminarRegistroPendiente);

// GET /api/registros-pendientes/stats - Obtener estadísticas (debe ir antes de /:dni)
router.get('/stats', obtenerEstadisticas);

// PUT /api/registros-pendientes/:dni/archivos - Actualizar archivos de un registro
router.put('/:dni/archivos', upload.any(), actualizarRegistroPendiente);

// POST /api/registros-pendientes/procesar - Procesar registro pendiente
router.post('/procesar', procesarRegistroPendiente);

// POST /api/registros-pendientes/:dni/procesar - Procesar registro pendiente (alternativo)
router.post('/:dni/procesar', procesarRegistroPendiente);

module.exports = router;