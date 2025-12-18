/**
 * Utilidades para manejo de registros sin documentación
 * Sistema de 7 días - Los registros se eliminan automáticamente después de 1 semana
 */

// Inicializar limpieza automática al cargar el módulo
let sistemaInicializado = false;

export const inicializarSistemaLimpieza = () => {
    if (!sistemaInicializado) {
        programarLimpiezaAutomatica();
        limpiarRegistrosVencidos(); // Limpieza inicial
        sistemaInicializado = true;
        console.log('🚀 Sistema de registros sin documentación inicializado (7 días)');

        // 🧪 Ejecutar test automático al inicializar (solo en desarrollo)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            setTimeout(() => {
                console.log('🧪 Ejecutando test automático del sistema de 7 días...');
                testearSistema7Dias();
            }, 1000);
        }
    }
};

// Función para obtener documentos requeridos según modalidad y plan - CON LÓGICA DE DOCUMENTOS ALTERNATIVOS
export const obtenerDocumentosRequeridos = (modalidad, planAnio, modulos) => {
    // Protección: no calcular si modalidad o planAnio están vacíos
    if (!modalidad || !planAnio) {
        console.warn(`⚠️ [VALIDACIÓN] No se puede obtener documentos requeridos: modalidad o planAnio vacío`, { modalidad, planAnio, modulos });
        return { documentos: [], alternativos: null, criterio: '' };
    }

    // Documentos base SIEMPRE requeridos
    const documentosBase = [
        "foto", // 📷 Foto 4x4  
        "archivo_dni", // 📄 DNI
        "archivo_cuil", // 📄 CUIL
        "archivo_fichaMedica", // 🏥 Ficha Médica CUS
        "archivo_partidaNacimiento" // 📜 Partida de Nacimiento
    ];

    let documentosAdicionales = [];
    let documentosAlternativos = null; // Para casos especiales con opciones

    // Documentos adicionales según modalidad y plan
    // Documentos adicionales según modalidad y plan
    // Normalizar entradas para asegurar coincidencia (usar strings para evitar problemas de tipo)
    const modString = String(modalidad || '');
    const planString = String(planAnio || '');
    const modulosString = String(modulos || '');

    if (modString === 'Presencial' || modString === '1') {
        if (planString === '1' || planString === '1er Año') {
            // 1er Año: Certificado Primario ÚNICAMENTE (además de básicos)
            documentosAdicionales = ["archivo_certificadoNivelPrimario"];
        } else if (planString === '2' || planString === '3' || planString === '2do Año' || planString === '3er Año') {
            // 2do/3er Año: ANALÍTICO PARCIAL (definitivo) o SOLICITUD DE PASE (temporal)
            documentosAdicionales = [];
            documentosAlternativos = {
                grupo: "analitico_o_pase",
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase",
                descripcion: "Analítico Parcial (definitivo) O Solicitud de Pase (temporal - luego deberá presentar analítico)"
            };
        }
    } else if (modString === 'Semipresencial' || modString === '2') {
        if (planString === '4' || planString === 'Plan A') {
            // Plan A: Certificado Primario ÚNICAMENTE (además de básicos)
            documentosAdicionales = ["archivo_certificadoNivelPrimario"];
        } else if (planString === '5' || planString === '6' || planString === 'Plan B' || planString === 'Plan C') {
            // Plan B/C: ANALÍTICO PARCIAL (definitivo) o SOLICITUD DE PASE (temporal)
            documentosAdicionales = [];
            documentosAlternativos = {
                grupo: "analitico_o_pase",
                preferido: "archivo_analiticoParcial",
                alternativa: "archivo_solicitudPase",
                descripcion: "Analítico Parcial (definitivo) O Solicitud de Pase (temporal - luego deberá presentar analítico)"
            };
        }
    }

    // Construir lista de documentos requeridos
    const documentosRequeridos = [...documentosBase, ...documentosAdicionales];

    // Agregar documento alternativo (se requiere UNO de los dos)
    if (documentosAlternativos) {
        documentosRequeridos.push(documentosAlternativos.preferido);
    }

    // Logging mejorado con información del criterio usado
    let criterioInfo = '';
    if (modString === 'Presencial' || modString === '1') {
        if (planString === '1' || planString === '1er Año') criterioInfo = '1er Año: Solo Título primario (NO Pase ni Analítico)';
        else criterioInfo = `${planString}: Documentos base + (Analítico Parcial O Solicitud de Pase)`;
    } else if (modString === 'Semipresencial' || modString === '2') {
        if (planString === '4' || planString === 'Plan A') {
            criterioInfo = 'Plan A: Base + Certificado Primario (NO Pase ni Analítico)';
        } else if (planString === '5' || planString === 'Plan B' || planString === '6' || planString === 'Plan C') {
            criterioInfo = `Plan ${planString}: Base + Analítico Parcial O Solicitud de Pase`;
        }
    }

    // Logs comentados para evitar spam - solo activar para debugging
    // console.log(`📋 [VALIDACIÓN] ${modalidad} - ${criterioInfo}`);
    // console.log(`📋 [VALIDACIÓN] Documentos requeridos (${documentosRequeridos.length}):`, documentosRequeridos);
    // if (documentosAlternativos) {
    //     console.log(`🔄 [ALTERNATIVAS] ${documentosAlternativos.descripcion}`);
    // }

    return {
        documentos: documentosRequeridos,
        alternativos: documentosAlternativos,
        criterio: criterioInfo
    };
};

// Función para obtener información sobre el estado de documentación - CON LÓGICA DE DOCUMENTOS ALTERNATIVOS
export const obtenerEstadoDocumentacion = (files = {}, previews = {}, modalidad = '', planAnio = '', modulos = '') => {
    // Obtener documentos requeridos según modalidad y plan específicos
    const requerimientos = obtenerDocumentosRequeridos(modalidad, planAnio, modulos);
    const documentosRequeridos = requerimientos.documentos;
    const documentosAlternativos = requerimientos.alternativos;

    // Mapeo de nombres técnicos a legibles
    const nombresLegibles = {
        "foto": "📷 Foto 4x4",
        "archivo_dni": "📄 DNI",
        "archivo_cuil": "📄 CUIL",
        "archivo_fichaMedica": "🏥 Ficha Médica CUS",
        "archivo_partidaNacimiento": "📜 Partida de Nacimiento",
        "archivo_solicitudPase": "📝 Solicitud de Pase",
        "archivo_analiticoParcial": "📊 Analítico Parcial",
        "archivo_certificadoNivelPrimario": "🎓 Certificado Nivel Primario"
    };

    // Documentos base siempre son 5: foto, dni, cuil, ficha médica, partida nacimiento
    const documentosBaseCantidad = 5;

    // Función auxiliar para verificar si un documento está presente
    const documentoPresente = (doc) => files[doc] || previews[doc]?.url;

    // Verificar documentos subidos
    let documentosSubidos = [];
    let documentosFaltantes = [];
    let validacionAlternativaOK = true; // Para casos con documentos alternativos

    // Validar documentos uno por uno
    for (const doc of documentosRequeridos) {
        // Si este documento es parte de un grupo alternativo
        if (documentosAlternativos &&
            (doc === documentosAlternativos.preferido || doc === documentosAlternativos.alternativa)) {

            const tienePreferido = documentoPresente(documentosAlternativos.preferido);
            const tieneAlternativa = documentoPresente(documentosAlternativos.alternativa);

            if (tienePreferido) {
                // Tiene el documento preferido (analítico parcial)
                documentosSubidos.push(documentosAlternativos.preferido);
                console.log(`✅ [ALTERNATIVA] Documento preferido encontrado: ${nombresLegibles[documentosAlternativos.preferido]}`);
            } else if (tieneAlternativa) {
                // Tiene la alternativa (solicitud de pase)
                documentosSubidos.push(documentosAlternativos.alternativa);
                console.log(`⚠️ [ALTERNATIVA] Usando documento alternativo TEMPORAL: ${nombresLegibles[documentosAlternativos.alternativa]} - Deberá completar con 📊 Analítico Parcial posteriormente`);
            } else {
                // No tiene ninguno de los dos
                documentosFaltantes.push(documentosAlternativos.preferido); // Mostrar el preferido como faltante
                validacionAlternativaOK = false;
                console.log(`❌ [ALTERNATIVA] Falta documento: ${documentosAlternativos.descripcion}`);
            }

            // Solo procesar una vez el grupo alternativo
            continue;
        }

        // Documento regular (no alternativo)
        if (documentoPresente(doc)) {
            documentosSubidos.push(doc);
        } else {
            documentosFaltantes.push(doc);
        }
    }

    // Eliminar duplicados de documentos alternativos procesados
    if (documentosAlternativos) {
        // Filtrar para evitar duplicados en subidos
        documentosSubidos = documentosSubidos.filter((doc, index, array) =>
            array.indexOf(doc) === index
        );

        // Si ya procesamos el grupo alternativo, remover el otro documento de faltantes
        if (documentosSubidos.includes(documentosAlternativos.preferido)) {
            documentosFaltantes = documentosFaltantes.filter(doc =>
                doc !== documentosAlternativos.alternativa
            );
        } else if (documentosSubidos.includes(documentosAlternativos.alternativa)) {
            documentosFaltantes = documentosFaltantes.filter(doc =>
                doc !== documentosAlternativos.preferido
            );
        }
    }

    const cantidadSubidos = documentosSubidos.length;
    // Para documentos alternativos: base + 1 alternativo = 6 total
    // Para documentos obligatorios: base + documentos adicionales
    const totalDocumentos = documentosBaseCantidad + (documentosAlternativos ? 1 : (documentosRequeridos.length - documentosBaseCantidad));

    // Para estar COMPLETO necesita todos los documentos REQUERIDOS para su modalidad/plan
    // Y si hay documentos alternativos, debe cumplir esa validación también
    const esCompleto = (cantidadSubidos === totalDocumentos) && validacionAlternativaOK;

    // Generar mensaje detallado
    let mensaje, tipo;

    if (cantidadSubidos === 0) {
        tipo = 'SIN_DOCUMENTACION';
        mensaje = `⚠️ Sin documentación - Registro quedará PENDIENTE hasta completar archivos requeridos para ${modalidad}.`;
    } else if (!esCompleto) {
        tipo = 'DOCUMENTACION_INCOMPLETA';
        const faltantesTexto = documentosFaltantes
            .map(doc => {
                // Mostrar información especial para documentos alternativos
                if (documentosAlternativos && doc === documentosAlternativos.preferido) {
                    return `${nombresLegibles[doc]} (o alternativamente: ${nombresLegibles[documentosAlternativos.alternativa]})`;
                }
                return nombresLegibles[doc] || doc;
            })
            .join(', ');
        mensaje = `⚠️ Documentación incompleta (${cantidadSubidos}/${totalDocumentos}) para ${modalidad} - Registro quedará PENDIENTE. Faltan: ${faltantesTexto}`;
    } else {
        tipo = 'DOCUMENTACION_COMPLETA';
        // Mensaje especial para alternativas temporales (cualquier plan con Solicitud de Pase)
        if (documentosAlternativos && documentosSubidos.includes(documentosAlternativos.alternativa) &&
            !documentosSubidos.includes(documentosAlternativos.preferido) &&
            documentosAlternativos.alternativa === 'archivo_solicitudPase') {
            mensaje = `✅ Documentación completa para ${modalidad} - Registro será marcado como PROCESADO. ⚠️ NOTA: Deberá presentar Analítico Parcial posteriormente.`;
        } else {
            mensaje = `✅ Documentación completa para ${modalidad} - Registro será marcado como PROCESADO.`;
        }
    }

    return {
        completo: esCompleto,
        tipo,
        mensaje,
        cantidadSubidos,
        totalDocumentos,
        documentosRequeridos: documentosRequeridos,
        documentosSubidos,
        documentosFaltantes,
        nombresDocumentosFaltantes: documentosFaltantes.map(doc => {
            if (documentosAlternativos && doc === documentosAlternativos.preferido) {
                return `${nombresLegibles[doc]} (o alternativamente: ${nombresLegibles[documentosAlternativos.alternativa]})`;
            }
            return nombresLegibles[doc] || doc;
        }),
        modalidad,
        planAnio: planAnio || modulos,
        documentosAlternativos: documentosAlternativos
    };
};

// Función para generar mensaje de notificación sobre documentos faltantes
export const generarMensajeNotificacion = (estadoDocumentacion, datosEstudiante) => {
    const { nombre = '', apellido = '', dni = '', email = '' } = datosEstudiante;
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    if (estadoDocumentacion.completo) {
        return {
            necesitaNotificacion: false,
            tipoNotificacion: 'completo',
            mensaje: `✅ Registro completo para ${nombreCompleto} (DNI: ${dni}) - Documentación procesada exitosamente.`
        };
    }

    const { tipo, cantidadSubidos, totalDocumentos, nombresDocumentosFaltantes } = estadoDocumentacion;

    let mensaje;
    if (tipo === 'SIN_DOCUMENTACION') {
        mensaje = `⚠️ REGISTRO PENDIENTE - ${nombreCompleto} (DNI: ${dni})\n` +
            `Sin documentación adjunta. El registro quedará PENDIENTE hasta completar los archivos requeridos.\n` +
            `📧 Email: ${email || 'No proporcionado'}\n` +
            `📋 Documentos requeridos: ${totalDocumentos}\n` +
            `⏰ El estudiante debe completar la documentación para procesar la inscripción.`;
    } else {
        mensaje = `⚠️ REGISTRO PENDIENTE - ${nombreCompleto} (DNI: ${dni})\n` +
            `Documentación incompleta (${cantidadSubidos}/${totalDocumentos}). El registro quedará PENDIENTE.\n` +
            `📧 Email: ${email || 'No proporcionado'}\n` +
            `📄 Documentos faltantes:\n${nombresDocumentosFaltantes.map(doc => `  • ${doc}`).join('\n')}\n` +
            `⏰ El estudiante debe completar los documentos faltantes para procesar la inscripción.`;
    }

    return {
        necesitaNotificacion: true,
        tipoNotificacion: tipo.toLowerCase(),
        mensaje,
        documentosFaltantes: nombresDocumentosFaltantes,
        cantidadFaltante: totalDocumentos - cantidadSubidos
    };
};

// Función para mostrar notificación en consola y/o enviar alerta
export const procesarNotificacionDocumentacion = (estadoDocumentacion, datosEstudiante, setAlert) => {
    const notificacion = generarMensajeNotificacion(estadoDocumentacion, datosEstudiante);

    // Siempre mostrar en consola para admins
    console.log(`📨 [NOTIFICACIÓN] ${notificacion.mensaje}`);

    if (notificacion.necesitaNotificacion) {
        // Mostrar alerta visual
        if (setAlert) {
            const alertaTexto = estadoDocumentacion.tipo === 'SIN_DOCUMENTACION'
                ? `${estadoDocumentacion.mensaje}\n📨 Se ha generado notificación para seguimiento administrativo.`
                : `${estadoDocumentacion.mensaje}\n📨 Se ha generado notificación para seguimiento administrativo.`;

            setAlert({
                text: alertaTexto,
                variant: 'warning'
            });
        }

        // Log detallado para administradores
        console.log('📊 [DETALLE DOCUMENTACIÓN]:', {
            estudiante: `${datosEstudiante.nombre} ${datosEstudiante.apellido}`,
            dni: datosEstudiante.dni,
            email: datosEstudiante.email,
            documentosSubidos: estadoDocumentacion.cantidadSubidos,
            documentosRequeridos: estadoDocumentacion.totalDocumentos,
            documentosFaltantes: notificacion.documentosFaltantes,
            estadoFinal: 'PENDIENTE'
        });

        return {
            estadoRegistro: 'PENDIENTE',
            requiereNotificacion: true,
            notificacion
        };
    }

    // Documentación completa
    console.log('✅ [DOCUMENTACIÓN COMPLETA]:', {
        estudiante: `${datosEstudiante.nombre} ${datosEstudiante.apellido}`,
        dni: datosEstudiante.dni,
        estadoFinal: 'PROCESADO'
    });

    return {
        estadoRegistro: 'PROCESADO',
        requiereNotificacion: false,
        notificacion
    };
};
export const tieneDocumentosAdjuntados = (files = {}, previews = {}) => {
    const documentos = [
        "foto", "archivo_dni", "archivo_cuil", "archivo_fichaMedica",
        "archivo_partidaNacimiento", "archivo_solicitudPase",
        "archivo_analiticoParcial", "archivo_certificadoNivelPrimario"
    ];

    // Contar documentos adjuntados
    const documentosSubidos = documentos.filter(doc =>
        files[doc] || previews[doc]?.url
    );

    const cantidadSubidos = documentosSubidos.length;
    console.log(`📄 Documentos subidos: ${cantidadSubidos}/${documentos.length}`, documentosSubidos);

    // Requerir al menos 4 documentos para considerarlo "completo"
    // (esto es configurable según los requerimientos del sistema)
    const MINIMO_DOCUMENTOS = 4;

    return cantidadSubidos >= MINIMO_DOCUMENTOS;
};

// Función para guardar datos en archivo JSON local (sin documentación o incompleta)
export const guardarRegistroSinDocumentacion = (datosEstudiante, estadoDocumentacion = null) => {
    try {
        const ahora = new Date();
        const fechaVencimiento = new Date(ahora.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 días (1 semana)

        // Obtener registros existentes del localStorage
        const registrosExistentes = JSON.parse(
            localStorage.getItem('registrosSinDocumentacion') || '[]'
        );

        // Limpiar registros vencidos automáticamente antes de procesar
        const registrosVigentes = limpiarRegistrosVencidos(registrosExistentes);

        // VALIDACIÓN: Verificar si ya existe un registro para este DNI
        const dniEstudiante = datosEstudiante.dni;
        const indiceExistente = registrosVigentes.findIndex(r => r.dni === dniEstudiante);

        if (indiceExistente !== -1) {
            // Ya existe un registro para este DNI - ACTUALIZAR en lugar de crear duplicado
            const registroExistente = registrosVigentes[indiceExistente];

            console.log(`🔄 Actualizando registro existente para DNI ${dniEstudiante}:`, {
                anterior: {
                    tipo: registroExistente.tipoRegistro,
                    documentos: `${registroExistente.cantidadDocumentosSubidos || 0}/8`,
                    fechaOriginal: new Date(registroExistente.fechaRegistroSinDocumentacion).toLocaleString()
                },
                nuevo: {
                    tipo: estadoDocumentacion?.tipo || 'SIN_DOCUMENTACION',
                    documentos: `${estadoDocumentacion?.cantidadSubidos || 0}/8`
                }
            });

            // Actualizar el registro existente manteniendo la fecha original pero actualizando el vencimiento
            registrosVigentes[indiceExistente] = {
                ...registroExistente,
                ...datosEstudiante, // Actualizar datos del estudiante (pueden haber cambiado)
                fechaVencimiento: fechaVencimiento.toISOString(), // Extender plazo
                estado: estadoDocumentacion?.tipo || 'PENDIENTE_7D',
                tipoRegistro: estadoDocumentacion?.tipo || 'SIN_DOCUMENTACION',
                cantidadDocumentosSubidos: estadoDocumentacion?.cantidadSubidos || 0,
                documentosSubidos: estadoDocumentacion?.documentosSubidos || [],
                diasRestantes: 7,
                fechaUltimaActualizacion: ahora.toISOString() // Nueva fecha de actualización
            };

            const registroActualizado = registrosVigentes[indiceExistente];

            // Guardar cambios en localStorage
            localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosVigentes, null, 2));
            crearArchivoJSONDescargable(registrosVigentes);

            console.log('✅ Registro pendiente ACTUALIZADO (plazo extendido a 7 días):', {
                tipo: registroActualizado.tipoRegistro,
                documentos: `${registroActualizado.cantidadDocumentosSubidos}/8`,
                vencimiento: fechaVencimiento.toLocaleString()
            });

            return registroActualizado;

        } else {
            // No existe registro previo - CREAR nuevo registro
            const registro = {
                ...datosEstudiante,
                fechaRegistroSinDocumentacion: ahora.toISOString(),
                fechaVencimiento: fechaVencimiento.toISOString(),
                estado: estadoDocumentacion?.tipo || 'PENDIENTE_7D',
                tipoRegistro: estadoDocumentacion?.tipo || 'SIN_DOCUMENTACION',
                cantidadDocumentosSubidos: estadoDocumentacion?.cantidadSubidos || 0,
                documentosSubidos: estadoDocumentacion?.documentosSubidos || [],
                diasRestantes: 7,
                id: Date.now() // ID único basado en timestamp
            };

            // Agregar nuevo registro
            registrosVigentes.push(registro);

            // Guardar de vuelta en localStorage
            localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosVigentes, null, 2));
            crearArchivoJSONDescargable(registrosVigentes);

            console.log('✅ Nuevo registro pendiente CREADO (válido por 7 días):', {
                tipo: registro.tipoRegistro,
                documentos: `${registro.cantidadDocumentosSubidos}/8`,
                vencimiento: fechaVencimiento.toLocaleString()
            });

            return registro;
        }

    } catch (error) {
        console.error('❌ Error al guardar/actualizar registro pendiente:', error);
        throw error;
    }
};

// Función para crear un archivo JSON descargable
const crearArchivoJSONDescargable = (registros) => {
    try {
        const contenidoJSON = JSON.stringify(registros, null, 2);
        const blob = new Blob([contenidoJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Crear un enlace temporal para descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = `registros-sin-documentacion-${new Date().toISOString().split('T')[0]}.json`;

        // Agregar al DOM temporalmente y hacer clic
        document.body.appendChild(link);
        // No descargar automáticamente, solo preparar para descarga manual si se desea
        document.body.removeChild(link);

        // Limpiar la URL
        URL.revokeObjectURL(url);

        console.log('📄 Archivo JSON preparado para descarga');
    } catch (error) {
        console.error('❌ Error al crear archivo JSON:', error);
    }
};

// Función para limpiar registros vencidos (más de 7 días)
export const limpiarRegistrosVencidos = (registros = null) => {
    try {
        const registrosActuales = registros || obtenerRegistrosSinDocumentacion();
        const ahora = new Date();

        const registrosVigentes = registrosActuales.filter(registro => {
            // Si el registro ya está procesado, no vence y se mantiene
            if (registro.estado === 'PROCESADO') return true;

            const fechaVencimiento = new Date(registro.fechaVencimiento);
            const estaVigente = ahora < fechaVencimiento;

            if (!estaVigente) {
                console.log(`🗑️ Eliminando registro vencido: ${registro.nombre} ${registro.apellido} (DNI: ${registro.dni})`);
            }

            return estaVigente;
        });

        // Actualizar localStorage solo si hubo cambios
        if (registrosVigentes.length !== registrosActuales.length) {
            localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosVigentes, null, 2));
            const eliminados = registrosActuales.length - registrosVigentes.length;
            console.log(`🧹 Limpieza automática: ${eliminados} registro(s) vencido(s) eliminado(s)`);
        }

        return registrosVigentes;
    } catch (error) {
        console.error('❌ Error al limpiar registros vencidos:', error);
        return registros || [];
    }
};

// Función para programar limpieza automática
let intervaloLimpieza = null;

export const programarLimpiezaAutomatica = () => {
    // Evitar múltiples intervalos
    if (intervaloLimpieza) {
        clearInterval(intervaloLimpieza);
    }

    // Limpiar cada 6 horas (21600000 ms = 6 horas) - más frecuente para mejor UX
    // Los registros vencen en 7 días, pero es mejor verificar más seguido
    intervaloLimpieza = setInterval(() => {
        console.log('🕐 Ejecutando limpieza automática programada...');
        const registrosAntesLimpieza = obtenerRegistrosSinDocumentacion().length;
        limpiarRegistrosVencidos();
        const registrosDespuesLimpieza = obtenerRegistrosSinDocumentacion().length;

        if (registrosAntesLimpieza !== registrosDespuesLimpieza) {
            const eliminados = registrosAntesLimpieza - registrosDespuesLimpieza;
            console.log(`🧹 Limpieza automática completada: ${eliminados} registro(s) vencido(s) eliminado(s)`);
        } else {
            console.log('✅ Limpieza automática: No hay registros vencidos para eliminar');
        }
    }, 21600000); // 6 horas

    console.log('⏲️ Limpieza automática programada cada 6 horas');
};

// Función para detener la limpieza automática
export const detenerLimpiezaAutomatica = () => {
    if (intervaloLimpieza) {
        clearInterval(intervaloLimpieza);
        intervaloLimpieza = null;
        console.log('⏹️ Limpieza automática detenida');
    }
};

// Función para obtener información de vencimiento
export const obtenerInfoVencimiento = (registro) => {
    const ahora = new Date();
    let vencimiento;
    // Si el registro tiene fechaVencimiento, úsala; si no, calcula sumando 7 días al timestamp
    if (registro.fechaVencimiento) {
        vencimiento = new Date(registro.fechaVencimiento);
    } else if (registro.timestamp) {
        vencimiento = new Date(registro.timestamp);
        vencimiento.setDate(vencimiento.getDate() + 7);
    } else {
        // Si no hay datos, considera vencido
        return { vencido: true, diasRestantes: 0, mensaje: 'VENCIDO', fechaVencimiento: 'Sin fecha' };
    }

    const msRestantes = vencimiento.getTime() - ahora.getTime();
    if (msRestantes <= 0) {
        return { vencido: true, diasRestantes: 0, mensaje: 'VENCIDO', fechaVencimiento: vencimiento.toLocaleString() };
    }

    const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60));

    let mensaje;
    if (diasRestantes > 1) {
        mensaje = `${diasRestantes} días restantes`;
    } else if (diasRestantes === 1) {
        mensaje = `1 día restante`;
    } else {
        mensaje = `${horasRestantes}h restantes`;
    }

    return {
        vencido: false,
        diasRestantes,
        horasRestantes,
        mensaje,
        fechaVencimiento: vencimiento.toLocaleString()
    };
};

// Función para descargar manualmente el archivo JSON
export const descargarRegistrosJSON = () => {
    try {
        const registros = obtenerRegistrosSinDocumentacion();

        if (registros.length === 0) {
            alert('No hay registros sin documentación para descargar.');
            return;
        }

        const contenidoJSON = JSON.stringify(registros, null, 2);
        const blob = new Blob([contenidoJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `registros-sin-documentacion-${new Date().toISOString().split('T')[0]}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log(`📥 Descargado archivo con ${registros.length} registros`);
        return true;
    } catch (error) {
        console.error('❌ Error al descargar archivo JSON:', error);
        return false;
    }
};

// Función para descargar registros en formato CSV legible
export const descargarRegistrosCSV = () => {
    try {
        const registros = obtenerRegistrosSinDocumentacion();

        if (registros.length === 0) {
            alert('No hay registros sin documentación para descargar.');
            return;
        }

        // Crear headers del CSV
        const headers = [
            'Apellido',
            'Nombre',
            'DNI',
            'Email',
            'Modalidad',
            'Tipo de Registro',
            'Estado',
            'Días Restantes',
            'Fecha Límite',
            'Documentos Subidos',
            'Total Documentos',
            'Documentos Faltantes',
            'Lista de Documentos Subidos',
            'Lista de Documentos Faltantes'
        ];

        // Función para escapar comillas y caracteres especiales en CSV
        const escaparCSV = (valor) => {
            if (valor === null || valor === undefined) return '';
            const textoStr = String(valor);
            // Si contiene comillas, comas, saltos de línea, envolver en comillas y duplicar comillas internas
            if (textoStr.includes('"') || textoStr.includes(',') || textoStr.includes('\n') || textoStr.includes('\r')) {
                return `"${textoStr.replace(/"/g, '""')}"`;
            }
            return textoStr;
        };

        // Mapeo de tipos de documentos con iconos legibles
        const tiposDocumentosMap = {
            'foto': '📷 Foto 4x4',
            'archivo_dni': '📄 DNI',
            'archivo_cuil': '📄 CUIL',
            'archivo_fichaMedica': '🏥 Ficha Médica',
            'archivo_partidaNacimiento': '📜 Partida de Nacimiento',
            'archivo_solicitudPase': '📝 Solicitud de Pase',
            'archivo_analiticoParcial': '📊 Analítico Parcial',
            'archivo_certificadoNivelPrimario': '🎓 Certificado Nivel Primario'
        };

        const todosDocumentos = Object.keys(tiposDocumentosMap);

        // Construir filas de datos
        const filas = registros.map(registro => {
            const infoVencimiento = obtenerInfoVencimiento(registro);
            const docsSubidos = registro.documentosSubidos || [];
            const docsFaltantes = todosDocumentos.filter(doc => !docsSubidos.includes(doc));

            // Listas legibles de documentos
            const listaSubidos = docsSubidos.map(doc => tiposDocumentosMap[doc] || doc).join('; ');
            const listaFaltantes = docsFaltantes.map(doc => tiposDocumentosMap[doc] || doc).join('; ');

            return [
                escaparCSV(registro.apellido || ''),
                escaparCSV(registro.nombre || ''),
                escaparCSV(registro.dni || ''),
                escaparCSV(registro.email || ''),
                escaparCSV(registro.modalidad || ''),
                escaparCSV(registro.tipoRegistro === 'SIN_DOCUMENTACION' ? 'Sin Documentación' : 'Documentación Incompleta'),
                escaparCSV(infoVencimiento.vencido ? 'VENCIDO' : 'VIGENTE'),
                escaparCSV(infoVencimiento.diasRestantes || 0),
                escaparCSV(registro.fechaVencimiento ? new Date(registro.fechaVencimiento).toLocaleDateString('es-AR') + ', ' + new Date(registro.fechaVencimiento).toLocaleTimeString('es-AR') : ''),
                escaparCSV(registro.cantidadDocumentosSubidos || 0),
                escaparCSV(todosDocumentos.length),
                escaparCSV(docsFaltantes.length),
                escaparCSV(listaSubidos),
                escaparCSV(listaFaltantes)
            ];
        });

        // Construir contenido CSV
        const contenidoCSV = [
            headers.join(','), // Headers
            ...filas.map(fila => fila.join(',')) // Filas de datos
        ].join('\n');

        // Crear blob y descargar
        const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Registros-Pendientes-${new Date().toISOString().split('T')[0]}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log(`📊 Descargado CSV con ${registros.length} registros en formato Excel-compatible`);
        return true;
    } catch (error) {
        console.error('❌ Error al descargar archivo CSV:', error);
        return false;
    }
};

// Función para eliminar registros duplicados basándose en el DNI
// Mantiene el registro más reciente (mayor timestamp o fecha de actualización)
export const eliminarDuplicadosPorDNI = (registros) => {
    if (!Array.isArray(registros) || registros.length === 0) {
        return registros;
    }

    const registrosUnicos = new Map();

    registros.forEach(registro => {
        const dni = registro.dni;
        if (!dni) return; // Saltar registros sin DNI

        const existente = registrosUnicos.get(dni);

        if (!existente) {
            // Es el primer registro para este DNI
            registrosUnicos.set(dni, registro);
        } else {
            // Ya existe un registro para este DNI, decidir cuál mantener
            const fechaExistente = new Date(existente.fechaUltimaActualizacion || existente.fechaRegistroSinDocumentacion);
            const fechaNueva = new Date(registro.fechaUltimaActualizacion || registro.fechaRegistroSinDocumentacion);

            if (fechaNueva > fechaExistente) {
                // El registro actual es más reciente, reemplazar
                console.log(`🔄 Reemplazando registro duplicado para DNI ${dni}:`, {
                    anterior: fechaExistente.toLocaleString(),
                    nuevo: fechaNueva.toLocaleString()
                });
                registrosUnicos.set(dni, registro);
            } else {
                console.log(`🗑️ Eliminando registro duplicado más antiguo para DNI ${dni}`);
                // Mantener el existente (más reciente)
            }
        }
    });

    const resultado = Array.from(registrosUnicos.values());

    if (resultado.length !== registros.length) {
        const eliminados = registros.length - resultado.length;
        console.log(`✅ Deduplicación completada: ${eliminados} registro(s) duplicado(s) eliminado(s)`);
    }

    return resultado;
};

// Función para obtener todos los registros sin documentación (con limpieza automática)
export const obtenerRegistrosSinDocumentacion = (todos = false) => {
    try {
        // Leer registros desde el archivo Registros_Pendientes.json usando fetch (solo en entorno navegador)
        if (typeof window !== 'undefined') {
            // Sincrónico para compatibilidad, pero en producción usaría async/await y promesas
            const request = new XMLHttpRequest();
            request.open('GET', '/api/registros-pendientes', false); // endpoint backend
            request.send(null);
            if (request.status === 200) {
                const registros = JSON.parse(request.responseText);
                if (todos) {
                    // Devuelve todos los registros
                    return registros;
                }
                // Filtrar los que realmente no tienen documentación o son PROCESADO
                const registrosSinDoc = registros.filter(r => {
                    // Si ya está procesado, lo mantenemos visible
                    if (r.estado === 'PROCESADO') return true;

                    const esWeb = r.origen === 'web' || r.tipo === 'web';
                    // lógica original para mostrar solo los faltantes
                    return !r.tieneDocumentacion || (r.documentosSubidos && r.documentosSubidos.length === 0);
                });
                return registrosSinDoc;
            } else {
                console.error('❌ Error al obtener registros pendientes:', request.statusText);
                return [];
            }
        } else {
            // Node.js: leer desde el sistema de archivos si se requiere
            return [];
        }
    } catch (error) {
        console.error('❌ Error al obtener registros sin documentación:', error);
        return [];
    }
};

// Función para forzar limpieza completa de duplicados (usar manualmente si es necesario)
export const limpiarDuplicadosManualmente = () => {
    try {
        console.log('🧹 Iniciando limpieza manual de duplicados...');

        const registros = JSON.parse(localStorage.getItem('registrosSinDocumentacion') || '[]');
        const registrosOriginales = registros.length;

        // Limpiar vencidos
        const registrosVigentes = limpiarRegistrosVencidos(registros);

        // Eliminar duplicados
        const registrosDedupicados = eliminarDuplicadosPorDNI(registrosVigentes);

        // Guardar cambios
        localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosDedupicados, null, 2));

        const eliminados = registrosOriginales - registrosDedupicados.length;

        console.log(`✅ Limpieza manual completada:`, {
            originales: registrosOriginales,
            finales: registrosDedupicados.length,
            eliminados: eliminados,
            dniUnicos: new Set(registrosDedupicados.map(r => r.dni)).size
        });

        return {
            success: true,
            eliminados,
            registrosFinales: registrosDedupicados.length,
            mensaje: `Limpieza completada: ${eliminados} registro(s) eliminado(s)`
        };

    } catch (error) {
        console.error('❌ Error en limpieza manual:', error);
        return {
            success: false,
            mensaje: `Error: ${error.message}`
        };
    }
};

// Función para verificar estado de duplicados sin modificar nada
export const verificarDuplicados = () => {
    try {
        const registros = JSON.parse(localStorage.getItem('registrosSinDocumentacion') || '[]');

        // Contar DNIs
        const dniMap = new Map();
        registros.forEach(registro => {
            const dni = registro.dni;
            if (dni) {
                dniMap.set(dni, (dniMap.get(dni) || 0) + 1);
            }
        });

        // Encontrar duplicados
        const duplicados = Array.from(dniMap.entries())
            .filter(([, cantidad]) => cantidad > 1)
            .map(([dni, cantidad]) => ({
                dni,
                cantidad,
                registros: registros.filter(r => r.dni === dni).map(r => ({
                    nombre: r.nombre,
                    apellido: r.apellido,
                    fecha: new Date(r.fechaRegistroSinDocumentacion).toLocaleString(),
                    tipo: r.tipoRegistro
                }))
            }));

        console.log('📊 Estado de duplicados:', {
            totalRegistros: registros.length,
            dnisUnicos: dniMap.size,
            duplicados: duplicados.length,
            detalles: duplicados
        });

        return {
            totalRegistros: registros.length,
            dnisUnicos: dniMap.size,
            cantidadDuplicados: duplicados.length,
            duplicados
        };

    } catch (error) {
        console.error('❌ Error al verificar duplicados:', error);
        return null;
    }
};

// 🧪 FUNCIÓN DE TESTING - Verificar funcionamiento del sistema de 7 días
export const testearSistema7Dias = () => {
    try {
        const ahora = new Date();
        console.log('🧪 === TESTING SISTEMA 7 DÍAS ===');
        console.log(`📅 Fecha actual: ${ahora.toLocaleString()}`);

        const registros = obtenerRegistrosSinDocumentacion();
        console.log(`📋 Total registros: ${registros.length}`);

        if (registros.length === 0) {
            console.log('ℹ️ No hay registros para analizar');
            return {
                totalRegistros: 0,
                registrosVigentes: 0,
                registrosVencidos: 0,
                detalles: []
            };
        }

        const detalles = registros.map(registro => {
            const fechaCreacion = new Date(registro.fechaRegistroSinDocumentacion);
            const fechaVencimiento = new Date(registro.fechaVencimiento);
            const msRestantes = fechaVencimiento.getTime() - ahora.getTime();
            const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
            const horasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60));
            const vencido = msRestantes <= 0;

            // Verificar si la fecha de vencimiento es correcta (7 días después de creación)
            const diasEsperados = Math.ceil((fechaVencimiento.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
            const vencimientoCorrectoCalculado = diasEsperados === 7;

            const detalle = {
                dni: registro.dni,
                nombre: `${registro.nombre} ${registro.apellido}`,
                fechaCreacion: fechaCreacion.toLocaleString(),
                fechaVencimiento: fechaVencimiento.toLocaleString(),
                diasRestantes,
                horasRestantes,
                vencido,
                diasEsperados,
                vencimientoCorrectoCalculado
            };

            console.log(`👤 ${detalle.nombre} (DNI: ${detalle.dni}):`);
            console.log(`   📅 Creado: ${detalle.fechaCreacion}`);
            console.log(`   ⏰ Vence: ${detalle.fechaVencimiento}`);
            console.log(`   📊 Estado: ${vencido ? '❌ VENCIDO' : '✅ VIGENTE'}`);
            console.log(`   🎯 Días calculados correctamente: ${vencimientoCorrectoCalculado ? '✅ SÍ' : '❌ NO'} (${diasEsperados} días)`);
            console.log(`   ⏳ Tiempo restante: ${vencido ? 'Vencido' : `${diasRestantes} días, ${horasRestantes} horas`}`);
            console.log('   ---');

            return detalle;
        });

        const vigentes = detalles.filter(d => !d.vencido).length;
        const vencidos = detalles.filter(d => d.vencido).length;
        const calculosCorrectos = detalles.filter(d => d.vencimientoCorrectoCalculado).length;

        console.log('📊 === RESUMEN ===');
        console.log(`✅ Registros vigentes: ${vigentes}`);
        console.log(`❌ Registros vencidos: ${vencidos}`);
        console.log(`🎯 Cálculos correctos: ${calculosCorrectos}/${registros.length}`);
        console.log(`⚠️ Cálculos incorrectos: ${registros.length - calculosCorrectos}/${registros.length}`);

        return {
            fechaAnalisis: ahora.toISOString(),
            totalRegistros: registros.length,
            registrosVigentes: vigentes,
            registrosVencidos: vencidos,
            calculosCorrectos,
            calculosIncorrectos: registros.length - calculosCorrectos,
            detalles
        };

    } catch (error) {
        console.error('❌ Error en testing sistema 7 días:', error);
        return null;
    }
};

// 🧪 FUNCIÓN DE TESTING - Simular registro con fecha específica (para testing)
export const simularRegistroConFecha = (datosEstudiante, diasAtras = 0) => {
    try {
        const ahora = new Date();
        const fechaCreacion = new Date(ahora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
        const fechaVencimiento = new Date(fechaCreacion.getTime() + (7 * 24 * 60 * 60 * 1000));

        const registro = {
            ...datosEstudiante,
            fechaRegistroSinDocumentacion: fechaCreacion.toISOString(),
            fechaVencimiento: fechaVencimiento.toISOString(),
            estado: 'PENDIENTE_7D',
            tipoRegistro: 'SIN_DOCUMENTACION',
            cantidadDocumentosSubidos: 0,
            documentosSubidos: [],
            diasRestantes: Math.max(0, 7 - diasAtras),
            id: Date.now(),
            esSimulacion: true // Marca para identificar registros de prueba
        };

        console.log(`🧪 Registro simulado creado:`, {
            nombre: `${datosEstudiante.nombre} ${datosEstudiante.apellido}`,
            dni: datosEstudiante.dni,
            diasAtras,
            fechaCreacion: fechaCreacion.toLocaleString(),
            fechaVencimiento: fechaVencimiento.toLocaleString(),
            vigente: ahora < fechaVencimiento
        });

        return registro;

    } catch (error) {
        console.error('❌ Error al simular registro:', error);
        return null;
    }
};

// 🧹 FUNCIÓN PARA LIMPIAR REGISTROS DE TESTING
export const limpiarRegistrosDePrueba = () => {
    try {
        const registros = JSON.parse(localStorage.getItem('registrosSinDocumentacion') || '[]');
        const registrosLimpios = registros.filter(r => !r.esSimulacion);
        const eliminados = registros.length - registrosLimpios.length;

        localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosLimpios, null, 2));

        console.log(`🧹 Registros de prueba eliminados: ${eliminados}`);
        return { eliminados, restantes: registrosLimpios.length };

    } catch (error) {
        console.error('❌ Error al limpiar registros de prueba:', error);
        return null;
    }
};

// Función para limpiar registros antiguos (opcional)
export const limpiarRegistrosAntiguos = (diasAntigüedad = 7) => {
    try {
        const registros = obtenerRegistrosSinDocumentacion();
        const fechaCorte = new Date();
        fechaCorte.setDate(fechaCorte.getDate() - diasAntigüedad);

        const registrosFiltrados = registros.filter(registro => {
            const fechaRegistro = new Date(registro.fechaRegistroSinDocumentacion);
            return fechaRegistro >= fechaCorte;
        });

        localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosFiltrados, null, 2));
        console.log(`🧹 Limpieza completada. Registros mantenidos: ${registrosFiltrados.length}`);

        return registrosFiltrados;
    } catch (error) {
        console.error('❌ Error al limpiar registros antiguos:', error);
        return [];
    }
};

// Función para verificar si existe un registro pendiente para un DNI específico
export const verificarRegistroPendiente = (dni) => {
    try {
        if (!dni) return null;

        const registros = obtenerRegistrosSinDocumentacion();
        const registro = registros.find(r => r.dni === dni);

        if (registro) {
            console.log(`🔍 Registro pendiente encontrado para DNI ${dni}:`, {
                tipo: registro.tipoRegistro,
                vencimiento: new Date(registro.fechaVencimiento).toLocaleString()
            });
        }

        return registro || null;
    } catch (error) {
        console.error('❌ Error al verificar registro pendiente:', error);
        return null;
    }
};

// Función para eliminar un registro pendiente específico por DNI
export const eliminarRegistroPendiente = (dni) => {
    try {
        if (!dni) return false;

        const registros = obtenerRegistrosSinDocumentacion();
        const registrosFiltrados = registros.filter(r => r.dni !== dni);

        if (registrosFiltrados.length < registros.length) {
            localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registrosFiltrados, null, 2));
            console.log(`🗑️ Registro pendiente eliminado para DNI ${dni}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ Error al eliminar registro pendiente:', error);
        return false;
    }
};

// Función para actualizar un registro pendiente con nueva información
export const actualizarRegistroPendiente = (dni, nuevosDatos) => {
    try {
        if (!dni) return null;

        const registros = obtenerRegistrosSinDocumentacion();
        const indiceRegistro = registros.findIndex(r => r.dni === dni);

        if (indiceRegistro !== -1) {
            // Mantener datos importantes del registro original
            const registroOriginal = registros[indiceRegistro];
            const registroActualizado = {
                ...registroOriginal,
                ...nuevosDatos,
                fechaActualizacion: new Date().toISOString(),
                // Mantener fechas originales de vencimiento
                fechaRegistroSinDocumentacion: registroOriginal.fechaRegistroSinDocumentacion,
                fechaVencimiento: registroOriginal.fechaVencimiento
            };

            registros[indiceRegistro] = registroActualizado;
            localStorage.setItem('registrosSinDocumentacion', JSON.stringify(registros, null, 2));

            console.log(`✅ Registro pendiente actualizado para DNI ${dni}`);
            return registroActualizado;
        }

        return null;
    } catch (error) {
        console.error('❌ Error al actualizar registro pendiente:', error);
        return null;
    }
};