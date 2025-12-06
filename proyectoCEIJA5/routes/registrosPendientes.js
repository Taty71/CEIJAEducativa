/**
 * REGISTROS PENDIENTES - VERSIÓN REFACTORIZADA
 * 
 * Este archivo ha sido refactorizado en componentes modulares ubicados en:
 * - services/registrosPendientes/config.js - Configuración y constantes
 * - services/registrosPendientes/fileManager.js - Gestión de archivos
 * - services/registrosPendientes/documentValidator.js - Validación de documentos
 * - services/registrosPendientes/databaseManager.js - Operaciones de BD
 * - services/registrosPendientes/controllers.js - Controladores de endpoints
 * 
 * Fecha de refactorización: 1 de noviembre de 2025
 */

const express = require('express');
const router = express.Router();

// Importar todos los servicios refactorizados
const { upload } = require('../services/registrosPendientes/config');
const {
    obtenerTodosLosRegistros,
    obtenerRegistroPorDni,
    crearRegistroPendiente,
    actualizarRegistroPendiente,
    eliminarRegistroPendiente,
    obtenerEstadisticas,
    procesarRegistroPendiente,
    reiniciarAlarma
} = require('../services/registrosPendientes/controllers');

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
router.post('/procesar', upload.any(), procesarRegistroPendiente);

// POST /api/registros-pendientes/:dni/procesar - Procesar registro pendiente (alternativo)
router.post('/:dni/procesar', upload.any(), procesarRegistroPendiente);

// POST /api/registros-pendientes/:dni/reiniciar-alarma - Reiniciar alarma de vencimiento
router.post('/:dni/reiniciar-alarma', reiniciarAlarma);

module.exports = router;