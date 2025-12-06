const http = require('http');

async function procesarRegistro() {
    try {
        console.log('\n🚀 Iniciando procesamiento del registro DNI 46123325...\n');
        
        // Crear el JSON body con todos los datos
        const datos = {
            tipoDocumento: 'DNI',
            dni: '46123325',
            nombre: 'María Pia',
            apellido: 'Vazquez',
            cuil: '27-46123325-8',
            email: 'crisbmaia50@gmail.com',
            telefono: '03518945658',
            fechaNacimiento: '2003-04-26',
            paisEmision: 'Argentina',
            calle: 'Simon Bolivar',
            numero: '365',
            barrio: '10',
            localidad: '108',
            provincia: '5',
            modalidad: 'Semipresencial',
            modalidadId: '2',
            planAnio: '6',
            idModulo: ['6'],
            idEstadoInscripcion: '1',
            sexo: 'Femenino'
        };
        
        const postData = JSON.stringify(datos);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/registros-pendientes/procesar',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        console.log('📋 Datos preparados:', datos);
        console.log('📎 Los archivos ya están migrados en archivosDocumento/');
        console.log('🔄 Enviando petición a /api/registros-pendientes/procesar...\n');
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('\n✅ RESPUESTA DEL SERVIDOR:');
                console.log('═══════════════════════════════════════════════════════════');
                console.log('Status:', res.statusCode);
                
                try {
                    const response = JSON.parse(data);
                    console.log(JSON.stringify(response, null, 2));
                    console.log('═══════════════════════════════════════════════════════════\n');
                    
                    if (response.estado === 'PROCESADO') {
                        console.log('🎉 ¡REGISTRO PROCESADO EXITOSAMENTE!');
                        console.log(`   ID Estudiante: ${response.idEstudiante}`);
                    } else if (response.estado === 'PENDIENTE') {
                        console.log('⚠️  REGISTRO PENDIENTE - Documentación incompleta');
                        console.log(`   Progreso: ${response.progreso}`);
                    }
                } catch (e) {
                    console.log(data);
                    console.log('═══════════════════════════════════════════════════════════\n');
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('\n❌ ERROR AL PROCESAR:');
            console.error('═══════════════════════════════════════════════════════════');
            console.error('Error completo:', error);
            console.error('Mensaje:', error.message);
            console.error('Code:', error.code);
            console.error('═══════════════════════════════════════════════════════════\n');
        });
        
        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('\n❌ ERROR AL PROCESAR:');
        console.error('═══════════════════════════════════════════════════════════');
        console.error(error.message);
        console.error('═══════════════════════════════════════════════════════════\n');
    }
}

procesarRegistro();
