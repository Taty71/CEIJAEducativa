const nodemailer = require('nodemailer');

// Configuración del transportador de email
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.EMAIL_USER || 'ceija5.inscripciones@gmail.com',
            pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Mapeo de nombres técnicos a nombres legibles para documentos
const mapeoDocumentos = {
    "foto": "📷 Foto 4x4",
    "archivo_dni": "📄 DNI",
    "archivo_cuil": "📄 CUIL",
    "archivo_fichaMedica": "🏥 Ficha Médica",
    "archivo_partidaNacimiento": "📜 Partida de Nacimiento",
    "archivo_solicitudPase": "📝 Solicitud de Pase",
    "archivo_analiticoParcial": "📊 Analítico Parcial",
    "archivo_certificadoNivelPrimario": "🎓 Certificado Nivel Primario"
};

const documentosRequeridos = [
    "foto", "archivo_dni", "archivo_cuil", "archivo_fichaMedica", 
    "archivo_partidaNacimiento", "archivo_solicitudPase", 
    "archivo_analiticoParcial", "archivo_certificadoNivelPrimario"
];

// Función para obtener información de vencimiento
const obtenerInfoVencimiento = (registro) => {
    const ahora = new Date();
    
    // Debug: Mostrar información de fechas
    console.log('📅 DEBUG - Calculando vencimiento:');
    console.log('  - Fecha actual:', ahora.toISOString());
    console.log('  - Timestamp registro:', registro.timestamp);
    console.log('  - FechaVencimiento registro:', registro.fechaVencimiento);
    
    // Determinar fecha de vencimiento
    let fechaVencimiento;
    if (registro.fechaVencimiento) {
        fechaVencimiento = new Date(registro.fechaVencimiento);
    } else if (registro.timestamp) {
        // Calcular 7 días desde el timestamp
        const fechaCreacion = new Date(registro.timestamp);
        fechaVencimiento = new Date(fechaCreacion.getTime() + (7 * 24 * 60 * 60 * 1000));
        console.log('  - FechaVencimiento calculada:', fechaVencimiento.toISOString());
    } else {
        console.error('❌ No se puede determinar fecha de vencimiento');
        return { vencido: true, diasRestantes: 0, mensaje: 'ERROR: Sin fecha' };
    }
    
    const msRestantes = fechaVencimiento.getTime() - ahora.getTime();
    
    console.log('  - Ms restantes:', msRestantes);
    
    if (msRestantes <= 0) {
        return { vencido: true, diasRestantes: 0, mensaje: 'VENCIDO' };
    }
    
    const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60));
    
    console.log('  - Días restantes:', diasRestantes);
    console.log('  - Horas restantes:', horasRestantes);
    
    let mensaje;
    if (diasRestantes > 1) {
        mensaje = `${diasRestantes} días restantes`;
    } else if (diasRestantes === 1) {
        mensaje = `1 día restante`;
    } else {
        mensaje = `${horasRestantes} horas restantes`;
    }
    
    console.log('  - Mensaje final:', mensaje);
    
    return { 
        vencido: false, 
        diasRestantes, 
        horasRestantes,
        mensaje,
        fechaVencimiento: fechaVencimiento.toLocaleDateString('es-AR') + ' a las ' + fechaVencimiento.toLocaleTimeString('es-AR')
    };
};

// Función para obtener el estado de documentación
const obtenerEstadoDocumentacion = (registro) => {
    const documentosSubidos = registro.documentosSubidos || [];
    const documentosFaltantes = documentosRequeridos.filter(doc => 
        !documentosSubidos.includes(doc)
    );
    
    return {
        subidos: documentosSubidos,
        faltantes: documentosFaltantes,
        totalSubidos: documentosSubidos.length,
        totalRequeridos: documentosRequeridos.length
    };
};

// Función para generar el contenido HTML del email
const generarHTMLEmail = (registro) => {
    const info = obtenerInfoVencimiento(registro);
    const estadoDoc = obtenerEstadoDocumentacion(registro);
    
    // Obtener datos personales desde la estructura correcta
    const datos = registro.datos || registro;
    const nombre = datos.nombre || registro.nombre;
    const apellido = datos.apellido || registro.apellido;
    const email = datos.email || registro.email;
    const modalidad = datos.modalidad || registro.modalidad;
    const dni = datos.dni || registro.dni;
    
    const tipoRegistro = registro.tipoRegistro === 'SIN_DOCUMENTACION' ? 'Sin Documentación' : 'Documentación Incompleta';
    
    console.log(`📧 Generando email para ${nombre} ${apellido} - ${info.mensaje}`);
    
    // Crear listas HTML de documentos
    const listaSubidos = estadoDoc.subidos.length > 0 
        ? estadoDoc.subidos.map(doc => `<li style="color: #2e7d32; margin: 4px 0;">${mapeoDocumentos[doc] || doc}</li>`).join('')
        : '<li style="color: #666;">Ningún documento presentado aún</li>';
    
    const listaFaltantes = estadoDoc.faltantes.length > 0 
        ? estadoDoc.faltantes.map(doc => `<li style="color: #f57c00; margin: 4px 0;">${mapeoDocumentos[doc] || doc}</li>`).join('')
        : '<li style="color: #666;">Documentación completa</li>';
    
    // Determinar color y urgencia según días restantes
    let colorUrgencia, mensajeUrgencia;
    if (info.vencido) {
        colorUrgencia = '#dc3545';
        mensajeUrgencia = '🚨 <strong>URGENTE - REGISTRO VENCIDO</strong>';
    } else if (info.diasRestantes <= 1) {
        colorUrgencia = '#dc3545';
        mensajeUrgencia = '🚨 <strong>URGENTE - Menos de 24 horas restantes</strong>';
    } else if (info.diasRestantes <= 3) {
        colorUrgencia = '#fd7e14';
        mensajeUrgencia = '⚠️ <strong>IMPORTANTE - Pocos días restantes</strong>';
    } else {
        colorUrgencia = '#28a745';
        mensajeUrgencia = 'ℹ️ <strong>Recordatorio de inscripción</strong>';
    }

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estado de Inscripción - CEIJA 5</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2d4177 0%, #4a6ba8 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎓 CEIJA 5</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Centro de Educación Integral para Jóvenes y Adultos N°5</p>
        </div>
        
        <!-- Alerta de urgencia -->
        <div style="background-color: ${colorUrgencia}; color: white; padding: 15px; text-align: center; font-size: 18px;">
            ${mensajeUrgencia}
        </div>
        
        <!-- Contenido principal -->
        <div style="background: white; padding: 25px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d4177; margin-top: 0; border-bottom: 2px solid #2d4177; padding-bottom: 10px;">
                📧 Estado de su Inscripción
            </h2>
            
            <!-- Información del estudiante -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2d4177;">
                <h3 style="color: #2d4177; margin: 0 0 15px 0; font-size: 20px;">
                    👤 ${nombre} ${apellido}
                </h3>
                <p style="margin: 8px 0; font-size: 16px;"><strong>📄 DNI:</strong> ${dni}</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>📚 Modalidad:</strong> ${modalidad}</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>📝 Tipo:</strong> ${tipoRegistro}</p>
                <p style="margin: 8px 0; font-size: 16px;"><strong>📎 Documentos:</strong> ${estadoDoc.totalSubidos}/${estadoDoc.totalRequeridos}</p>
            </div>

            <!-- Tiempo restante -->
            <div style="background: ${info.vencido ? '#ffebee' : '#e8f5e8'}; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 2px solid ${colorUrgencia};">
                <h4 style="margin: 0 0 10px 0; color: ${colorUrgencia}; font-size: 18px;">
                    ⏰ ${info.vencido ? 'REGISTRO VENCIDO' : info.mensaje.toUpperCase()}
                </h4>
                ${!info.vencido ? `
                    <p style="margin: 0; font-size: 16px; color: #555;">
                        <strong>Fecha límite:</strong> ${info.fechaVencimiento}
                    </p>
                ` : `
                    <p style="margin: 0; font-size: 16px; color: #dc3545;">
                        Su registro ha vencido y será eliminado automáticamente. Contacte a la institución.
                    </p>
                `}
            </div>

            <!-- Documentos subidos -->
            ${estadoDoc.subidos.length > 0 ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">
                    ✅ Documentos ya presentados:
                </h4>
                <ul style="margin: 0; padding-left: 20px;">
                    ${listaSubidos}
                </ul>
            </div>
            ` : ''}

            <!-- Documentos faltantes -->
            ${estadoDoc.faltantes.length > 0 ? `
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #f57c00;">
                <h4 style="color: #f57c00; margin: 0 0 10px 0; font-size: 16px;">
                    ⚠️ Documentos faltantes para completar su inscripción:
                </h4>
                <ul style="margin: 0; padding-left: 20px;">
                    ${listaFaltantes}
                </ul>
            </div>
            ` : ''}

            <!-- Instrucciones -->
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #1976d2; margin: 0 0 15px 0;">📋 ¿Cómo completar su inscripción?</h4>
                <ol style="margin: 0; padding-left: 20px; color: #555;">
                    <li style="margin: 8px 0;">Prepare todos los documentos faltantes listados arriba</li>
                    <li style="margin: 8px 0;">Ingrese al sistema de inscripciones online</li>
                    <li style="margin: 8px 0;">Complete el formulario con la documentación faltante</li>
                    <li style="margin: 8px 0;">Envíe su inscripción antes de la fecha límite</li>
                </ol>
            </div>

            <!-- Contacto -->
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
                <h4 style="color: #2d4177; margin: 0 0 10px 0;">📞 ¿Necesita ayuda?</h4>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Horarios de atención:</strong> Lunes a Viernes de 19:00 a 22:00 hs
                </p>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Teléfono:</strong> (03543) 123456
                </p>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Email:</strong> secretaria@ceija5.edu.ar
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Este es un mensaje automático del sistema de inscripciones de CEIJA 5.</p>
            <p style="margin: 5px 0 0 0;">Por favor, no responda a este email.</p>
        </div>
    </body>
    </html>
    `;
};

// Función para enviar email a un estudiante
// Ahora acepta un parámetro opcional `options` con `subject` y `body` (HTML).
const enviarEmailEstudiante = async (registro, options = {}) => {
    try {
        const transporter = createTransporter();
        const info = obtenerInfoVencimiento(registro);

        // Obtener datos personales desde la estructura correcta
        const datos = registro.datos || registro;
        const email = datos.email || registro.email;
        const nombre = datos.nombre || registro.nombre;
        const apellido = datos.apellido || registro.apellido;
        const dni = datos.dni || registro.dni;

        // Si el cliente provee subject/body, úsalos; si no, genera por defecto
        let asunto = options.subject;
        if (!asunto) {
            if (info.vencido) {
                asunto = `🚨 URGENTE - Inscripción VENCIDA - CEIJA 5`;
            } else if (info.diasRestantes <= 1) {
                asunto = `🚨 URGENTE - Menos de 24h para completar inscripción - CEIJA 5`;
            } else if (info.diasRestantes <= 3) {
                asunto = `⚠️ IMPORTANTE - ${info.diasRestantes} días para completar inscripción - CEIJA 5`;
            } else {
                asunto = `📧 Recordatorio: ${info.diasRestantes} días para completar inscripción - CEIJA 5`;
            }
        }

        // Si se pasa un body HTML en options.body, utilízalo; sino usa el generador
        const htmlBody = options.body || generarHTMLEmail(registro);

        console.log(`📧 Enviando email a ${email} - Asunto: "${asunto}"`);

        const mailOptions = {
            from: `"CEIJA 5 - Inscripciones" <${process.env.EMAIL_USER || 'ceija5.inscripciones@gmail.com'}>`,
            to: email,
            subject: asunto,
            html: htmlBody,
            priority: info.diasRestantes <= 3 ? 'high' : 'normal',
            attachments: []
        };

        // Adjuntos opcionales (buffers, rutas o base64). Esperamos options.attachments = [{filename, content, contentType}]
        if (options.attachments && Array.isArray(options.attachments) && options.attachments.length > 0) {
            mailOptions.attachments = options.attachments.map(att => {
                // Si content es Buffer ya está listo
                return {
                    filename: att.filename || 'adjunto.pdf',
                    content: att.content,
                    contentType: att.contentType || 'application/pdf'
                };
            });
        }

        const result = await transporter.sendMail(mailOptions);

        console.log(`✅ Email enviado exitosamente a ${email} (${nombre} ${apellido})`);
        console.log(`📨 Message ID: ${result.messageId}`);

        return {
            success: true,
            messageId: result.messageId,
            email: email,
            nombre: `${nombre} ${apellido}`,
            dni: dni
        };

    } catch (error) {
        console.error('❌ Error enviando email:', error.message);

        return {
            success: false,
            error: error.message
        };
    }
};

// Función para enviar emails masivos
const enviarEmailsMasivos = async (registros) => {
    const resultados = {
        enviados: [],
        fallidos: [],
        total: registros.length,
        exitosos: 0,
        fallidos_count: 0
    };

    console.log(`📧 Iniciando envío masivo de ${registros.length} emails...`);

    for (const registro of registros) {
        if (!registro.email || !registro.email.includes('@')) {
            console.log(`⚠️ Saltando ${registro.nombre} ${registro.apellido} - Email inválido: ${registro.email}`);
            resultados.fallidos.push({
                success: false,
                error: 'Email inválido o vacío',
                email: registro.email,
                nombre: `${registro.nombre} ${registro.apellido}`,
                dni: registro.dni
            });
            resultados.fallidos_count++;
            continue;
        }

        try {
            const resultado = await enviarEmailEstudiante(registro);
            
            if (resultado.success) {
                resultados.enviados.push(resultado);
                resultados.exitosos++;
            } else {
                resultados.fallidos.push(resultado);
                resultados.fallidos_count++;
            }
            
            // Pausa de 1 segundo entre emails para no sobrecargar el servidor SMTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Error procesando ${registro.nombre} ${registro.apellido}:`, error.message);
            resultados.fallidos.push({
                success: false,
                error: error.message,
                email: registro.email,
                nombre: `${registro.nombre} ${registro.apellido}`,
                dni: registro.dni
            });
            resultados.fallidos_count++;
        }
    }

    console.log(`📊 Envío masivo completado: ${resultados.exitosos} enviados, ${resultados.fallidos_count} fallidos`);
    
    return resultados;
};

module.exports = {
    enviarEmailEstudiante,
    enviarEmailsMasivos,
    generarHTMLEmail,
    obtenerInfoVencimiento,
    obtenerEstadoDocumentacion
};