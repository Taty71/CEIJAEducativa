const fs = require('fs');
const path = require('path');

// Simulamos la lógica de validación de documentación
function validarDocumentacion(modalidadId, planAnioId, archivosDisponibles) {
    console.log('\n📋 Validación de documentación:');
    console.log(`   - Modalidad: ${modalidadId === 1 ? 'Presencial' : modalidadId === 2 ? 'Semipresencial' : 'Desconocida'} (ID: ${modalidadId})`);
    console.log(`   - Plan/Año: ${planAnioId === 1 ? '1er Año' : planAnioId === 2 ? '2do Año' : planAnioId === 3 ? '3er Año' : planAnioId === 4 ? 'Plan A' : planAnioId === 5 ? 'Plan B' : planAnioId === 6 ? 'Plan C' : `Plan ${planAnioId}`}`);

    // Documentos básicos requeridos (5 documentos)
    const documentosBasicos = ['foto', 'archivo_dni', 'archivo_cuil', 'archivo_partidaNacimiento', 'archivo_fichaMedica'];
    const faltantesBasicos = documentosBasicos.filter(doc => !archivosDisponibles[doc]);
    const documentacionBasicaCompleta = faltantesBasicos.length === 0;

    // Documentos adicionales
    const tieneAnaliticoParcial = !!archivosDisponibles['archivo_analiticoParcial'];
    const tieneSolicitudPase = !!archivosDisponibles['archivo_solicitudPase'];
    const tieneCertificadoPrimario = !!archivosDisponibles['archivo_certificadoNivelPrimario'];

    console.log(`   - Básicos (5 docs): ${documentacionBasicaCompleta ? '✅ Completos' : `❌ Faltan ${faltantesBasicos.length}`}`);
    if (!documentacionBasicaCompleta) {
        console.log(`     Faltantes: ${faltantesBasicos.join(', ')}`);
    }
    console.log(`   - Analítico Parcial: ${tieneAnaliticoParcial ? '✅' : '❌'}`);
    console.log(`   - Solicitud Pase: ${tieneSolicitudPase ? '✅' : '❌'}`);
    console.log(`   - Certificado Primario: ${tieneCertificadoPrimario ? '✅' : '❌'}`);

    // Lógica de validación universal con fallbacks
    let documentacionCompleta = false;
    let nombreDocumentoRequerido = '';
    let requiereDocumentoAdicional = true;

    if (modalidadId === 1) { // PRESENCIAL
        if (planAnioId === 1) { // 1er Año
            nombreDocumentoRequerido = 'Certificado de Nivel Primario o Solicitud de Pase';
            documentacionCompleta = documentacionBasicaCompleta && (tieneCertificadoPrimario || tieneSolicitudPase);
        } else if (planAnioId === 2 || planAnioId === 3) { // 2do/3er Año
            nombreDocumentoRequerido = 'Analítico Parcial o Solicitud de Pase';
            documentacionCompleta = documentacionBasicaCompleta && (tieneAnaliticoParcial || tieneSolicitudPase);
        } else {
            // Default case for unspecified Presencial plans
            console.log(`   ⚠️  Plan ${planAnioId} no especificado para Presencial, usando documentación básica`);
            nombreDocumentoRequerido = 'Documentación básica';
            documentacionCompleta = documentacionBasicaCompleta;
            requiereDocumentoAdicional = false;
        }
    } else if (modalidadId === 2) { // SEMIPRESENCIAL
        if (planAnioId === 4) { // Plan A
            nombreDocumentoRequerido = 'Certificado de Nivel Primario';
            documentacionCompleta = documentacionBasicaCompleta && tieneCertificadoPrimario;
        } else if (planAnioId === 5 || planAnioId === 6) { // Plan B/C
            nombreDocumentoRequerido = 'Analítico Parcial';
            documentacionCompleta = documentacionBasicaCompleta && tieneAnaliticoParcial;
        } else {
            // Default case for unspecified Semipresencial plans
            console.log(`   ⚠️  Plan ${planAnioId} no especificado para Semipresencial, usando documentación básica`);
            nombreDocumentoRequerido = 'Documentación básica';
            documentacionCompleta = documentacionBasicaCompleta;
            requiereDocumentoAdicional = false;
        }
    } else {
        // Fallback for unrecognized modalidades
        console.log(`   ⚠️  Modalidad ${modalidadId} no reconocida, usando documentación básica como fallback`);
        nombreDocumentoRequeridad = 'Documentación básica';
        documentacionCompleta = documentacionBasicaCompleta;
        requiereDocumentoAdicional = false;
    }

    console.log(`   - Documentos requeridos: ${nombreDocumentoRequerido}`);
    console.log(`   - Requiere documentación adicional: ${requiereDocumentoAdicional ? 'Sí' : 'No'}`);
    console.log(`   - Documentación suficiente para procesar: ${documentacionCompleta ? '✅ SÍ' : '❌ NO'}`);

    return {
        documentacionCompleta,
        nombreDocumentoRequerido,
        faltantesBasicos,
        documentacionBasicaCompleta,
        requiereDocumentoAdicional
    };
}

// Leer registros y probar la lógica
const data = JSON.parse(fs.readFileSync('./data/Registros_Pendientes.json', 'utf8'));

console.log('🧪 PRUEBA DE LÓGICA UNIVERSAL DE VALIDACIÓN');
console.log('============================================\n');

// Probar diferentes combinaciones
const registrosParaProbar = [
    data.find(r => r.modalidadId === 1 && r.planAnioId === 2), // Presencial Plan 2
    data.find(r => r.modalidadId === 2 && r.planAnioId === 5), // Semipresencial Plan 5
    data.find(r => r.modalidadId === 2 && r.planAnioId === 6), // Semipresencial Plan 6
].filter(Boolean);

registrosParaProbar.forEach((registro, index) => {
    console.log(`\n🔍 PRUEBA ${index + 1}: ${registro.datos.nombre} ${registro.datos.apellido} (DNI: ${registro.dni})`);
    
    // Simular archivos disponibles basados en los archivos del registro
    const archivosDisponibles = {};
    if (registro.archivos) {
        Object.keys(registro.archivos).forEach(key => {
            archivosDisponibles[key] = true;
        });
    }

    // Ejecutar validación
    const resultado = validarDocumentacion(
        parseInt(registro.modalidadId || registro.datos.modalidadId),
        parseInt(registro.planAnioId || registro.datos.planAnio),
        archivosDisponibles
    );

    console.log(`   - Estado sugerido: ${resultado.documentacionCompleta ? 'PROCESADO' : 'PENDIENTE'}`);
    console.log(`   - Estado actual: ${registro.estado}`);
    
    if (!resultado.documentacionCompleta && resultado.faltantesBasicos.length > 0) {
        console.log(`   - ⚠️  Faltan documentos básicos: ${resultado.faltantesBasicos.join(', ')}`);
    }
});

console.log('\n✅ Prueba de lógica universal completada');