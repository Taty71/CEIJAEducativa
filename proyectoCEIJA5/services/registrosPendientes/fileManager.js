const fs = require('fs').promises;
const path = require('path');
const { REGISTROS_PENDIENTES_PATH, ARCHIVOS_PENDIENTES_PATH, ARCHIVOS_DOCUMENTO_PATH } = require('./config');

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
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, '[]', 'utf8');
    }
};

// Función para leer registros pendientes
const leerRegistrosPendientes = async () => {
    await ensureFileExists();
    const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
    return JSON.parse(data);
};

// Función para guardar registros pendientes
const guardarRegistrosPendientes = async (registros) => {
    await ensureFileExists();
    await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2), 'utf8');
};

// Función para migrar archivo de archivosPendientes a archivosDocumento
const migrarArchivo = async (archivoPath, nuevoNombre) => {
    try {
        if (!archivoPath) return null;

        // Limpiar la ruta para obtener solo el nombre del archivo
        // Esto maneja rutas como '/archivosPendientes/file.jpg', 'archivosPendientes\file.jpg' o solo 'file.jpg'
        const nombreArchivoOrigen = path.basename(archivoPath.replace(/\\/g, '/'));
        const archivoCompleto = path.join(ARCHIVOS_PENDIENTES_PATH, nombreArchivoOrigen);
        const destinoCompleto = path.join(ARCHIVOS_DOCUMENTO_PATH, nuevoNombre);

        console.log(`📂 [migración] Intentando migrar: ${nombreArchivoOrigen}`);
        console.log(`   De: ${archivoCompleto}`);
        console.log(`   A: ${destinoCompleto}`);

        // Verificar que el archivo de origen existe
        try {
            await fs.access(archivoCompleto);
        } catch (accessError) {
            console.warn(`⚠️ [migración] No se pudo acceder al archivo de origen: ${archivoCompleto}. Quizás ya fue migrado o el nombre es diferente.`);
            // Si el archivo ya tiene el nombre de destino pero está en pendientes, intentar con ese
            return archivoPath;
        }

        // Asegurar que el directorio de destino existe
        await fs.mkdir(path.dirname(destinoCompleto), { recursive: true });

        try {
            // Copiar archivo
            await fs.copyFile(archivoCompleto, destinoCompleto);

            // Verificar que el archivo se copió correctamente
            await fs.access(destinoCompleto);

            // Eliminar archivo original solo si la copia fue exitosa
            await fs.unlink(archivoCompleto);

            console.log(`✅ [migración] Archivo migrado exitosamente a ${destinoCompleto}`);
            return `/archivosDocumento/${nuevoNombre}`;
        } catch (copyError) {
            console.error(`❌ [migración] Error en la copia/verificación de ${nombreArchivoOrigen}:`, copyError.message);
            // Si falló la copia, mantener el archivo en pendientes (la ruta original)
            return archivoPath;
        }
    } catch (error) {
        console.error(`❌ [migración] Error fatal al migrar archivo:`, error);
        return archivoPath; // Devolver original en lugar de lanzar error para no bloquear todo el proceso
    }
};

// Función para detectar archivos disponibles en archivosPendientes
const detectarArchivosDisponibles = async (registro) => {
    const archivosDisponibles = {};

    try {
        const archivosEnPendientes = await fs.readdir(ARCHIVOS_PENDIENTES_PATH);

        // Normalización más robusta
        const nombreLimpio = (registro.datos.nombre || '').trim().toLowerCase();
        const apellidoLimpio = (registro.datos.apellido || '').trim().toLowerCase();
        const dniLimpio = (registro.dni || '').trim();

        // Buscamos archivos que contengan el DNI y opcionalmente partes del nombre/apellido
        // El formato usual es: nombre_apellido_dni_tipo.ext
        console.log(`🔍 [detección] Buscando archivos para DNI: ${dniLimpio}`);

        const archivosCoincidentes = archivosEnPendientes.filter(archivo => {
            const archivoLower = archivo.toLowerCase();
            // Regla principal: Debe contener el DNI
            if (!archivoLower.includes(dniLimpio)) return false;

            // Regla secundaria: Verificar si tiene algo del nombre o apellido para evitar colisiones accidentales
            // (aunque el DNI debería ser suficiente)
            return true;
        });

        console.log(`📁 [detección] Archivos encontrados: ${archivosCoincidentes.length}`);

        // Mapear archivos encontrados a los campos esperados
        archivosCoincidentes.forEach(archivo => {
            const archivoLower = archivo.toLowerCase();

            // Intentar determinar el tipo basado en el sufijo después del DNI
            // nombre_apellido_dni_FOTO.jpg -> foto
            let campo = '';
            if (archivoLower.includes('foto')) campo = 'foto';
            else if (archivoLower.includes('dni')) campo = 'archivo_dni';
            else if (archivoLower.includes('cuil')) campo = 'archivo_cuil';
            else if (archivoLower.includes('nacimiento') || archivoLower.includes('partida')) campo = 'archivo_partidaNacimiento';
            else if (archivoLower.includes('medica') || archivoLower.includes('ficha')) campo = 'archivo_fichaMedica';
            else if (archivoLower.includes('primario')) campo = 'archivo_certificadoNivelPrimario';
            else if (archivoLower.includes('analitico')) campo = 'archivo_analiticoParcial';
            else if (archivoLower.includes('pase')) campo = 'archivo_solicitudPase';

            if (campo) {
                archivosDisponibles[campo] = `/archivosPendientes/${archivo}`;
                console.log(`   ✅ Detectado automáticamente: ${campo} -> ${archivo}`);
            }
        });

        // También incluir archivos que ya están en el registro
        if (registro.archivos) {
            Object.keys(registro.archivos).forEach(campo => {
                if (!archivosDisponibles[campo]) {
                    archivosDisponibles[campo] = registro.archivos[campo];
                    console.log(`   📋 ${campo}: desde registro existente`);
                }
            });
        }

    } catch (error) {
        console.error('❌ [detección] Error al detectar archivos:', error);
    }

    return archivosDisponibles;
};

// Función para migrar todos los archivos de un registro
const migrarArchivosRegistro = async (registro, archivosDisponibles) => {
    console.log('\n📦 [MIGRACIÓN] Iniciando migración de archivos...');
    console.log(`   - DNI: ${registro.dni}`);
    console.log(`   - Nombre: ${registro.datos.nombre} ${registro.datos.apellido}`);

    const archivosMigrados = {};
    let erroresMigracion = false;

    for (const [campo, rutaArchivo] of Object.entries(archivosDisponibles)) {
        if (rutaArchivo && rutaArchivo.includes('/archivosPendientes/')) {
            try {
                console.log(`\n🔄 [MIGRACIÓN] Procesando ${campo}:`);
                console.log(`   Origen: ${rutaArchivo}`);

                const nombreArchivo = path.basename(rutaArchivo);
                const nuevaRuta = await migrarArchivo(rutaArchivo, nombreArchivo);

                archivosMigrados[campo] = nuevaRuta;
                console.log(`   ✅ Migrado a: ${nuevaRuta}`);

            } catch (error) {
                console.error(`   ❌ Error al migrar ${campo}:`, error.message);
                erroresMigracion = true;
                // Mantener la ruta original si falla la migración
                archivosMigrados[campo] = rutaArchivo;
            }
        } else {
            // Archivo ya migrado o no existe
            archivosMigrados[campo] = rutaArchivo;
            console.log(`   ℹ️ [MIGRACIÓN] ${campo}: ya migrado o no requiere migración`);
        }
    }

    return archivosMigrados;
};

module.exports = {
    ensureFileExists,
    leerRegistrosPendientes,
    guardarRegistrosPendientes,
    migrarArchivo,
    detectarArchivosDisponibles,
    migrarArchivosRegistro
};