const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { 
    enviarEmailEstudiante, 
    enviarEmailsMasivos 
} = require('../services/emailService');
const comprobanteService = require('../services/comprobanteService');

// Ruta del archivo JSON donde están los registros pendientes de administrador
const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');
const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');

// Función para obtener registros pendientes desde el archivo JSON
const obtenerRegistrosPendientes = async () => {
    try {
        console.log('📋 Obteniendo registros pendientes de administrador desde:', REGISTROS_PENDIENTES_PATH);
        
        // Leer el archivo de registros pendientes de administrador
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        // Transformar el formato para compatibilidad con el sistema de email
        const registrosTransformados = registros.map(registro => ({
            ...registro,
            id: registro.dni, // Usar DNI como ID para compatibilidad
            nombre: registro.datos?.nombre || registro.nombre,
            apellido: registro.datos?.apellido || registro.apellido,
            email: registro.datos?.email || registro.email,
            modalidad: registro.datos?.modalidad || registro.modalidad,
            tipoRegistro: registro.tipo || 'REGISTRO_PENDIENTE',
            fechaVencimiento: registro.fechaVencimiento || calcularFechaVencimiento(registro.timestamp),
            documentosSubidos: registro.documentosSubidos || Object.keys(registro.archivos || {}),
            // Calcular fecha de vencimiento si no existe (7 días desde timestamp)
            ...(!registro.fechaVencimiento && {
                fechaVencimiento: calcularFechaVencimiento(registro.timestamp)
            })
        }));
        
        console.log(`📋 Registros pendientes encontrados: ${registrosTransformados.length}`);
        return registrosTransformados;
        
    } catch (error) {
        console.error('Error al obtener registros pendientes:', error);
        // Si no existe el archivo, retornar array vacío
        if (error.code === 'ENOENT') {
            console.log('📋 Archivo de registros pendientes no existe, retornando array vacío');
            return [];
        }
        return [];
    }
};

// Función para calcular fecha de vencimiento (7 días desde timestamp)
const calcularFechaVencimiento = (timestamp) => {
    const fechaCreacion = new Date(timestamp);
    const fechaVencimiento = new Date(fechaCreacion.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 días
    return fechaVencimiento.toISOString();
};

// POST: Enviar email a un estudiante específico
router.post('/enviar-individual', async (req, res) => {
    try {
        const { dni } = req.body; // Cambiar de registroId a dni
        
        if (!dni) {
            return res.status(400).json({
                success: false,
                message: 'DNI del estudiante requerido'
            });
        }

        console.log(`📧 Buscando registro pendiente para DNI: ${dni}`);

        // Obtener los registros pendientes
        const registros = await obtenerRegistrosPendientes();
        let registro = registros.find(r => r.dni === dni);
        
        // Si no está en registros pendientes, intentar obtener estudiante del catálogo (tabla estudiantes + inscripciones + documentación)
        if (!registro) {
            console.log(`⚠️ Registro pendiente no encontrado para DNI ${dni}, buscando en tabla estudiantes...`);
            const db = require('../db');
            const [estRows] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
            if (estRows && estRows.length > 0) {
                const est = estRows[0];
                // Obtener inscripción (si existe)
                const [insRows] = await db.query(`
                    SELECT i.id AS idInscripcion, i.fechaInscripcion, m.modalidad, a.descripcionAnioPlan AS plan, mod.modulo, ei.descripcionEstado AS estado
                    FROM inscripciones i
                    LEFT JOIN modalidades m ON i.idModalidad = m.id
                    LEFT JOIN anio_plan a ON i.idAnioPlan = a.id
                    LEFT JOIN modulos mod ON i.idModulos = mod.id
                    LEFT JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
                    WHERE i.idEstudiante = ?
                    LIMIT 1
                `, [est.id]);
                const ins = (insRows && insRows.length > 0) ? insRows[0] : null;

                // Obtener documentación asociada (detalle_inscripcion)
                let documentacion = [];
                if (ins && ins.idInscripcion) {
                    const [docRows] = await db.query(`
                        SELECT d.idDocumentaciones, doc.descripcionDocumentacion, d.estadoDocumentacion, d.fechaEntrega, d.archivoDocumentacion
                        FROM detalle_inscripcion d
                        JOIN documentaciones doc ON doc.id = d.idDocumentaciones
                        WHERE d.idInscripcion = ?
                    `, [ins.idInscripcion]);
                    documentacion = (docRows || []).map(r => ({
                        idDocumentaciones: r.idDocumentaciones,
                        descripcionDocumentacion: r.descripcionDocumentacion,
                        estadoDocumentacion: r.estadoDocumentacion,
                        fechaEntrega: r.fechaEntrega,
                        archivoDocumentacion: r.archivoDocumentacion ? (r.archivoDocumentacion.startsWith('/') ? `http://localhost:5000${r.archivoDocumentacion}` : r.archivoDocumentacion) : null
                    }));
                }

                // Construir objeto tipo 'registro' compatible con emailService
                registro = {
                    id: est.id,
                    dni: est.dni,
                    nombre: est.nombre,
                    apellido: est.apellido,
                    email: est.email,
                    telefono: est.telefono || null,
                    modalidad: ins?.modalidad || est.modalidad || null,
                    fechaCreacion: est.createdAt || new Date().toISOString(),
                    fechaVencimiento: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 días por defecto
                    estado: ins?.estado || 'INSCRIPTO',
                    documentosSubidos: documentacion.filter(d => d.archivoDocumentacion).map(d => d.descripcionDocumentacion),
                    documentosFaltantes: documentacion.filter(d => !d.archivoDocumentacion).map(d => d.descripcionDocumentacion),
                    tieneDocumentacion: (documentacion && documentacion.length > 0),
                    tipoRegistro: 'ESTUDIANTE',
                    datos: est,
                    documentacion
                };
            }
        }

        const email = registro?.datos?.email || registro?.email;
        const { subject, body } = req.body || {};
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'El estudiante no tiene email válido registrado'
            });
        }

        console.log(`📧 Enviando email individual a: ${email} (${registro.datos?.nombre || registro.nombre} ${registro.datos?.apellido || registro.apellido})`);

        // Pasar subject/body opcionales desde el cliente (previsualización personalizada)
        const opcionesEnvio = { subject, body };

        // Si el cliente solicitó adjuntar comprobante, generarlo y anexarlo
        if (req.body && req.body.attachComprobante) {
            try {
                const pdfBuffer = await comprobanteService.generarPDFBuffer(registro);
                opcionesEnvio.attachments = [{ filename: `Comprobante_${registro.dni}.pdf`, content: pdfBuffer }];
            } catch (err) {
                console.error('Error generando comprobante PDF:', err.message);
                // continuar sin adjunto si falla la generación
            }
        }

        const resultado = await enviarEmailEstudiante(registro, opcionesEnvio);
        
        if (resultado.success) {
            res.json({
                success: true,
                message: `Email enviado exitosamente a ${registro.datos?.nombre || registro.nombre} ${registro.datos?.apellido || registro.apellido}`,
                email: email,
                dni: dni
            });
        } else {
            res.status(500).json({
                success: false,
                message: resultado.error || 'Error al enviar email'
            });
        }
        
    } catch (error) {
        console.error('Error al enviar email individual:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// POST: Enviar emails masivos a todos los estudiantes pendientes
router.post('/enviar-masivo', async (req, res) => {
    try {
        console.log('📧 Iniciando envío masivo de notificaciones...');
        
        const registros = await obtenerRegistrosPendientes();
        
        if (registros.length === 0) {
            return res.json({
                success: true,
                message: 'No hay registros pendientes para notificar',
                enviados: 0,
                resultados: {
                    enviados: [],
                    fallidos: [],
                    total: 0,
                    exitosos: 0,
                    fallidos_count: 0
                }
            });
        }

        // Filtrar solo los que tienen email válido
        const registrosConEmail = registros.filter(r => r.email && r.email.includes('@'));
        
        if (registrosConEmail.length === 0) {
            return res.json({
                success: false,
                message: 'No hay registros con emails válidos para notificar',
                enviados: 0
            });
        }

        console.log(`📧 Enviando emails masivos a ${registrosConEmail.length} estudiantes de ${registros.length} totales...`);
        
        const resultados = await enviarEmailsMasivos(registrosConEmail);
        
        res.json({
            success: true,
            message: `Envío masivo completado: ${resultados.exitosos} enviados, ${resultados.fallidos_count} fallidos`,
            enviados: resultados.exitosos,
            fallidos: resultados.fallidos_count,
            totalRegistros: registros.length,
            conEmail: registrosConEmail.length,
            resultados
        });

    } catch (error) {
        console.error('Error en envío masivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// POST: Enviar emails urgentes (próximos a vencer)
router.post('/enviar-urgentes', async (req, res) => {
    try {
        const { diasUmbral = 3 } = req.body; // Por defecto 3 días o menos
        
        console.log(`⚡ Iniciando envío urgente (${diasUmbral} días o menos)...`);
        
        const registros = await obtenerRegistrosPendientes();
        
        if (registros.length === 0) {
            return res.json({
                success: true,
                message: 'No hay registros pendientes',
                enviados: 0,
                resultados: {
                    enviados: [],
                    fallidos: [],
                    total: 0,
                    exitosos: 0,
                    fallidos_count: 0
                }
            });
        }

        // Filtrar registros urgentes (próximos a vencer)
        const ahora = new Date();
        const registrosUrgentes = registros.filter(registro => {
            if (!registro.email || !registro.email.includes('@')) return false;
            
            const fechaVencimiento = new Date(registro.fechaVencimiento);
            const msRestantes = fechaVencimiento.getTime() - ahora.getTime();
            const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
            
            return diasRestantes <= diasUmbral && diasRestantes >= 0;
        });

        if (registrosUrgentes.length === 0) {
            return res.json({
                success: true,
                message: `No hay registros urgentes (que venzan en menos de ${diasUmbral} días)`,
                enviados: 0,
                diasUmbral,
                resultados: {
                    enviados: [],
                    fallidos: [],
                    total: 0,
                    exitosos: 0,
                    fallidos_count: 0
                }
            });
        }

        console.log(`⚡ Enviando emails urgentes a ${registrosUrgentes.length} estudiantes de ${registros.length} totales...`);
        
        const resultados = await enviarEmailsMasivos(registrosUrgentes);
        
        res.json({
            success: true,
            message: `Envío urgente completado: ${resultados.exitosos} enviados, ${resultados.fallidos_count} fallidos`,
            enviados: resultados.exitosos,
            fallidos: resultados.fallidos_count,
            totalUrgentes: registrosUrgentes.length,
            diasUmbral,
            resultados
        });

    } catch (error) {
        console.error('Error en envío urgente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// GET: Obtener lista de registros pendientes (para debugging)
router.get('/registros-pendientes', async (req, res) => {
    try {
        const registros = await obtenerRegistrosPendientes();
        
        res.json({
            success: true,
            total: registros.length,
            registros: registros.map(r => ({
                id: r.id,
                nombre: r.nombre,
                apellido: r.apellido,
                dni: r.dni,
                email: r.email,
                modalidad: r.modalidad,
                fechaVencimiento: r.fechaVencimiento,
                documentosSubidos: r.documentosSubidos.length,
                documentosFaltantes: r.documentosFaltantes.length,
                tipoRegistro: r.tipoRegistro
            }))
        });
    } catch (error) {
        console.error('Error al obtener registros pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;