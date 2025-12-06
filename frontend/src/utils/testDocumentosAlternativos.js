/**
 * Test para validar la lógica de documentos alternativos
 * Casos específicos: Plan B/C y 2do/3er año pueden presentar
 * - PREFERIDO: Analítico Parcial (más importante)
 * - ALTERNATIVO: Solicitud de Pase (cuando no presenta analítico)
 */

import { obtenerDocumentosRequeridos, obtenerEstadoDocumentacion } from './registroSinDocumentacion.js';

const testDocumentosAlternativos = () => {
    console.log('\n🧪 INICIANDO TESTS DE DOCUMENTOS ALTERNATIVOS\n');
    console.log('=' * 80);
    
    // Test 1: Presencial 2do año con Analítico Parcial (preferido) - SIN certificado primario
    console.log('\n📋 TEST 1: Presencial 2do año - CON Analítico Parcial, SIN certificado primario (correcto)');
    const requerimientos1 = obtenerDocumentosRequeridos('Presencial', '2', '');
    console.log('Requerimientos:', requerimientos1);
    
    const archivosConAnalitico = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        // NO incluye archivo_certificadoNivelPrimario (no requerido para 2do año)
        "archivo_analiticoParcial": true  // PREFERIDO ✅
        // NO tiene solicitud de pase (no necesario cuando tiene analítico)
    };
    
    const estado1 = obtenerEstadoDocumentacion(
        archivosConAnalitico, {}, 'Presencial', '2', ''
    );
    console.log('Estado documentación:', estado1);
    console.log(`✅ Esperado: COMPLETO (6/6) - Resultado: ${estado1.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado1.cantidadSubidos}/${estado1.totalDocumentos})`);
    
    // Test 2: Presencial 2do año con Solicitud de Pase (alternativo) - SIN certificado primario
    console.log('\n📋 TEST 2: Presencial 2do año - CON Solicitud de Pase, SIN certificado primario (correcto)');
    const archivosConSolicitud = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        // NO incluye archivo_certificadoNivelPrimario (no requerido para 2do año)
        "archivo_solicitudPase": true  // ALTERNATIVO ✅
        // NO tiene analítico parcial (pero no es necesario cuando tiene solicitud)
    };
    
    const estado2 = obtenerEstadoDocumentacion(
        archivosConSolicitud, {}, 'Presencial', '2', ''
    );
    console.log('Estado documentación:', estado2);
    console.log(`✅ Esperado: COMPLETO (6/6) - Resultado: ${estado2.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado2.cantidadSubidos}/${estado2.totalDocumentos})`);
    
    // Test 3: Presencial 2do año SIN ninguno de los dos (incompleto) - SIN certificado primario
    console.log('\n📋 TEST 3: Presencial 2do año - SIN Analítico NI Solicitud, SIN certificado primario (correcto pero incompleto)');
    const archivosSinAlternativos = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true
        // NO incluye archivo_certificadoNivelPrimario (correcto, no requerido para 2do año)
        // NO tiene analítico_parcial NI solicitud_pase ❌
    };
    
    const estado3 = obtenerEstadoDocumentacion(
        archivosSinAlternativos, {}, 'Presencial', '2', ''
    );
    console.log('Estado documentación:', estado3);
    console.log(`❌ Esperado: INCOMPLETO (5/6) - Resultado: ${estado3.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado3.cantidadSubidos}/${estado3.totalDocumentos})`);
    
    // Test 4: Semipresencial Plan B con Analítico Parcial (preferido) - SIN certificado primario
    console.log('\n📋 TEST 4: Semipresencial Plan B - CON Analítico Parcial, SIN certificado primario (correcto)');
    const requerimientos4 = obtenerDocumentosRequeridos('Semipresencial', '2', 'B');
    console.log('Requerimientos:', requerimientos4);
    
    const archivosConAnaliticoSinCertificado = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        // NO incluye archivo_certificadoNivelPrimario (no requerido para Plan B)
        "archivo_analiticoParcial": true  // PREFERIDO ✅
    };
    
    const estado4 = obtenerEstadoDocumentacion(
        archivosConAnaliticoSinCertificado, {}, 'Semipresencial', '2', 'B'
    );
    console.log('Estado documentación:', estado4);
    console.log(`✅ Esperado: COMPLETO (6/6) - Resultado: ${estado4.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado4.cantidadSubidos}/${estado4.totalDocumentos})`);
    
    // Test 5: Presencial 1er año (requiere certificado primario)
    console.log('\n📋 TEST 5: Presencial 1er año - CON certificado primario (requerido)');
    const requerimientos5 = obtenerDocumentosRequeridos('Presencial', '1', '');
    console.log('Requerimientos:', requerimientos5);
    
    const archivos1erAno = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        "archivo_certificadoNivelPrimario": true,  // REQUERIDO para 1er año ✅
        "archivo_solicitudPase": true              // Para 1er año es requerido junto con certificado
    };
    
    const estado5 = obtenerEstadoDocumentacion(
        archivos1erAno, {}, 'Presencial', '1', ''
    );
    console.log('Estado documentación:', estado5);
    console.log(`✅ Esperado: COMPLETO (7/7) - Resultado: ${estado5.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado5.cantidadSubidos}/${estado5.totalDocumentos})`);
    
    // Test 6: Con AMBOS documentos alternativos - SIN certificado primario (debe preferir el analítico)
    console.log('\n📋 TEST 6: Presencial 2do año - CON AMBOS documentos alternativos, SIN certificado primario (debe preferir analítico)');
    const archivosConAmbosSinCertificado = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        // NO incluye archivo_certificadoNivelPrimario (no requerido para 2do año)
        "archivo_analiticoParcial": true,  // PREFERIDO ✅
        "archivo_solicitudPase": true      // También presente pero no contará
    };
    
    const estado6 = obtenerEstadoDocumentacion(
        archivosConAmbosSinCertificado, {}, 'Presencial', '2', ''
    );
    console.log('Estado documentación:', estado6);
    console.log(`✅ Esperado: COMPLETO (6/6) usando analítico - Resultado: ${estado6.completo ? 'COMPLETO' : 'INCOMPLETO'} (${estado6.cantidadSubidos}/${estado6.totalDocumentos})`);
    console.log('Documentos subidos:', estado6.documentosSubidos);
    console.log('Debe incluir archivo_analiticoParcial y NO archivo_solicitudPase en el conteo');
    
    console.log('\n🎯 RESUMEN DE TESTS COMPLETADO');
    console.log('=' * 80);
    console.log('La lógica debe priorizar:');
    console.log('1. Analítico Parcial (preferido) para planes 2/3 y B/C');
    console.log('2. Solicitud de Pase (alternativo) cuando no presenta analítico');
    console.log('3. Solo UNO de los dos cuenta para completar los 7 documentos requeridos');
    console.log('4. Planes 1/A requieren ambos documentos (sin alternativas)');
};

// Ejecutar tests
export { testDocumentosAlternativos };

// Para ejecutar en consola del navegador:
// import { testDocumentosAlternativos } from './testDocumentosAlternativos.js';
// testDocumentosAlternativos();