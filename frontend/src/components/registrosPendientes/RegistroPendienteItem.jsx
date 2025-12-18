import { useMemo } from 'react';
import PropTypes from 'prop-types';
import SeccionDocumentos from './SeccionDocumentos';
import AccionesRegistro from './AccionesRegistro';
import { obtenerDocumentosRequeridos } from '../../utils/registroSinDocumentacion';

const RegistroPendienteItem = ({
    registro,
    index,
    mapeoDocumentos,
    enviandoEmail,
    onCompletar,
    onEliminar,
    onEnviarEmail,
    obtenerInfoVencimiento,
    onReiniciarAlarma
}) => {
    const info = obtenerInfoVencimiento(registro);

    // Debug log solo una vez por componente
    // if (estaRegistrado) {
    //     console.log('🏷️ Badge visible para:', registro.datos?.nombre, registro.datos?.apellido, 'DNI:', registro.datos?.dni);
    // }

    // Memoizar el estado de documentación para evitar cálculos innecesarios
    const estadoDoc = useMemo(() => {
        const esProcesado = registro.estado === 'PROCESADO';

        // Si el registro tiene documentación de BD Y está procesado, usar esa
        if (esProcesado && registro.estudianteEnBD && registro.documentacionBD && registro.documentacionBD.length > 0) {
            console.log('📊 [RegistroPendienteItem] Usando documentación de BD para registro procesado:', registro.dni);

            const documentosEntregados = registro.documentacionBD.filter(
                doc => doc.estadoDocumentacion === 'Entregado'
            );

            const documentosFaltantes = registro.documentacionBD.filter(
                doc => doc.estadoDocumentacion === 'Faltante'
            );

            return {
                subidos: documentosEntregados.map(doc => doc.descripcionDocumentacion),
                faltantes: documentosFaltantes.map(doc => doc.descripcionDocumentacion),
                totalSubidos: documentosEntregados.length,
                totalRequeridos: registro.documentacionBD.length,
                porcentajeCompletado: Math.round((documentosEntregados.length / registro.documentacionBD.length) * 100),
                desdeBD: true
            };
        }

        // Lógica original para registros pendientes normales
        const modalidad = registro.datos?.modalidad || registro.modalidad || '';
        const planAnio = registro.datos?.planAnio || registro.planAnio || '';

        // Extraer modulos del campo directo o del array idModulo
        let modulos = registro.datos?.modulos || registro.modulos || '';

        // Siempre intentar extraer módulos del array idModulo primero
        if (registro.datos?.idModulo && Array.isArray(registro.datos.idModulo)) {
            const modulosValidos = registro.datos.idModulo.filter(id => id && id !== '' && id !== null);
            if (modulosValidos.length > 0) {
                modulos = modulosValidos.join(',');
                console.log('📋 [ITEM] Módulos del registro:', {
                    modulos,
                    idModulo: modulosValidos,
                    dni: registro.dni
                });
            } else {
                console.warn('⚠️ [ITEM] No se encontraron módulos válidos en idModulo para DNI:', registro.dni);
            }
        } else if (!modulos || modulos === '') {
            console.warn('⚠️ [ITEM] Registro sin módulos especificados para DNI:', registro.dni);
        }

        // Log de contexto (datos académicos usados para calcular qué documentos se requieren)
        console.log('[DEBUG] Datos académicos para cálculo de documentos:', {
            modalidad,
            planAnio,
            modulos: modulos || '❌ SIN MÓDULOS',
            idModulo: registro.datos?.idModulo || [],
            dni: registro.dni
        });
        const requerimientos = obtenerDocumentosRequeridos(modalidad, planAnio, modulos);
        const documentosRequeridosDinamicos = requerimientos.documentos || [];
        const documentosAlternativos = requerimientos.alternativos;

        // Log que muestra los documentos requeridos efectivamente calculados y los archivos existentes
        console.log('📋 [DEBUG] Documentos requeridos calculados:', {
            documentos: documentosRequeridosDinamicos,
            alternativos: documentosAlternativos,
            archivosExistentes: registro.archivos ? Object.keys(registro.archivos) : []
        });

        let documentosSubidos = [];

        if (Array.isArray(registro.documentosSubidos)) {
            documentosSubidos = registro.documentosSubidos;
        } else if (registro.archivos && typeof registro.archivos === 'object') {
            documentosSubidos = Object.keys(registro.archivos).filter(key =>
                registro.archivos[key] && registro.archivos[key] !== null && registro.archivos[key] !== ''
            );
        } else {
            // No documentos subidos encontrados
        }

        let documentosFaltantes = [];
        let documentosValidosSubidos = [];

        if (documentosAlternativos) {
            const tienePreferido = documentosSubidos.includes(documentosAlternativos.preferido);
            const tieneAlternativa = documentosSubidos.includes(documentosAlternativos.alternativa);

            if (tienePreferido || tieneAlternativa) {
                documentosValidosSubidos = documentosSubidos;
                documentosFaltantes = documentosRequeridosDinamicos.filter(doc =>
                    doc !== documentosAlternativos.preferido &&
                    doc !== documentosAlternativos.alternativa &&
                    !documentosSubidos.includes(doc)
                );
            } else {
                documentosValidosSubidos = documentosSubidos.filter(doc =>
                    doc !== documentosAlternativos.preferido &&
                    doc !== documentosAlternativos.alternativa
                );
                documentosFaltantes = documentosRequeridosDinamicos.filter(doc => !documentosSubidos.includes(doc));
            }
        } else {
            documentosValidosSubidos = documentosSubidos.filter(doc => documentosRequeridosDinamicos.includes(doc));
            documentosFaltantes = documentosRequeridosDinamicos.filter(doc => !documentosSubidos.includes(doc));
        }

        const documentosBasicos = ['foto', 'archivo_dni', 'archivo_cuil', 'archivo_partidaNacimiento', 'archivo_fichaMedica'];
        const basicoCount = 5;
        const faltantesBasicos = documentosBasicos.filter(doc => !documentosSubidos.includes(doc));

        // Determinar si requiere adicional basado en modalidad/plan
        const modId = parseInt(registro.modalidadId || (modalidad === 'Presencial' ? 1 : modalidad === 'Semipresencial' ? 2 : 0));
        const planId = parseInt(registro.planAnioId || planAnio);

        const esGrupo1 = (modId === 1 && planId === 1) || (modId === 2 && planId === 4);
        const esGrupo2 = (modId === 1 && (planId === 2 || planId === 3)) || (modId === 2 && (planId === 5 || planId === 6));
        const requiereAdicional = esGrupo1 || esGrupo2;
        const totalRequeridos = basicoCount + (requiereAdicional ? 1 : 0);

        // Re-calcular documentos subidos válidos para el conteo
        const docsValidos = documentosSubidos.filter(d =>
            ['foto', 'archivo_dni', 'archivo_cuil', 'archivo_partidaNacimiento', 'archivo_fichaMedica'].includes(d) ||
            (esGrupo1 && d === 'archivo_certificadoNivelPrimario') ||
            (esGrupo2 && (d === 'archivo_analiticoParcial' || d === 'archivo_solicitudPase'))
        );

        // Conteo preciso de lo subido (6/6 si tiene al menos uno de los adicionales)
        let totalSubidos = documentosSubidos.filter(d => ['foto', 'archivo_dni', 'archivo_cuil', 'archivo_partidaNacimiento', 'archivo_fichaMedica'].includes(d)).length;
        if (esGrupo1 && documentosSubidos.includes('archivo_certificadoNivelPrimario')) totalSubidos += 1;
        if (esGrupo2 && (documentosSubidos.includes('archivo_analiticoParcial') || documentosSubidos.includes('archivo_solicitudPase'))) totalSubidos += 1;

        // Log final del estado documental calculado para este registro
        console.log('📎 [DEBUG] Conteo sincronizado con backend:', {
            dni: registro.dni,
            totalSubidos,
            totalRequeridos,
            requiereAdicional
        });

        return {
            subidos: documentosValidosSubidos,
            faltantes: documentosFaltantes,
            totalSubidos: totalSubidos,
            totalRequeridos: totalRequeridos,
            modalidad: modalidad,
            plan: planAnio || modulos,
            documentosAlternativos: documentosAlternativos,
            porcentajeCompletado: Math.round((totalSubidos / totalRequeridos) * 100),
            desdeBD: false
        };
    }, [registro.datos, registro.modalidad, registro.planAnio, registro.modulos, registro.documentosSubidos, registro.archivos, registro.estudianteEnBD, registro.documentacionBD, registro.dni]);


    // Detectar si es un registro procesado basándose en el estado explícito
    // Mantenemos la lógica de negocio: solo si estado es 'PROCESADO' se muestra el badge
    const esProcesado = registro.estado === 'PROCESADO';
    const mostrarBadgeCompleta = esProcesado;

    // Si está en BD pero pendiente, podríamos mostrar un indicador diferente en el futuro
    const enBaseDeDatos = registro.estudianteEnBD === true;

    return (
        <div
            key={registro.id || index}
            className={`registro-item ${esProcesado ? 'registro-procesado' : (info.vencido ? 'registro-vencido' : 'registro-vigente')}`}
            style={{ borderLeftColor: 'var(--color-btn-main)' }}
        >
            <div className="registro-grid">
                {/* Información principal del registro */}
                <div className="registro-info-principal">
                    <div className="registro-info-estudiante">
                        <h4>
                            {registro.datos?.nombre || registro.nombre} {registro.datos?.apellido || registro.apellido}
                            {esProcesado && (
                                <span className="badge-unificado" style={{ marginLeft: '10px' }}>
                                    ✅ Registro Procesado y Completa
                                </span>
                            )}
                            {!esProcesado && mostrarBadgeCompleta && (
                                <span className="badge-unificado" style={{ marginLeft: '10px' }}>
                                    ✅ Registro Procesado y Completa
                                </span>
                            )}
                        </h4>
                        <p><strong>📄 DNI:</strong> {registro.datos?.dni || registro.dni}</p>
                        <p>
                            <strong>📧 Email:</strong> {
                                (registro.datos?.email || registro.email) ||
                                <span style={{ color: 'var(--color-mid)', fontStyle: 'italic' }}>Sin email</span>
                            }
                        </p>
                        <p>
                            <strong>📚 Modalidad:</strong> {registro.datos?.modalidad || registro.modalidad}
                        </p>
                        <p>
                            <strong>📎 Documentos:</strong> {estadoDoc.totalSubidos}/{estadoDoc.totalRequeridos}
                        </p>
                    </div>
                    {/* Información de la derecha */}
                    <div className="registro-info-derecha">
                        {/* Mostrar alarma/vencimiento solo si NO está registrado NI procesado */}
                        {!mostrarBadgeCompleta && !esProcesado && (
                            <>
                                <div className="registro-vencimiento">
                                    {info.vencido ? `🔴 ${info.mensaje}` : `🕒 ${info.mensaje}`}
                                </div>
                                {!info.vencido && (
                                    <div className="registro-fecha-limite">
                                        Vence: {info.fechaVencimiento}
                                    </div>
                                )}
                                {registro.modalidad && (
                                    <div className="registro-modalidad">
                                        📚 {registro.modalidad}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Sección de documentos */}
                <SeccionDocumentos estadoDoc={estadoDoc} mapeoDocumentos={mapeoDocumentos} />

                {/* Información sobre documentos alternativos */}
                {estadoDoc.documentosAlternativos && estadoDoc.faltantes.length === 0 && (
                    <div className="info-documento-usado">
                        {estadoDoc.subidos.includes(estadoDoc.documentosAlternativos.preferido) ?
                            `✨ Presenta documento preferido: ${mapeoDocumentos[estadoDoc.documentosAlternativos.preferido] || estadoDoc.documentosAlternativos.preferido}` :
                            estadoDoc.documentosAlternativos.alternativa && mapeoDocumentos[estadoDoc.documentosAlternativos.alternativa] ?
                                `📝 Presenta alternativa: ${mapeoDocumentos[estadoDoc.documentosAlternativos.alternativa]}` :
                                null
                        }
                    </div>
                )}

                {/* Acciones del registro */}
                <AccionesRegistro
                    registro={registro}
                    info={{ ...info, esProcesado }}
                    enviandoEmail={enviandoEmail}
                    onCompletar={onCompletar}
                    onEliminar={onEliminar}
                    onEnviarEmail={onEnviarEmail}
                    onReiniciarAlarma={onReiniciarAlarma}
                />
            </div>
        </div>
    );
};

RegistroPendienteItem.propTypes = {
    registro: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    mapeoDocumentos: PropTypes.object.isRequired,
    enviandoEmail: PropTypes.bool.isRequired,
    onCompletar: PropTypes.func.isRequired,
    onEliminar: PropTypes.func.isRequired,
    onEnviarEmail: PropTypes.func.isRequired,
    obtenerInfoVencimiento: PropTypes.func.isRequired,
    onReiniciarAlarma: PropTypes.func.isRequired
};

export default RegistroPendienteItem;