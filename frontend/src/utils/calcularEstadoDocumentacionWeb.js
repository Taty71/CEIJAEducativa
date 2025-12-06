/**
 * Función para calcular el estado de documentación en tiempo real para registros web
 * Esta función se usa en el frontend para mostrar el conteo correcto
 */

export const calcularEstadoDocumentacionWeb = (registro) => {
    if (!registro || !registro.datos) return { mensaje: 'Registro inválido', cantidadSubidos: 0, totalDocumentos: 6 };

    const { modalidad, planAnio } = registro.datos;
    const archivos = registro.archivos || {};

    // Documentos base siempre requeridos
    const documentosBase = [
        "foto",
        "archivo_dni", 
        "archivo_cuil",
        "archivo_fichaMedica",
        "archivo_partidaNacimiento"
    ];

    // Documentos según modalidad
    let documentosRequeridos = [...documentosBase];
    let alternativas = null;

    if (modalidad === 'Presencial') {
        if (planAnio === '1') {
            // 1er año: Certificado primario + Solicitud de pase (ambos obligatorios)
            documentosRequeridos.push("archivo_certificadoNivelPrimario", "archivo_solicitudPase");
        } else {
            // 2do, 3er año: Analítico Parcial (preferido) O Solicitud de Pase (alternativa)
            documentosRequeridos.push("archivo_analiticoParcial"); // Mostraremos el preferido
            alternativas = {
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase"
            };
        }
    } else if (modalidad === 'Semipresencial') {
        if (planAnio === '4') {
            // Plan A: Certificado Primario (preferido) O Solicitud de Pase (alternativa)
            documentosRequeridos.push("archivo_certificadoNivelPrimario");
            alternativas = {
                preferido: "archivo_certificadoNivelPrimario",
                alternativa: "archivo_solicitudPase"
            };
        } else {
            // Plan B y C: Analítico Parcial (preferido) O Solicitud de Pase (alternativa)
            documentosRequeridos.push("archivo_analiticoParcial");
            alternativas = {
                preferido: "archivo_analiticoParcial", 
                alternativa: "archivo_solicitudPase"
            };
        }
    }

    // Contar documentos subidos
    let documentosSubidos = 0;
    let documentosFaltantes = [];

    for (const doc of documentosRequeridos) {
        if (archivos[doc]) {
            documentosSubidos++;
        } else {
            // Si es un documento alternativo, verificar si tiene la alternativa
            if (alternativas && doc === alternativas.preferido && archivos[alternativas.alternativa]) {
                documentosSubidos++; // Cuenta la alternativa
            } else {
                documentosFaltantes.push(doc);
            }
        }
    }

    const totalDocumentos = documentosRequeridos.length;
    const esCompleto = documentosSubidos === totalDocumentos;

    // Nombres legibles
    const nombresLegibles = {
        "foto": "📷 Foto",
        "archivo_dni": "📄 DNI",
        "archivo_cuil": "📄 CUIL",
        "archivo_fichaMedica": "🏥 Ficha Médica",
        "archivo_partidaNacimiento": "📜 Partida de Nacimiento",
        "archivo_solicitudPase": "📝 Solicitud de Pase",
        "archivo_analiticoParcial": "📊 Analítico Parcial",
        "archivo_certificadoNivelPrimario": "🎓 Certificado Primario"
    };

    let mensaje;
    if (esCompleto) {
        mensaje = `✅ Documentación completa (${documentosSubidos}/${totalDocumentos}) para ${modalidad}`;
    } else {
        const faltantesTexto = documentosFaltantes
            .map(doc => {
                if (alternativas && doc === alternativas.preferido) {
                    return `${nombresLegibles[doc]} (o ${nombresLegibles[alternativas.alternativa]})`;
                }
                return nombresLegibles[doc] || doc;
            })
            .join(', ');
        mensaje = `⚠️ Documentación incompleta (${documentosSubidos}/${totalDocumentos}) para ${modalidad}. Faltan: ${faltantesTexto}`;
    }

    return {
        esCompleto,
        cantidadSubidos: documentosSubidos,
        totalDocumentos,
        mensaje,
        documentosFaltantes,
        archivosEncontrados: Object.keys(archivos).filter(key => archivos[key])
    };
};

// Test con los datos reales
const testNarella = {
    datos: {
        modalidad: "Presencial",
        planAnio: "3"
    },
    archivos: {
        "foto": "/archivosDocWeb/Narella_Caliva_45785412_foto.png",
        "archivo_dni": "/archivosDocWeb/Narella_Caliva_45785412_archivo_dni.pdf",
        "archivo_cuil": "/archivosDocWeb/Narella_Caliva_45785412_archivo_cuil.pdf",
        "archivo_fichaMedica": "/archivosDocWeb/Narella_Caliva_45785412_archivo_fichaMedica.pdf",
        "archivo_solicitudPase": "/archivosDocWeb/Narella_Caliva_45785412_archivo_solicitudPase.pdf"
    }
};



console.log('=== TEST NARELLA (Presencial 3° año) ===');
console.log(calcularEstadoDocumentacionWeb(testNarella));

