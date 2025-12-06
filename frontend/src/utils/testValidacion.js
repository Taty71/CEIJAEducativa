// Test de validación dinámica de documentación CON DOCUMENTOS ALTERNATIVOS
import { obtenerDocumentosRequeridos, obtenerEstadoDocumentacion } from './registroSinDocumentacion.js';

// Casos de prueba
console.log('=== PRUEBA DE VALIDACIÓN DINÁMICA CON DOCUMENTOS ALTERNATIVOS ===');

// Test 1: Presencial 1er año
console.log('\n1. Presencial - 1er Año:');
const requerimientos1 = obtenerDocumentosRequeridos('Presencial', '1', '');
console.log('Documentos requeridos:', requerimientos1.documentos);
console.log('Alternativos:', requerimientos1.alternativos || 'No tiene');

// Test 2: Semipresencial Plan A
console.log('\n2. Semipresencial - Plan A:');
const requerimientos2 = obtenerDocumentosRequeridos('Semipresencial', '', 'A');
console.log('Documentos requeridos:', requerimientos2.documentos);
console.log('Alternativos:', requerimientos2.alternativos || 'No tiene');

// Test 3: Semipresencial Plan B (CON ALTERNATIVOS)
console.log('\n3. Semipresencial - Plan B (CON ALTERNATIVOS):');
const requerimientos3 = obtenerDocumentosRequeridos('Semipresencial', '', 'B');
console.log('Documentos requeridos:', requerimientos3.documentos);
console.log('Alternativos:', requerimientos3.alternativos);

// Test 4: Semipresencial Plan C (CON ALTERNATIVOS)
console.log('\n4. Semipresencial - Plan C (CON ALTERNATIVOS):');
const requerimientos4 = obtenerDocumentosRequeridos('Semipresencial', '', 'C');
console.log('Documentos requeridos:', requerimientos4.documentos);
console.log('Alternativos:', requerimientos4.alternativos);

// Test 5: Presencial 3er año (CON ALTERNATIVOS)
console.log('\n5. Presencial - 3er Año (CON ALTERNATIVOS):');
const requerimientos5 = obtenerDocumentosRequeridos('Presencial', '3', '');
console.log('Documentos requeridos:', requerimientos5.documentos);
console.log('Alternativos:', requerimientos5.alternativos);

// Test 6: Estado con documentación incompleta Plan A (SIN alternativos)
console.log('\n6. Test estado documentación Plan A (sin alternativos):');
const filesTest = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true
    // Falta: archivo_solicitudPase
};

const estado = obtenerEstadoDocumentacion(filesTest, {}, 'Semipresencial', '', 'A');
console.log('Estado:', estado.mensaje);
console.log('Completo:', estado.completo);
console.log('Documentos faltantes:', estado.nombresDocumentosFaltantes);

// Test 7: Plan B con ANALÍTICO PARCIAL (preferido) - COMPLETO SIN CERTIFICADO PRIMARIO
console.log('\n7. Test Plan B con ANALÍTICO PARCIAL - SIN certificado primario (correcto):');
const filesPlanBConAnalitico = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    // NO incluye archivo_certificadoNivelPrimario (no requerido para Plan B)
    archivo_analiticoParcial: true  // PREFERIDO ✅
    // No necesita archivo_solicitudPase
};

const estadoPlanBAnalítico = obtenerEstadoDocumentacion(filesPlanBConAnalitico, {}, 'Semipresencial', '', 'B');
console.log('Estado:', estadoPlanBAnalítico.mensaje);
console.log('Completo:', estadoPlanBAnalítico.completo);
console.log('Documentos subidos:', estadoPlanBAnalítico.cantidadSubidos);
console.log('Total requeridos:', estadoPlanBAnalítico.totalDocumentos, '(debe ser 6: base 5 + alternativo 1)');

// Test 8: Plan B con SOLICITUD DE PASE (alternativo) - COMPLETO SIN CERTIFICADO PRIMARIO
console.log('\n8. Test Plan B con SOLICITUD DE PASE - SIN certificado primario (correcto):');
const filesPlanBConSolicitud = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    // NO incluye archivo_certificadoNivelPrimario (no requerido para Plan B)
    archivo_solicitudPase: true  // ALTERNATIVO ✅
    // No necesita archivo_analiticoParcial
};

const estadoPlanBSolicitud = obtenerEstadoDocumentacion(filesPlanBConSolicitud, {}, 'Semipresencial', '', 'B');
console.log('Estado:', estadoPlanBSolicitud.mensaje);
console.log('Completo:', estadoPlanBSolicitud.completo);
console.log('Documentos subidos:', estadoPlanBSolicitud.cantidadSubidos);
console.log('Total requeridos:', estadoPlanBSolicitud.totalDocumentos, '(debe ser 6: base 5 + alternativo 1)');

// Test 9: Plan B SIN NINGUNO de los alternativos - INCOMPLETO
console.log('\n9. Test Plan B SIN NINGUNO de los alternativos - INCOMPLETO:');
const filesPlanBIncompleto = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true
    // NO incluye certificado primario (correcto, no requerido)
    // No tiene archivo_analiticoParcial NI archivo_solicitudPase ❌
};

const estadoPlanBIncompleto = obtenerEstadoDocumentacion(filesPlanBIncompleto, {}, 'Semipresencial', '', 'B');
console.log('Estado:', estadoPlanBIncompleto.mensaje);
console.log('Completo:', estadoPlanBIncompleto.completo);
console.log('Documentos subidos:', estadoPlanBIncompleto.cantidadSubidos, '(debe ser 5)');
console.log('Total requeridos:', estadoPlanBIncompleto.totalDocumentos, '(debe ser 6)');
console.log('Documentos faltantes:', estadoPlanBIncompleto.nombresDocumentosFaltantes);

// Test 10: Plan A CON certificado primario (requerido para Plan A) - COMPLETO
console.log('\n10. Test Plan A CON certificado primario (requerido) - COMPLETO:');
const filesPlanACompleto = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true,  // REQUERIDO para Plan A ✅
    archivo_solicitudPase: true              // REQUERIDO para Plan A ✅
};

const estadoPlanACompleto = obtenerEstadoDocumentacion(filesPlanACompleto, {}, 'Semipresencial', '', 'A');
console.log('Estado:', estadoPlanACompleto.mensaje);
console.log('Completo:', estadoPlanACompleto.completo);
console.log('Documentos subidos:', estadoPlanACompleto.cantidadSubidos, '(debe ser 7)');
console.log('Total requeridos:', estadoPlanACompleto.totalDocumentos, '(debe ser 7)');

// Test 10: Plan B con AMBOS alternativos (debe preferir analítico)
console.log('\n10. Test Plan B con AMBOS alternativos (debe preferir analítico):');
const filesPlanBConAmbos = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_certificadoNivelPrimario: true,
    archivo_analiticoParcial: true,  // PREFERIDO ✅
    archivo_solicitudPase: true       // También presente pero no debe contar
};

const estadoPlanBConAmbos = obtenerEstadoDocumentacion(filesPlanBConAmbos, {}, 'Semipresencial', '', 'B');
console.log('Estado:', estadoPlanBConAmbos.mensaje);
console.log('Completo:', estadoPlanBConAmbos.completo);
console.log('Documentos subidos:', estadoPlanBConAmbos.cantidadSubidos, '(debe ser 7, no 8)');
console.log('Total requeridos:', estadoPlanBConAmbos.totalDocumentos);
console.log('Documentos en conteo:', estadoPlanBConAmbos.documentosSubidos);

// Test 11: Semipresencial Plan 4 (equivalente a Plan B) - NUEVO CASO
console.log('\n11. Test Semipresencial Plan 4 (equivalente a Plan B) - SIN certificado primario:');
const requerimientos11 = obtenerDocumentosRequeridos('Semipresencial', '4', '');
console.log('Requerimientos Plan 4:', requerimientos11);

const filesPlan4 = {
    foto: true,
    archivo_dni: true,
    archivo_cuil: true,
    archivo_fichaMedica: true,
    archivo_partidaNacimiento: true,
    archivo_analiticoParcial: true  // Documento alternativo requerido
    // NO incluye certificado primario (correcto)
};

const estadoPlan4 = obtenerEstadoDocumentacion(filesPlan4, {}, 'Semipresencial', '4', '');
console.log('Estado Plan 4:', estadoPlan4.mensaje);
console.log('Completo:', estadoPlan4.completo);
console.log('Documentos subidos:', estadoPlan4.cantidadSubidos, '(debe ser 6)');
console.log('Total requeridos:', estadoPlan4.totalDocumentos, '(debe ser 6)');

console.log('\n=== FIN PRUEBAS DOCUMENTOS ALTERNATIVOS (ACTUALIZADO) ===');