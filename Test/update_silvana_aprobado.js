const fs = require('fs');
const path = require('path');

// Leer el archivo de registros pendientes
const REGISTROS_PATH = path.join(__dirname, 'data', 'Registros_Pendientes.json');
const data = JSON.parse(fs.readFileSync(REGISTROS_PATH, 'utf8'));

console.log('🔄 Actualizando estado de Silvana Correa a Completa...\n');

// Buscar Silvana Correa
const indice = data.findIndex(r => r.dni === '40152145');

if (indice !== -1) {
    const registro = data[indice];
    
    console.log('📋 Estado anterior:');
    console.log(`   - DNI: ${registro.dni}`);
    console.log(`   - Estado: ${registro.estado}`);
    console.log(`   - Fecha Completa: ${registro.fechaCompleta || 'No Completa'}`);
    
    // Actualizar a Completa
    data[indice] = {
        ...registro,
        estado: 'Completa',
        fechaCompleta: new Date().toISOString(),
        motivoCompleta: 'Documentación completa verificada - 5 documentos básicos + Solicitud de Pase para Semipresencial Plan 5',
        fechaActualizacion: new Date().toISOString()
    };
    
    // Guardar cambios
    fs.writeFileSync(REGISTROS_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('\n✅ Estado actualizado:');
    console.log(`   - DNI: ${data[indice].dni}`);
    console.log(`   - Estado: ${data[indice].estado}`);
    console.log(`   - Fecha Completa: ${data[indice].fechaCompleta}`);
    console.log(`   - Motivo: ${data[indice].motivoCompleta}`);
    
} else {
    console.log('❌ No se encontró el registro de Silvana Correa');
}

console.log('\n🎉 Actualización completada');