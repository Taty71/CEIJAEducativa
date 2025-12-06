const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const db = require('../db');

// Configurar multer para archivos de completación
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../archivosDocumento'));
    },
    filename: (req, file, cb) => {
        const nombre = (req.body.nombre || 'sin_nombre').trim().replace(/\s+/g, '_');
        const apellido = (req.body.apellido || 'sin_apellido').trim().replace(/\s+/g, '_');
        const dni = (req.body.dni || req.params.dni || 'sin_dni');
        const campo = file.fieldname;
        const ext = path.extname(file.originalname);
        
        const filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');

// Funciones auxiliares para domicilio
const buscarOInsertarProvincia = async (db, nombreProvincia) => {
    const [rows] = await db.query('SELECT * FROM provincias WHERE nombre = ?', [nombreProvincia]);
    if (rows.length > 0) return rows[0];
    const [result] = await db.query('INSERT INTO provincias (nombre) VALUES (?)', [nombreProvincia]);
    return { id: result.insertId, nombre: nombreProvincia };
};

const buscarOInsertarLocalidad = async (db, nombreLocalidad, idProvincia) => {
    const [rows] = await db.query('SELECT * FROM localidades WHERE nombre = ? AND idProvincia = ?', [nombreLocalidad, idProvincia]);
    if (rows.length > 0) return rows[0];
    const [result] = await db.query('INSERT INTO localidades (nombre, idProvincia) VALUES (?, ?)', [nombreLocalidad, idProvincia]);
    return { id: result.insertId, nombre: nombreLocalidad, idProvincia };
};

const buscarOInsertarBarrio = async (db, nombreBarrio, idLocalidad) => {
    const [rows] = await db.query('SELECT * FROM barrios WHERE nombre = ? AND idLocalidad = ?', [nombreBarrio, idLocalidad]);
    if (rows.length > 0) return rows[0];
    const [result] = await db.query('INSERT INTO barrios (nombre, idLocalidad) VALUES (?, ?)', [nombreBarrio, idLocalidad]);
    return { id: result.insertId, nombre: nombreBarrio, idLocalidad };
};

// POST: Completar documentación de registro pendiente y pasar a BD
router.post('/:dni', upload.any(), async (req, res) => {
    try {
        const { dni } = req.params;
        console.log(`✅ [COMPLETAR] Iniciando completación de documentación para DNI: ${dni}`);
        // Log request body and files for traceability
        try {
            console.log('🧾 [REQ BODY] Campos recibidos en body:', Object.keys(req.body).length ? req.body : '(vacío)');
        } catch (e) {
            console.log('🧾 [REQ BODY] No se pudo serializar req.body');
        }
        console.log(`📎 [REQ FILES] Archivos recibidos: ${req.files ? req.files.length : 0}`);
        
        // Leer registros pendientes
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        let registros = JSON.parse(data);
        
        // Buscar el registro pendiente
        const indiceRegistro = registros.findIndex(r => r.dni === dni);
        
        if (indiceRegistro === -1) {
            return res.status(404).json({
                success: false,
                message: `Registro pendiente con DNI ${dni} no encontrado`
            });
        }
        
        const registro = registros[indiceRegistro];
        console.log('📄 [REGISTRO PENDIENTE] Resumen del registro encontrado:', {
            dni: registro.dni,
            nombre: registro.datos?.nombre || registro.nombre,
            apellido: registro.datos?.apellido || registro.apellido,
            modalidad: registro.datos?.modalidad || registro.modalidad,
            planAnio: registro.datos?.planAnio || registro.planAnio,
            modulos: registro.datos?.modulos || registro.modulos,
            idModuloRaw: registro.datos?.idModulo || registro.idModulo,
            archivosKeys: registro.archivos ? Object.keys(registro.archivos) : []
        });
        
        // Verificar si ya existe en BD y tiene inscripción activa
        const [existenteRows] = await db.query(`
            SELECT e.id, COUNT(i.id) as inscripciones_activas 
            FROM estudiantes e 
            LEFT JOIN inscripciones i ON e.id = i.idEstudiante AND i.idEstadoInscripcion = 1
            WHERE e.dni = ?
            GROUP BY e.id`, [dni]);
        
        let idEstudianteExistente = null;
        let usarEstudianteExistente = false;
        
        if (existenteRows && existenteRows.length > 0) {
            idEstudianteExistente = existenteRows[0].id;
            const inscripcionesActivas = existenteRows[0].inscripciones_activas;
            
            if (inscripcionesActivas > 0) {
                // El estudiante existe Y tiene inscripciones activas
                console.log(`⚠️ [INFO] DNI ${dni} existe y tiene ${inscripcionesActivas} inscripción(es) activa(s)`);
                
                // Solo marcar como "ya existe" si realmente tiene inscripciones activas
                usarEstudianteExistente = true;
                
                return res.status(409).json({
                    success: false,
                    yaExistia: true,
                    message: `El estudiante ya está inscripto y tiene ${inscripcionesActivas} inscripción(es) activa(s)`,
                    idEstudiante: idEstudianteExistente
                });
            } else {
                // El estudiante existe pero NO tiene inscripciones activas
                console.log(`✅ [INFO] DNI ${dni} existe pero no tiene inscripciones activas. Procediendo a crear nueva inscripción.`);
                usarEstudianteExistente = true;
            }
        }
        
        // Procesar archivos nuevos
        const archivosNuevos = {};
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                archivosNuevos[file.fieldname] = `/archivosPendientes/${file.filename}`;
            });
        }

        console.log('📁 [ARCHIVOS] Archivos nuevos procesados:', archivosNuevos);

        // Combinar archivos existentes con nuevos
        const todosLosArchivos = {
            ...registro.archivos,
            ...archivosNuevos
        };
        console.log('📂 [ARCHIVOS] Rutas finales combinadas (todosLosArchivos) keys:', Object.keys(todosLosArchivos));

        // Validación completa usando la lógica de validación del backend
        const { obtenerDocumentosRequeridos } = require(path.join(__dirname, '../utils/obtenerDocumentosRequeridos.js'));
        const modalidad = registro.datos?.modalidad || registro.modalidad || '';
        const planAnio = registro.datos?.planAnio || registro.planAnio || '';
        const modulos = registro.datos?.modulos || registro.modulos || '';
        
        console.log('🔍 Validando documentación para:', {
            modalidad,
            planAnio,
            modulos,
            dni: registro.dni
        });
        
        const requerimientos = obtenerDocumentosRequeridos(modalidad, planAnio, modulos);
        const documentosRequeridos = requerimientos.documentos;
        const documentosAlternativos = requerimientos.alternativos;

        // DEBUG: mostrar en una sola traza los documentos requeridos y los archivos disponibles
        try {
            console.log('📋 [DEBUG] Documentos requeridos vs archivos disponibles:', {
                documentosRequeridos,
                documentosAlternativos,
                todosLosArchivos,
                archivosKeys: Object.keys(todosLosArchivos || {})
            });
        } catch (dbgErr) {
            console.warn('⚠️ [DEBUG] No se pudo serializar documentos/archivos para depuración:', dbgErr.message);
        }

        // Validar documentos subidos
        let documentosSubidos = [];
        let documentosFaltantes = [];
        let validacionAlternativaOK = true;
        let detalleDocumentos = {};

        for (const doc of documentosRequeridos) {
            if (documentosAlternativos && (doc === documentosAlternativos.preferido || doc === documentosAlternativos.alternativa)) {
                const tienePreferido = !!todosLosArchivos[documentosAlternativos.preferido];
                const tieneAlternativa = !!todosLosArchivos[documentosAlternativos.alternativa];
                if (tienePreferido || tieneAlternativa) {
                    const docUsado = tienePreferido ? documentosAlternativos.preferido : documentosAlternativos.alternativa;
                    documentosSubidos.push(docUsado);
                    detalleDocumentos[docUsado] = {
                        estado: 'Entregado',
                        ruta: todosLosArchivos[docUsado],
                        esPreferido: tienePreferido
                    };
                } else {
                    documentosFaltantes.push(doc);
                    validacionAlternativaOK = false;
                    detalleDocumentos[documentosAlternativos.preferido] = {
                        estado: 'Faltante',
                        descripcion: documentosAlternativos.descripcion
                    };
                }
                continue;
            }
            
            if (todosLosArchivos[doc]) {
                documentosSubidos.push(doc);
                detalleDocumentos[doc] = {
                    estado: 'Entregado',
                    ruta: todosLosArchivos[doc]
                };
            } else {
                documentosFaltantes.push(doc);
                detalleDocumentos[doc] = {
                    estado: 'Faltante'
                };
            }
        }

        const cantidadSubidos = documentosSubidos.length;
        const totalDocumentos = documentosRequeridos.length;
        const esCompleto = (cantidadSubidos === totalDocumentos) && validacionAlternativaOK;
        
        console.log('📋 Resultado validación documentos:', {
            cantidadSubidos,
            totalDocumentos,
            esCompleto,
            validacionAlternativaOK,
            documentosSubidos,
            documentosFaltantes,
            detalleDocumentos
        });

        if (!esCompleto) {
            // Si falta documentación, guardar los archivos nuevos en archivosPendientes
            const fsExtra = require('fs-extra');
            const carpetaPendientes = path.join(__dirname, '../archivosPendientes');
            await fsExtra.ensureDir(carpetaPendientes);
            const archivosPendientes = { ...registro.archivos };
            
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const nombreArchivo = file.filename;
                    const origen = path.join(__dirname, '../archivosPendientes', nombreArchivo);
                    const destino = path.join(carpetaPendientes, nombreArchivo);
                    try {
                        await fsExtra.copy(origen, destino);
                        archivosPendientes[file.fieldname] = `/archivosPendientes/${nombreArchivo}`;
                        console.log(`📁 Archivo guardado en pendientes: ${nombreArchivo}`);
                    } catch (err) {
                        console.warn(`⚠️ Error copiando archivo a pendientes: ${nombreArchivo}`, err.message);
                    }
                }
            }
            
            // Actualizar el registro pendiente con los nuevos archivos y estado
            const motivoPendiente = `⚠️ Documentación incompleta (${cantidadSubidos}/${totalDocumentos}) para ${registro.dni} - Registro quedará PENDIENTE. Faltan: ${documentosFaltantes.map(doc => {
                const nombreLegible = doc.replace('archivo_', '').replace(/([A-Z])/g, ' $1').toLowerCase();
                return `📄 ${nombreLegible}`;
            }).join(', ')}`;

                // DEBUG: mostrar el detalleDocumentos que vamos a guardar en el JSON del registro pendiente
                try {
                    console.log('📑 [DEBUG] detalleDocumentos que se guardará en Registros_Pendientes.json:', detalleDocumentos);
                    console.log('📁 [DEBUG] archivosPendientes que se guardarán:', archivosPendientes);
                } catch (dbgErr) {
                    console.warn('⚠️ [DEBUG] No se pudo serializar detalleDocumentos/archivosPendientes:', dbgErr.message);
                }

                registros[indiceRegistro] = {
                    ...registro,
                    archivos: archivosPendientes,
                    estado: 'PENDIENTE',
                    fechaActualizacion: new Date().toISOString(),
                    detalleDocumentos,
                    motivoPendiente,
                    fechaUltimaActualizacion: new Date().toISOString()
                };
            
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
            
            console.log('📝 Registro actualizado como PENDIENTE:', {
                dni: registro.dni,
                documentosSubidos: cantidadSubidos,
                documentosFaltantes,
                motivoPendiente
            });
            
            // Actualizar contador y estado en la respuesta
            return res.status(200).json({
                success: true,
                migradoAPendientes: true,
                migradoABaseDatos: false,
                message: 'Registro actualizado en Pendientes de Inscripción',
                documentosFaltantes,
                documentosSubidos,
                detalleDocumentos,
                archivosPendientes,
                estado: 'PENDIENTE',
                motivoPendiente,
                contadorPendientes: registros.length,
                fechaActualizacion: new Date().toISOString()
            });
        }
        
        // Extraer datos del registro
        const datos = registro.datos || registro;
        console.log('🔎 [DATOS] Datos que se usarán para crear/actualizar estudiante e inscripción:', {
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni || dni,
            telefono: datos.telefono,
            email: datos.email,
            modalidadId: datos.modalidadId,
            planAnio: datos.planAnio,
            idModuloRaw: datos.idModulo
        });
        
        // 1. Crear domicilio (solo si vamos a crear estudiante nuevo)
        const provincia = datos.provincia || 'Córdoba';
        const localidad = datos.localidad || datos.ciudad || 'La Calera';
        const barrio = datos.barrio || 'Centro';
        const calle = datos.calle || datos.direccion || 'Sin especificar';
        const numero = parseInt(datos.numero || datos.numeroCalle || '0') || 0;
        
        let idDomicilio = null;
        if (!usarEstudianteExistente) {
            const provinciaResult = await buscarOInsertarProvincia(db, provincia);
            const localidadResult = await buscarOInsertarLocalidad(db, localidad, provinciaResult.id);
            const barrioResult = await buscarOInsertarBarrio(db, barrio, localidadResult.id);
            
            const [domicilioRes] = await db.query(
                'INSERT INTO domicilios (calle, numero, idBarrio, idLocalidad, idProvincia) VALUES (?,?,?,?,?)',
                [calle, numero, barrioResult.id, localidadResult.id, provinciaResult.id]
            );
            idDomicilio = domicilioRes.insertId;
        }
        
        // 2. Crear estudiante
        // Si la foto está en archivosPendientes, mover a archivosDocumento
        let fotoUrl = todosLosArchivos.foto || todosLosArchivos.archivo_foto || null;
        if (fotoUrl && fotoUrl.startsWith('/archivosPendientes/')) {
            const nombreArchivo = fotoUrl.split('/').pop();
            const origen = path.join(__dirname, '../archivosPendientes', nombreArchivo);
            const destino = path.join(__dirname, '../archivosDocumento', nombreArchivo);
            const fsExtra = require('fs-extra');
            try {
                await fsExtra.copy(origen, destino);
                fotoUrl = `/archivosDocumento/${nombreArchivo}`;
                    // Intentar eliminar el archivo original en archivosPendientes si existe
                    try {
                        const origenPend = path.join(__dirname, '../archivosPendientes', nombreArchivo);
                        await fsExtra.remove(origenPend);
                        console.log(`🧹 Eliminado archivo pendiente original: ${nombreArchivo}`);
                    } catch (rmErr) {
                        console.warn(`⚠️ No se pudo eliminar archivo pendiente original ${nombreArchivo}:`, rmErr.message);
                    }
            } catch (err) {
                console.warn(`⚠️ Error moviendo foto a archivosDocumento: ${nombreArchivo}`, err.message);
            }
        }
        const fechaNacimiento = datos.fechaNacimiento || null;
        
        // 2. Crear estudiante si no existe; si existe, usar su id
        let idEstudiante = idEstudianteExistente;
        if (!usarEstudianteExistente) {
            const [estRes] = await db.query(
                `INSERT INTO estudiantes
                 (nombre, apellido, tipoDocumento, paisEmision, dni, cuil, email, telefono, fechaNacimiento, foto, idDomicilio, idUsuarios)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    datos.nombre,
                    datos.apellido, 
                    datos.tipoDocumento || 'DNI',
                    datos.paisEmision || 'Argentina',
                    dni,
                    datos.cuil || null,
                    datos.email || null,
                    datos.telefono || null,
                    fechaNacimiento,
                    fotoUrl,
                    idDomicilio,
                    null
                ]
            );
            idEstudiante = estRes.insertId;
            console.log(`🆕 [BD] Estudiante creado: idEstudiante=${idEstudiante}`);
        }

        if (usarEstudianteExistente) {
            console.log(`🔁 [BD] Usando estudiante existente: idEstudiante=${idEstudiante}`);
        }
        
            // 3. Crear o reutilizar inscripción (sin modificar estado)
            const modalidadId = parseInt(datos.modalidadId) || 1;
            const planAnioId = parseInt(datos.planAnio) || 1;
            // Array de módulos - procesar desde el idModulo array
            console.log('🔍 [DEBUG] Módulos recibidos (raw):', datos.idModulo);
            let modulosIds = [];
            
            if (Array.isArray(datos.idModulo)) {
                modulosIds = datos.idModulo
                    .filter(id => id && id !== '' && id !== null)
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));
            } else if (datos.idModulo && datos.idModulo !== '') {
                const parsedId = parseInt(datos.idModulo);
                if (!isNaN(parsedId)) {
                    modulosIds = [parsedId];
                }
            }
            
            console.log('✅ [DEBUG] Módulos procesados:', modulosIds);

            console.log('🔎 [VALIDACION] modalidadId, planAnioId, idEstadoInscripcion:', { modalidadId, planAnioId, idEstadoInscripcion });

            // Para modalidad Semipresencial, exigir módulo
            if (modalidadId === 2 && (!modulosIds || modulosIds.length === 0)) {
                console.error('❌ [ERROR] Modalidad Semipresencial requiere al menos un módulo');
                return res.status(400).json({
                    success: false,
                    message: 'La modalidad Semipresencial requiere seleccionar al menos un módulo.'
                });
            }

            const idEstadoInscripcion = datos.idEstadoInscripcion || 1; // Usar el estado del formulario, o 1 por defecto

            // Validar existencia en tablas referenciadas
            const [[modalidadExiste]] = await db.query('SELECT id FROM modalidades WHERE id = ?', [modalidadId]);
            if (!modalidadExiste) {
                return res.status(400).json({
                    success: false,
                    message: `La modalidad seleccionada (${modalidadId}) no existe en la base de datos.`
                });
            }
            const [[planExiste]] = await db.query('SELECT id FROM anio_plan WHERE id = ?', [planAnioId]);
            if (!planExiste) {
                return res.status(400).json({
                    success: false,
                    message: `El año/plan seleccionado (${planAnioId}) no existe en la base de datos.`
                });
            }
            
            // Validar todos los módulos
            for (const moduloId of modulosIds) {
                const [[moduloExiste]] = await db.query('SELECT id FROM modulos WHERE id = ?', [moduloId]);
                if (!moduloExiste) {
                    return res.status(400).json({
                        success: false,
                        message: `El módulo seleccionado (${moduloId}) no existe en la base de datos.`
                    });
                }
            }        // Verificar si ya existe una inscripción para este estudiante con la misma modalidad/plan/modulo
        let idInscripcion = null;
        try {
            // Comenzar transacción
            console.log('🔐 [BD] Iniciando transacción para creación/verificación de inscripción');
            await db.query('START TRANSACTION');

            // Verificar/crear inscripción principal sin módulo
            const [inscripcionesExistentes] = await db.query(
                'SELECT id AS idInscripcion FROM inscripciones WHERE idEstudiante = ? AND idModalidad = ? AND idAnioPlan = ? LIMIT 1',
                [idEstudiante, modalidadId, planAnioId]
            );

            if (inscripcionesExistentes && inscripcionesExistentes.length > 0) {
                idInscripcion = inscripcionesExistentes[0].idInscripcion;
                console.log(`[INFO] Ya existe inscripción para estudiante ${idEstudiante}: idInscripcion=${idInscripcion}`);
            } else {
                const [inscRes] = await db.query(
                    'INSERT INTO inscripciones (idEstudiante, idModalidad, idAnioPlan, fechaInscripcion, idEstadoInscripcion) VALUES (?, ?, ?, CURDATE(), ?)',
                    [idEstudiante, modalidadId, planAnioId, idEstadoInscripcion]
                );
                idInscripcion = inscRes.insertId;
                console.log(`[INFO] Nueva inscripción creada: idInscripcion=${idInscripcion}`);
            }

            // Guardar módulo en la inscripción: el esquema actual usa `inscripciones.idModulos` (entero).
            // No usamos la tabla `inscripcion_modulos` (many-to-many) porque no existe en la base de datos del usuario.
            // Comportamiento: si se seleccionaron varios módulos, tomamos el primero como el módulo principal
            // y lo guardamos en la columna `idModulos` para mantener compatibilidad con consultas existentes.
            try {
                if (modulosIds && modulosIds.length > 0) {
                    const moduloPrincipal = modulosIds[0];
                    console.log(`� Guardando módulo principal ${moduloPrincipal} en inscripciones.idModulos para idInscripcion=${idInscripcion}`);
                    await db.query('UPDATE inscripciones SET idModulos = ? WHERE id = ?', [moduloPrincipal, idInscripcion]);
                } else {
                    // Si no hay módulos seleccionados, asegurarnos de dejar idModulos en 0
                    console.log(`ℹ️ No hay módulos para guardar para la inscripción ${idInscripcion}. Estableciendo idModulos = 0`);
                    await db.query('UPDATE inscripciones SET idModulos = ? WHERE id = ?', [0, idInscripcion]);
                }
            } catch (modErr) {
                console.warn(`⚠️ [BD] Error actualizando idModulos en inscripciones para idInscripcion=${idInscripcion}:`, modErr.message);
                // No abortamos la operación completa por este fallo; se registró el warning.
            }

            // Confirmar transacción
            await db.query('COMMIT');
        } catch (insErr) {
            console.error('Error verificando/creando inscripción:', insErr.message);
            return res.status(500).json({ success: false, userMessage: 'Error al crear o verificar la inscripción en la base de datos.', technical: insErr.message });
        }
        
        // 4. Guardar archivos en BD
        const fsExtra = require('fs-extra');
        
        try {
            // Iniciar transacción para archivos
            console.log('🔐 [BD] Iniciando transacción para procesamiento de archivos');
            await db.query('START TRANSACTION');
            
            // Asegurarnos de que la tabla `archivos_estudiantes` exista
            await db.query(`
                CREATE TABLE IF NOT EXISTS archivos_estudiantes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    idEstudiante INT NOT NULL,
                    tipoArchivo VARCHAR(100),
                    rutaArchivo VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX (idEstudiante)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);

            // Preparar carpeta de destino
            const destinoDir = path.join(__dirname, '../archivosDocumento');
            await fsExtra.ensureDir(destinoDir);

            // Array para rastrear archivos movidos exitosamente
            const archivosMigrados = [];

            console.log('📋 [FILES] Procesando archivos para detalle de inscripción. Total campos:', Object.keys(todosLosArchivos).length);

            for (const [campo, rutaArchivo] of Object.entries(todosLosArchivos)) {
                if (rutaArchivo && (campo.startsWith('archivo_') || campo === 'foto')) {
                try {
                    // Copiar archivo a archivosDocumento si no está allí
                    const nombreArchivo = rutaArchivo.split('/').pop();
                    let origen = null;
                    
                    // Determinar la ubicación correcta del archivo
                    if (rutaArchivo.startsWith('/archivosDocWeb/')) {
                        origen = path.join(__dirname, '../archivosDocWeb', nombreArchivo);
                    } else if (rutaArchivo.startsWith('/archivosPendientes/')) {
                        origen = path.join(__dirname, '../archivosPendientes', nombreArchivo);
                    } else if (rutaArchivo.startsWith('/archivosDocumento/')) {
                        origen = path.join(__dirname, '../archivosDocumento', nombreArchivo);
                    }
                    
                    if (!origen) {
                        console.error(`❌ Ruta de archivo inválida: ${rutaArchivo}`);
                        continue;
                    }
                    const destino = path.join(__dirname, '../archivosDocumento', nombreArchivo);
                    
                    // Si el archivo viene de archivosPendientes, asegurarnos de moverlo correctamente
                    if (origen && origen !== destino) {
                        try {
                            // Primero verificar que el archivo existe en origen
                            const existeOrigen = await fsExtra.pathExists(origen);
                            if (!existeOrigen) {
                                console.warn(`⚠️ Archivo no encontrado en origen: ${origen}`);
                                continue;
                            }

                            // Copiar a archivosDocumento
                            await fsExtra.copy(origen, destino);
                            console.log(`📁 Copiado ${nombreArchivo} a archivosDocumento`);

                            // Si viene de archivosPendientes, eliminarlo del origen
                            if (rutaArchivo.startsWith('/archivosPendientes/')) {
                                try {
                                    await fsExtra.remove(origen);
                                    console.log(`🧹 Eliminado archivo pendiente original: ${nombreArchivo}`);
                                } catch (rmErr) {
                                    console.warn(`⚠️ No se pudo eliminar archivo pendiente: ${nombreArchivo}:`, rmErr.message);
                                }
                            }

                            // Actualizar la ruta en el registro para reflejar la nueva ubicación
                            rutaArchivo = `/archivosDocumento/${nombreArchivo}`;
                            archivosMigrados.push({ campo, nombreArchivo, rutaNueva: rutaArchivo });
                        } catch (copyError) {
                            console.error(`❌ Error procesando archivo ${nombreArchivo}:`, copyError.message);
                            await db.query('ROLLBACK');
                            throw new Error(`Error al procesar archivo ${nombreArchivo}: ${copyError.message}`);
                        }
                    }

                    // Guardar ruta en archivos_estudiantes
                    await db.query(
                        'INSERT INTO archivos_estudiantes (idEstudiante, tipoArchivo, rutaArchivo) VALUES (?, ?, ?)',
                        [idEstudiante, campo, `/archivosDocumento/${nombreArchivo}`]
                    );
                    console.log(`💾 [BD] Archivo registrado en archivos_estudiantes: ${nombreArchivo} (campo=${campo})`);

                    // Mapeo explícito de documentación
                    const DocumentacionNameToId = {
                        archivo_dni: 1,
                        archivo_cuil: 2,
                        archivo_fichaMedica: 3,
                        archivo_partidaNacimiento: 4,
                        archivo_solicitudPase: 5,
                        archivo_analiticoParcial: 6,
                        archivo_certificadoNivelPrimario: 7,
                        foto: 8,
                    };
                    
                    const idDocumentaciones = DocumentacionNameToId[campo];
                    if (idDocumentaciones) {
                        await db.query(
                            'INSERT INTO detalle_inscripcion (estadoDocumentacion, fechaEntrega, idDocumentaciones, idInscripcion, archivoDocumentacion) VALUES (?, CURDATE(), ?, ?, ?)',
                            ['Entregado', idDocumentaciones, idInscripcion, `/archivosDocumento/${nombreArchivo}`]
                        );
                        console.log(`💾 [BD] detalle_inscripcion insertado para idDocumentaciones=${idDocumentaciones} (archivo=${nombreArchivo})`);
                    }
                } catch (archivoError) {
                    console.error(`❌ Error guardando archivo ${campo}:`, archivoError.message);
                    await db.query('ROLLBACK');
                    throw archivoError;
                }
            }
        }

        // Si llegamos aquí, todos los archivos se procesaron correctamente
        await db.query('COMMIT');

            // DEBUG: mostrar el detalleDocumentos final antes de eliminar el registro pendiente
            try {
                console.log('📑 [DEBUG] detalleDocumentos final para registro (antes de eliminar pendiente):', detalleDocumentos);
            } catch (dbgErr) {
                console.warn('⚠️ [DEBUG] No se pudo serializar detalleDocumentos final:', dbgErr.message);
            }

        // Solo después de confirmar la transacción, eliminamos los archivos originales
        for (const { nombreArchivo } of archivosMigrados) {
            try {
                const origenPend = path.join(__dirname, '../archivosPendientes', nombreArchivo);
                await fsExtra.remove(origenPend);
                console.log(`🧹 Eliminado archivo pendiente original: ${nombreArchivo}`);
            } catch (rmErr) {
                // No es crítico si falla la eliminación de los originales
                console.warn(`⚠️ No se pudo eliminar archivo pendiente original ${nombreArchivo}:`, rmErr.message);
            }
        }
        } catch (error) {
        console.error('❌ Error procesando archivos:', error);
        try {
            await db.query('ROLLBACK');
            console.log('🔄 [BD] Rollback realizado por error en procesamiento de archivos');
        } catch (rbErr) {
            console.error('❌ Error realizando rollback tras fallo en archivos:', rbErr.message);
        }
        throw error;
    }

            // 5. Eliminar el registro pendiente del JSON
            const registroEliminado = registros.splice(indiceRegistro, 1)[0];
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));

        // 6. Intentar actualizar un posible registro web que correspondiera a este DNI
        // Hacemos esto antes de responder para que el cliente (GestorRegistrosWeb) vea el cambio inmediatamente
        let registroWebActualizado = null;
        try {
            const REGISTROS_WEB_PATH = path.join(__dirname, '..', 'data', 'Registro_Web.json');
            const rawWeb = await fs.readFile(REGISTROS_WEB_PATH, 'utf8');
            let registrosWeb = JSON.parse(rawWeb || '[]');
            let changed = false;
            registrosWeb = registrosWeb.map(rw => {
                try {
                    const rwDni = rw?.datos?.dni || rw?.dni;
                    if (rwDni && String(rwDni) === String(dni)) {
                        changed = true;
                        const updated = {
                            ...rw,
                            estado: 'PROCESADO_Y_Completa',
                            fechaProcesado: new Date().toISOString(),
                            archivos: todosLosArchivos || rw.archivos || {},
                            datos: { ...rw.datos, ...datos }
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
                console.log(`🔄 Registro Web actualizado para DNI ${dni} (marcado PROCESADO_Y_Completa)`);
            }
        } catch (webErr) {
            console.warn('⚠️ No se pudo actualizar Registro_Web.json:', webErr.message);
        }

        console.log(`✅ [COMPLETAR] Estudiante ${datos.nombre} ${datos.apellido} (DNI: ${dni}) registrado y eliminado de pendientes`);

        // 7. Responder al cliente indicando éxito. Mantener el estado claro de la operación
        res.json({
            success: true,
            migradoABaseDatos: true,
            migradoAPendientes: false,
            message: 'Documentación completada y archivos guardados correctamente',
            estado: 'PROCESADO_Y_Completa',
            documentosGuardados: todosLosArchivos,
            rutasActualizadas: true,
            estudiante: {
                id: idEstudiante,
                nombre: datos.nombre,
                apellido: datos.apellido,
                dni: dni,
                inscripcionId: idInscripcion
            },
            registroPendiente: registroEliminado,
            registroWebActualizado
        });
        
    } catch (error) {
        console.error('Error completando documentación:', error);
        
        // Intentar revertir la transacción si está activa
        try {
            await db.query('ROLLBACK');
            console.log('🔄 Transacción revertida después de error');
        } catch (rollbackError) {
            console.error('Error adicional al revertir transacción:', rollbackError);
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            userMessage: 'Ocurrió un error al completar la documentación. Revise los datos e intente nuevamente, o contacte al equipo técnico.',
            technical: error.message
        });
    }
});

module.exports = router;