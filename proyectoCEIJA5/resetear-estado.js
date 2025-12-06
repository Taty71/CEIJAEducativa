const fs = require('fs').promises;
const path = require('path');

async function resetearEstadoRegistro(dni) {
    try {
        const rutaArchivo = path.join(__dirname, 'data', 'Registros_Pendientes.json');
        const contenido = await fs.readFile(rutaArchivo, 'utf8');
        const registros = JSON.parse(contenido);
        
        const indice = registros.findIndex(r => r.dni === dni);
        
        if (indice === -1) {
            console.log(`❌ No se encontró registro con DNI: ${dni}`);
            return;
        }
        
        console.log(`✅ Registro encontrado en posición ${indice}`);
        console.log(`   Estado actual: ${registros[indice].estado}`);
        
        // Resetear estado
        registros[indice].estado = 'PENDIENTE';
        delete registros[indice].fechaProcesado;
        delete registros[indice].idEstudiante;
        
        // Guardar
        await fs.writeFile(rutaArchivo, JSON.stringify(registros, null, 2), 'utf8');
        
        console.log(`🎉 Estado reseteado a PENDIENTE para DNI: ${dni}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

resetearEstadoRegistro('46123325');
