/**
 * Script de debugging para probar la eliminación de registros pendientes
 * Ejecutar con: node debug-eliminacion.js
 */

const http = require('http');

// Función para hacer petición HTTP
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testEliminarRegistro() {
    try {
        console.log('🧪 Iniciando test de eliminación de registros pendientes...\n');
        
        // 1. Obtener lista de registros pendientes
        console.log('📋 1. Obteniendo lista de registros pendientes...');
        const listaResponse = await makeRequest('GET', '/api/registros-pendientes');
        
        console.log(`Status: ${listaResponse.status}`);
        console.log(`Registros encontrados: ${Array.isArray(listaResponse.data) ? listaResponse.data.length : 'No es array'}`);
        
        if (listaResponse.status !== 200) {
            console.error('❌ Error obteniendo registros:', listaResponse.data);
            return;
        }
        
        const registros = listaResponse.data;
        
        if (!Array.isArray(registros) || registros.length === 0) {
            console.log('❌ No hay registros pendientes para probar');
            return;
        }
        
        // Mostrar registros disponibles
        console.log('\n📋 Registros disponibles:');
        registros.forEach((reg, index) => {
            console.log(`  ${index + 1}. DNI: ${reg.dni} - ${reg.datos?.nombre} ${reg.datos?.apellido}`);
        });
        
        // 2. Probar eliminación con el primer registro
        const registroParaEliminar = registros[0];
        const dniPrueba = registroParaEliminar.dni;
        
        console.log(`\n🗑️ 2. Intentando eliminar registro con DNI: ${dniPrueba}`);
        console.log(`   Nombre: ${registroParaEliminar.datos?.nombre} ${registroParaEliminar.datos?.apellido}`);
        
        const deleteResponse = await makeRequest('DELETE', `/api/registros-pendientes/${dniPrueba}`);
        
        console.log(`Status: ${deleteResponse.status}`);
        console.log('Response:', deleteResponse.data);
        
        if (deleteResponse.status === 200) {
            console.log('✅ Eliminación exitosa!');
            
            // 3. Verificar que se eliminó
            console.log('\n🔍 3. Verificando eliminación...');
            const verificacionResponse = await makeRequest('GET', '/api/registros-pendientes');
            
            if (verificacionResponse.status === 200) {
                const nuevosRegistros = verificacionResponse.data;
                const registroEliminado = nuevosRegistros.find(r => r.dni === dniPrueba);
                
                if (registroEliminado) {
                    console.log('❌ ERROR: El registro NO se eliminó correctamente');
                } else {
                    console.log('✅ ÉXITO: El registro se eliminó correctamente');
                    console.log(`   Registros restantes: ${nuevosRegistros.length}`);
                }
            }
        } else {
            console.log('❌ Error en eliminación:', deleteResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar test
testEliminarRegistro();