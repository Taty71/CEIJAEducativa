/**
 * Script para probar el servicio del frontend directamente
 * Ejecutar desde la carpeta frontend con: node test-frontend-service.js
 */

// Simular el servicio del frontend
const API_BASE_URL = 'http://localhost:5000/api';

const registrosPendientesService = {
    // Obtener todos los registros pendientes
    obtenerRegistrosPendientes: async () => {
        try {
            console.log('📋 [SERVICE] Obteniendo registros pendientes...');
            const response = await fetch(`${API_BASE_URL}/registros-pendientes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const registros = await response.json();
            console.log(`✅ [SERVICE] ${registros.length} registros pendientes obtenidos`);
            return registros;
        } catch (error) {
            console.error('Error al obtener registros pendientes:', error);
            throw error;
        }
    },

    // Eliminar un registro pendiente
    eliminarRegistroPendiente: async (dni) => {
        try {
            console.log(`🗑️ [SERVICE] Eliminando registro pendiente: ${dni}`);
            console.log(`🗑️ [SERVICE] URL completa: ${API_BASE_URL}/registros-pendientes/${dni}`);
            
            const response = await fetch(`${API_BASE_URL}/registros-pendientes/${dni}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(`🗑️ [SERVICE] Response status: ${response.status}`);
            console.log(`🗑️ [SERVICE] Response ok: ${response.ok}`);

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ [SERVICE] Error response:`, errorData);
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const resultado = await response.json();
            console.log('✅ [SERVICE] Registro pendiente eliminado exitosamente:', resultado);
            return resultado;
        } catch (error) {
            console.error('❌ [SERVICE] Error al eliminar registro pendiente:', error);
            console.error('❌ [SERVICE] Error stack:', error.stack);
            throw error;
        }
    }
};

async function testFrontendService() {
    try {
        console.log('🧪 [TEST] Iniciando test del servicio frontend...\n');
        
        // 1. Obtener registros
        console.log('📋 1. Obteniendo registros...');
        const registros = await registrosPendientesService.obtenerRegistrosPendientes();
        
        if (registros.length === 0) {
            console.log('❌ No hay registros para probar');
            return;
        }
        
        console.log('\n📋 Registros disponibles:');
        registros.forEach((reg, index) => {
            console.log(`  ${index + 1}. DNI: ${reg.dni} - ${reg.datos?.nombre || 'Sin nombre'} ${reg.datos?.apellido || 'Sin apellido'}`);
        });
        
        // 2. Probar eliminación
        const registroParaEliminar = registros[0];
        const dniPrueba = registroParaEliminar.dni;
        
        console.log(`\n🗑️ 2. Probando eliminación del DNI: ${dniPrueba}...`);
        
        const resultado = await registrosPendientesService.eliminarRegistroPendiente(dniPrueba);
        
        console.log('\n✅ Eliminación completada!');
        console.log('Resultado:', resultado);
        
        // 3. Verificar eliminación
        console.log('\n🔍 3. Verificando eliminación...');
        const nuevosRegistros = await registrosPendientesService.obtenerRegistrosPendientes();
        
        const registroEliminado = nuevosRegistros.find(r => r.dni === dniPrueba);
        
        if (registroEliminado) {
            console.log('❌ ERROR: El registro NO se eliminó');
        } else {
            console.log('✅ ÉXITO: El registro se eliminó correctamente');
            console.log(`   Registros restantes: ${nuevosRegistros.length}`);
        }
        
    } catch (error) {
        console.error('❌ [TEST] Error en el test:', error.message);
        console.error('❌ [TEST] Stack:', error.stack);
    }
}

// Ejecutar test
testFrontendService();