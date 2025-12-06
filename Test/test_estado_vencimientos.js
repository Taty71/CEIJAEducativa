// Test para verificar el estado actual del sistema de vencimientos
const fetch = require('node-fetch');

async function testEstadoVencimientos() {
    try {
        console.log('🔍 Verificando estado actual del sistema de vencimientos...\n');
        
        // Obtener registros pendientes desde el API
        const response = await fetch('http://localhost:5000/api/registros-pendientes');
        const registros = await response.json();
        
        console.log(`📊 Total de registros: ${registros.length}\n`);
        
        // Analizar cada registro, especialmente los que han sido reiniciados
        registros.forEach((registro, index) => {
            const dni = registro.dni;
            const nombre = `${registro.datos?.nombre || 'N/A'} ${registro.datos?.apellido || 'N/A'}`;
            const vencimiento = registro.vencimiento;
            
            console.log(`${index + 1}. ${nombre} (DNI: ${dni})`);
            console.log(`   Estado: ${registro.estado}`);
            
            if (vencimiento) {
                console.log(`   Vencimiento info:`);
                console.log(`     - Tipo: ${vencimiento.tipoNotificacion}`);
                console.log(`     - Mensaje: ${vencimiento.mensaje}`);
                console.log(`     - Días restantes: ${vencimiento.diasRestantes}`);
                console.log(`     - Puede reiniciar: ${vencimiento.puedeReiniciarAlarma}`);
                console.log(`     - Fecha vencimiento: ${vencimiento.fechaVencimiento}`);
                console.log(`     - Alarma reiniciada: ${vencimiento.alarmaReiniciada}`);
                console.log(`     - Extensiones anteriores: ${vencimiento.extensionesAnteriores}`);
            } else {
                console.log(`   ⚠️ Sin información de vencimiento del backend`);
            }
            
            // Información adicional del registro raw
            if (registro.alarmaReiniciada) {
                console.log(`   📅 Alarma reiniciada: ${registro.alarmaReiniciada}`);
                console.log(`   📅 Fecha vencimiento (registro): ${registro.fechaVencimiento}`);
                console.log(`   📅 Fecha reinicio: ${registro.fechaReinicio}`);
                console.log(`   📝 Motivo: ${registro.motivoExtension}`);
                if (registro.historialExtensiones) {
                    console.log(`   📋 Extensiones: ${registro.historialExtensiones.length}`);
                }
            }
            
            console.log('   ---\n');
        });
        
        // Identificar específicamente el registro de Milagros que debería haber sido reiniciado
        const milagros = registros.find(r => r.dni === '36258852');
        if (milagros) {
            console.log('🔍 ANÁLISIS ESPECÍFICO - Milagros Gesper (36258852):');
            console.log('Raw data:', JSON.stringify(milagros.vencimiento, null, 2));
            console.log('Estado de alarma en registro:', milagros.alarmaReiniciada);
            console.log('Fecha vencimiento:', milagros.fechaVencimiento);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEstadoVencimientos();