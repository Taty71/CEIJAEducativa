const db = require('./db');

async function eliminarEstudiante(dni) {
    try {
        console.log(`\n🗑️  Eliminando estudiante con DNI: ${dni}`);
        
        // 1. Buscar estudiante
        const [estudiante] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
        
        if (estudiante.length === 0) {
            console.log('❌ Estudiante no encontrado');
            process.exit(0);
        }
        
        const idEstudiante = estudiante[0].id;
        const idDomicilio = estudiante[0].idDomicilio;
        console.log(`✅ Estudiante encontrado: ID ${idEstudiante}, Domicilio ID ${idDomicilio}`);
        
        // 2. Buscar inscripciones
        const [inscripciones] = await db.query('SELECT id FROM inscripciones WHERE idEstudiante = ?', [idEstudiante]);
        console.log(`📚 Inscripciones encontradas: ${inscripciones.length}`);
        
        // 3. Eliminar detalle_inscripcion si hay inscripciones
        for (const inscripcion of inscripciones) {
            await db.query('DELETE FROM detalle_inscripcion WHERE idInscripcion = ?', [inscripcion.id]);
            console.log(`   ✅ Eliminados detalles de inscripción ${inscripcion.id}`);
        }
        
        // 4. Eliminar inscripciones
        if (inscripciones.length > 0) {
            await db.query('DELETE FROM inscripciones WHERE idEstudiante = ?', [idEstudiante]);
            console.log(`✅ Eliminadas ${inscripciones.length} inscripciones`);
        }
        
        // 5. Eliminar archivos_estudiantes
        const [archivos] = await db.query('SELECT COUNT(*) as total FROM archivos_estudiantes WHERE idEstudiante = ?', [idEstudiante]);
        if (archivos[0].total > 0) {
            await db.query('DELETE FROM archivos_estudiantes WHERE idEstudiante = ?', [idEstudiante]);
            console.log(`✅ Eliminados ${archivos[0].total} archivos_estudiantes`);
        }
        
        // 6. Eliminar estudiante
        await db.query('DELETE FROM estudiantes WHERE id = ?', [idEstudiante]);
        console.log(`✅ Eliminado estudiante ID ${idEstudiante}`);
        
        // 7. Eliminar domicilio si existe
        if (idDomicilio) {
            await db.query('DELETE FROM domicilios WHERE id = ?', [idDomicilio]);
            console.log(`✅ Eliminado domicilio ID ${idDomicilio}`);
        }
        
        console.log('\n🎉 Eliminación completada exitosamente');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

eliminarEstudiante('46123325');
