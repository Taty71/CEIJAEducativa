const fs = require('fs').promises;
const db = require('./db');

// Script para sincronizar estados de registros pendientes con la base de datos
async function sincronizarEstados() {
    try {
        console.log('🔄 Iniciando sincronización de estados...');
        
        // Leer registros pendientes
        const data = await fs.readFile('./data/Registros_Pendientes.json', 'utf8');
        const registros = JSON.parse(data);
        
        let actualizados = 0;
        
        for (let i = 0; i < registros.length; i++) {
            const registro = registros[i];
            
            // Verificar si el estudiante existe en la base de datos
            const [rows] = await db.query('SELECT id FROM estudiantes WHERE dni = ?', [registro.dni]);
            
            if (rows && rows.length > 0) {
                const idEstudiante = rows[0].id;
                
                // Verificar si tiene inscripción
                const [inscripciones] = await db.query(`
                    SELECT i.id as idInscripcion, ei.descripcionEstado as estado
                    FROM inscripciones i 
                    JOIN estado_inscripciones ei ON i.idEstadoInscripcion = ei.id
                    WHERE i.idEstudiante = ?
                `, [idEstudiante]);
                
                if (inscripciones && inscripciones.length > 0) {
                    const estadoInscripcion = inscripciones[0].estado;
                    
                    // Actualizar el registro si está pendiente pero ya está en BD
                    if (registro.estado === 'PENDIENTE') {
                        registro.estado = 'PROCESADO';
                        registro.idEstudiante = idEstudiante;
                        registro.fechaProcesado = new Date().toISOString();
                        registro.estadoInscripcion = estadoInscripcion;
                        
                        console.log(`✅ Actualizado: ${registro.datos.nombre} ${registro.datos.apellido} (DNI: ${registro.dni}) -> PROCESADO`);
                        actualizados++;
                    }
                }
            }
        }
        
        // Guardar cambios si hay actualizaciones
        if (actualizados > 0) {
            await fs.writeFile('./data/Registros_Pendientes.json', JSON.stringify(registros, null, 2), 'utf8');
            console.log(`🎉 Sincronización completada: ${actualizados} registros actualizados`);
        } else {
            console.log('ℹ️  No se encontraron registros para actualizar');
        }
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar script
sincronizarEstados();