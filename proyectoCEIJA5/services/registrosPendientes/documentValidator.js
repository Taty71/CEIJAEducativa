// Validador de documentación para registros pendientes

// Función principal de validación de documentación
const validarDocumentacion = (modalidadId, planAnioId, archivosDisponibles) => {
    console.log('\n📋 Validación de documentación (Estricta):');
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

    // Lógica de validación según requerimientos del usuario
    let documentacionCompleta = false;
    let nombreDocumentoRequerido = '';
    let requiereDocumentoAdicional = true;

    // GRUPO 1: Presencial 1er Año (1) O Semipresencial Plan A (4)
    // Requisito: Básicos + Certificado de Nivel Primario ÚNICAMENTE
    if ((modalidadId === 1 && planAnioId === 1) || (modalidadId === 2 && planAnioId === 4)) {
        nombreDocumentoRequerido = 'Certificado de Nivel Primario';

        // Solo exigimos Primario. NO exigimos pase ni analitico.
        const tieneRequisitoGrupo1 = tieneCertificadoPrimario;
        documentacionCompleta = documentacionBasicaCompleta && tieneRequisitoGrupo1;

        // Debug
        console.log(`   - REGLA GRUPO 1 (Basics + Primario): ${documentacionCompleta ? 'CUMPLE' : 'NO CUMPLE'}`);

        // GRUPO 2: Presencial 2do/3er Año (2, 3) O Semipresencial Plan B/C (5, 6)
        // Requisito: Básicos + (Solicitud de Pase O Analítico Parcial O Ambos)
    } else if (
        (modalidadId === 1 && (planAnioId === 2 || planAnioId === 3)) ||
        (modalidadId === 2 && (planAnioId === 5 || planAnioId === 6))
    ) {
        nombreDocumentoRequerido = 'Analítico Parcial o Solicitud de Pase';

        // Cumple si tiene al menos uno de los dos documentos académicos
        const tieneRequisitoGrupo2 = tieneAnaliticoParcial || tieneSolicitudPase;
        documentacionCompleta = documentacionBasicaCompleta && tieneRequisitoGrupo2;

        // Debug
        console.log(`   - REGLA GRUPO 2 (Basics + Pase/Analítico): ${documentacionCompleta ? 'CUMPLE' : 'NO CUMPLE'}`);

    } else {
        // Fallback para casos no especificados
        console.log(`   ⚠️  Combinación Modalidad/Plan no específica (M:${modalidadId}, P:${planAnioId}), aplicando validación básica.`);
        nombreDocumentoRequerido = 'Documentación básica';
        documentacionCompleta = documentacionBasicaCompleta;
        requiereDocumentoAdicional = false;
    }

    console.log(`   - Resultado Final: ${documentacionCompleta ? '✅ LISTO PARA PROCESAR' : '⏳ INCOMPLETO'}`);

    return {
        documentacionCompleta,
        nombreDocumentoRequerido,
        faltantesBasicos,
        documentacionBasicaCompleta,
        requiereDocumentoAdicional,
        tieneAnaliticoParcial,
        tieneSolicitudPase,
        tieneCertificadoPrimario,
        // Helper para saber qué regla aplicó
        reglaAplicada: nombreDocumentoRequerido
    };
};

// Función para generar mensaje de motivoPendiente
const generarMensajePendiente = (resultado, registro) => {
    const { faltantesBasicos, nombreDocumentoRequerido, requiereDocumentoAdicional, tieneAnaliticoParcial, tieneSolicitudPase, tieneCertificadoPrimario } = resultado;

    let documentosFaltantes = [];

    // 1. Mensajes para documentos básicos faltantes
    if (faltantesBasicos.length > 0) {
        const mapeoNombres = {
            'foto': '📷 Foto',
            'archivo_dni': '📄 DNI',
            'archivo_cuil': '📄 CUIL',
            'archivo_partidaNacimiento': '🎂 Partida Nac.',
            'archivo_fichaMedica': '🏥 Ficha Médica'
        };

        faltantesBasicos.forEach(doc => {
            documentosFaltantes.push(mapeoNombres[doc] || doc);
        });
    }

    // 2. Mensajes para documentos adicionales faltantes (Solo si faltan)
    if (requiereDocumentoAdicional) {
        const modalidadId = parseInt(registro.modalidadId || registro.datos.modalidadId);
        const planAnioId = parseInt(registro.planAnioId || registro.datos.planAnio);

        // GRUPO 1: Presencial 1er Año / Semi Plan A
        if ((modalidadId === 1 && planAnioId === 1) || (modalidadId === 2 && planAnioId === 4)) {
            if (!tieneCertificadoPrimario) {
                documentosFaltantes.push('🎓 Certificado Nivel Primario');
            }
        }
        // GRUPO 2: Presencial 2do/3er Año / Semi Plan B/C
        else if (
            (modalidadId === 1 && (planAnioId === 2 || planAnioId === 3)) ||
            (modalidadId === 2 && (planAnioId === 5 || planAnioId === 6))
        ) {
            // Solo avisar si faltan AMBOS
            if (!tieneAnaliticoParcial && !tieneSolicitudPase) {
                documentosFaltantes.push('🎓 Analítico Parcial o Solicitud de Pase');
            }
        }
    }

    const esGrupo2 = (modalidadId === 1 && (planAnioId === 2 || planAnioId === 3)) || (modalidadId === 2 && (planAnioId === 5 || planAnioId === 6));
    const esGrupo1 = (modalidadId === 1 && planAnioId === 1) || (modalidadId === 2 && planAnioId === 4);

    const requiereAdicional = esGrupo1 || esGrupo2;
    const totalCalc = 5 + (requiereAdicional ? 1 : 0);

    // Cantidad actual = (Básicos que SI tiene) + (Adicionales que SI tiene)
    const basicosPresentes = 5 - faltantesBasicos.length;

    let adicionalesPresentes = 0;
    if (requiereAdicional) {
        if (esGrupo1 && tieneCertificadoPrimario) adicionalesPresentes = 1;
        if (esGrupo2 && (tieneAnaliticoParcial || tieneSolicitudPase)) adicionalesPresentes = 1;
    }

    const countActual = basicosPresentes + adicionalesPresentes;

    // Mensaje final
    return `⚠️ Faltan documentos (${countActual}/${totalCalc}): ${documentosFaltantes.join(' + ')}`;
};

module.exports = {
    validarDocumentacion,
    generarMensajePendiente
};