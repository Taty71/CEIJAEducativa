const { leerRegistrosPendientes, guardarRegistrosPendientes, detectarArchivosDisponibles, migrarArchivosRegistro } = require('./fileManager');
const { validarDocumentacion, generarMensajePendiente } = require('./documentValidator');
const { insertarEstudianteCompleto, verificarEstudianteExistente, insertarInscripcion } = require('./databaseManager');
const { determinarEstadoNotificacion } = require('./vencimientoUtils');
const { enviarEmailEstudiante } = require('../emailService');

// Controlador: Obtener todos los registros pendientes
const obtenerTodosLosRegistros = async (req, res) => {
    const db = require('../../db');

    try {
        console.log('📋 [GET] Solicitando todos los registros pendientes');
        const registros = await leerRegistrosPendientes();

        // Sincronización automática de estados
        let actualizados = 0;
        for (let i = 0; i < registros.length; i++) {
            const registro = registros[i];

            // Solo verificar registros PENDIENTES o PROCESADOS
            if (registro.estado === 'PENDIENTE' || registro.estado === 'PROCESADO') {
                try {
                    console.log(`🔍 [VERIFICAR] Consultando estudiante con DNI: ${registro.dni}`);
                    const [rows] = await db.query('SELECT id FROM estudiantes WHERE dni = ?', [registro.dni]);

                    if (rows && rows.length > 0) {
                        const idEstudiante = rows[0].id;
                        console.log(`✅ [VERIFICAR] Estudiante encontrado: ${registro.datos?.nombre || 'N/A'} ${registro.datos?.apellido || 'N/A'} (ID: ${idEstudiante})`);

                        // Verificar inscripciones
                        const [inscripciones] = await db.query(`
                            SELECT ei.descripcionEstado as estado
                            FROM inscripciones i 
                            JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
                            WHERE i.idEstudiante = ?
                        `, [idEstudiante]);

                        console.log(`📋 [VERIFICAR] ${inscripciones.length} inscripción(es) encontrada(s)`);

                        // Contar documentos
                        const [documentos] = await db.query(`
                            SELECT COUNT(*) as total FROM archivos_estudiantes WHERE idEstudiante = ?
                        `, [idEstudiante]);

                        const totalDocumentos = documentos[0]?.total || 0;
                        console.log(`📁 [VERIFICAR] ${totalDocumentos} documento(s) en BD`);

                        let necesitaActualizacion = false;

                        // SOLO enriquecer con información de BD, NO cambiar estados
                        // El estado lo decide exclusivamente el administrador al completar el registro
                        if (!registro.idEstudiante) {
                            registro.idEstudiante = idEstudiante;
                            necesitaActualizacion = true;
                            console.log(` [SYNC] Vinculando ${registro.dni} con idEstudiante: ${idEstudiante}`);
                        }

                        // Agregar flag para indicar que existe en BD (para el frontend)
                        if (!registro.estudianteEnBD) {
                            registro.estudianteEnBD = true;
                            registro.inscripcionesBD = inscripciones.length;
                            registro.documentosBD = totalDocumentos;
                            necesitaActualizacion = true;
                            console.log(`🏷️ [SYNC] Marcando ${registro.dni} como existente en BD (${inscripciones.length} inscripciones, ${totalDocumentos} documentos)`);
                        }

                        // NO cambiar estado - eso lo decide el administrador
                        console.log(`ℹ️ [SYNC] Estado actual de ${registro.dni}: ${registro.estado} (mantenido, lo decide el administrador)`)

                        if (necesitaActualizacion) {
                            actualizados++;
                        }
                    } else {
                        console.log(`❌ [VERIFICAR] No se encontró estudiante con DNI: ${registro.dni}`);
                    }
                } catch (dbError) {
                    console.warn(`⚠️ [SYNC] Error verificando DNI ${registro.dni}:`, dbError.message);
                }
            }
        }

        // Guardar cambios si hay actualizaciones
        if (actualizados > 0) {
            await guardarRegistrosPendientes(registros);
            console.log(`🔄 [SYNC] ${actualizados} registros sincronizados automáticamente con BD`);
        }

        // 3. Enriquecer con archivos en disco para registros PENDIENTES
        for (let i = 0; i < registros.length; i++) {
            if (registros[i].estado === 'PENDIENTE') {
                const archivosDetectados = await detectarArchivosDisponibles(registros[i]);
                // Combinar con los que ya tiene (los detectados mandan porque son la realidad del disco)
                registros[i].archivos = { ...registros[i].archivos, ...archivosDetectados };

                // También actualizar idDocumentaciones si es necesario
                const totalDetectados = Object.keys(archivosDetectados).filter(k => archivosDetectados[k]).length;
                console.log(`📁 [SYNC-DISCO] ${registros[i].dni}: ${totalDetectados} archivos detectados en disco`);
            }
        }

        // Agregar información de vencimiento a cada registro
        const registrosConVencimiento = registros.map(registro => ({
            ...registro,
            vencimiento: determinarEstadoNotificacion(registro)
        }));

        console.log(`✅ [GET] Enviando ${registrosConVencimiento.length} registros pendientes`);
        res.json(registrosConVencimiento);
    } catch (error) {
        console.error('❌ [GET] Error al obtener registros:', error);
        res.status(500).json({
            mensaje: 'Error al obtener registros pendientes',
            error: error.message
        });
    }
};

// Controlador: Obtener un registro por DNI
const obtenerRegistroPorDni = async (req, res) => {
    const db = require('../../db');

    try {
        const { dni } = req.params;
        console.log(`🔍 [GET] Buscando registro con DNI: ${dni}`);

        const registros = await leerRegistrosPendientes();
        let registro = registros.find(r => r.dni === dni);
        let indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (!registro) {
            console.log(`❌ [GET] Registro no encontrado para DNI: ${dni}`);
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        // Verificar si el estudiante existe en la base de datos y sincronizar estado
        const [rows] = await db.query('SELECT id FROM estudiantes WHERE dni = ?', [dni]);

        if (rows && rows.length > 0) {
            const idEstudiante = rows[0].id;

            // Verificar inscripciones y documentación
            const [inscripciones] = await db.query(`
                SELECT i.id as idInscripcion, ei.descripcionEstado as estado,
                       m.descripcionModalidad as modalidad, ap.descripcionPlan as plan
                FROM inscripciones i 
                JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
                LEFT JOIN modalidades m ON i.idModalidad = m.id
                LEFT JOIN anio_plan ap ON i.idAnioPlan = ap.id
                WHERE i.idEstudiante = ?
            `, [idEstudiante]);

            // Obtener documentos de la base de datos
            const [documentos] = await db.query(`
                SELECT ae.tipo_archivo, ae.ruta_archivo, ae.fecha_subida
                FROM archivos_estudiantes ae
                WHERE ae.idEstudiante = ?
            `, [idEstudiante]);

            // SOLO enriquecer con información de BD, NO cambiar estados
            // El estado lo decide exclusivamente el administrador al completar el registro
            let necesitaActualizacion = false;
            if (!registro.idEstudiante) {
                registro.idEstudiante = idEstudiante;
                necesitaActualizacion = true;
                console.log(` [SYNC] Vinculando ${registro.datos.nombre} ${registro.datos.apellido} con idEstudiante: ${idEstudiante}`);
            }

            // Agregar flag para indicar que existe en BD (para el frontend)
            if (!registro.estudianteEnBD) {
                registro.estudianteEnBD = true;
                registro.inscripcionesBD = inscripciones.length;
                registro.documentosBD = documentos.length;
                necesitaActualizacion = true;
                console.log(`🏷️ [SYNC] Marcando ${registro.datos.nombre} ${registro.datos.apellido} como existente en BD`);
            }

            // NO cambiar estado - eso lo decide el administrador
            console.log(`ℹ️ [SYNC] Estado actual: ${registro.estado} (mantenido, lo decide el administrador)`)

            // Agregar información de la base de datos
            registro.datosBaseDatos = {
                idEstudiante,
                inscripciones: inscripciones,
                documentos: documentos.map(doc => ({
                    tipo: doc.tipo_archivo,
                    archivo: doc.ruta_archivo,
                    fechaSubida: doc.fecha_subida
                })),
                estadoInscripcion: inscripciones.length > 0 ? inscripciones[0].estado : null
            };

            // Guardar cambios si es necesario
            if (necesitaActualizacion) {
                registros[indiceRegistro] = registro;
                await guardarRegistrosPendientes(registros);
            }

        } else {
            // Si no está en BD, detectar archivos disponibles en archivosPendientes
            const archivosDisponibles = await detectarArchivosDisponibles(registro);
            registro.archivosDisponibles = archivosDisponibles;
        }

        // Agregar información de vencimiento
        registro.vencimiento = determinarEstadoNotificacion(registro);

        console.log(`✅ [GET] Registro encontrado para DNI: ${dni} - Estado: ${registro.estado}`);
        res.json(registro);

    } catch (error) {
        console.error('❌ [GET] Error al obtener registro:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el registro',
            error: error.message
        });
    }
};

// Controlador: Crear nuevo registro pendiente
const crearRegistroPendiente = async (req, res) => {
    try {
        console.log('📝 [POST] Creando nuevo registro pendiente');
        console.log('📋 [POST] Datos recibidos:', req.body);
        console.log('📎 [POST] Archivos recibidos:', req.files?.map(f => f.filename));

        const datos = req.body;

        // Validaciones básicas
        if (!datos.dni || !datos.nombre || !datos.apellido) {
            console.log('❌ [POST] Faltan datos obligatorios');
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios (DNI, nombre, apellido)'
            });
        }

        // Verificar si ya existe un registro con este DNI
        const registrosExistentes = await leerRegistrosPendientes();
        const yaExiste = registrosExistentes.find(r => r.dni === datos.dni);

        if (yaExiste) {
            console.log(`⚠️  [POST] Ya existe un registro con DNI: ${datos.dni}`);
            return res.status(409).json({
                mensaje: 'Ya existe un registro con este DNI'
            });
        }

        // Crear registro de archivos subidos
        const archivos = {};
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                archivos[file.fieldname] = `/archivosPendientes/${file.filename}`;
            });
        }

        // Crear nuevo registro
        const nuevoRegistro = {
            dni: datos.dni,
            timestamp: new Date().toISOString(),
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            horaRegistro: new Date().toTimeString().split(' ')[0],
            tipo: datos.origenWeb ? 'REGISTRO_WEB_PENDIENTE' : 'REGISTRO_PENDIENTE',
            estado: 'PENDIENTE',
            datos: datos,
            archivos: archivos,
            observaciones: `Registro pendiente creado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toTimeString().split(' ')[0]}`,
            modalidadId: datos.modalidadId,
            planAnioId: datos.planAnio
        };

        // Si es de origen web, agregar información adicional
        if (datos.origenWeb) {
            nuevoRegistro.origenWeb = true;
            nuevoRegistro.idRegistroWebOriginal = datos.idRegistroWebOriginal;
        }

        // Agregar el nuevo registro
        registrosExistentes.push(nuevoRegistro);
        await guardarRegistrosPendientes(registrosExistentes);

        console.log(`✅ [POST] Registro pendiente creado exitosamente para DNI: ${datos.dni}`);
        res.status(201).json({
            mensaje: 'Registro pendiente creado exitosamente',
            registro: nuevoRegistro
        });

    } catch (error) {
        console.error('❌ [POST] Error al crear registro:', error);
        res.status(500).json({
            mensaje: 'Error al crear el registro pendiente',
            error: error.message
        });
    }
};

// Controlador: Actualizar registro pendiente
const actualizarRegistroPendiente = async (req, res) => {
    try {
        const { dni } = req.params;
        const datosActualizados = req.body;

        console.log(`📝 [PUT] Actualizando registro con DNI: ${dni}`);

        const registros = await leerRegistrosPendientes();
        const indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (indiceRegistro === -1) {
            console.log(`❌ [PUT] Registro no encontrado para DNI: ${dni}`);
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        // Actualizar datos manteniendo la estructura original
        registros[indiceRegistro] = {
            ...registros[indiceRegistro],
            datos: { ...registros[indiceRegistro].datos, ...datosActualizados },
            fechaActualizacion: new Date().toISOString()
        };

        // Actualizar archivos si se subieron nuevos
        if (req.files && req.files.length > 0) {
            console.log(`📎 [PUT] Actualizando ${req.files.length} archivo(s) para DNI: ${dni}`);
            if (!registros[indiceRegistro].archivos) {
                registros[indiceRegistro].archivos = {};
            }

            req.files.forEach(file => {
                registros[indiceRegistro].archivos[file.fieldname] = `/archivosPendientes/${file.filename}`;
                console.log(`   ✅ Archivo actualizado: ${file.fieldname} -> ${file.filename}`);
            });
        }

        await guardarRegistrosPendientes(registros);

        console.log(`✅ [PUT] Registro actualizado exitosamente para DNI: ${dni}`);
        res.json({
            mensaje: 'Registro actualizado exitosamente',
            registro: registros[indiceRegistro]
        });

    } catch (error) {
        console.error('❌ [PUT] Error al actualizar registro:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar el registro',
            error: error.message
        });
    }
};

// Controlador: Eliminar registro pendiente
const eliminarRegistroPendiente = async (req, res) => {
    try {
        const { dni } = req.params;
        console.log(`🗑️  [DELETE] Eliminando registro con DNI: ${dni}`);

        const registros = await leerRegistrosPendientes();
        const indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (indiceRegistro === -1) {
            console.log(`❌ [DELETE] Registro no encontrado para DNI: ${dni}`);
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        // Eliminar el registro
        const registroEliminado = registros.splice(indiceRegistro, 1)[0];
        await guardarRegistrosPendientes(registros);

        console.log(`✅ [DELETE] Registro eliminado exitosamente para DNI: ${dni}`);
        res.json({
            mensaje: 'Registro eliminado exitosamente',
            registro: registroEliminado
        });

    } catch (error) {
        console.error('❌ [DELETE] Error al eliminar registro:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar el registro',
            error: error.message
        });
    }
};

// Controlador: Obtener estadísticas
const obtenerEstadisticas = async (req, res) => {
    try {
        console.log('📊 [GET] Obteniendo estadísticas de registros pendientes');

        const registros = await leerRegistrosPendientes();

        const estadisticas = {
            total: registros.length,
            porEstado: {},
            porModalidad: {},
            porTipo: {}
        };

        registros.forEach(registro => {
            // Por estado
            estadisticas.porEstado[registro.estado] = (estadisticas.porEstado[registro.estado] || 0) + 1;

            // Por modalidad
            const modalidad = registro.datos.modalidad || 'Sin especificar';
            estadisticas.porModalidad[modalidad] = (estadisticas.porModalidad[modalidad] || 0) + 1;

            // Por tipo
            estadisticas.porTipo[registro.tipo] = (estadisticas.porTipo[registro.tipo] || 0) + 1;
        });

        console.log('✅ [GET] Estadísticas generadas exitosamente');
        res.json(estadisticas);

    } catch (error) {
        console.error('❌ [GET] Error al obtener estadísticas:', error);
        res.status(500).json({
            mensaje: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

// Controlador: Procesar registro pendiente
const procesarRegistroPendiente = async (req, res) => {
    try {
        // Obtener DNI desde los parámetros de URL o del body
        const dni = req.params.dni || req.body.dni;

        if (!dni) {
            return res.status(400).json({ mensaje: 'DNI es requerido' });
        }

        console.log(`\n🔄 [PROCESAR] Iniciando procesamiento de registro con DNI: ${dni}`);

        // 1. Buscar el registro en JSON
        const registros = await leerRegistrosPendientes();
        const indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (indiceRegistro === -1) {
            console.log(`❌ [PROCESAR] Registro no encontrado para DNI: ${dni}`);
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        const registro = registros[indiceRegistro];
        console.log(`📋 [PROCESAR] Registro encontrado: ${registro.datos.nombre} ${registro.datos.apellido}`);

        // 2. Verificar si el estudiante ya existe en la base de datos
        const estudianteExistente = await verificarEstudianteExistente(dni);

        // NOTA: Ya NO saltamos la validación si existe. Siempre validamos documentos de la NUEVA modalidad.
        if (estudianteExistente) {
            console.log(`ℹ️ [PROCESAR] El estudiante ya existe (ID: ${estudianteExistente.id}). Se validará documentación e inscripción.`);
        }

        // 3. Detectar archivos disponibles
        const archivosDisponibles = await detectarArchivosDisponibles(registro);
        // 3.1. Agregar archivos recién subidos
        if (req.files && req.files.length > 0) {
            console.log(`📎 [PROCESAR] Agregando ${req.files.length} archivos recién subidos:`);
            for (const file of req.files) {
                const fieldName = file.fieldname;
                const rutaRelativa = `/archivosPendientes/${file.filename}`;
                archivosDisponibles[fieldName] = rutaRelativa;
                console.log(`   ✅ ${fieldName} -> ${rutaRelativa}`);
            }
        }

        console.log('📊 [PROCESAR] Mapa final de archivos para validación:', Object.keys(archivosDisponibles));

        // Actualizar datos del registro con la información recibida (incluyendo idDivision)
        if (req.body) {
            registro.datos = {
                ...registro.datos,
                ...req.body,
                idDivision: req.body.idDivision || registro.datos?.idDivision
            };
            // También actualizar propiedades directas si existen para evitar datos estancados
            if (req.body.idDivision) registro.idDivision = req.body.idDivision;
            if (req.body.modalidadId) registro.modalidadId = req.body.modalidadId;
            if (req.body.planAnio) registro.planAnioId = req.body.planAnio;

            // Debug para verificar actualización
            console.log(`📝 [PROCESAR] IDs actualizados para validación: Modalidad=${registro.modalidadId}, Plan=${registro.planAnioId}`);
        }

        // 4. Validar documentación (REGLA ESTRICTA SIEMPRE SE APLICA)
        // Usar los valores recién actualizados
        const modalidadId = parseInt(registro.modalidadId || registro.datos.modalidadId);
        const planAnioId = parseInt(registro.planAnioId || registro.datos.planAnio);

        const resultadoValidacion = validarDocumentacion(modalidadId, planAnioId, archivosDisponibles);

        if (!resultadoValidacion.documentacionCompleta) {
            // FLUJO INCOMPLETO
            console.log(`⚠️ [PROCESAR] Documentación incompleta (${resultadoValidacion.reglaAplicada}) - Queda PENDIENTE`);

            registro.estado = 'PENDIENTE';
            registro.motivoPendiente = generarMensajePendiente(resultadoValidacion, registro);

            // LOGICA REINICIO ALARMA - REGISTRO INCOMPLETO
            const diasExtension = 7;
            const nuevaFechaVencimiento = new Date();
            nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + diasExtension);

            registro.fechaVencimiento = nuevaFechaVencimiento.toISOString();
            registro.alarmaReiniciada = true;
            registro.fechaReinicio = new Date().toISOString();
            registro.motivoExtension = 'Reinicio automático: Documentación incompleta al procesar.';
            registro.diasExtension = diasExtension;
            registro.fechaActualizacion = new Date().toISOString();

            if (!registro.historialExtensiones) registro.historialExtensiones = [];
            registro.historialExtensiones.push({
                fecha: new Date().toISOString(),
                dias: diasExtension,
                motivo: 'Automático: Intento de procesamiento incompleto',
                usuario: 'sistema'
            });

            console.log(`⏰ [PROCESAR] Alarma reiniciada por 7 días para ${registro.datos.nombre}`);

            // Actualizar archivos en JSON
            const archivosActualizados = { ...registro.archivos };
            for (const [campo, ruta] of Object.entries(archivosDisponibles)) {
                if (ruta) archivosActualizados[campo] = ruta;
            }
            registro.archivos = archivosActualizados;

            // Detalles de validación
            registro.detalleDocumentos = {
                documentacionBasicaCompleta: resultadoValidacion.documentacionBasicaCompleta,
                faltantesBasicos: resultadoValidacion.faltantesBasicos,
                totalRequerido: 5 + (resultadoValidacion.requiereDocumentoAdicional ? 1 : 0),
                totalDisponible: Object.keys(archivosActualizados).filter(k => archivosActualizados[k]).length
            };

            registros[indiceRegistro] = registro;
            await guardarRegistrosPendientes(registros);

            return res.json({
                mensaje: `Documentación incompleta (${resultadoValidacion.reglaAplicada}) - registro actualizado y alarma reiniciada 7 días`,
                estado: 'PENDIENTE',
                detalles: resultadoValidacion,
                motivoPendiente: registro.motivoPendiente,
                progreso: `${basicosPresentes + adicionalesPresentes}/${totalCalc}`,
                registro: registro,
                alarmaReiniciada: true
            });
        }

        // 5. Migrar archivos a archivosDocumento (Solo si está completo)
        console.log(`📦 [PROCESAR] Documentación completa. Migrando archivos...`);
        const archivosMigrados = await migrarArchivosRegistro(registro, archivosDisponibles);

        // 6. Insertar en BD o Inscribir
        let idEstudianteFinal;

        if (estudianteExistente) {
            // Caso A: Estudiante existe -> Crear inscripción si no tiene para esta modalidad
            console.log(`💾 [PROCESAR] Estudiante ya existe. Creando solo inscripción...`);
            const resultadoInscripcion = await insertarInscripcion(estudianteExistente.id, registro, archivosMigrados);
            idEstudianteFinal = estudianteExistente.id;
            console.log(`✅ [PROCESAR] Inscripción creada/verificada (ID Insc: ${resultadoInscripcion.idInscripcion})`);
        } else {
            // Caso B: Estudiante nuevo -> Insertar todo
            console.log(`💾 [PROCESAR] Insertando nuevo estudiante completo...`);
            const resultadoInsercion = await insertarEstudianteCompleto(registro, archivosMigrados);
            idEstudianteFinal = resultadoInsercion.idEstudiante;
        }

        // 7. Actualizar registro como PROCESADO
        registro.estado = 'PROCESADO';
        registro.fechaProcesado = new Date().toISOString();
        registro.idEstudiante = idEstudianteFinal;
        registro.archivos = archivosMigrados;
        delete registro.motivoPendiente; // Ya no hay motivo de pendiente
        delete registro.vencimiento; // Ya no aplica vencimiento

        // Mantenemos el registro en la lista pero con estado PROCESADO
        // El administrador decidirá cuándo eliminarlo manualmente
        registros[indiceRegistro] = registro;
        await guardarRegistrosPendientes(registros);

        console.log(`🎉 [PROCESAR] Registro procesado exitosamente - ID Estudiante: ${idEstudianteFinal}`);

        // Enviar NOTIFICACIÓN EMAIL de éxito
        try {
            console.log(`📧 [PROCESAR] Enviando email de éxito a ${registro.datos.email}...`);
            const nombreCompleto = `${registro.datos.nombre} ${registro.datos.apellido}`;
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="background-color: #2d4177; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h2 style="color: white; margin: 0;">🎓 CEIJA 5 - Inscripciones</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3 style="color: #2e7d32;">¡Inscripción Exitosa!</h3>
                        <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
                        <p>Nos complace informarle que su documentación ha sido verificada y su inscripción ha sido procesada correctamente.</p>
                        
                        <div style="background-color: #f0f7f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>DNI:</strong> ${registro.datos.dni}</p>
                            <p style="margin: 5px 0;"><strong>Modalidad:</strong> ${registro.datos.modalidad}</p>
                            <p style="margin: 5px 0;"><strong>Estado:</strong> ✅ INSCRIPTO/A</p>
                        </div>

                        <p>Ya forma parte de nuestra comunidad educativa. ¡Bienvenido/a!</p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                        <p>CEIJA 5 - Centro de Educación Integral para Jóvenes y Adultos</p>
                    </div>
                </div>
            `;

            await enviarEmailEstudiante(registro, {
                subject: '✅ Inscripción Procesada Exitosamente - CEIJA 5',
                body: htmlBody
            });
            console.log(`✅ [PROCESAR] Email enviado correctamente.`);
        } catch (emailErr) {
            console.warn(`⚠️ [PROCESAR] Error al enviar email de éxito (no bloqueante):`, emailErr.message);
        }

        res.json({
            mensaje: 'Registro procesado exitosamente y notificado',
            estado: 'PROCESADO',
            idEstudiante: idEstudianteFinal,
            detalles: resultadoValidacion,
            registro: registro
        });

    } catch (error) {
        console.error('❌ [PROCESAR] Error al procesar registro:', error);
        res.status(500).json({
            mensaje: 'Error al procesar el registro',
            error: error.message
        });
    }
};

// Controlador: Reiniciar alarma de vencimiento
const reiniciarAlarma = async (req, res) => {
    try {
        const { dni } = req.params;
        const { diasExtension = 7, motivo = 'Extensión solicitada por el estudiante' } = req.body;

        console.log(`🔄 [REINICIAR-ALARMA] Reiniciando alarma para DNI: ${dni}`);

        const registros = await leerRegistrosPendientes();
        const indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (indiceRegistro === -1) {
            console.log(`❌ [REINICIAR-ALARMA] Registro no encontrado para DNI: ${dni}`);
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        const registro = registros[indiceRegistro];

        // Verificar que el registro esté vencido o próximo a vencer
        if (registro.estado !== 'PENDIENTE') {
            console.log(`⚠️  [REINICIAR-ALARMA] El registro no está en estado PENDIENTE: ${registro.estado}`);
            return res.status(400).json({
                mensaje: 'Solo se pueden reiniciar alarmas de registros pendientes'
            });
        }

        // Calcular nueva fecha de vencimiento
        const nuevaFechaVencimiento = new Date();
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + parseInt(diasExtension));

        // Actualizar el registro
        registros[indiceRegistro] = {
            ...registro,
            fechaVencimiento: nuevaFechaVencimiento.toISOString(),
            alarmaReiniciada: true,
            fechaReinicio: new Date().toISOString(),
            motivoExtension: motivo,
            diasExtension: parseInt(diasExtension),
            fechaActualizacion: new Date().toISOString(),
            historialExtensiones: [
                ...(registro.historialExtensiones || []),
                {
                    fecha: new Date().toISOString(),
                    dias: parseInt(diasExtension),
                    motivo: motivo,
                    usuario: req.body.usuario || 'admin'
                }
            ]
        };

        await guardarRegistrosPendientes(registros);

        console.log(`✅ [REINICIAR-ALARMA] Alarma reiniciada para ${registro.datos.nombre} ${registro.datos.apellido}`);
        console.log(`   - Nueva fecha vencimiento: ${nuevaFechaVencimiento.toLocaleDateString('es-AR')}`);
        console.log(`   - Días de extensión: ${diasExtension}`);
        console.log(`   - Motivo: ${motivo}`);

        res.json({
            mensaje: 'Alarma reiniciada exitosamente',
            registro: registros[indiceRegistro],
            nuevaFechaVencimiento: nuevaFechaVencimiento.toLocaleDateString('es-AR'),
            diasExtension: parseInt(diasExtension)
        });

    } catch (error) {
        console.error('❌ [REINICIAR-ALARMA] Error al reiniciar alarma:', error);
        res.status(500).json({
            mensaje: 'Error al reiniciar la alarma',
            error: error.message
        });
    }
};

module.exports = {
    obtenerTodosLosRegistros,
    obtenerRegistroPorDni,
    crearRegistroPendiente,
    actualizarRegistroPendiente,
    eliminarRegistroPendiente,
    obtenerEstadisticas,
    procesarRegistroPendiente,
    reiniciarAlarma
};