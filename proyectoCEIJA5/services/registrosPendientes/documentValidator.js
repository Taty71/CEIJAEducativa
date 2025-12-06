// Validador de documentación para registros pendientes

// Función principal de validación de documentación
const validarDocumentacion = (modalidadId, planAnioId, archivosDisponibles) => {
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
            nombreDocumentoRequerido = 'Analítico Parcial o Solicitud de Pase';
            documentacionCompleta = documentacionBasicaCompleta && (tieneAnaliticoParcial || tieneSolicitudPase);
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
        nombreDocumentoRequerido = 'Documentación básica';
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
        requiereDocumentoAdicional,
        tieneAnaliticoParcial,
        tieneSolicitudPase,
        tieneCertificadoPrimario
    };
};

// Función para generar mensaje de motivoPendiente
const generarMensajePendiente = (resultado, registro) => {
    const { faltantesBasicos, nombreDocumentoRequerido, requiereDocumentoAdicional, tieneAnaliticoParcial, tieneSolicitudPase, tieneCertificadoPrimario } = resultado;
    
    let documentosFaltantes = [];
    
    // Documentos básicos faltantes
    if (faltantesBasicos.length > 0) {
        const mapeoNombres = {
            'foto': '📷 Foto',
            'archivo_dni': '📄 DNI',
            'archivo_cuil': '📄 CUIL',
            'archivo_partidaNacimiento': '🎂 Partida de Nacimiento',
            'archivo_fichaMedica': '🏥 Ficha Médica CUS'
        };
        
        faltantesBasicos.forEach(doc => {
            documentosFaltantes.push(mapeoNombres[doc] || doc);
        });
    }
    
    // Documento adicional faltante
    if (requiereDocumentoAdicional) {
        const modalidadId = parseInt(registro.modalidadId || registro.datos.modalidadId);
        const planAnioId = parseInt(registro.planAnioId || registro.datos.planAnio);
        
        if (modalidadId === 1) { // PRESENCIAL
            if (planAnioId === 1 && !tieneCertificadoPrimario && !tieneSolicitudPase) {
                documentosFaltantes.push('📊 Certificado de Nivel Primario (o alternativamente: 📝 Solicitud de Pase)');
            } else if ((planAnioId === 2 || planAnioId === 3) && !tieneAnaliticoParcial && !tieneSolicitudPase) {
                documentosFaltantes.push('📊 Analítico Parcial (o alternativamente: 📝 Solicitud de Pase)');
            }
        } else if (modalidadId === 2) { // SEMIPRESENCIAL
            if (planAnioId === 4 && !tieneCertificadoPrimario) {
                documentosFaltantes.push('📊 Certificado de Nivel Primario');
            } else if ((planAnioId === 5 || planAnioId === 6) && !tieneAnaliticoParcial && !tieneSolicitudPase) {
                documentosFaltantes.push('📊 Analítico Parcial (o alternativamente: 📝 Solicitud de Pase)');
            }
        }
    }
    
    const totalDocumentos = 5 + (requiereDocumentoAdicional ? 1 : 0);
    const documentosCompletos = totalDocumentos - documentosFaltantes.length;
    
    return `⚠️ Documentación incompleta (${documentosCompletos}/${totalDocumentos}) para ${nombreDocumentoRequerido} - Registro quedará PENDIENTE. Faltan: ${documentosFaltantes.join(', ')}`;
};

module.exports = {
    validarDocumentacion,
    generarMensajePendiente
};