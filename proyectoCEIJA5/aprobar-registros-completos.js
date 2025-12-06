const fs = require('fs');
const db = require('./db');
const { validarDocumentacion } = require('./services/registrosPendientes/documentValidator');

async function aprobarRegistrosCompletos() {
    try {
        console.log('🔍 Buscando registros PROCESADOS que deberían estar CompletaS...');
        
        // Leer registros pendientes
        const data = JSON.parse(fs.readFileSync('./data/Registros_Pendientes.json', 'utf8'));
        const registrosProcesados = data.filter(r => r.estado === 'PROCESADO' && r.idEstudiante);
        
        console.log(`📋 Encontrados ${registrosProcesados.length} registros PROCESADOS`);
        
        for (const registro of registrosProcesados) {
            console.log(`\n🔍 Evaluando: ${registro.datos.nombre} ${registro.datos.apellido} (DNI: ${registro.dni})`);
            
            // Evaluar documentación con validador universal
            const modalidadId = parseInt(registro.modalidadId || registro.datos.modalidadId);
            const planAnioId = parseInt(registro.planAnioId || registro.datos.planAnio);
            
            // Convertir archivos a formato esperado por el validador
            const archivosDisponibles = {};
            if (registro.archivos) {
                Object.keys(registro.archivos).forEach(key => {
                    archivosDisponibles[key] = registro.archivos[key];
                });
            }
            
            const resultadoValidacion = validarDocumentacion(modalidadId, planAnioId, archivosDisponibles);
            
            if (resultadoValidacion.documentacionCompleta) {
                console.log(`✅ ${registro.datos.nombre} ${registro.datos.apellido} tiene documentación completa - Marcando como Completa`);
                
                // Actualizar estado en el archivo JSON
                const indiceRegistro = data.findIndex(r => r.dni === registro.dni);
                if (indiceRegistro !== -1) {
                    data[indiceRegistro].estado = 'Completa';
                    data[indiceRegistro].fechaCompleta = new Date().toISOString();
                    delete data[indiceRegistro].motivoPendiente; // Eliminar mensaje de pendiente
                    
                    // Actualizar estado en la base de datos
                    try {
                        await db.query(
                            'UPDATE inscripciones SET estado_id = 3 WHERE idEstudiante = ?', // 3 = Completa
                            [registro.idEstudiante]
                        );
                        console.log(`   📝 Estado actualizado en BD para estudiante ID: ${registro.idEstudiante}`);
                    } catch (dbError) {
                        console.error(`   ❌ Error al actualizar BD:`, dbError.message);
                    }
                }
            } else {
                console.log(`⚠️  ${registro.datos.nombre} ${registro.datos.apellido} aún tiene documentación incompleta`);
                console.log(`   Faltan: ${resultadoValidacion.faltantesBasicos.join(', ')}`);
            }
        }
        
        // Guardar cambios en el archivo JSON
        fs.writeFileSync('./data/Registros_Pendientes.json', JSON.stringify(data, null, 2));
        console.log('\n💾 Archivo JSON actualizado');
        
        // Mostrar resumen
        const Completas = data.filter(r => r.estado === 'Completa').length;
        const procesados = data.filter(r => r.estado === 'PROCESADO').length;
        const pendientes = data.filter(r => r.estado === 'PENDIENTE').length;
        
        console.log('\n📊 RESUMEN DE ESTADOS:');
        console.log(`   ✅ CompletaS: ${Completas}`);
        console.log(`   🔄 PROCESADOS: ${procesados}`);
        console.log(`   ⏳ PENDIENTES: ${pendientes}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

aprobarRegistrosCompletos();