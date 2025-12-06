// Test del endpoint reiniciar alarma
const fetch = require('node-fetch');

async function testReiniciarAlarma() {
    try {
        console.log('🧪 Probando endpoint de reiniciar alarma...');
        
        // Usar un DNI que sabemos que existe (Milagros Gesper)
        const dni = '41234567';
        const url = `http://localhost:5000/api/registros-pendientes/${dni}/reiniciar-alarma`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diasExtension: 7,
                motivo: 'Prueba de extensión desde test'
            })
        });
        
        const resultado = await response.json();
        
        console.log('📊 Respuesta del servidor:');
        console.log('Status:', response.status);
        console.log('Resultado:', JSON.stringify(resultado, null, 2));
        
        if (resultado.success) {
            console.log('✅ Test exitoso - alarma reiniciada');
        } else {
            console.log('❌ Test falló:', resultado.message);
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
    }
}

testReiniciarAlarma();