const { leerRegistrosPendientes } = require('./services/registrosPendientes/fileManager');
const { determinarEstadoNotificacion } = require('./services/registrosPendientes/vencimientoUtils');

async function probarVencimiento() {
    try {
        const registros = await leerRegistrosPendientes();
        const milagros = registros.find(r => r.dni === '36258852');
        
        if (milagros) {
            console.log('🔍 Milagros Gesper - Información de vencimiento:');
            console.log('📅 Fecha de registro:', milagros.timestamp);
            console.log('📊 Estado actual:', milagros.estado);
            
            const vencimiento = determinarEstadoNotificacion(milagros);
            console.log('\n🚨 Información de vencimiento:');
            console.log(JSON.stringify(vencimiento, null, 2));
            
            console.log('\n📋 ¿Qué debería ver el frontend?');
            console.log(`- Badge: ${vencimiento.tipoNotificacion}`);
            console.log(`- Mensaje: "${vencimiento.mensaje}"`);
            console.log(`- Puede reiniciar alarma: ${vencimiento.puedeReiniciarAlarma}`);
        } else {
            console.log('❌ No se encontró a Milagros Gesper');
            console.log('\n📋 Registros disponibles:');
            registros.forEach(r => console.log(`- ${r.datos.nombre} ${r.datos.apellido} (${r.dni})`));
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

probarVencimiento();