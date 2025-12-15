const db = require('../../db');

// Utilidades para manejo de ubicaciones
const buscarOInsertarProvincia = require('../../utils/buscarOInsertarProvincia');
const buscarOInsertarLocalidad = require('../../utils/buscarOInsertarLocalidad');
const buscarOInsertarBarrio = require('../../utils/buscarOInsertarBarrio');

const buscarOInsertarDetalleDocumentacion = require('../../utils/buscarOInsertarDetalleDocumentacion');

// Función para insertar estudiante completo en la base de datos
const insertarEstudianteCompleto = async (registro, archivosMigrados, connection = null) => {
    const conn = connection || db;
    // DEBUG: mostrar resumen breve de entrada para ayudar en pruebas
    try {
        console.log('🔍 [DEBUG] insertarEstudianteCompleto llamado con DNI:', registro?.dni || registro?.datos?.dni);
        console.log('🔍 [DEBUG] archivosMigrados (keys/summary):', Array.isArray(archivosMigrados) ? archivosMigrados.map(a => a.campo || a.tipo || a.nombreArchivo) : Object.keys(archivosMigrados || {}));
    } catch (dbg) {
        console.warn('⚠️ [DEBUG] No se pudo serializar entradas en insertarEstudianteCompleto:', dbg.message);
    }

    try {
        console.log('\n🗄️  [BD] Iniciando inserción de estudiante completo...');

        // 1. Insertar domicilio (usar nombres de columnas según esquema)
        console.log('📍 [BD] Insertando domicilio...');
        const domicilioResult = await conn.query(
            'INSERT INTO domicilios (calle, numero, idBarrio, idLocalidad, idProvincia) VALUES (?, ?, ?, ?, ?)',
            [
                registro.datos.calle,
                registro.datos.numero,
                parseInt(registro.datos.barrio) || null,
                parseInt(registro.datos.localidad) || null,
                parseInt(registro.datos.provincia) || null
            ]
        );

        const idDomicilio = domicilioResult[0]?.insertId || domicilioResult.insertId;
        console.log(`✅ [BD] Domicilio insertado con ID: ${idDomicilio}`);

        // 2. Insertar estudiante (usar nombres de columnas reales)
        console.log('👤 [BD] Insertando estudiante...');
        const estudianteResult = await conn.query(
            `INSERT INTO estudiantes (
                nombre, apellido, tipoDocumento, paisEmision, dni, cuil, email, telefono, fechaNacimiento, sexo, idDomicilio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                registro.datos.nombre,
                registro.datos.apellido,
                registro.datos.tipoDocumento || registro.datos.tipoDocumento,
                registro.datos.paisEmision && registro.datos.paisEmision.trim() !== '' ? registro.datos.paisEmision : 'Argentina',
                registro.dni || registro.datos.dni,
                registro.datos.cuil || null,
                registro.datos.email || null,
                registro.datos.telefono || null,
                registro.datos.fechaNacimiento || null,
                registro.datos.sexo || null,
                idDomicilio
            ]
        );

        const idEstudiante = estudianteResult[0]?.insertId || estudianteResult.insertId;
        console.log(`✅ [BD] Estudiante insertado con ID: ${idEstudiante}`);

        // 3. Actualizar campo foto en tabla estudiantes si existe
        const fotoRuta = archivosMigrados['foto'];
        if (fotoRuta) {
            await conn.query(
                'UPDATE estudiantes SET foto = ? WHERE id = ?',
                [fotoRuta, idEstudiante]
            );
            console.log(`   ✅ [BD] Foto actualizada en estudiante: ${fotoRuta}`);
        }

        // 4. Insertar inscripción (con módulo si corresponde)
        console.log('📝 [BD] Insertando inscripción...');
        // Procesar array de módulos
        let modulosArray = [];

        // 1. Intentar obtener módulos de registro.datos.idModulo
        if (registro.datos?.idModulo) {
            if (Array.isArray(registro.datos.idModulo)) {
                const mod = parseInt(registro.datos.idModulo[0], 10);
                if (!isNaN(mod)) {
                    modulosArray.push(mod);
                }
            } else if (typeof registro.datos.idModulo === 'string' && registro.datos.idModulo !== '') {
                const mod = parseInt(registro.datos.idModulo, 10);
                if (!isNaN(mod)) {
                    modulosArray.push(mod);
                }
            }
        }

        // 2. Si no hay módulos, intentar obtener de registro.idModulo
        if (modulosArray.length === 0 && registro.idModulo) {
            if (Array.isArray(registro.idModulo)) {
                modulosArray = registro.idModulo
                    .filter(id => id && id !== '' && id !== null)
                    .map(id => parseInt(id, 10))
                    .filter(id => !isNaN(id));
            } else if (typeof registro.idModulo === 'string' && registro.idModulo !== '') {
                const mod = parseInt(registro.idModulo, 10);
                if (!isNaN(mod)) {
                    modulosArray.push(mod);
                }
            }
        }

        console.log('📋 [BD] Módulo seleccionado:', {
            moduloOriginal: registro.datos?.idModulo || registro.idModulo,
            moduloProcesado: modulosArray[0],
            modalidadId: parseInt(registro.modalidadId || registro.datos.modalidadId)
        });

        // Si modalidad es Semipresencial, idModulo es obligatorio
        const modalidadId = parseInt(registro.modalidadId || registro.datos.modalidadId);
        let inscripcionQuery, inscripcionParams;

        if (modalidadId === 2) {
            if (modulosArray.length === 0) {
                throw new Error('idModulo es obligatorio para modalidad Semipresencial');
            }

            // Para modalidad Semipresencial, obtener el ID del módulo seleccionado
            let idModulo = modulosArray[0]; // Tomar el primer módulo válido del array procesado

            if (!Number.isInteger(idModulo) || idModulo === 0) {
                throw new Error('Se requiere un módulo válido para modalidad Semipresencial');
            }

            // Usar nombres de columnas según esquema: fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion
            const idAnioPlan = parseInt(registro.planAnioId || registro.datos.planAnio) || null;
            const idEstado = parseInt(registro.idEstadoInscripcion || registro.datos.idEstadoInscripcion) || 1;
            inscripcionQuery = `INSERT INTO inscripciones (fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion) VALUES (CURDATE(), ?, ?, ?, ?, ?)`;
            inscripcionParams = [idEstudiante, modalidadId, idAnioPlan, idModulo, idEstado];
            console.log(`✅ [BD] Preparando inscripción con módulo:`, {
                idEstudiante,
                modalidadId,
                idAnioPlan,
                idModulo,
                idEstado,
                query: inscripcionQuery
            });
        } else {
            const idAnioPlan = parseInt(registro.planAnioId || registro.datos.planAnio) || null;
            const idEstado = parseInt(registro.idEstadoInscripcion || registro.datos.idEstadoInscripcion) || 1;
            inscripcionQuery = `INSERT INTO inscripciones (fechaInscripcion, idEstudiante, idModalidad, idAnioPlan, idModulos, idEstadoInscripcion) VALUES (CURDATE(), ?, ?, ?, 0, ?)`;
            inscripcionParams = [idEstudiante, modalidadId, idAnioPlan, idEstado];
            console.log('✅ [BD] Preparando inscripción sin módulo:', {
                idEstudiante,
                modalidadId,
                idAnioPlan,
                idEstado,
                query: inscripcionQuery
            });
        }

        console.log('🔄 [BD] Ejecutando query de inscripción...');
        const inscripcionResult = await conn.query(inscripcionQuery, inscripcionParams);
        const idInscripcion = inscripcionResult[0]?.insertId || inscripcionResult.insertId;

        if (!idInscripcion) {
            console.error('❌ [BD] ERROR: No se obtuvo ID de inscripción. Result:', inscripcionResult);
            throw new Error('No se pudo obtener ID de inscripción');
        }

        console.log(`✅ [BD] Inscripción insertada con ID: ${idInscripcion}`);

        // 5. Insertar detalle de inscripción por cada archivo entregado (si corresponde)
        console.log('📋 [BD] Insertando detalle de inscripción por archivos entregados...');
        // Mapeo explícito de documentación (coincide con completarDocumentacion.js)
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

        for (const [campo, rutaArchivo] of Object.entries(archivosMigrados || {})) {
            const idDocumentaciones = DocumentacionNameToId[campo];
            if (idDocumentaciones && rutaArchivo) {
                try {
                    await buscarOInsertarDetalleDocumentacion(conn, idInscripcion, idDocumentaciones, 'Entregado', new Date(), rutaArchivo);
                    console.log(`   ✅ [BD] Detalle insertado para ${campo} (ID: ${idDocumentaciones})`);
                } catch (dErr) {
                    console.warn(`⚠️ No se pudo insertar detalle para documento ${campo}:`, dErr.message || dErr);
                }
            }
        }

        console.log('✅ [BD] Detalle de inscripción procesado (archivos entregados)');
        console.log(`🎉 [BD] Estudiante completo procesado exitosamente - ID: ${idEstudiante}`);

        return {
            idEstudiante,
            idDomicilio,
            idInscripcion
        };

    } catch (error) {
        console.error('❌ [BD] Error en inserción completa:', error);
        throw error;
    }
};

// Función para verificar si un estudiante ya existe
const verificarEstudianteExistente = async (dni) => {
    try {
        console.log(`🔍 [BD-VERIFICAR] Verificando estudiante con DNI: ${dni}`);
        // mysql2 promise .query returns [rows, fields]
        const [rows] = await db.query('SELECT id FROM estudiantes WHERE dni = ?', [dni]);
        console.log(`📊 [BD-VERIFICAR] Resultado query: ${rows.length} filas encontradas`);
        if (rows.length > 0) {
            console.log(`✅ [BD-VERIFICAR] Estudiante encontrado con ID: ${rows[0].id}`);
            return rows[0];
        } else {
            console.log(`❌ [BD-VERIFICAR] No se encontró estudiante con DNI: ${dni}`);
            return null;
        }
    } catch (error) {
        console.error('❌ [BD] Error al verificar estudiante existente:', error);
        throw error;
    }
};

// Función para obtener ubicaciones procesadas
const procesarUbicaciones = async (datos) => {
    try {
        console.log('🌍 [BD] Procesando ubicaciones...');

        // Buscar o insertar provincia
        const provincia = await buscarOInsertarProvincia(datos.provincia);
        console.log(`   - Provincia: ${provincia.nombre} (ID: ${provincia.id})`);

        // Buscar o insertar localidad
        const localidad = await buscarOInsertarLocalidad(datos.localidad, provincia.id);
        console.log(`   - Localidad: ${localidad.nombre} (ID: ${localidad.id})`);

        // Buscar o insertar barrio
        const barrio = await buscarOInsertarBarrio(datos.barrio, localidad.id);
        console.log(`   - Barrio: ${barrio.nombre} (ID: ${barrio.id})`);

        return {
            provincia,
            localidad,
            barrio
        };
    } catch (error) {
        console.error('❌ [BD] Error al procesar ubicaciones:', error);
        throw error;
    }
};

module.exports = {
    insertarEstudianteCompleto,
    verificarEstudianteExistente,
    procesarUbicaciones
};