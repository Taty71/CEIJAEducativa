// Script de prueba para la funcionalidad de reiniciar alarma

const { determinarEstadoNotificacion } = require('./services/registrosPendientes/vencimientoUtils');
const fs = require('fs');

console.log('🧪 PRUEBA: Funcionalidad de Reiniciar Alarma');
console.log('==========================================\n');

// Leer registros
const data = JSON.parse(fs.readFileSync('./data/Registros_Pendientes.json', 'utf8'));

// Analizar algunos registros
console.log('📊 Estado de vencimiento de registros pendientes:\n');

data.filter(r => r.estado === 'PENDIENTE').slice(0, 5).forEach(registro => {
    const vencimiento = determinarEstadoNotificacion(registro);
    
    console.log(`👤 ${registro.datos.nombre} ${registro.datos.apellido} (DNI: ${registro.dni})`);
    console.log(`   📅 Registro: ${new Date(registro.timestamp).toLocaleDateString('es-AR')}`);
    console.log(`   ⏰ Vence: ${vencimiento.fechaVencimientoLocal}`);
    console.log(`   🚨 Estado: ${vencimiento.mensaje} (${vencimiento.tipoNotificacion})`);
    console.log(`   🔄 Puede reiniciar: ${vencimiento.puedeReiniciarAlarma ? 'SÍ' : 'NO'}`);
    console.log(`   📊 Extensiones: ${vencimiento.extensionesAnteriores}`);
    console.log('');
});

console.log('✅ Análisis completado');
console.log('\n📝 Para reiniciar una alarma, usar:');
console.log('POST /api/registros-pendientes/:dni/reiniciar-alarma');
console.log('Body: { "diasExtension": 7, "motivo": "Extensión solicitada", "usuario": "admin" }');