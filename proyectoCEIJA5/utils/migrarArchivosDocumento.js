const db = require('../db');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script para migrar archivos de estudiantes en BD a archivosDocumento
 * Asegura que todos los estudiantes registrados tengan sus archivos en la carpeta correcta
 */
async function migrarArchivosDocumento() {
    try {
        console.log('🚀 [MIGRACIÓN] Iniciando migración de archivos a archivosDocumento...');
        
        // 1. Buscar todos los registros en detalle_inscripcion con archivos
        const [documentos] = await db.query(`
            SELECT di.id, di.archivoDocumentacion, e.nombre, e.apellido, e.dni
            FROM detalle_inscripcion di
            JOIN inscripciones i ON i.id = di.idInscripcion
            JOIN estudiantes e ON e.id = i.idEstudiante
            WHERE di.archivoDocumentacion IS NOT NULL 
            AND di.archivoDocumentacion != ''
        `);
        
        console.log(`📋 [MIGRACIÓN] Encontrados ${documentos.length} documentos a revisar`);
        
        let migrados = 0;
        let errores = 0;
        let yaCorrectos = 0;
        
        for (const doc of documentos) {
            const rutaActual = doc.archivoDocumentacion;
            
            // Si ya está en archivosDocumento, continuar
            if (rutaActual.startsWith('/archivosDocumento/')) {
                yaCorrectos++;
                continue;
            }
            
            try {
                // Determinar carpeta origen
                let carpetaOrigen;
                if (rutaActual.startsWith('/archivosDocumentacion/')) {
                    carpetaOrigen = 'archivosDocumentacion';
                } else if (rutaActual.startsWith('/archivosDocWeb/')) {
                    carpetaOrigen = 'archivosDocWeb';
                } else {
                    console.log(`⚠️ [SKIP] Ruta no reconocida: ${rutaActual}`);
                    continue;
                }
                
                // Generar nuevo nombre de archivo
                const nombreArchivo = path.basename(rutaActual);
                const extension = path.extname(nombreArchivo);
                const tipoDoc = nombreArchivo.split('_').slice(3).join('_').replace(extension, '');
                const nuevoNombre = `${doc.nombre}_${doc.apellido}_${doc.dni}_${tipoDoc}${extension}`;
                
                // Rutas físicas
                const rutaOrigen = path.join(__dirname, '..', carpetaOrigen, path.basename(rutaActual));
                const rutaDestino = path.join(__dirname, '../archivosDocumento', nuevoNombre);
                const nuevaRutaBD = `/archivosDocumento/${nuevoNombre}`;
                
                // Verificar si el archivo origen existe
                try {
                    await fs.access(rutaOrigen);
                } catch {
                    console.log(`❌ [ERROR] Archivo no encontrado: ${rutaOrigen}`);
                    errores++;
                    continue;
                }
                
                // Copiar archivo
                await fs.copyFile(rutaOrigen, rutaDestino);
                
                // Actualizar BD
                await db.query(
                    'UPDATE detalle_inscripcion SET archivoDocumentacion = ? WHERE id = ?',
                    [nuevaRutaBD, doc.id]
                );
                
                console.log(`✅ [MIGRADO] ${doc.nombre} ${doc.apellido} - ${tipoDoc}: ${nombreArchivo} -> ${nuevoNombre}`);
                migrados++;
                
            } catch (error) {
                console.error(`❌ [ERROR] Migrando documento ID ${doc.id}:`, error.message);
                errores++;
            }
        }
        
        // 2. Migrar fotos de estudiantes
        const [estudiantes] = await db.query(`
            SELECT id, nombre, apellido, dni, foto
            FROM estudiantes
            WHERE foto IS NOT NULL 
            AND foto != ''
            AND foto NOT LIKE '/archivosDocumento/%'
        `);
        
        console.log(`📸 [FOTOS] Encontradas ${estudiantes.length} fotos a migrar`);
        
        for (const est of estudiantes) {
            try {
                const rutaActual = est.foto;
                let carpetaOrigen;
                
                if (rutaActual.startsWith('/archivosDocumentacion/')) {
                    carpetaOrigen = 'archivosDocumentacion';
                } else if (rutaActual.startsWith('/archivosDocWeb/')) {
                    carpetaOrigen = 'archivosDocWeb';
                } else {
                    continue;
                }
                
                const nombreArchivo = path.basename(rutaActual);
                const extension = path.extname(nombreArchivo);
                const nuevoNombre = `${est.nombre}_${est.apellido}_${est.dni}_foto${extension}`;
                
                const rutaOrigen = path.join(__dirname, '..', carpetaOrigen, path.basename(rutaActual));
                const rutaDestino = path.join(__dirname, '../archivosDocumento', nuevoNombre);
                const nuevaRutaBD = `/archivosDocumento/${nuevoNombre}`;
                
                // Verificar origen
                try {
                    await fs.access(rutaOrigen);
                } catch {
                    console.log(`❌ [ERROR] Foto no encontrada: ${rutaOrigen}`);
                    errores++;
                    continue;
                }
                
                // Copiar foto
                await fs.copyFile(rutaOrigen, rutaDestino);
                
                // Actualizar BD
                await db.query(
                    'UPDATE estudiantes SET foto = ? WHERE id = ?',
                    [nuevaRutaBD, est.id]
                );
                
                console.log(`📸 [FOTO MIGRADA] ${est.nombre} ${est.apellido}: ${nombreArchivo} -> ${nuevoNombre}`);
                migrados++;
                
            } catch (error) {
                console.error(`❌ [ERROR] Migrando foto estudiante ID ${est.id}:`, error.message);
                errores++;
            }
        }
        
        console.log('\n📊 [RESUMEN MIGRACIÓN]');
        console.log(`✅ Archivos migrados: ${migrados}`);
        console.log(`✅ Ya correctos: ${yaCorrectos}`);
        console.log(`❌ Errores: ${errores}`);
        console.log('🎉 [MIGRACIÓN] Completada\n');
        
    } catch (error) {
        console.error('❌ [ERROR MIGRACIÓN]:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrarArchivosDocumento()
        .then(() => process.exit(0))
        .catch(console.error);
}

module.exports = migrarArchivosDocumento;