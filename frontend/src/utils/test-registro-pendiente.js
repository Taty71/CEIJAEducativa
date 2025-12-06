// Test simple del flujo de registro pendiente desde el frontend
async function testFrontendToBackend() {
    try {
        console.log('🧪 Probando flujo frontend → backend para registro pendiente...');
        
        // Simular FormData como lo haría el frontend
        const formData = new FormData();
        
        // Datos básicos (equivalente a lo que envía useSubmitHandler)
        formData.append('dni', '12345678');
        formData.append('nombre', 'Test');
        formData.append('apellido', 'Usuario');
        formData.append('email', 'test@example.com');
        formData.append('telefono', '123456789');
        formData.append('modalidad', 'Presencial');
        formData.append('modalidadId', '1');
        formData.append('calle', 'Calle Test');
        formData.append('numero', '123');
        formData.append('localidad', 'Ciudad Test');
        formData.append('provincia', 'Provincia Test');
        formData.append('motivoPendiente', 'Test desde consola - documentación incompleta');
        formData.append('tipoRegistro', 'SIN_DOCUMENTACION');
        formData.append('cuil', '20123456780');
        formData.append('fechaNacimiento', '1990-01-01');
        
        console.log('📤 Enviando datos al endpoint...');
        
        const response = await fetch('http://localhost:5000/api/registros-pendientes', {
            method: 'POST',
            body: formData
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📊 Response text:', responseText);
        
        try {
            const result = JSON.parse(responseText);
            console.log('✅ Response JSON:', result);
            
            if (result.message) {
                console.log('✅ Mensaje del servidor:', result.message);
            }
            
            // Verificar que se guardó
            console.log('🔍 Verificando que se guardó...');
            const checkResponse = await fetch('http://localhost:5000/api/registros-pendientes');
            const registros = await checkResponse.json();
            console.log('📋 Registros en archivo:', registros);
            
        } catch (parseError) {
            console.log('❌ Error parsing JSON:', parseError.message);
        }
        
    } catch (error) {
        console.error('❌ Error en test frontend→backend:', error);
    }
}

// Test solo del GET para verificar que el servidor responde
async function testGetBasico() {
    try {
        console.log('🧪 Test GET básico...');
        const response = await fetch('http://localhost:5000/api/registros-pendientes');
        const data = await response.json();
        console.log('📋 Datos obtenidos:', data);
    } catch (error) {
        console.error('❌ Error en GET:', error);
    }
}

// Función para limpiar el archivo antes del test
async function limpiarArchivoTest() {
    try {
        console.log('🧹 Limpiando registros para test...');
        const response = await fetch('http://localhost:5000/api/registros-pendientes');
        const registros = await response.json();
        
        // Eliminar todos los registros de test existentes
        for (const registro of registros) {
            if (registro.dni === '12345678') {
                console.log('🗑️ Eliminando registro test existente...');
                await fetch(`http://localhost:5000/api/registros-pendientes/${registro.dni}`, {
                    method: 'DELETE'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error limpiando:', error);
    }
}

// Ejecutar tests secuencialmente
async function runFullTest() {
    await testGetBasico();
    await limpiarArchivoTest();
    await testFrontendToBackend();
}

// Ejecutar
runFullTest();