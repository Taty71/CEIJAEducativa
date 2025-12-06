/**
 * Script de prueba para verificar la funcionalidad de eliminación automática
 * de registros pendientes cuando se completan
 */

const fs = require('fs').promises;
const path = require('path');

const REGISTROS_PENDIENTES_PATH = path.join(__dirname, 'data', 'Registros_Pendientes.json');

async function testEliminarRegistroPendiente(dni) {
    try {
        console.log(`🧪 Iniciando prueba de eliminación para DNI: ${dni}`);
        
        // Leer archivo actual
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        console.log(`📋 Registros actuales: ${registros.length}`);
        console.log('📋 DNIs actuales:', registros.map(r => r.dni));
        
        // Verificar si el DNI existe
        const registroExiste = registros.find(r => r.dni === dni);
        
        if (registroExiste) {
            console.log(`✅ Registro encontrado para DNI ${dni}:`, {
                nombre: registroExiste.datos?.nombre,
                apellido: registroExiste.datos?.apellido,
                fechaRegistro: registroExiste.fechaRegistro
            });
            
            // Simular eliminación
            const registrosFiltrados = registros.filter(r => r.dni !== dni);
            
            console.log(`🗑️ Registros después de eliminar: ${registrosFiltrados.length}`);
            console.log('📋 DNIs restantes:', registrosFiltrados.map(r => r.dni));
            
            // Crear backup antes de modificar
            const backupPath = REGISTROS_PENDIENTES_PATH + '.backup';
            await fs.copyFile(REGISTROS_PENDIENTES_PATH, backupPath);
            console.log(`💾 Backup creado en: ${backupPath}`);
            
            // Escribir cambios
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registrosFiltrados, null, 2));
            console.log(`✅ Registro eliminado exitosamente del archivo`);
            
        } else {
            console.log(`❌ No se encontró registro para DNI ${dni}`);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

async function restaurarBackup() {
    try {
        const backupPath = REGISTROS_PENDIENTES_PATH + '.backup';
        await fs.copyFile(backupPath, REGISTROS_PENDIENTES_PATH);
        console.log('✅ Backup restaurado');
    } catch (error) {
        console.error('❌ Error al restaurar backup:', error);
    }
}

// Ejecutar prueba con un DNI del archivo
async function ejecutarPrueba() {
    try {
        // Leer DNI de prueba del archivo
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        if (registros.length > 0) {
            const dniPrueba = registros[0].dni;
            console.log(`🧪 Ejecutando prueba con DNI: ${dniPrueba}`);
            await testEliminarRegistroPendiente(dniPrueba);
            
            console.log('\n⏱️ Esperando 5 segundos antes de restaurar...');
            setTimeout(async () => {
                await restaurarBackup();
                console.log('🎉 Prueba completada');
            }, 5000);
        } else {
            console.log('❌ No hay registros pendientes para probar');
        }
    } catch (error) {
        console.error('❌ Error ejecutando prueba:', error);
    }
}

// Exportar funciones para uso desde otros archivos
module.exports = {
    testEliminarRegistroPendiente,
    restaurarBackup,
    ejecutarPrueba
};

// Si se ejecuta directamente
if (require.main === module) {
    ejecutarPrueba();
}