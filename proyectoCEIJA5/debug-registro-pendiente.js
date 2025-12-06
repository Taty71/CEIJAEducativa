// Debug script para probar el flujo de registro pendiente
const fetch = require('node-fetch');
const FormData = require('form-data');

// Test del endpoint de registros pendientes
async function testRegistroPendiente() {
    try {
        console.log('🧪 Probando endpoint de registro pendiente...');
        
        const formData = new FormData();
        
        // Datos básicos de prueba
        formData.append('dni', '12345678');
        formData.append('nombre', 'Juan');
        formData.append('apellido', 'Perez');
        formData.append('email', 'juan.perez@example.com');
        formData.append('telefono', '123456789');
        formData.append('modalidad', 'Presencial');
        formData.append('calle', 'Calle Falsa');
        formData.append('numero', '123');
        formData.append('localidad', 'Springfield');
        formData.append('provincia', 'Buenos Aires');
        formData.append('motivoPendiente', 'Documentación incompleta - Test de debug');
        formData.append('tipoRegistro', 'SIN_DOCUMENTACION');
        
        const response = await fetch('http://localhost:5000/api/registros-pendientes', {
            method: 'POST',
            body: formData
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Headers:', response.headers.raw());
        
        const responseText = await response.text();
        console.log('📊 Response raw:', responseText);
        
        try {
            const result = JSON.parse(responseText);
            console.log('✅ Response JSON:', result);
        } catch (parseError) {
            console.log('❌ Error parsing JSON:', parseError.message);
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

// Test simple del endpoint GET
async function testGetRegistros() {
    try {
        console.log('🧪 Probando GET de registros pendientes...');
        
        const response = await fetch('http://localhost:5000/api/registros-pendientes');
        const registros = await response.json();
        
        console.log('📋 Registros existentes:', registros);
        
    } catch (error) {
        console.error('❌ Error en test GET:', error);
    }
}

// Ejecutar tests
async function runTests() {
    await testGetRegistros();
    await testRegistroPendiente();
}

runTests();