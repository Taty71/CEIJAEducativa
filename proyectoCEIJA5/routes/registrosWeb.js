const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const buscarOInsertarProvincia = require('../utils/buscarOInsertarProvincia');
const buscarOInsertarLocalidad = require('../utils/buscarOInsertarLocalidad');
const buscarOInsertarBarrio = require('../utils/buscarOInsertarBarrio');
const insertarInscripcion = require('../utils/insertarInscripcion');
const buscarOInsertarDetalleDocumentacion = require('../utils/buscarOInsertarDetalleDocumentacion');

// Configurar multer para manejar archivos de registros web
const storage = multer.diskStorage({
    // Carpeta donde se guardan los archivos de registros web
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../archivosDocWeb'));
    },
    // Nombre del archivo: <nombre>_<apellido>_<dni>_<campo>.<ext>
    filename: (req, file, cb) => {
        const nombre = (req.body.nombre || 'sin_nombre').trim().replace(/\s+/g, '_');
        const apellido = (req.body.apellido || 'sin_apellido').trim().replace(/\s+/g, '_');
        const dni = (req.body.dni || 'sin_dni');
        const campo = file.fieldname; // archivo_dni, archivo_cuil, foto, etc.
        const ext = path.extname(file.originalname);

        const filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
        console.log(`📎 [archivos-web] Guardando archivo: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Ruta del archivo JSON donde se guardarán los registros web
const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');

// Ruta para estadísticas persistentes (contadores históricos)
const REGISTROS_STATS_PATH = path.join(__dirname, '..', 'data', 'Registros_Web_Stats.json');

// Función para asegurar que existe el directorio y el archivo
const ensureFileExists = async () => {
    const dir = path.dirname(REGISTROS_WEB_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    try {
        await fs.access(REGISTROS_WEB_PATH);
    } catch {
        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify([], null, 2));
    }
};

const ensureStatsFileExists = async () => {
    try {
        await fs.access(REGISTROS_STATS_PATH);
    } catch {
        await fs.writeFile(REGISTROS_STATS_PATH, JSON.stringify({ procesados_archivados: 0 }, null, 2));
    }
};

// Helper para incrementar contador de procesados archivados
const incrementarProcesadosArchivados = async () => {
    await ensureStatsFileExists();
    const data = await fs.readFile(REGISTROS_STATS_PATH, 'utf8');
    const stats = JSON.parse(data);
    stats.procesados_archivados = (stats.procesados_archivados || 0) + 1;
    await fs.writeFile(REGISTROS_STATS_PATH, JSON.stringify(stats, null, 2));
    return stats.procesados_archivados;
};




// GET: Obtener todos los registros web
router.get('/', async (req, res) => {
    try {
        await ensureFileExists();
        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        const registros = JSON.parse(data);

        console.log(`📋 Obteniendo ${registros.length} registros web`);
        res.json(registros);
    } catch (error) {
        console.error('Error al obtener registros web:', error);
        res.status(500).json({
            error: 'Error al obtener los registros web',
            userMessage: 'No se pudieron cargar los registros web. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// POST: Crear un nuevo registro web
// ⚠️ SOLO guarda en Registro_Web.json y archivosDocWeb. NO mueve a pendientes ni a la base de datos.
// El registro web queda en estado 'PENDIENTE' hasta que un admin lo procese desde el dashboard.
router.post('/', upload.any(), async (req, res) => {
    try {
        await ensureFileExists();

        console.log('📋 [registros-web] Datos recibidos:', req.body);
        console.log('📎 [registros-web] Archivos recibidos:', req.files);

        // Mapear archivos recibidos
        const archivosMap = {};
        if (req.files) {
            req.files.forEach(file => {
                // Guardar la ruta relativa para acceso web
                archivosMap[file.fieldname] = `/archivosDocWeb/${file.filename}`;
                console.log(`📎 [archivos-web] Mapeado: ${file.fieldname} → ${file.filename}`);
            });
        }

        const nuevoRegistro = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            horaRegistro: new Date().toLocaleTimeString('es-AR'),
            tipo: 'WEB_REGISTRATION',
            estado: 'PENDIENTE',
            datos: {
                // Datos personales
                nombre: req.body.nombre || '',
                apellido: req.body.apellido || '',
                dni: req.body.dni || '',
                cuil: req.body.cuil || '',
                email: req.body.email || '',
                telefono: req.body.telefono || '',
                fechaNacimiento: req.body.fechaNacimiento || '',
                tipoDocumento: req.body.tipoDocumento || 'DNI',
                paisEmision: req.body.paisEmision || 'Argentina',
                sexo: req.body.sexo || '',

                // Domicilio
                calle: req.body.calle || '',
                numero: req.body.numero || '',
                barrio: req.body.barrio || '',
                localidad: req.body.localidad || '',
                provincia: req.body.provincia || '',

                // Información académica
                modalidad: req.body.modalidad || '',
                modalidadId: req.body.modalidadId || null,
                planAnio: req.body.planAnio || '',
                modulos: req.body.modulos || '',
                idModulo: req.body.idModulo || null,

                // Información del usuario web
                usuario: req.body.usuario || req.user?.usuario || 'usuario_web',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
            },
            archivos: archivosMap, // Agregar información de archivos subidos
            observaciones: `Registro web realizado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`
        };

        // Leer registros existentes
        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        const registros = JSON.parse(data);

        // Agregar nuevo registro
        registros.push(nuevoRegistro);

        // Guardar archivo actualizado
        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));

        console.log(`✅ Nuevo registro web creado - DNI: ${nuevoRegistro.datos.dni}, Usuario: ${nuevoRegistro.datos.usuario}`);
        console.log(`📎 Archivos guardados:`, Object.keys(archivosMap).length, 'archivos');

        res.status(201).json({
            message: 'Registro web guardado exitosamente',
            registro: nuevoRegistro,
            archivosProcesados: Object.keys(archivosMap).length
        });

    } catch (error) {
        console.error('Error al crear registro web:', error);
        res.status(500).json({
            error: 'Error al guardar el registro web',
            userMessage: 'No se pudo guardar el registro web. Verifique los datos e intente nuevamente, o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// PUT: Actualizar estado de un registro web
router.put('/:id', async (req, res) => {
    try {
        await ensureFileExists();
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        const registros = JSON.parse(data);

        const indiceRegistro = registros.findIndex(r => r.id === id);

        if (indiceRegistro === -1) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        // Actualizar registro
        registros[indiceRegistro].estado = estado || registros[indiceRegistro].estado;
        registros[indiceRegistro].observaciones = observaciones || registros[indiceRegistro].observaciones;
        registros[indiceRegistro].fechaActualizacion = new Date().toISOString();

        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));

        console.log(`🔄 Registro web actualizado - ID: ${id}, Estado: ${estado}`);

        res.json({
            message: 'Registro actualizado exitosamente',
            registro: registros[indiceRegistro]
        });

    } catch (error) {
        console.error('Error al actualizar registro web:', error);
        res.status(500).json({
            error: 'Error al actualizar el registro web',
            userMessage: 'No se pudo actualizar el registro web. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// DELETE: Eliminar un registro web (Optimización: Limpieza)
router.delete('/:id', async (req, res) => {
    try {
        await ensureFileExists();
        const { id } = req.params;

        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        let registros = JSON.parse(data);

        const registroAEliminar = registros.find(r => r.id === id);

        if (!registroAEliminar) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        // Lógica de Optimización:
        // Si el registro ya fue PROCESADO (está completo o movido a pendientes histórico),
        // lo eliminamos físicamente de la lista para limpiar, PERO incrementamos el contador histórico.
        const estadoUpper = (registroAEliminar.estado || '').toUpperCase();
        const esProcesado = ['PROCESADO_Y_COMPLETA', 'PROCESADO', 'COMPLETA', 'PROCESADO_A_PENDIENTES'].includes(estadoUpper) ||
            estadoUpper.includes('PROCESADO');

        if (esProcesado) {
            console.log(`🧹 Limpiando registro procesado ID: ${id}. Incrementando estadísticas históricas.`);
            await incrementarProcesadosArchivados();
        } else {
            console.log(`🗑️ Eliminando registro PENDIENTE ID: ${id}. No suma a históricos.`);
        }

        // Hard Delete (Eliminación física para optimizar JSON)
        registros = registros.filter(r => r.id !== id);

        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));

        res.json({
            message: esProcesado ? 'Registro limpiado exitosamente (histórico guardado)' : 'Registro eliminado exitosamente',
            registroEliminado: registroAEliminar,
            tipoEliminacion: esProcesado ? 'LIMPIEZA' : 'ELIMINACION',
            esProcesado
        });

    } catch (error) {
        console.error('Error al eliminar registro web:', error);
        res.status(500).json({
            error: 'Error al eliminar el registro web',
            userMessage: 'No se pudo eliminar el registro web. Intente nuevamente.',
            technical: error.message
        });
    }
});

// POST: Procesar un registro web (solo ADMIN)
// Si la documentación está completa: guarda en la base de datos y migra archivos a archivosDocumento.
// Si está incompleta: mueve a Registros_Pendientes.json y marca el registro web como PROCESADO_A_PENDIENTES.
router.post('/:id/procesar', upload.any(), async (req, res) => {
    try {
        await ensureFileExists();
        const { id } = req.params;
        // Los datos del formulario pueden venir en req.body
        // Los archivos nuevos en req.files
        // Cargar registro web original
        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        let registros = JSON.parse(data);
        const indiceRegistro = registros.findIndex(r => r.id === id);
        if (indiceRegistro === -1) {
            return res.status(404).json({ error: 'Registro web no encontrado' });
        }
        const registro = registros[indiceRegistro];
        // Mapear archivos nuevos
        const archivosNuevos = {};
        if (req.files) {
            req.files.forEach(file => {
                archivosNuevos[file.fieldname] = `/archivosDocWeb/${file.filename}`;
            });
        }

        // Recuperar rutas de archivos existentes que vienen en el body (enviados por frontend)
        const archivosExistentesBody = {};
        console.log('🔍 [DEBUG] req.body keys:', Object.keys(req.body)); // Ver qué llega

        for (const [key, value] of Object.entries(req.body)) {
            // Normalizar clave 'foto' (case insensitive)
            let cleanKey = key;
            if (key.toLowerCase() === 'foto') {
                cleanKey = 'foto';
            }

            // Asumimos que los campos de archivo empiezan con 'archivo_' o son 'foto'
            // Y que el valor es un string (ruta)
            if ((cleanKey.startsWith('archivo_') || cleanKey === 'foto')) {
                console.log(`🔍 [DEBUG] Analizando body key: ${key} -> ${cleanKey}, Value: ${value}`);
                // Aceptar tanto / (Linux/Web) como \ (Windows)
                if (typeof value === 'string' && (value.startsWith('/') || value.startsWith('\\'))) {
                    // Normalizar a forward slashes para consistencia interna
                    const rutaNormalizada = value.replace(/\\/g, '/');
                    archivosExistentesBody[cleanKey] = rutaNormalizada;
                    if (cleanKey === 'foto') {
                        console.log(`📸 [DEBUG-FOTO] Foto detectada y guardada en archivosExistentesBody: ${rutaNormalizada}`);
                    }
                }
            }
        }

        console.log('📂 [DEBUG] archivosExistentesBody:', archivosExistentesBody);
        console.log('📂 [DEBUG] registro.archivos original:', registro.archivos);

        // Combinar archivos: Prioridad: Nuevos > Body (UI) > Original JSON
        const archivosCombinados = { ...registro.archivos, ...archivosExistentesBody, ...archivosNuevos };

        console.log('📂 [DEBUG] archivosCombinados FINAL:', archivosCombinados);
        // Combinar datos del formulario
        const datosCompletos = { ...registro.datos, ...req.body };
        // Validar documentación (usa tu lógica de validación)
        const { obtenerDocumentosRequeridos } = require(path.join(__dirname, '../utils/obtenerDocumentosRequeridos.js'));
        const modalidad = datosCompletos.modalidad || '';
        const planAnio = datosCompletos.planAnio || '';
        const modulos = datosCompletos.modulos || '';
        const requerimientos = obtenerDocumentosRequeridos(modalidad, planAnio, modulos);
        const documentosRequeridos = requerimientos.documentos;
        const documentosAlternativos = requerimientos.alternativos;
        // Validar documentos subidos
        let documentosSubidos = [];
        let documentosFaltantes = [];
        let validacionAlternativaOK = true;
        for (const doc of documentosRequeridos) {
            if (documentosAlternativos && (doc === documentosAlternativos.preferido || doc === documentosAlternativos.alternativa)) {
                const tienePreferido = !!archivosCombinados[documentosAlternativos.preferido];
                const tieneAlternativa = !!archivosCombinados[documentosAlternativos.alternativa];
                if (tienePreferido || tieneAlternativa) {
                    documentosSubidos.push(tienePreferido ? documentosAlternativos.preferido : documentosAlternativos.alternativa);
                } else {
                    documentosFaltantes.push(doc);
                    validacionAlternativaOK = false;
                }
                continue;
            }
            if (archivosCombinados[doc]) {
                documentosSubidos.push(doc);
            } else {
                documentosFaltantes.push(doc);
            }
        }
        const cantidadSubidos = documentosSubidos.length;
        const totalDocumentos = documentosRequeridos.length;
        const esCompleto = (cantidadSubidos === totalDocumentos) && validacionAlternativaOK;

        // Antes de cualquier acción, comprobar si el DNI ya existe en la BD para evitar duplicados
        try {
            const pool = require('../db');
            const [existing] = await pool.query('SELECT id FROM estudiantes WHERE dni = ?', [datosCompletos.dni]);
            if (existing && existing.length > 0) {
                // En lugar de abortar, consultar toda la información del estudiante
                console.log(`⚠️ DNI ${datosCompletos.dni} ya existe en BD (id=${existing[0].id})`);

                // Obtener información completa del estudiante con inscripciones y documentación
                const [estudianteRows] = await pool.query('SELECT * FROM estudiantes WHERE id = ?', [existing[0].id]);
                const estudiante = estudianteRows[0];

                // Obtener inscripciones
                const [inscripcionesRows] = await pool.query(`
                    SELECT 
                        i.idInscripcion,
                        i.fechaInscripcion,
                        i.idEstadoInscripcion,
                        m.nombre as modalidad,
                        p.anio as plan,
                        mo.nombre as modulo,
                        e.descripcionEstado as estado
                    FROM inscripciones i
                    LEFT JOIN modalidades m ON i.idModalidad = m.id
                    LEFT JOIN anio_plan p ON i.idPlan = p.id
                    LEFT JOIN modulos mo ON i.idModulo = mo.id
                    LEFT JOIN estado_inscripciones e ON i.idEstadoInscripcion = e.id
                    WHERE i.idEstudiante = ?
                    ORDER BY i.fechaInscripcion DESC
                `, [existing[0].id]);

                // Para cada inscripción, obtener documentación
                const inscripcionesConDocs = [];
                for (const insc of inscripcionesRows) {
                    const [docs] = await pool.query(`
                        SELECT 
                            dd.idDetalleDocumentacion,
                            dd.idDocumentaciones,
                            d.descripcionDocumentacion,
                            dd.estadoDocumentacion,
                            dd.fechaEntrega,
                            dd.archivoDocumentacion
                        FROM detalle_inscripcion dd
                        LEFT JOIN documentaciones d ON dd.idDocumentaciones = d.id
                        WHERE dd.idInscripcion = ?
                    `, [insc.idInscripcion]);
                    inscripcionesConDocs.push({ ...insc, documentacion: docs });
                }

                // Marcar el registro web como procesado
                registros[indiceRegistro] = {
                    ...registro,
                    estado: 'PROCESADO_Y_Completa',
                    fechaProcesado: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString(),
                    archivos: archivosCombinados,
                    datos: datosCompletos,
                    observaciones: (registro.observaciones || '') + `\nProcesado automáticamente: DNI ya existe en la base de datos (idEstudiante=${existing[0].id}).`
                };
                await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));

                return res.status(200).json({
                    yaExiste: true,
                    message: 'El DNI ya está registrado en el sistema',
                    estudianteExistente: {
                        id: estudiante.id,
                        nombre: estudiante.nombre,
                        apellido: estudiante.apellido,
                        dni: estudiante.dni,
                        cuil: estudiante.cuil,
                        email: estudiante.email,
                        telefono: estudiante.telefono,
                        fechaNacimiento: estudiante.fechaNacimiento
                    },
                    inscripciones: inscripcionesConDocs,
                    archivosNuevosRegistroWeb: archivosCombinados,
                    registroWebActualizado: registros[indiceRegistro]
                });
            }
        } catch (dbErr) {
            console.warn('⚠️ No se pudo comprobar duplicado en BD (registro web), se continuará y la inserción manejará posibles errores:', dbErr.message);
        }

        // Si la documentación está incompleta, mover a pendientes
        const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');
        let registrosPendientes = [];
        try {
            const dataPendientes = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
            registrosPendientes = JSON.parse(dataPendientes);
        } catch { registrosPendientes = []; }
        // Validar si ya existe en pendientes por DNI
        const yaEnPendientes = registrosPendientes.some(rp => rp.dni === datosCompletos.dni);
        if (yaEnPendientes) {
            // Solo cambiar estado y devolver mensaje, no eliminar ni crear duplicado
            registros[indiceRegistro] = {
                ...registro,
                estado: 'PROCESADO_A_PENDIENTES',
                fechaMovimiento: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                motivoPendiente: `Ya existe en pendientes`,
                observaciones: `Registro ya estaba en pendientes, contabilizado como procesado a pendientes el ${new Date().toLocaleDateString('es-AR')}`
            };
            await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));
            return res.status(200).json({
                message: 'Registro procesado a pendientes',
                registroWebActualizado: registros[indiceRegistro]
            });
        }
        // Si está incompleto: copiar archivos desde archivosDocWeb a archivosPendientes y crear registro pendiente
        if (!esCompleto) {
            // Copiar todos los archivos de archivosDocWeb a archivosPendientes antes de crear el registro pendiente
            const archivosPendientesDir = path.join(__dirname, '../archivosPendientes');
            await fs.mkdir(archivosPendientesDir, { recursive: true });
            for (const [campo, ruta] of Object.entries(archivosCombinados)) {
                if (ruta && ruta.startsWith('/archivosDocWeb/')) {
                    const nombreArchivo = path.basename(ruta);
                    const origen = path.join(__dirname, '../archivosDocWeb', nombreArchivo);
                    const destino = path.join(archivosPendientesDir, nombreArchivo);
                    try {
                        await fs.copyFile(origen, destino);
                        // Actualiza la ruta para el registro pendiente
                        archivosCombinados[campo] = `/archivosPendientes/${nombreArchivo}`;
                    } catch (err) {
                        console.error(`Error copiando archivo ${nombreArchivo}:`, err);
                    }
                }
            }
            // Crear registro pendiente
            const registroPendiente = {
                dni: datosCompletos.dni,
                timestamp: new Date().toISOString(),
                fechaRegistro: new Date().toLocaleDateString('es-AR'),
                horaRegistro: new Date().toLocaleTimeString('es-AR'),
                tipo: 'REGISTRO_WEB_PENDIENTE',
                estado: 'PENDIENTE',
                origenWeb: true,
                idRegistroWebOriginal: registro.id,
                datos: {
                    ...datosCompletos,
                    motivoPendiente: `Faltan: ${documentosFaltantes.join(', ')}`,
                    administrador: 'admin_web'
                },
                archivos: archivosCombinados,
                observaciones: `Movido desde registro web a pendientes el ${new Date().toLocaleDateString('es-AR')} - Faltan: ${documentosFaltantes.join(', ')}`
            };
            registrosPendientes.push(registroPendiente);
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registrosPendientes, null, 2));
            // Actualizar estado del registro web original
            registros[indiceRegistro] = {
                ...registro,
                estado: 'PROCESADO_A_PENDIENTES',
                fechaMovimiento: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                motivoPendiente: `Faltan: ${documentosFaltantes.join(', ')}`,
                observaciones: `Procesado por admin y movido a registros pendientes el ${new Date().toLocaleDateString('es-AR')} - Faltan: ${documentosFaltantes.join(', ')}`
            };
            await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));
            return res.status(200).json({
                message: 'Registro web procesado y movido a pendientes por documentación incompleta',
                registroWebActualizado: registros[indiceRegistro],
                registroPendienteCreado: registroPendiente
            });
        }
        // Si la documentación está completa, guardar en la base de datos
        const pool = require('../db');
        // Preparar migración atómica de archivos: copiar desde archivosDocWeb a archivosDocumento y registrar copias para rollback
        const archivosDocumentoDir = path.join(__dirname, '../archivosDocumento');
        await fs.mkdir(archivosDocumentoDir, { recursive: true });
        const copiedFiles = [];
        for (const [campo, ruta] of Object.entries(archivosCombinados)) {
            if (ruta && ruta.startsWith('/archivosDocWeb/')) {
                const nombreArchivo = path.basename(ruta);
                const origenWeb = path.join(__dirname, '..', 'archivosDocWeb', nombreArchivo);
                const destino = path.join(archivosDocumentoDir, nombreArchivo);
                try {
                    // Si no existe en destino, copiar
                    try {
                        await fs.access(destino);
                        // ya existe, no copiar
                        archivosCombinados[campo] = `/archivosDocumento/${nombreArchivo}`;
                    } catch (_) {
                        await fs.copyFile(origenWeb, destino);
                        archivosCombinados[campo] = `/archivosDocumento/${nombreArchivo}`;
                        copiedFiles.push(destino);
                    }
                } catch (copyErr) {
                    console.warn(`⚠️ No se pudo copiar ${nombreArchivo} a archivosDocumento:`, copyErr.message);
                    // mantener la referencia original si falla
                    archivosCombinados[campo] = ruta;
                }
            }
        }

        try {
            // ─── 1) Datos de domicilio ─────────────────────────────
            const provincia = datosCompletos.provincia;
            const localidad = datosCompletos.localidad;
            const barrio = datosCompletos.barrio;
            const calle = datosCompletos.calle;
            const numero = Number(datosCompletos.numero);
            let idDomicilio = null;

            if (provincia && localidad && barrio && calle && !isNaN(numero)) {
                try {
                    const provinciaResult = await buscarOInsertarProvincia(pool, provincia);
                    const localidadResult = await buscarOInsertarLocalidad(pool, localidad, provinciaResult.id);
                    const barrioResult = await buscarOInsertarBarrio(pool, barrio, localidadResult.id);

                    const [domicilioRes] = await pool.query(
                        'INSERT INTO domicilios (calle, numero, idBarrio, idLocalidad, idProvincia) VALUES (?,?,?,?,?)',
                        [calle, numero, barrioResult.id, localidadResult.id, provinciaResult.id]
                    );
                    idDomicilio = domicilioRes.insertId;
                } catch (addrErr) {
                    console.warn('⚠️ Error guardando domicilio, se guardará sin idDomicilio:', addrErr.message);
                }
            }

            // ─── 2) Insertar estudiante en la tabla 'estudiantes' ────────────────────────────
            // Se mantienen columnas legacy y se agrega idDomicilio
            const [result] = await pool.query(
                `INSERT INTO estudiantes (nombre, apellido, dni, cuil, email, telefono, fechaNacimiento, tipoDocumento, paisEmision, sexo, calle, numero, barrio, localidad, provincia, modalidad, planAnio, modulos, usuario, archivo_dni, archivo_cuil, archivo_fichaMedica, archivo_partidaNacimiento, foto, archivo_analiticoParcial, archivo_certificadoNivelPrimario, archivo_solicitudPase, idDomicilio, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                [
                    datosCompletos.nombre,
                    datosCompletos.apellido,
                    datosCompletos.dni,
                    datosCompletos.cuil,
                    datosCompletos.email,
                    datosCompletos.telefono,
                    datosCompletos.fechaNacimiento,
                    datosCompletos.tipoDocumento,
                    datosCompletos.paisEmision,
                    datosCompletos.sexo || null,
                    datosCompletos.calle,
                    datosCompletos.numero,
                    datosCompletos.barrio,
                    datosCompletos.localidad,
                    datosCompletos.provincia,
                    datosCompletos.modalidad,
                    datosCompletos.planAnio,
                    datosCompletos.modulos,
                    datosCompletos.usuario,
                    archivosCombinados['archivo_dni'] || '',
                    archivosCombinados['archivo_cuil'] || '',
                    archivosCombinados['archivo_fichaMedica'] || '',
                    archivosCombinados['archivo_partidaNacimiento'] || '',
                    archivosCombinados['foto'] || '',
                    archivosCombinados['archivo_analiticoParcial'] || '',
                    archivosCombinados['archivo_certificadoNivelPrimario'] || '',
                    archivosCombinados['archivo_solicitudPase'] || '',
                    idDomicilio
                ]
            );
            const idEstudiante = result.insertId;

            // ─── 3) Insertar Inscripción ───────────────────────────
            try {
                // Parsear IDs si vienen como strings
                // Parsear IDs si vienen como strings, o BUSCAR por nombre si no vienen IDs
                let modalidadId = parseInt(datosCompletos.modalidadId) || null;
                const modalidadNombre = datosCompletos.modalidad;
                if (!modalidadId && modalidadNombre) {
                    try {
                        const [mRows] = await pool.query('SELECT id FROM modalidades WHERE nombre = ?', [modalidadNombre]);
                        if (mRows.length) modalidadId = mRows[0].id;
                    } catch (err) { console.warn('Error buscando modalidad por nombre:', err.message); }
                }

                let planAnioId = parseInt(datosCompletos.planAnio) || parseInt(datosCompletos.anioPlan) || null;
                const planNombre = datosCompletos.planAnio || datosCompletos.anioPlan;
                if (!planAnioId && planNombre) {
                    try {
                        const [pRows] = await pool.query('SELECT id FROM anio_plan WHERE anio = ?', [planNombre]);
                        if (pRows.length) planAnioId = pRows[0].id;
                    } catch (err) { console.warn('Error buscando plan por nombre:', err.message); }
                }

                let modulosId = parseInt(datosCompletos.idModulo) || parseInt(datosCompletos.modulos) || null;
                const moduloNombre = datosCompletos.modulos || datosCompletos.modulo;
                if (!modulosId && moduloNombre) {
                    try {
                        const [moRows] = await pool.query('SELECT id FROM modulos WHERE nombre = ? OR descripcion = ?', [moduloNombre, moduloNombre]);
                        if (moRows.length) modulosId = moRows[0].id;
                    } catch (err) { console.warn('Error buscando modulo por nombre:', err.message); }
                }
                const idEstadoInscripcion = 1; // Asumimos 'Completa' o 'Regular' id=1? Validar DB. 
                // registroEst.js usa req.body.idEstadoInscripcion
                // Aquí asumimos que al procesar, queda inscripto (4 = inscripto? 1=regular?)
                // Usaremos 1 (Regular) o obtener de datosCompletos 'estadoInscripcion'

                if (modalidadId) {
                    const idInscripcion = await insertarInscripcion(
                        pool,
                        idEstudiante,
                        modalidadId,
                        planAnioId,
                        modulosId,
                        idEstadoInscripcion, // Default a 1 si no hay dato
                        'CURDATE()',
                        datosCompletos.idDivision || null
                    );

                    // ─── 4) Detalle de documentación ──────────────────────
                    let detalleDocumentacion = [];
                    // Intentar obtener detalle de datosCompletos (añadido por frontend)
                    if (datosCompletos.detalleDocumentacion) {
                        detalleDocumentacion = typeof datosCompletos.detalleDocumentacion === 'string'
                            ? JSON.parse(datosCompletos.detalleDocumentacion)
                            : datosCompletos.detalleDocumentacion;
                    }

                    if (Array.isArray(detalleDocumentacion)) {
                        for (const det of detalleDocumentacion) {
                            const url = archivosCombinados[det.nombreArchivo] || null;
                            await buscarOInsertarDetalleDocumentacion(
                                pool,
                                idInscripcion,
                                det.idDocumentaciones,
                                det.estadoDocumentacion || 'Entregado',
                                det.fechaEntrega || new Date(),
                                url
                            );
                        }
                    }
                }
            } catch (inscErr) {
                console.error('❌ Error creando inscripción/detalle:', inscErr);
                // No abortar, el estudiante se creó
            }

            // ─── 5) Insertar en archivos_estudiantes (Tabla auxiliar de archivos) ────────────────
            for (const [campo, rutaArchivo] of Object.entries(archivosCombinados)) {
                if (rutaArchivo && (campo.startsWith('archivo_') || campo === 'foto')) {
                    try {
                        await pool.query(
                            'INSERT INTO archivos_estudiantes (idEstudiante, tipoArchivo, rutaArchivo) VALUES (?, ?, ?)',
                            [idEstudiante, campo, rutaArchivo]
                        );
                    } catch (fileDbErr) {
                        console.warn(`⚠️ Error guardando archivo ${campo} en archivos_estudiantes:`, fileDbErr.message);
                    }
                }
            }
            registros[indiceRegistro] = {
                ...registro,
                estado: 'PROCESADO_Y_Completa',
                fechaProcesado: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                archivos: archivosCombinados,
                datos: datosCompletos,
                observaciones: `Procesado y guardado en BD el ${new Date().toLocaleDateString('es-AR')}`
            };
            await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));
            // Opcional: eliminar archivos originales en archivosDocWeb si se copiaron
            try {
                for (const destino of copiedFiles) {
                    // determinar nombre
                    const nombre = path.basename(destino);
                    const origenWeb = path.join(__dirname, '..', 'archivosDocWeb', nombre);
                    await fs.unlink(origenWeb).catch(() => { });
                }
            } catch (rmErr) {
                console.warn('⚠️ No se pudieron eliminar archivos originales de archivosDocWeb tras procesar:', rmErr.message);
            }
            return res.status(200).json({
                message: 'Registro web procesado y guardado en la base de datos',
                registroProcesado: registros[indiceRegistro],
                insertId: result.insertId
            });
        } catch (err) {
            // En caso de error al insertar, intentar rollback de archivos copiados
            try {
                for (const f of copiedFiles) {
                    await fs.unlink(f).catch(() => { });
                }
            } catch (cleanupErr) {
                console.warn('⚠️ Error limpiando archivos tras fallo de inserción (registro web):', cleanupErr.message);
            }
            console.error('Error al guardar en la base de datos:', err);
            return res.status(500).json({
                error: 'Error al guardar en la base de datos',
                userMessage: 'No se pudo guardar el estudiante en la base de datos. Verifique los datos o contacte al equipo técnico.',
                technical: err.message
            });
        }
        // Por ahora, solo marcamos como PROCESADO y respondemos
        registros[indiceRegistro] = {
            ...registro,
            estado: 'PROCESADO_Y_Completa',
            fechaProcesado: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            archivos: archivosCombinados,
            datos: datosCompletos,
            observaciones: `Procesado correctamente el ${new Date().toLocaleDateString('es-AR')}`
        };
        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registros, null, 2));
        return res.status(200).json({
            message: 'Registro web procesado exitosamente',
            registroProcesado: registros[indiceRegistro]
        });
    } catch (error) {
        console.error('Error al procesar registro web:', error);
        res.status(500).json({
            error: 'Error al procesar el registro web',
            message: error.message
        });
    }
});

// POST: Mover un registro web a pendientes (solo ADMIN, acción manual)
// Permite mover un registro web a Registros_Pendientes.json y marcarlo como PROCESADO_A_PENDIENTES.
router.post('/:id/mover-pendiente', async (req, res) => {
    try {
        await ensureFileExists();
        const { id } = req.params;
        const { motivoPendiente } = req.body;

        console.log(`📋 Moviendo registro web ${id} a pendientes`);

        // Leer registros web actuales
        const dataWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        const registrosWeb = JSON.parse(dataWeb);

        const indiceRegistro = registrosWeb.findIndex(r => r.id === id);
        if (indiceRegistro === -1) {
            return res.status(404).json({ error: 'Registro web no encontrado' });
        }

        const registroWeb = registrosWeb[indiceRegistro];

        // Crear registro pendiente
        const registroPendiente = {
            dni: registroWeb.datos.dni,
            timestamp: new Date().toISOString(),
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            horaRegistro: new Date().toLocaleTimeString('es-AR'),
            tipo: 'REGISTRO_WEB_PENDIENTE',
            estado: 'PENDIENTE',
            origenWeb: true,
            idRegistroWebOriginal: registroWeb.id,
            datos: {
                ...registroWeb.datos,
                motivoPendiente: motivoPendiente,
                administrador: 'admin_web'
            },
            archivos: registroWeb.archivos || {},
            observaciones: `Movido desde registro web a pendientes el ${new Date().toLocaleDateString('es-AR')} - ${motivoPendiente}`
        };

        // Leer y actualizar registros pendientes
        const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');
        let registrosPendientes = [];

        try {
            const dataPendientes = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
            registrosPendientes = JSON.parse(dataPendientes);
        } catch {
            // Si no existe el archivo, crear array vacío
            registrosPendientes = [];
        }

        registrosPendientes.push(registroPendiente);
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registrosPendientes, null, 2));

        // Actualizar estado del registro web original
        registrosWeb[indiceRegistro] = {
            ...registroWeb,
            estado: 'PROCESADO_A_PENDIENTES',
            fechaMovimiento: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            motivoPendiente: motivoPendiente,
            observaciones: `Movido a registros pendientes el ${new Date().toLocaleDateString('es-AR')} - ${motivoPendiente}`
        };

        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registrosWeb, null, 2));

        console.log(`✅ Registro web ${id} movido a pendientes exitosamente`);

        res.json({
            message: 'Registro web movido a pendientes exitosamente',
            registroWebActualizado: registrosWeb[indiceRegistro],
            registroPendienteCreado: registroPendiente
        });

    } catch (error) {
        console.error('Error al mover registro web a pendientes:', error);
        res.status(500).json({
            error: 'Error al mover el registro web a pendientes',
            userMessage: 'No se pudo mover el registro web a pendientes. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// GET: Obtener estadísticas de registros web
router.get('/stats', async (req, res) => {
    try {
        await ensureFileExists();
        await ensureStatsFileExists();

        const data = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
        const registros = JSON.parse(data);

        const dataStats = await fs.readFile(REGISTROS_STATS_PATH, 'utf8');
        const statsPersistentes = JSON.parse(dataStats);
        const archivados = statsPersistentes.procesados_archivados || 0;

        // Calcular vivos
        const pendientesVivos = registros.filter(r => r.estado === 'PENDIENTE' || r.estado === 'REGISTRO_WEB_PENDIENTE').length;

        // Procesados Vivos (en la lista)
        const procesadosVivos = registros.filter(r => {
            const estadoUpper = (r.estado || '').toUpperCase();
            return ['PROCESADO_Y_COMPLETA', 'PROCESADO', 'COMPLETA', 'PROCESADO_A_PENDIENTES'].includes(estadoUpper) ||
                estadoUpper.includes('PROCESADO');
        }).length;

        // Total Procesados = Vivos + Archivados
        const totalProcesados = procesadosVivos + archivados;

        const stats = {
            total: registros.length, // Total actual en lista
            pendientes: pendientesVivos,
            procesados: totalProcesados, // Histórico + Vivos
            archivados: archivados,
            ultimoRegistro: registros.length > 0 ? registros[registros.length - 1].timestamp : null
        };

        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            userMessage: 'No se pudieron calcular las estadísticas.',
            technical: error.message
        });
    }
});

module.exports = router;