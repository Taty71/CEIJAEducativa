const nodemailer = require('nodemailer');
const comprobanteService = require('./comprobanteService');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'ceija5.inscripciones@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion'
    },
    tls: { rejectUnauthorized: false }
  });
};

// Enviar email a estudiantes ya inscriptos/guardados en la base de datos
const enviarEmailEstudianteInscrito = async (estudiante, options = {}) => {
  try {
    const transporter = createTransporter();

    const subject = options.subject || `Notificación CEIJA5 - ${estudiante.modalidad || ''}`;
    let htmlBody = options.body || (`<p>Estimado/a ${estudiante.nombre} ${estudiante.apellido},</p><p>Le notificamos ...</p>`);

    // Si el caller pasó una lista de documentos, incluimos una sección detallada en el HTML
    if (Array.isArray(options.documentos) && options.documentos.length > 0) {
      const docsHtml = `<h4>Documentación presentada</h4><ul>${options.documentos.map(d => `<li>${d}</li>`).join('')}</ul>`;
      // Si body ya contiene HTML, simplemente anexar; si no, envolver en <div>
      htmlBody = `${htmlBody}${docsHtml}`;
    }

    const mailOptions = {
      from: `"CEIJA 5 - Inscripciones" <${process.env.EMAIL_USER || 'ceija5.inscripciones@gmail.com'}>`,
      to: estudiante.email,
      subject,
      html: htmlBody,
      attachments: []
    };

    if (options.attachComprobante) {
      try {
        const pdfBuffer = await comprobanteService.generarPDFBuffer(estudiante);
        mailOptions.attachments.push({ filename: `Comprobante_${estudiante.dni}.pdf`, content: pdfBuffer, contentType: 'application/pdf' });
      } catch (err) {
        console.error('No se pudo generar comprobante para adjuntar:', err.message);
      }
    }

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error enviando email a estudiante inscripto:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { enviarEmailEstudianteInscrito };
