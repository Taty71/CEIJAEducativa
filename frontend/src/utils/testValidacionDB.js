/**
 * Test de validación con IDs REALES de la base de datos
 * Corregido según estructura: Plan A=ID 4, Plan B=ID 5, Plan C=ID 6
 */

import { obtenerDocumentosRequeridos, obtenerEstadoDocumentacion } from './registroSinDocumentacion.js';

console.log('🧪 === PRUEBA DE VALIDACIÓN CON IDs REALES DE LA BASE DE DATOS ===\n');

console.log('📋 ESTRUCTURA REAL DE LA BD:');
console.log('- Presencial: ID 1 = 1er año, ID 2 = 2do año, ID 3 = 3er año');
console.log('- Semipresencial: ID 4 = Plan A, ID 5 = Plan B, ID 6 = Plan C');
console.log('');

// Test 1: Plan A Semipresencial (ID 4) - Primer nivel, requiere certificado
console.log('🔍 TEST 1: Semipresencial Plan A (ID 4) - Primer nivel');
const req1 = obtenerDocumentosRequeridos('Semipresencial', '4', '');
console.log('Requerimientos:', req1);
console.log('¿Requiere certificado primario?:', req1.documentos.includes('archivo_certificadoNivelPrimario'));
console.log('¿Tiene alternativos?:', req1.alternativos !== null);

const test1Completo = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true, // Requerido para Plan A
    archivo_solicitudPase: true             // También requerido para Plan A
};

const resultado1 = obtenerEstadoDocumentacion(test1Completo, {}, 'Semipresencial', '4', '');
console.log('✅ PLAN A COMPLETO:', resultado1.completo ? 'SÍ' : 'NO');
console.log('Documentos:', resultado1.cantidadSubidos + '/' + resultado1.totalDocumentos);
console.log('');

// Test 2: Plan B Semipresencial (ID 5) - CBU completo, documentos alternativos
console.log('🔍 TEST 2: Semipresencial Plan B (ID 5) - CBU completo');
const req2 = obtenerDocumentosRequeridos('Semipresencial', '5', '');
console.log('Requerimientos:', req2);
console.log('¿Requiere certificado primario?:', req2.documentos.includes('archivo_certificadoNivelPrimario'));
console.log('¿Tiene alternativos?:', req2.alternativos !== null);

const test2ConAnalitico = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_analiticoParcial: true // Solo necesita uno de los alternativos
    // NO necesita certificado primario
};

const resultado2 = obtenerEstadoDocumentacion(test2ConAnalitico, {}, 'Semipresencial', '5', '');
console.log('✅ PLAN B CON ANALÍTICO:', resultado2.completo ? 'SÍ' : 'NO');
console.log('Documentos:', resultado2.cantidadSubidos + '/' + resultado2.totalDocumentos);
console.log('');

// Test 3: Plan C Semipresencial (ID 6) - Solo primario completo
console.log('🔍 TEST 3: Semipresencial Plan C (ID 6) - Solo primario completo');
const req3 = obtenerDocumentosRequeridos('Semipresencial', '6', '');
console.log('Requerimientos:', req3);
console.log('¿Requiere certificado primario?:', req3.documentos.includes('archivo_certificadoNivelPrimario'));
console.log('¿Tiene alternativos?:', req3.alternativos !== null);

const test3ConSolicitud = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_solicitudPase: true // Solo necesita uno de los alternativos
    // NO necesita certificado primario
};

const resultado3 = obtenerEstadoDocumentacion(test3ConSolicitud, {}, 'Semipresencial', '6', '');
console.log('✅ PLAN C CON SOLICITUD:', resultado3.completo ? 'SÍ' : 'NO');
console.log('Documentos:', resultado3.cantidadSubidos + '/' + resultado3.totalDocumentos);
console.log('');

// Test 4: CASO ESPECÍFICO DEL ERROR - Plan A (ID 4) con certificado pero sin solicitud
console.log('🚨 TEST 4: CASO DEL ERROR REPORTADO - Plan A (ID 4) incompleto');
const test4Error = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true // Tiene certificado
    // FALTA: archivo_solicitudPase (también requerido para Plan A)
};

const resultado4 = obtenerEstadoDocumentacion(test4Error, {}, 'Semipresencial', '4', '');
console.log('🔴 PLAN A INCOMPLETO (caso error):', resultado4.completo ? 'SÍ' : 'NO');
console.log('Estado:', resultado4.mensaje);
console.log('Documentos:', resultado4.cantidadSubidos + '/' + resultado4.totalDocumentos);
console.log('Faltantes:', resultado4.nombresDocumentosFaltantes);
console.log('');

// Test 5: Presencial 1er año (ID 1) para comparar
console.log('🔍 TEST 5: Presencial 1er año (ID 1) - Para comparar con Plan A');
const req5 = obtenerDocumentosRequeridos('Presencial', '1', '');
console.log('Requerimientos Presencial 1er:', req5);
console.log('¿Requiere certificado primario?:', req5.documentos.includes('archivo_certificadoNivelPrimario'));
console.log('¿Tiene alternativos?:', req5.alternativos !== null);

const test5Presencial = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true, // Requerido para 1er año
    archivo_solicitudPase: true             // También requerido para 1er año
};

const resultado5 = obtenerEstadoDocumentacion(test5Presencial, {}, 'Presencial', '1', '');
console.log('✅ PRESENCIAL 1ER AÑO:', resultado5.completo ? 'SÍ' : 'NO');
console.log('Documentos:', resultado5.cantidadSubidos + '/' + resultado5.totalDocumentos);
console.log('');

console.log('📊 === RESUMEN DE LA CORRECCIÓN ===');
console.log('✅ Plan A (ID 4) = Primer nivel semipresencial');
console.log('   - SÍ requiere certificado de nivel primario');
console.log('   - SÍ requiere solicitud de pase');
console.log('   - NO tiene documentos alternativos (ambos obligatorios)');
console.log('   - Total: 7 documentos');
console.log('');
console.log('✅ Plan B (ID 5) = CBU completo/4to año incompleto');
console.log('   - NO requiere certificado de nivel primario');
console.log('   - Requiere UNO de: Analítico Parcial O Solicitud de Pase');
console.log('   - SÍ tiene documentos alternativos');
console.log('   - Total: 6 documentos');
console.log('');
console.log('✅ Plan C (ID 6) = Solo primario completo');
console.log('   - NO requiere certificado de nivel primario');
console.log('   - Requiere UNO de: Analítico Parcial O Solicitud de Pase');
console.log('   - SÍ tiene documentos alternativos');
console.log('   - Total: 6 documentos');
console.log('');
console.log('🔧 ERROR ORIGINAL: Plan A (ID 4) se mapeaba incorrectamente a lógica Plan B');
console.log('🎯 CORRECCIÓN: Plan A (ID 4) ahora usa lógica correcta de primer nivel');

export { };
console.log('🧪 Test BD IDs disponible. Copiar y pegar en consola para ejecutar.');