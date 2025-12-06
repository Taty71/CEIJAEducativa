const fs = require('fs');
const path = require('path');

// Intentamos cargar html-pdf-node si está disponible
let htmlPdf = null;
try {
  htmlPdf = require('html-pdf-node');
} catch (e) {
  console.warn('html-pdf-node no está instalado; generación de PDF en servidor no disponible. Ejecuta `npm install html-pdf-node` si quieres habilitarlo.');
}

// Generador de HTML para comprobante (servidor)
function generarHTMLComprobante(estudiante = {}, options = {}) {
  const fecha = new Date().toLocaleDateString('es-AR');
  const hora = new Date().toLocaleTimeString('es-AR');
  const nombre = estudiante.nombre || '';
  const apellido = estudiante.apellido || '';
  const dni = estudiante.dni || '';
  const modalidad = estudiante.modalidad || 'Sin modalidad';
  const plan = estudiante.planAnio || estudiante.cursoPlan || 'Sin asignar';
  const modulo = estudiante.modulo || estudiante.modulos || 'Sin asignar';
  const estado = estudiante.estadoInscripcion || estudiante.estado || (estudiante.activo ? 'Activo' : 'Inactivo');

  const docArray = Array.isArray(estudiante.documentacion) ? estudiante.documentacion : [];
  const presentados = docArray.filter(d => d.archivoDocumentacion && d.archivoDocumentacion !== '' && d.estadoDocumentacion !== 'Faltante').map(d => d.descripcionDocumentacion);
  // To determine faltantes, prefer an explicit list if provided, otherwise infer from presentados/requeridos
  const requeridos = estudiante.requeridos || [];
  const faltantes = estudiante.faltantes || (requeridos.length ? requeridos.filter(r => !presentados.includes(r)) : docArray.filter(d => !d.archivoDocumentacion).map(d => d.descripcionDocumentacion));

  // Intentar cargar CSS del frontend comprobante para mantener mismo estilo
  let cssContent = '';
  try {
    const cssPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'estilos', 'comprobante.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  } catch (e) {
    cssContent = '@page{size:A5;margin:10mm}body{font-family:Arial,sans-serif;font-size:11px;color:#333}';
  }

  const previewBodyHTML = options.previewBody ? `<div class="section"><h3 class="comprobante-h3">Mensaje enviado</h3><div>${options.previewBody}</div></div>` : '';

  const lista = (arr) => (arr && arr.length) ? arr.map(i => `<li class="comprobante-li">${i}</li>`).join('') : '<li class="comprobante-li">No disponible</li>';

  return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Comprobante - ${dni}</title>
      <style>${cssContent}</style>
    </head>
    <body>
      <div class="comprobante-header">
        <div class="comprobante-logo">CEIJA 5</div>
        <div class="comprobante-institucion">Centro de Educación Integral para Jóvenes y Adultos N° 5</div>
        <div class="comprobante-subtitulo">Comprobante de Estado de Inscripción</div>
      </div>

      <div class="comprobante-info-estudiante">
        <h3 class="comprobante-h3">Información del Estudiante</h3>
        <p class="comprobante-p"><strong class="comprobante-strong">ID:</strong> ${estudiante.id || ''}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">DNI:</strong> ${dni}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">Nombre y Apellido:</strong> ${nombre} ${apellido}</p>
      </div>

      <div class="comprobante-info-academica">
        <h3 class="comprobante-h3">Información Académica</h3>
        <p class="comprobante-p"><strong class="comprobante-strong">Modalidad:</strong> ${modalidad}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">Plan/Año:</strong> ${plan}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">Módulo:</strong> ${modulo}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">Fecha de Inscripción:</strong> ${estudiante.fechaInscripcion ? new Date(estudiante.fechaInscripcion).toLocaleDateString('es-AR') : 'No disponible'}</p>
        <p class="comprobante-p"><strong class="comprobante-strong">Estado de Inscripción:</strong> <span class="${(estudiante.estadoInscripcion || '').toLowerCase().includes('pendiente') ? 'comprobante-estado-pendiente' : 'comprobante-estado-activo'}">${estudiante.estadoInscripcion || 'Sin estado'}</span></p>
      </div>

      <div class="comprobante-documentos-requeridos">
        <h3 class="comprobante-h3">📑 Documentos Requeridos</h3>
        <ul class="comprobante-ul">
          ${lista(requeridos)}
        </ul>
      </div>

      <div class="comprobante-documentos-presentados">
        <h3 class="comprobante-h3">📄 Documentación Presentada</h3>
        <ul class="comprobante-ul">
          ${lista(presentados)}
        </ul>
      </div>

      <div class="comprobante-documentos-faltantes">
        <h3 class="comprobante-h3">📋 Documentación Faltante</h3>
        <ul class="comprobante-ul">
          ${lista(faltantes)}
        </ul>
      </div>

      ${previewBodyHTML}

      <div class="comprobante-footer">
        <p>Comprobante emitido el ${fecha} a las ${hora}</p>
        <p>Este documento es válido como constancia del estado de inscripción del estudiante.</p>
        <p><strong class="comprobante-strong">CEIJA 5 - Centro de Educación Integral para Jóvenes y Adultos N° 5</strong></p>
      </div>
    </body>
    </html>`;
}

async function generarPDFBuffer(estudiante = {}, options = {}) {
  const html = generarHTMLComprobante(estudiante, options);
  if (!htmlPdf) {
    throw new Error('html-pdf-node no está disponible en el servidor. Instala la dependencia antes de usar generación de PDF en servidor.');
  }

  const pdfOptions = { format: 'A5', margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } };
  const file = { content: html };
  const result = await htmlPdf.generatePdf(file, pdfOptions);
  return result;
}

module.exports = { generarHTMLComprobante, generarPDFBuffer };
