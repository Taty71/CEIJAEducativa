// Lista registros pendientes existentes
const path = require('path');
const fs = require('fs');

async function listarRegistros() {
    try {
        console.log('📋 Listando registros pendientes...');
        
        // Leer el archivo de registros pendientes
        const archivoPath = path.join(__dirname, 'proyectoCEIJA5', 'archivosPendientes', 'registrosPendientes.json');
        
        if (!fs.existsSync(archivoPath)) {
            console.log('❌ No se encontró el archivo de registros pendientes');
            return;
        }
        
        const contenido = fs.readFileSync(archivoPath, 'utf8');
        const registros = JSON.parse(contenido);
        
        console.log(`📊 Total de registros: ${registros.length}`);
        
        registros.forEach((registro, index) => {
            const dni = registro.datos?.dni || registro.dni;
            const nombre = `${registro.datos?.nombre || registro.nombre} ${registro.datos?.apellido || registro.apellido}`;
            const estado = registro.estado || 'PENDIENTE';
            console.log(`${index + 1}. DNI: ${dni} - ${nombre} - Estado: ${estado}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listarRegistros();