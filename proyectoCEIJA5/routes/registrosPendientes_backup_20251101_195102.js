const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Utilidades para manejo de ubicaciones
const buscarOInsertarProvincia = require('../utils/buscarOInsertarProvincia');
const buscarOInsertarLocalidad = require('../utils/buscarOInsertarLocalidad');  
const buscarOInsertarBarrio = require('../utils/buscarOInsertarBarrio');

// Configurar multer para manejar archivos de registros pendientes
const storage = multer.diskStorage({
    // Carpeta donde se guardan los archivos de registros pendientes
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../archivosPendientes'));
    },
    // Nombre del archivo: <nombre>_<apellido>_<dni>_<campo>.<ext>
    filename: (req, file, cb) => {
        const nombre = (req.body.nombre || 'sin_nombre').trim().replace(/\s+/g, '_');
        const apellido = (req.body.apellido || 'sin_apellido').trim().replace(/\s+/g, '_');
        const dni = (req.body.dni || 'sin_dni');
        const campo = file.fieldname; // archivo_dni, archivo_cuil, foto, etc.
        const ext = path.extname(file.originalname);
        
        const filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
        console.log(`📎 [archivos-pendientes] Guardando archivo: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Rutas de archivos y directorios
const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');
const ARCHIVOS_PENDIENTES_PATH = path.join(__dirname, '..', 'archivosPendientes');
const ARCHIVOS_DOCUMENTO_PATH = path.join(__dirname, '..', 'archivosDocumento');

// Función para asegurar que existe el directorio y el archivo
const ensureFileExists = async () => {
    const dir = path.dirname(REGISTROS_PENDIENTES_PATH);
    
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    
    try {
        await fs.access(REGISTROS_PENDIENTES_PATH);
    } catch {
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify([], null, 2));
    }
};

// GET: Obtener todos los registros pendientes
router.get('/', async (req, res) => {
    try {
        await ensureFileExists();
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        console.log(`📋 Obteniendo ${registros.length} registros pendientes`);
        res.json(registros);
    } catch (error) {
        console.error('Error al obtener registros pendientes:', error);
        res.status(500).json({ 
            error: 'Error al obtener los registros pendientes',
            userMessage: 'No se pudieron cargar los registros pendientes. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// GET: Obtener un registro pendiente específico por DNI y modalidadId (opcional)
router.get('/:dni', async (req, res) => {
    try {
        await ensureFileExists();
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);

        const { modalidadId } = req.query;
        let registro = registros.find(r => r.dni === req.params.dni);

        // Si se pasa modalidadId, filtrar también por modalidadId
        if (registro && modalidadId) {
            // Puede estar en r.datos o en r.modalidadId
            const regModalidadId = (registro.datos && registro.datos.modalidadId) || registro.modalidadId;
            if (parseInt(regModalidadId) !== parseInt(modalidadId)) {
                registro = undefined;
            }
        }

        if (!registro) {
            return res.status(404).json({ 
                error: 'Registro no encontrado',
                message: `No se encontró un registro con DNI ${req.params.dni}` + (modalidadId ? ` y modalidadId ${modalidadId}` : '')
            });
        }

        // Antes de devolver, comprobar si ya existe un estudiante con ese DNI en la BD
        try {
            const pool = require('../db');
            const [rows] = await pool.query('SELECT id FROM estudiantes WHERE dni = ?', [req.params.dni]);
            if (rows && rows.length > 0) {
                // Marcar que este DNI ya está registrado en la BD para que el cliente pueda decidir no procesarlo
                registro.alreadyInDb = true;
                registro.idEstudiante = rows[0].id;
                console.log(`📋 Registro pendiente para DNI ${req.params.dni} encontrado, pero el DNI ya está en la BD (idEstudiante=${rows[0].id})`);
            } else {
                console.log(`📋 Obteniendo registro pendiente para DNI: ${req.params.dni}` + (modalidadId ? ` y modalidadId: ${modalidadId}` : ''));
            }
        } catch (dbErr) {
            console.warn('⚠️ No se pudo verificar existencia en BD para DNI:', req.params.dni, dbErr.message);
        }

        res.json(registro);
    } catch (error) {
        console.error('Error al obtener registro pendiente:', error);
        res.status(500).json({ 
            error: 'Error al obtener el registro pendiente',
            userMessage: 'No se pudo recuperar el registro solicitado. Verifique el DNI o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// POST: Crear un nuevo registro pendiente
router.post('/', upload.any(), async (req, res) => {
    try {
        await ensureFileExists();
        
        console.log('📋 [registros-pendientes] Datos recibidos:', req.body);
        console.log('📎 [registros-pendientes] Archivos recibidos:', req.files);

        // Mapear archivos recibidos
        const archivosMap = {};
        if (req.files) {
            req.files.forEach(file => {
                // Guardar la ruta relativa para acceso web
                archivosMap[file.fieldname] = `/archivosPendientes/${file.filename}`;
                console.log(`📎 [archivos-pendientes] Mapeado: ${file.fieldname} → ${file.filename}`);
            });
        }
        
        const nuevoRegistro = {
            dni: req.body.dni || '',
            timestamp: new Date().toISOString(),
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            horaRegistro: new Date().toLocaleTimeString('es-AR'),
            tipo: 'REGISTRO_PENDIENTE',
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
                
                // Domicilio
                calle: req.body.calle || '',
                numero: req.body.numero || '',
                barrio: req.body.barrio || '',
                localidad: req.body.localidad || '',
                provincia: req.body.provincia || '',
                
                
                // Información académica
                modalidad: req.body.modalidad || '',
                modalidadId: req.body.modalidadId || null,
                planAnio: req.body.planAnio !== undefined && req.body.planAnio !== null ? req.body.planAnio : '',
                modulos: req.body.modulos !== undefined && req.body.modulos !== null ? req.body.modulos : '',
                idModulo: Array.isArray(req.body.idModulo)
                    ? req.body.idModulo.filter(x => x && x !== ',' && x !== '').map(String)
                    : (typeof req.body.idModulo === 'string' && req.body.idModulo !== '' && req.body.idModulo !== ',' ? [req.body.idModulo] : []),
                
                // Información del administrador
                administrador: req.body.administrador || req.user?.usuario || 'admin',
                motivoPendiente: req.body.motivoPendiente || 'Documentación incompleta'
            },
            archivos: archivosMap, // Agregar información de archivos subidos
            observaciones: req.body.observaciones || `Registro pendiente creado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`
        };

        // Leer registros existentes
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        // Verificar si ya existe un registro con el mismo DNI
        const registroExistente = registros.findIndex(r => r.dni === nuevoRegistro.dni);
        
        if (registroExistente !== -1) {
            // Actualizar registro existente
            registros[registroExistente] = {
                ...registros[registroExistente],
                ...nuevoRegistro,
                fechaActualizacion: new Date().toISOString()
            };
            console.log(`🔄 Registro pendiente actualizado - DNI: ${nuevoRegistro.dni}`);
        } else {
            // Agregar nuevo registro
            registros.push(nuevoRegistro);
            console.log(`✅ Nuevo registro pendiente creado - DNI: ${nuevoRegistro.dni}`);
        }
        
        // Guardar archivo actualizado
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        
        console.log(`📎 Archivos guardados:`, Object.keys(archivosMap).length, 'archivos');

        // Además, si existe un Registro Web correspondiente (por idRegistroWebOriginal en el body
        // o por DNI), actualizar su estado a PROCESADO_A_PENDIENTES y añadir las rutas de archivos pendientes
        // para que el Gestor y los contadores reflejen el cambio inmediatamente.
        try {
            const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');
            try {
                const rawWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
                let registrosWeb = JSON.parse(rawWeb || '[]');
                let changed = false;
                registrosWeb = registrosWeb.map(rw => {
                    try {
                        // Si el cliente incluyó la referencia al id del registro web original
                        if (req.body && req.body.idRegistroWebOriginal && String(rw.id) === String(req.body.idRegistroWebOriginal)) {
                                changed = true;
                                return {
                                    ...rw,
                                    estado: 'PROCESADO_A_PENDIENTES',
                                    fechaMovimiento: new Date().toISOString(),
                                    fechaActualizacion: new Date().toISOString(),
                                    motivoPendiente: req.body.motivoPendiente || rw.motivoPendiente || 'Documentación incompleta',
                                    archivos: { ...(rw.archivos || {}), ...(archivosMap || {}) },
                                    observaciones: (rw.observaciones || '') + `\nMovido a pendientes por gestor.`,
                                };
                            }

                        // Si no hay idRegistroWebOriginal, intentar emparejar por DNI
                        const rwDni = rw?.datos?.dni;
                        if (!changed && rwDni && String(rwDni) === String(nuevoRegistro.dni)) {
                            changed = true;
                            return {
                                ...rw,
                                estado: 'PROCESADO_A_PENDIENTES',
                                fechaMovimiento: new Date().toISOString(),
                                fechaActualizacion: new Date().toISOString(),
                                motivoPendiente: req.body.motivoPendiente || rw.motivoPendiente || 'Documentación incompleta',
                                archivos: { ...(rw.archivos || {}), ...(archivosMap || {}) },
                                observaciones: (rw.observaciones || '') + `\nMovido a pendientes por gestor.`,
                            };
                        }
                    } catch (e) {
                        // ignore per-record errors
                    }
                    return rw;
                });
                if (changed) {
                    await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registrosWeb, null, 2));
                    console.log(`🔄 Registro Web actualizado automáticamente al crear pendiente para DNI ${nuevoRegistro.dni}`);
                }
            } catch (rErr) {
                // si no existe el archivo o no se pudo leer, lo ignoramos
            }
        } catch (err) {
            console.warn('⚠️ Error intentando actualizar Registro_Web.json tras crear pendiente:', err.message);
        }
        // Después de guardar el pendiente, comprobar si el DNI ya existe en la BD.
        // Si existe, actualizar también el Registro_Web.json marcando el registro web como PROCESADO_Y_Completa
        let registroWebActualizado = null;
        try {
            const pool = require('../db');
            const [rows] = await pool.query('SELECT id FROM estudiantes WHERE dni = ?', [nuevoRegistro.dni]);
            if (rows && rows.length > 0) {
                // Actualizar Registro_Web.json
                try {
                    const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');
                    const rawWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
                    let registrosWeb = JSON.parse(rawWeb || '[]');
                    let changed = false;
                    registrosWeb = registrosWeb.map(rw => {
                        try {
                            const rwDni = rw?.datos?.dni;
                            if (rwDni && String(rwDni) === String(nuevoRegistro.dni)) {
                                changed = true;
                                const updated = {
                                    ...rw,
                                    estado: 'PROCESADO_Y_Completa',
                                    fechaProcesado: new Date().toISOString(),
                                    observaciones: (rw.observaciones || '') + `\nProcesado automáticamente: DNI ya existe en la base de datos (idEstudiante=${rows[0].id}).`
                                };
                                registroWebActualizado = updated;
                                return updated;
                            }
                        } catch (e) {
                            // ignore per-record errors
                        }
                        return rw;
                    });
                    if (changed) {
                        await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registrosWeb, null, 2));
                        console.log(`🔄 Registro Web actualizado automáticamente para DNI ${nuevoRegistro.dni} (marcado PROCESADO_Y_Completa)`);
                    }
                } catch (err) {
                    console.warn('⚠️ No se pudo actualizar Registro_Web.json automáticamente:', err.message);
                }
            }
        } catch (dbErr) {
            console.warn('⚠️ Error comprobando existencia de DNI en BD después de crear pendiente:', dbErr.message);
        }

        res.status(201).json({
            message: 'Registro pendiente guardado exitosamente',
            registro: nuevoRegistro,
            archivosProcesados: Object.keys(archivosMap).length,
            registroWebActualizado
        });
        
    } catch (error) {
        console.error('Error al crear registro pendiente:', error);
        res.status(500).json({ 
            error: 'Error al guardar el registro pendiente',
            userMessage: 'No se pudo guardar el registro pendiente. Revise los datos e intente nuevamente, o contacte al soporte.',
            technical: error.message
        });
    }
});

// PUT: Actualizar estado de un registro pendiente
router.put('/:dni', async (req, res) => {
    try {
        await ensureFileExists();
        const { dni } = req.params;
        const { estado, observaciones } = req.body;
        
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        const indiceRegistro = registros.findIndex(r => r.dni === dni);
        
        if (indiceRegistro === -1) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        
        // Actualizar registro
        registros[indiceRegistro].estado = estado || registros[indiceRegistro].estado;
        registros[indiceRegistro].observaciones = observaciones || registros[indiceRegistro].observaciones;
        registros[indiceRegistro].fechaActualizacion = new Date().toISOString();
        
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        
        console.log(`🔄 Registro pendiente actualizado - DNI: ${dni}, Estado: ${estado}`);
        
        res.json({
            message: 'Registro actualizado exitosamente',
            registro: registros[indiceRegistro]
        });
        
    } catch (error) {
        console.error('Error al actualizar registro pendiente:', error);
        res.status(500).json({ 
            error: 'Error al actualizar el registro pendiente',
            userMessage: 'No se pudo actualizar el registro. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// DELETE: Eliminar un registro pendiente
router.delete('/:dni', async (req, res) => {
    try {
        await ensureFileExists();
        const { dni } = req.params;
        
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        let registros = JSON.parse(data);
        
        const registroAEliminar = registros.find(r => r.dni === dni);
        
        if (!registroAEliminar) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        
        // Filtrar registros (eliminar el seleccionado)
        registros = registros.filter(r => r.dni !== dni);
        
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        
        console.log(`🗑️ Registro pendiente eliminado - DNI: ${dni}`);
        
        res.json({
            message: 'Registro eliminado exitosamente',
            registroEliminado: registroAEliminar
        });
        
    } catch (error) {
        console.error('Error al eliminar registro pendiente:', error);
        res.status(500).json({ 
            error: 'Error al eliminar el registro pendiente',
            userMessage: 'No se pudo eliminar el registro. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// GET: Obtener estadísticas de registros pendientes
router.get('/stats', async (req, res) => {
    try {
        await ensureFileExists();
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        const stats = {
            total: registros.length,
            pendientes: registros.filter(r => r.estado === 'PENDIENTE').length,
            // compat: contar como procesados tanto registros marcados PROCESADO_Y_Completa como el antiguo PROCESADO
            procesados: registros.filter(r => r.estado === 'PROCESADO_Y_Completa' || r.estado === 'PROCESADO').length,
            vencidos: registros.filter(r => {
                const fechaRegistro = new Date(r.timestamp);
                const ahora = new Date();
                const diasTranscurridos = Math.floor((ahora - fechaRegistro) / (1000 * 60 * 60 * 24));
                return diasTranscurridos > 7;
            }).length,
            ultimoRegistro: registros.length > 0 ? registros[registros.length - 1].timestamp : null
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ 
            error: 'Error al obtener estadísticas',
            userMessage: 'No se pudieron calcular las estadísticas. Intente nuevamente o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

// PUT: Actualizar un registro pendiente específico
router.put('/:dni', upload.any(), async (req, res) => {
    try {
        const { dni } = req.params;
        const datosActualizados = req.body;
        
        console.log(`🔄 Actualizando registro pendiente para DNI: ${dni}`);
        
        await ensureFileExists();
        
        // Leer registros existentes
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        let registros = JSON.parse(data);
        
        // Buscar el registro a actualizar
        const indiceRegistro = registros.findIndex(r => r.dni === dni);
        
        if (indiceRegistro === -1) {
            return res.status(404).json({
                success: false,
                message: `Registro pendiente con DNI ${dni} no encontrado`
            });
        }
        
        // Procesar archivos si hay
        const archivosActualizados = {};
        if (req.files && req.files.length > 0) {
            console.log(`📎 Procesando ${req.files.length} archivos actualizados`);
            req.files.forEach(file => {
                archivosActualizados[file.fieldname] = `/archivosPendientes/${file.filename}`;
            });
        }
        
        // Actualizar el registro
        const registroExistente = registros[indiceRegistro];
        registros[indiceRegistro] = {
            ...registroExistente,
            datos: {
                ...registroExistente.datos,
                ...datosActualizados.datos || datosActualizados
            },
            archivos: {
                ...registroExistente.archivos,
                ...archivosActualizados
            },
            timestamp: new Date().toISOString(),
            fechaActualizacion: new Date().toLocaleDateString('es-AR'),
            horaActualizacion: new Date().toLocaleTimeString('es-AR'),
            observaciones: `Registro actualizado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`
        };
        
        // Guardar cambios
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        
        console.log(`✅ Registro pendiente ${dni} actualizado exitosamente`);
        
        res.json({
            success: true,
            message: 'Registro pendiente actualizado exitosamente',
            registro: registros[indiceRegistro]
        });
        
    } catch (error) {
        console.error('Error al actualizar registro pendiente:', error);
        res.status(500).json({
            success: false,
            userMessage: 'Error interno del servidor al actualizar el registro pendiente. Contacte al equipo técnico.',
            technical: error.message
        });
    }
});




// POST: Procesar/aprobar un registro pendiente
router.post('/:dni/procesar', async (req, res) => {
    console.log(`🎯 [PROCESAR] === INICIANDO PROCESO PARA DNI: ${req.params.dni} ===`);
    console.log(`🎯 [PROCESAR] Método: ${req.method}, URL: ${req.originalUrl}`);
    console.log(`🎯 [PROCESAR] Headers: ${JSON.stringify(req.headers['content-type'] || 'N/A')}`);
    
    try {
        await ensureFileExists();
        const { dni } = req.params;
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        let registros = JSON.parse(data);
        const indiceRegistro = registros.findIndex(r => r.dni === dni);
        
        if (indiceRegistro === -1) {
            console.log(`❌ [PROCESAR] Registro pendiente no encontrado para DNI: ${dni}`);
            return res.status(404).json({ 
                error: 'Registro pendiente no encontrado',
                userMessage: `No se encontró un registro pendiente para el DNI ${dni}.`,
                technical: `DNI ${dni} not found in Registros_Pendientes.json`
            });
        }
        
        const registro = registros[indiceRegistro];
        const datos = registro.datos || {};
        
        console.log(`📋 [PROCESAR] Registro encontrado para ${datos.nombre} ${datos.apellido} (DNI: ${dni})`);
        console.log(`📋 [PROCESAR] Modalidad: ${datos.modalidad}, Plan: ${datos.planAnio}, Archivos: ${Object.keys(registro.archivos || {}).length}`);

        // Validar documentación con lógica de documentos alternativos
        const modalidadId = datos.modalidadId || (datos.modalidad === 'Presencial' ? 1 : 2);
        const planAnioId = datos.planAnio || 2;
        
        // Documentos básicos (SIEMPRE requeridos)
        const documentosBasicos = [
            'archivo_dni', 'archivo_cuil', 'archivo_fichaMedica', 'archivo_partidaNacimiento', 'foto'
        ];
        
        const archivos = registro.archivos || {};
        let documentacionCompleta = false;
        let documentacionBasicaCompleta = false;
        let tieneAnaliticoParcial = false;
        let tieneSolicitudPase = false;
        let tieneCertificadoPrimario = false;
        let requiereDocumentoAdicional = false;
        let nombreDocumentoRequerido = '';
        
        // Verificar documentos básicos
        const faltantesBasicos = documentosBasicos.filter(doc => !archivos[doc]);
        documentacionBasicaCompleta = faltantesBasicos.length === 0;
        
        // Verificar documentos adicionales presentes
        tieneAnaliticoParcial = !!archivos['archivo_analiticoParcial'];
        tieneSolicitudPase = !!archivos['archivo_solicitudPase'];
        tieneCertificadoPrimario = !!archivos['archivo_certificadoNivelPrimario'];
        
        // Determinar si documentación está completa según modalidad y plan
        if (modalidadId === 1) { // PRESENCIAL
            if (planAnioId === 1) { // 1er Año
                // Requiere: Básicos + (Certificado Primario O Solicitud Pase)
                // PROCESABLE con al menos uno de los dos
                requiereDocumentoAdicional = true;
                nombreDocumentoRequerido = 'Certificado Nivel Primario o Solicitud de Pase';
                documentacionCompleta = documentacionBasicaCompleta && (tieneCertificadoPrimario || tieneSolicitudPase);
            } else if (planAnioId === 2 || planAnioId === 3) { // 2do/3er Año
                // Requiere: Básicos + (Analítico Parcial O Solicitud Pase)
                // PROCESABLE con cualquiera de los dos
                requiereDocumentoAdicional = true;
                nombreDocumentoRequerido = 'Analítico Parcial o Solicitud de Pase';
                documentacionCompleta = documentacionBasicaCompleta && (tieneAnaliticoParcial || tieneSolicitudPase);
            } else {
                // Caso por defecto para planes no especificados en Presencial
                // Solo requiere documentación básica  
                requiereDocumentoAdicional = false;
                nombreDocumentoRequerido = 'Solo documentación básica';
                documentacionCompleta = documentacionBasicaCompleta;
                console.log(`⚠️ Plan ${planAnioId} no específico para Presencial, usando solo docs básicos`);
            }
        } else if (modalidadId === 2) { // SEMIPRESENCIAL
            if (planAnioId === 4) { // Plan A
                // Requiere: Básicos + (Certificado Primario O Solicitud Pase)
                // PROCESABLE con al menos uno de los dos
                requiereDocumentoAdicional = true;
                nombreDocumentoRequerido = 'Certificado Nivel Primario o Solicitud de Pase';
                documentacionCompleta = documentacionBasicaCompleta && (tieneCertificadoPrimario || tieneSolicitudPase);
            } else if (planAnioId === 5 || planAnioId === 6) { // Plan B/C
                // Requiere: Básicos + (Analítico Parcial O Solicitud Pase)
                // PROCESABLE con cualquiera de los dos
                requiereDocumentoAdicional = true;
                nombreDocumentoRequerido = 'Analítico Parcial o Solicitud de Pase';
                documentacionCompleta = documentacionBasicaCompleta && (tieneAnaliticoParcial || tieneSolicitudPase);
            } else {
                // Caso por defecto para planes no especificados en Semipresencial
                // Solo requiere documentación básica
                requiereDocumentoAdicional = false;
                nombreDocumentoRequerido = 'Solo documentación básica';
                documentacionCompleta = documentacionBasicaCompleta;
                console.log(`⚠️ Plan ${planAnioId} no específico para Semipresencial, usando solo docs básicos`);
            }
        } else {
            // Modalidad no reconocida - usar solo documentación básica
            requiereDocumentoAdicional = false;
            nombreDocumentoRequerido = 'Solo documentación básica';
            documentacionCompleta = documentacionBasicaCompleta;
            console.log(`⚠️ Modalidad ${modalidadId} no reconocida, usando solo docs básicos`);
        }
        
        console.log('📋 Validación de documentación:');
        console.log(`   - Modalidad: ${modalidadId === 1 ? 'Presencial' : modalidadId === 2 ? 'Semipresencial' : 'Desconocida'} (ID: ${modalidadId})`);
        console.log(`   - Plan/Año: ${planAnioId === 1 ? '1er Año' : planAnioId === 2 ? '2do Año' : planAnioId === 3 ? '3er Año' : planAnioId === 4 ? 'Plan A' : planAnioId === 5 ? 'Plan B' : planAnioId === 6 ? 'Plan C' : `Plan ${planAnioId}`}`);
        console.log(`   - Documentos requeridos: ${nombreDocumentoRequerido}`);
        console.log(`   - Básicos (5 docs): ${documentacionBasicaCompleta ? '✅ Completos' : `❌ Faltan ${faltantesBasicos.length}`}`);
        console.log(`   - Analítico Parcial: ${tieneAnaliticoParcial ? '✅' : '❌'}`);
        console.log(`   - Solicitud Pase: ${tieneSolicitudPase ? '✅' : '❌'}`);
        console.log(`   - Certificado Primario: ${tieneCertificadoPrimario ? '✅' : '❌'}`);
        console.log(`   - Requiere documentación adicional: ${requiereDocumentoAdicional ? 'Sí' : 'No'}`);
        console.log(`   - Documentación suficiente para procesar: ${documentacionCompleta}`);

        // 1. Migrar archivos a /archivosDocumento
        let archivosMigrados = {};
        const archivosPendientesDir = path.join(__dirname, '../archivosPendientes');
        const archivosDocumentoDir = path.join(__dirname, '../archivosDocumento');
        await fs.mkdir(archivosDocumentoDir, { recursive: true });
        const copiedFiles = []; // para rollback si la inserción en BD falla
        for (const [campo, ruta] of Object.entries(archivos)) {
            if (!ruta) {
                archivosMigrados[campo] = '';
                continue;
            }

            // Caso 1: archivo cargado desde archivosPendientes (subido por gestor o admin)
            if (ruta.startsWith('/archivosPendientes/')) {
                const nombreArchivo = path.basename(ruta);
                const origen = path.join(archivosPendientesDir, nombreArchivo);
                const destino = path.join(archivosDocumentoDir, nombreArchivo);
                try {
                    await fs.copyFile(origen, destino);
                    archivosMigrados[campo] = `/archivosDocumento/${nombreArchivo}`;
                    // Eliminar el archivo pendiente original una vez copiado
                    try {
                        await fs.unlink(origen);
                        console.log(`🧹 Eliminado archivo pendiente original: ${nombreArchivo}`);
                        // registrar como copiado (destino) para posible rollback
                        copiedFiles.push(destino);
                    } catch (rmErr) {
                        console.warn(`⚠️ No se pudo eliminar archivo pendiente original ${nombreArchivo}:`, rmErr.message);
                    }
                } catch (err) {
                        // En caso de error al copiar, intentar limpiar lo copiado y responder
                        try {
                            for (const f of copiedFiles) {
                                await fs.unlink(f).catch(() => {});
                            }
                        } catch (cleanupErr) {
                            console.warn('⚠️ Error durante cleanup tras fallo de copia:', cleanupErr.message);
                        }
                        console.error(`Error migrando archivo ${nombreArchivo}:`, err);
                        return res.status(500).json({
                            error: `Error migrando archivo ${nombreArchivo}`,
                            userMessage: `No se pudo mover el archivo ${nombreArchivo} a la carpeta de documentos. Verifique el archivo o contacte al equipo técnico.`,
                            technical: err.message
                        });
                    }

            // Caso 2: archivo ya está en archivosDocumento (no hace falta copiar)
            } else if (ruta.startsWith('/archivosDocumento/')) {
                archivosMigrados[campo] = ruta;

            // Caso 3: archivo proviene de archivosDocWeb (registro web). Copiar al folder archivosDocumento
            } else if (ruta.startsWith('/archivosDocWeb/')) {
                const nombreArchivo = path.basename(ruta);
                const origenWeb = path.join(__dirname, '..', 'archivosDocWeb', nombreArchivo);
                const destino = path.join(archivosDocumentoDir, nombreArchivo);

                try {
                    // Si el archivo ya existe en archivosDocumento, no copiar de nuevo
                    try {
                        await fs.access(destino);
                        // existe
                        archivosMigrados[campo] = `/archivosDocumento/${nombreArchivo}`;
                    } catch (accErr) {
                        // no existe: intentar copiar desde archivosDocWeb
                        await fs.copyFile(origenWeb, destino);
                        archivosMigrados[campo] = `/archivosDocumento/${nombreArchivo}`;
                    }
                } catch (err) {
                    // Si no encontramos el archivo en archivosDocWeb, dejar la referencia original para que el cliente lo muestre
                    console.warn(`⚠️ No se pudo copiar desde archivosDocWeb ${nombreArchivo}:`, err.message);
                    // Mantener la ruta web para visualización, aunque la tabla de estudiantes preferirá archivosDocumento
                    archivosMigrados[campo] = ruta;
                }
            } else {
                // Ruta no reconocida: mantener vacía para evitar referencias inválidas
                archivosMigrados[campo] = '';
            }
        }

        // 2. Verificar si el estudiante ya existe en la BD
        const pool = require('../db');
        
        // Verificar si el DNI ya está registrado
        const [estudiantesExistentes] = await pool.query(
            'SELECT id FROM estudiantes WHERE dni = ?',
            [registro.dni]
        );

        let insertId = null;
        let yaExistia = false;

        if (estudiantesExistentes.length > 0) {
            // El estudiante ya existe - ACTUALIZAR documentación
            insertId = estudiantesExistentes[0].id;
            yaExistia = true;
            console.log(`🔄 [PROCESAR] Estudiante con DNI ${registro.dni} ya existe (id=${insertId}). Actualizando documentación...`);

            // IMPORTANTE: Buscar TODOS los archivos disponibles en archivosPendientes para este DNI
            // para permitir actualización incremental de documentos
            const archivosDisponibles = {};
            const archivosEnPendientes = await fs.readdir(ARCHIVOS_PENDIENTES_PATH);
            const prefijoBusqueda = `${registro.datos.nombre}_${registro.datos.apellido}_${registro.dni}_`;
            
            for (const archivo of archivosEnPendientes) {
                if (archivo.startsWith(prefijoBusqueda)) {
                    const nombreSinPrefijo = archivo.replace(prefijoBusqueda, '');
                    const extension = path.extname(nombreSinPrefijo);
                    const tipoArchivo = nombreSinPrefijo.replace(extension, '');
                    
                    archivosDisponibles[tipoArchivo] = `/archivosPendientes/${archivo}`;
                    console.log(`📂 [PROCESAR] Archivo disponible encontrado: ${tipoArchivo} -> ${archivo}`);
                }
            }
            
            // Combinar archivos del registro con archivos disponibles en pendientes
            const todosLosArchivos = { ...registro.archivos, ...archivosDisponibles };
            console.log(`📊 [PROCESAR] Total de archivos a procesar: ${Object.keys(todosLosArchivos).length}`);

            // Migrar TODOS los archivos disponibles
            const archivosMigradosCompletos = {};
            for (const [campo, rutaOriginal] of Object.entries(todosLosArchivos)) {
                if (rutaOriginal && rutaOriginal.includes('/archivosPendientes/')) {
                    const nombreArchivo = path.basename(rutaOriginal);
                    const rutaDestino = path.join(ARCHIVOS_DOCUMENTO_PATH, nombreArchivo);
                    const rutaOrigen = path.join(ARCHIVOS_PENDIENTES_PATH, nombreArchivo);
                    
                    try {
                        await fs.copyFile(rutaOrigen, rutaDestino);
                        await fs.unlink(rutaOrigen);
                        archivosMigradosCompletos[campo] = `/archivosDocumento/${nombreArchivo}`;
                        console.log(`🚚 [PROCESAR] Migrado: ${campo} -> ${nombreArchivo}`);
                        
                        // Verificar que el archivo existe en destino
                        try {
                            await fs.access(rutaDestino);
                            console.log(`✅ [VERIFICAR] Archivo confirmado en destino: ${nombreArchivo}`);
                        } catch (err) {
                            console.error(`❌ [VERIFICAR] Archivo NO encontrado en destino: ${nombreArchivo}`);
                        }
                    } catch (err) {
                        console.warn(`⚠️ Error migrando ${nombreArchivo}:`, err.message);
                        archivosMigradosCompletos[campo] = rutaOriginal; // Mantener ruta original si falla migración
                    }
                } else {
                    archivosMigradosCompletos[campo] = rutaOriginal;
                }
            }

            try {
                // Actualizar foto en tabla estudiantes
                await pool.query(
                    `UPDATE estudiantes SET foto = COALESCE(NULLIF(?, ''), foto) WHERE id = ?`,
                    [archivosMigradosCompletos['foto'] || '', insertId]
                );
                
                console.log(`👤 [PROCESAR] Estudiante actualizado (ID: ${insertId})`);
                
                // Guardar/actualizar TODOS los archivos en tabla archivos_estudiantes
                for (const [campo, rutaArchivo] of Object.entries(archivosMigradosCompletos)) {
                    if (rutaArchivo && (campo.startsWith('archivo_') || campo === 'foto')) {
                        // Verificar si ya existe este tipo de archivo para el estudiante
                        const [existeArchivo] = await pool.query(
                            'SELECT id FROM archivos_estudiantes WHERE idEstudiante = ? AND tipoArchivo = ?',
                            [insertId, campo]
                        );
                        
                        if (existeArchivo.length > 0) {
                            // Actualizar archivo existente
                            await pool.query(
                                'UPDATE archivos_estudiantes SET rutaArchivo = ? WHERE idEstudiante = ? AND tipoArchivo = ?',
                                [rutaArchivo, insertId, campo]
                            );
                            console.log(`🔄 [PROCESAR] Archivo actualizado: ${campo} -> ${rutaArchivo}`);
                        } else {
                            // Insertar nuevo archivo
                            await pool.query(
                                'INSERT INTO archivos_estudiantes (idEstudiante, tipoArchivo, rutaArchivo) VALUES (?, ?, ?)',
                                [insertId, campo, rutaArchivo]
                            );
                            console.log(`➕ [PROCESAR] Archivo agregado: ${campo} -> ${rutaArchivo}`);
                        }
                    }
                }
                
                // Actualizar archivosMigrados con la versión completa
                archivosMigrados = archivosMigradosCompletos;
                
            } catch (updateErr) {
                console.error('❌ Error al actualizar documentación del estudiante existente:', updateErr);
                // Limpiar archivos copiados
                try {
                    for (const f of copiedFiles) {
                        await fs.unlink(f).catch(() => {});
                    }
                } catch (cleanupErr) {
                    console.warn('⚠️ Error limpiando archivos tras fallo de actualización:', cleanupErr.message);
                }
                return res.status(500).json({
                    error: 'Error al actualizar documentación',
                    userMessage: 'No se pudo actualizar la documentación del estudiante existente.',
                    technical: updateErr.message
                });
            }
        } else {
            // El estudiante NO existe - INSERTAR nuevo registro
            try {
                // PASO 1: Crear domicilio primero
                console.log('🏠 [PROCESAR] Creando domicilio...');
                
                // Buscar/crear provincia, localidad y barrio
                const provincia = await buscarOInsertarProvincia(pool, datos.provincia);
                const localidad = await buscarOInsertarLocalidad(pool, datos.localidad, provincia.id);
                const barrio = await buscarOInsertarBarrio(pool, datos.barrio, localidad.id);
                
                // Crear el domicilio
                const [domicilioResult] = await pool.query(
                    'INSERT INTO domicilios (calle, numero, idBarrio, idLocalidad, idProvincia) VALUES (?, ?, ?, ?, ?)',
                    [datos.calle, datos.numero, barrio.id, localidad.id, provincia.id]
                );
                const idDomicilio = domicilioResult.insertId;
                console.log('🏠 [PROCESAR] Domicilio creado con ID:', idDomicilio);
                
                // PASO 2: Crear estudiante con referencia al domicilio (solo campos básicos + foto)
                const [result] = await pool.query(
                    `INSERT INTO estudiantes (nombre, apellido, dni, cuil, email, telefono, fechaNacimiento, tipoDocumento, paisEmision, idDomicilio, foto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        datos.nombre,
                        datos.apellido,
                        registro.dni,
                        datos.cuil,
                        datos.email,
                        datos.telefono,
                        datos.fechaNacimiento,
                        datos.tipoDocumento,
                        datos.paisEmision,
                        idDomicilio,
                        archivosMigrados['foto'] || ''
                    ]
                );
                insertId = result.insertId;
                console.log(`👤 [PROCESAR] Estudiante creado con ID: ${insertId}`);
                
                // PASO 3: Guardar archivos en tabla archivos_estudiantes
                for (const [campo, rutaArchivo] of Object.entries(archivosMigrados)) {
                    if (rutaArchivo && (campo.startsWith('archivo_') || campo === 'foto')) {
                        await pool.query(
                            'INSERT INTO archivos_estudiantes (idEstudiante, tipoArchivo, rutaArchivo) VALUES (?, ?, ?)',
                            [insertId, campo, rutaArchivo]
                        );
                        console.log(`📎 [PROCESAR] Archivo guardado: ${campo} -> ${rutaArchivo}`);
                    }
                }
                console.log(`✅ Nuevo estudiante registrado con id=${insertId}`);
            } catch (insertErr) {
                // Si falló la inserción, intentar limpiar los archivos copiados
                try {
                    for (const f of copiedFiles) {
                        await fs.unlink(f).catch(() => {});
                    }
                } catch (cleanupErr) {
                    console.warn('⚠️ Error limpiando archivos tras fallo de inserción:', cleanupErr.message);
                }
                return res.status(500).json({
                    error: 'Error al guardar en la base de datos',
                    userMessage: 'No se pudo guardar el estudiante en la base de datos. Verifique los datos o contacte al equipo técnico.',
                    technical: insertErr.message
                });
            }
        }

        // 3. Crear/actualizar inscripción y detalle_inscripcion
        let idInscripcion = null;
        
        // Buscar si ya tiene una inscripción
        const [inscripcionesExistentes] = await pool.query(
            'SELECT id FROM inscripciones WHERE idEstudiante = ? ORDER BY id DESC LIMIT 1',
            [insertId]
        );
        
        const tieneInscripcionExistente = inscripcionesExistentes.length > 0;
        
        if (tieneInscripcionExistente) {
            // Ya tiene inscripción, usar la existente
            idInscripcion = inscripcionesExistentes[0].id;
            console.log(`📋 [PROCESAR] Usando inscripción existente id=${idInscripcion} para estudiante ${insertId}`);
        } else {
            // Crear nueva inscripción
            const modalidadId = datos.modalidadId || (datos.modalidad === 'Presencial' ? 1 : 2);
            const planAnioId = datos.planAnio || 2;
            
            // Obtener módulo: para Semipresencial es requerido, para Presencial es 0
            let modulosId = 0;
            if (modalidadId === 2) { // Semipresencial
                if (datos.idModulo && Array.isArray(datos.idModulo) && datos.idModulo.length > 0) {
                    modulosId = parseInt(datos.idModulo[0]);
                } else if (datos.idModulo && !Array.isArray(datos.idModulo)) {
                    modulosId = parseInt(datos.idModulo);
                } else if (datos.modulos) {
                    modulosId = parseInt(datos.modulos);
                }
                
                if (!modulosId || modulosId === 0) {
                    console.warn(`⚠️ Modalidad Semipresencial requiere módulo, pero no se encontró. Usando módulo 1 por defecto.`);
                    modulosId = 1;
                }
            }
            
            const [inscResult] = await pool.query(
                `INSERT INTO inscripciones (fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion)
                VALUES (CURDATE(), ?, ?, ?, ?, 1)`,
                [insertId, modalidadId, planAnioId, modulosId]
            );
            idInscripcion = inscResult.insertId;
            console.log(`📋 Nueva inscripción creada id=${idInscripcion} para estudiante ${insertId} (modalidad=${modalidadId}, plan=${planAnioId}, modulo=${modulosId})`);
        }
        
        // Obtener tipos de documentación y crear mapeo correcto
        const [tiposDoc] = await pool.query('SELECT id, descripcionDocumentacion FROM documentaciones');
        
        // Mapeo de campos del registro a IDs de documentaciones en la BD
        const mapeoDocumentos = {
            'archivo_dni': 1,                              // DNI
            'archivo_cuil': 2,                             // CUIL
            'archivo_fichaMedica': 3,                      // Ficha Médica
            'archivo_partidaNacimiento': 4,                // Partida Nacimiento
            'archivo_solicitudPase': 5,                    // Solicitud Pase
            'archivo_analiticoParcial': 6,                 // Analítico Parcial/Pase
            'archivo_certificadoNivelPrimario': 7,         // Certificado Nivel Primario
            'foto': 8                                       // Foto
        };
        
        console.log(`📄 [PROCESAR] Procesando ${Object.keys(archivosMigrados).length} documentos para inscripción ${idInscripcion}`);
        console.log(`🔍 [DEBUG] archivosMigrados:`, archivosMigrados);

        // Insertar/actualizar detalle_inscripcion para cada archivo migrado
        for (const [campo, ruta] of Object.entries(archivosMigrados)) {
            if (!ruta || ruta === '') {
                console.log(`⚠️ [PROCESAR] Saltando documento vacío: ${campo}`);
                continue;
            }
            
            console.log(`🔍 [DEBUG] Procesando archivo: ${campo} -> ${ruta}`);
            const idTipoDoc = mapeoDocumentos[campo];
            if (!idTipoDoc) {
                console.warn(`⚠️ No se encontró tipo de documentación para: ${campo}`);
                continue;
            }
            
            // Verificar si ya existe este documento
            const [docExistente] = await pool.query(
                'SELECT id FROM detalle_inscripcion WHERE idInscripcion = ? AND idDocumentaciones = ?',
                [idInscripcion, idTipoDoc]
            );
            
            if (docExistente.length > 0) {
                // Actualizar existente
                await pool.query(
                    `UPDATE detalle_inscripcion 
                    SET estadoDocumentacion = 'Entregado', 
                        fechaEntrega = CURDATE(), 
                        archivoDocumentacion = ?
                    WHERE id = ?`,
                    [ruta, docExistente[0].id]
                );
                console.log(`📄 Documento actualizado: ${campo} (idDoc=${idTipoDoc}) en detalle_inscripcion`);
            } else {
                // Insertar nuevo
                await pool.query(
                    `INSERT INTO detalle_inscripcion (idInscripcion, idDocumentaciones, estadoDocumentacion, fechaEntrega, archivoDocumentacion)
                    VALUES (?, ?, 'Entregado', CURDATE(), ?)`,
                    [idInscripcion, idTipoDoc, ruta]
                );
                console.log(`📄 Documento insertado: ${campo} (idDoc=${idTipoDoc}) en detalle_inscripcion`);
            }
        }
        
        // 4. Actualizar estado según nivel de documentación
        let nuevoEstado, estadoInscripcionId;
        let motivoPendiente = '';
        
        if (documentacionCompleta) {
            // Documentación suficiente para procesar (básicos + al menos un documento adicional)
            nuevoEstado = 'PROCESADO';
            estadoInscripcionId = 2; // Estado procesado/Completa
            console.log('✅ Documentación suficiente para procesar - Estado: PROCESADO');
        } else if (documentacionBasicaCompleta && !requiereDocumentoAdicional) {
            // Solo documentación básica y no requiere adicionales
            nuevoEstado = 'PROCESADO';
            estadoInscripcionId = 1;
            console.log('✅ Documentación básica completa - Estado: PROCESADO');
        } else if (documentacionBasicaCompleta && requiereDocumentoAdicional) {
            // Tiene básicos pero faltan documentos adicionales requeridos
            nuevoEstado = 'PENDIENTE';
            estadoInscripcionId = 1;
            motivoPendiente = `Documentación básica completa. Faltan documentos adicionales: ${nombreDocumentoRequerido}`;
            console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
        } else if (documentacionBasicaCompleta && requiereDocumentoAdicional) {
            // Este bloque ya no se ejecutará, pero lo mantenemos por compatibilidad
            nuevoEstado = 'PROCESADO';
            estadoInscripcionId = 1;
            
            if ((planAnioId === 2 || planAnioId === 3 || planAnioId === 5 || planAnioId === 6) && tieneSolicitudPase && !tieneAnaliticoParcial) {
                // Casos 2do/3er Año o Plan B/C: tiene solicitud pero falta analítico
                motivoPendiente = 'Tiene Solicitud de Pase (temporal) - Falta Analítico Parcial (definitivo)';
                console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
            } else if (planAnioId === 1 && tieneCertificadoPrimario && !tieneSolicitudPase) {
                // 1er Año: tiene certificado pero falta solicitud
                motivoPendiente = 'Tiene Certificado Primario - Falta Solicitud de Pase';
                console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
            } else if (planAnioId === 1 && tieneSolicitudPase && !tieneCertificadoPrimario) {
                // 1er Año: tiene solicitud pero falta certificado
                motivoPendiente = 'Tiene Solicitud de Pase - Falta Certificado Nivel Primario';
                console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
            } else if (planAnioId === 4 && tieneCertificadoPrimario && !tieneSolicitudPase) {
                // Plan A: tiene certificado pero falta solicitud
                motivoPendiente = 'Tiene Certificado Primario - Falta Solicitud de Pase';
                console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
            } else if (planAnioId === 4 && tieneSolicitudPase && !tieneCertificadoPrimario) {
                // Plan A: tiene solicitud pero falta certificado
                motivoPendiente = 'Tiene Solicitud de Pase - Falta Certificado Nivel Primario';
                console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
            } else {
                // Caso genérico
                motivoPendiente = 'Faltan documentos adicionales';
                console.log(`⚠️ Documentación básica completa pero ${motivoPendiente} - Estado: PENDIENTE`);
            }
        } else {
            // Faltan documentos básicos
            nuevoEstado = 'PENDIENTE';
            estadoInscripcionId = 1;
            motivoPendiente = `Faltan documentos básicos: ${faltantesBasicos.join(', ')}`;
            console.log(`⚠️ ${motivoPendiente} - Estado: PENDIENTE`);
        }
        
        // Actualizar el estado de la inscripción en la BD
        if (idInscripcion) {
            await pool.query(
                'UPDATE inscripciones SET idEstadoInscripcion = ? WHERE id = ?',
                [estadoInscripcionId, idInscripcion]
            );
            console.log(`📋 Estado de inscripción actualizado: idEstadoInscripcion=${estadoInscripcionId}`);
        }
        
        registros[indiceRegistro] = {
            ...registros[indiceRegistro],
            estado: nuevoEstado,
            fechaProcesado: documentacionCompleta ? new Date().toISOString() : registros[indiceRegistro].fechaProcesado,
            idEstudiante: insertId,
            archivos: archivosMigrados
        };
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        console.log(`✅ [PROCESAR] Estado actualizado a ${nuevoEstado} para DNI ${registro.dni} (id=${insertId})`);
        console.log(`📊 [PROCESAR] RESUMEN FINAL:`);
        console.log(`   - Estudiante: ${yaExistia ? 'ACTUALIZADO' : 'CREADO'} (id=${insertId})`);
        console.log(`   - Inscripción: ${idInscripcion} ${tieneInscripcionExistente ? '(existente)' : '(nueva)'}`);
        console.log(`   - Documentos procesados: ${Object.keys(archivosMigrados).length}`);
        console.log(`   - Estado final: ${nuevoEstado}`);

        // 5. Intentar actualizar Registro_Web.json si existe algún registro web con este DNI
        let registroWebActualizado = null;
        try {
            const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');
            const rawWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
            let registrosWeb = JSON.parse(rawWeb || '[]');
            let changed = false;
            registrosWeb = registrosWeb.map(rw => {
                try {
                    const rwDni = rw?.datos?.dni;
                    if (rwDni && String(rwDni) === String(registro.dni)) {
                        changed = true;
                        const updated = {
                            ...rw,
                            estado: 'PROCESADO_Y_Completa',
                            fechaProcesado: new Date().toISOString(),
                            archivos: archivosMigrados || rw.archivos || {},
                            datos: { ...rw.datos, ...(registro.datos || {}) }
                        };
                        registroWebActualizado = updated;
                        return updated;
                    }
                } catch (e) {
                    // ignore per-record errors
                }
                return rw;
            });
            if (changed) {
                await fs.writeFile(REGISTROS_WEB_PATH, JSON.stringify(registrosWeb, null, 2));
                console.log(`🔄 Registro Web actualizado para DNI ${registro.dni} (marcado PROCESADO_Y_Completa)`);
            }
        } catch (err) {
            console.warn('⚠️ No se pudo actualizar Registro_Web.json después de procesar pendiente:', err.message);
        }

        // Determinar mensaje según nivel de documentación
        let mensajeRespuesta;
        if (documentacionCompleta) {
            mensajeRespuesta = yaExistia 
                ? '✅ Documentación completa - Registro actualizado y Completa en la base de datos'
                : '✅ Documentación completa - Registro procesado y Completa en la base de datos';
        } else if (motivoPendiente) {
            mensajeRespuesta = yaExistia
                ? `⚠️ Registro actualizado pero queda PENDIENTE: ${motivoPendiente}`
                : `⚠️ Estudiante registrado pero queda PENDIENTE: ${motivoPendiente}`;
        } else {
            mensajeRespuesta = yaExistia
                ? '⚠️ Registro actualizado pero documentación incompleta - queda PENDIENTE'
                : '⚠️ Estudiante registrado pero documentación incompleta - queda PENDIENTE';
        }
        
        return res.status(200).json({
            message: mensajeRespuesta,
            insertId,
            archivos: archivosMigrados,
            registroWebActualizado,
            yaExistia,
            documentacionCompleta,
            documentacionBasicaCompleta,
            tieneAnaliticoParcial,
            tieneSolicitudPase,
            tieneCertificadoPrimario,
            motivoPendiente: motivoPendiente || null,
            estado: nuevoEstado
        });
    } catch (error) {
    console.error('Error al procesar/aprobar pendiente:', error);
    res.status(500).json({ error: 'Error al procesar/aprobar pendiente', userMessage: 'Ocurrió un error procesando este registro. Revise los logs o contacte al equipo técnico.', technical: error.message });
    }
});

module.exports = router;