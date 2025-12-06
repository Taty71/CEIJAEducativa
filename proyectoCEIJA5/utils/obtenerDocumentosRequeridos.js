// Utilidad compartida para backend y frontend
// Solo la función obtenerDocumentosRequeridos

function obtenerDocumentosRequeridos(modalidad, planAnio, modulos) {
    const documentosBase = [
        "foto",
        "archivo_dni",
        "archivo_cuil",
        "archivo_fichaMedica",
        "archivo_partidaNacimiento"
    ];
    let documentosAdicionales = [];
    let documentosAlternativos = null;
    if (modalidad === 'Presencial') {
        if (planAnio === '1') {
            documentosAdicionales = ["archivo_certificadoNivelPrimario", "archivo_solicitudPase"];
        } else if (planAnio === '2' || planAnio === '3' || (planAnio && planAnio !== '1')) {
            documentosAlternativos = {
                grupo: "analitico_o_pase",
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase",
                descripcion: "Analítico Parcial (preferido) O Solicitud de Pase (si no presenta analítico)"
            };
        }
    } else if (modalidad === 'Semipresencial') {
        if (planAnio === '4') {
            documentosAlternativos = {
                grupo: "certificado_o_pase_planA",
                preferido: "archivo_certificadoNivelPrimario",
                alternativa: "archivo_solicitudPase",
                descripcion: "Certificado de Nivel Primario (definitivo) O Solicitud de Pase (temporal - luego deberá presentar Analítico Parcial)"
            };
        } else if (planAnio === '5' || planAnio === '6') {
            documentosAlternativos = {
                grupo: planAnio === '5' ? "analitico_o_pase_planB" : "analitico_o_pase_planC",
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase",
                descripcion: "Analítico Parcial (obligatorio) O Solicitud de Pase (si no presenta analítico, luego deberá completar con analítico)"
            };
        } else {
            documentosAlternativos = {
                grupo: "analitico_o_pase",
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase",
                descripcion: "Analítico Parcial (preferido) O Solicitud de Pase (si no presenta analítico)"
            };
        }
    }
    if (documentosAdicionales.length === 0 && !documentosAlternativos) {
        documentosAlternativos = {
            grupo: "analitico_o_pase",
            preferido: "archivo_analiticoParcial",
            alternativa: "archivo_solicitudPase",
            descripcion: "Analítico Parcial (preferido) O Solicitud de Pase (alternativa)"
        };
    }
    const documentosRequeridos = [...documentosBase, ...documentosAdicionales];
    if (documentosAlternativos) {
        documentosRequeridos.push(documentosAlternativos.preferido);
    }
    return { documentos: documentosRequeridos, alternativos: documentosAlternativos };
}

module.exports = { obtenerDocumentosRequeridos };