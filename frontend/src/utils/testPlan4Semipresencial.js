/**
 * Test específico para el caso Plan A Semipresencial (ID 4)
 * CORRECCIÓN: Plan 4 = Plan A (no Plan B como pensamos antes)
 * Según BD: ID 4 = "Plan A", ID 5 = "Plan B", ID 6 = "Plan C"
 */

import { obtenerDocumentosRequeridos, obtenerEstadoDocumentacion } from './registroSinDocumentacion.js';

const testPlan4Semipresencial = () => {
    console.log('\n🧪 TEST ESPECÍFICO: PLAN A SEMIPRESENCIAL (ID 4)\n');
    console.log('=' * 70);
    
    console.log('🔍 CORRECCIÓN IMPORTANTE:');
    console.log('- Plan 4 = Plan A (requiere certificado primario + solicitud pase)');
    console.log('- Plan 5 = Plan B (documentos alternativos)');
    console.log('- Plan 6 = Plan C (documentos alternativos)');
    console.log('');
    
    // Caso exacto del error reportado - CORREGIDO
    console.log('📋 TEST: Semipresencial Plan A (ID 4) - Caso real del error');
    const requerimientos = obtenerDocumentosRequeridos('Semipresencial', '4', '');
    console.log('Requerimientos obtenidos:', requerimientos);
    
    // Archivos que el usuario está enviando según el log
    const archivosUsuario = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        "archivo_certificadoNivelPrimario": true  // ¡Ahora SÍ es requerido para Plan A!
        // FALTA: archivo_solicitudPase (requerido para Plan A)
    };
    
    const estado = obtenerEstadoDocumentacion(
        archivosUsuario, {}, 'Semipresencial', '4', ''
    );
    
    console.log('\n📊 RESULTADO DEL TEST:');
    console.log('Estado:', estado.mensaje);
    console.log('¿Es completo?:', estado.completo);
    console.log('Documentos subidos:', estado.cantidadSubidos);
    console.log('Total requeridos:', estado.totalDocumentos);
    console.log('Documentos que cuenta como subidos:', estado.documentosSubidos);
    console.log('Documentos faltantes:', estado.documentosFaltantes);
    
    console.log('\n🔍 ANÁLISIS CORREGIDO:');
    console.log('- Plan A (ID 4) = 1er nivel semipresencial');
    console.log('- SÍ requiere certificado de nivel primario');
    console.log('- SÍ requiere solicitud de pase');
    console.log('- NO tiene documentos alternativos (ambos son obligatorios)');
    console.log('- El usuario envió certificado (correcto) pero falta solicitud de pase');
    
    // Test con documentación completa para Plan A
    console.log('\n📋 TEST: Plan A (ID 4) CON documentación completa');
    const archivosCompletos = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        "archivo_certificadoNivelPrimario": true, // Requerido para Plan A
        "archivo_solicitudPase": true             // También requerido para Plan A
    };
    
    const estadoCompleto = obtenerEstadoDocumentacion(
        archivosCompletos, {}, 'Semipresencial', '4', ''
    );
    
    console.log('\n📊 RESULTADO COMPLETO:');
    console.log('Estado:', estadoCompleto.mensaje);
    console.log('¿Es completo?:', estadoCompleto.completo);
    console.log('Documentos subidos:', estadoCompleto.cantidadSubidos, '(debe ser 7)');
    console.log('Total requeridos:', estadoCompleto.totalDocumentos, '(debe ser 7)');
    
    // Test comparativo con Plan B (ID 5)
    console.log('\n📋 TEST COMPARATIVO: Plan B (ID 5) - documentos alternativos');
    const requerimientosPlanB = obtenerDocumentosRequeridos('Semipresencial', '5', '');
    console.log('Requerimientos Plan B:', requerimientosPlanB);
    
    const archivosPlanB = {
        "foto": true,
        "archivo_dni": true,
        "archivo_cuil": true,
        "archivo_fichaMedica": true,
        "archivo_partidaNacimiento": true,
        "archivo_analiticoParcial": true  // Plan B: solo necesita uno de los alternativos
        // NO incluye certificado primario (no requerido para Plan B)
    };
    
    const estadoPlanB = obtenerEstadoDocumentacion(
        archivosPlanB, {}, 'Semipresencial', '5', ''
    );
    
    console.log('\n📊 RESULTADO PLAN B:');
    console.log('Estado:', estadoPlanB.mensaje);
    console.log('¿Es completo?:', estadoPlanB.completo);
    console.log('Documentos subidos:', estadoPlanB.cantidadSubidos, '(debe ser 6)');
    console.log('Total requeridos:', estadoPlanB.totalDocumentos, '(debe ser 6)');
    
    console.log('\n✅ RESUMEN FINAL CORREGIDO:');
    console.log('- Plan A (ID 4): 7 documentos - certificado + solicitud (ambos obligatorios)');
    console.log('- Plan B (ID 5): 6 documentos - analítico O solicitud (alternativos)');
    console.log('- Plan C (ID 6): 6 documentos - analítico O solicitud (alternativos)');
    console.log('- Error original: Usuario en Plan A falta solicitud de pase');
    
    return {
        planARequiereCertificado: requerimientos.documentos.includes('archivo_certificadoNivelPrimario'),
        planARequiereSolicitud: requerimientos.documentos.includes('archivo_solicitudPase'),
        planATieneAlternativos: requerimientos.alternativos !== null,
        casoOriginalCompleto: estado.completo,
        casoCompletoValido: estadoCompleto.completo,
        planBTieneAlternativos: requerimientosPlanB.alternativos !== null
    };
};

export { testPlan4Semipresencial };

console.log('🔧 Test Plan A (ID 4) Semipresencial corregido. Ejecutar testPlan4Semipresencial() para validar.');