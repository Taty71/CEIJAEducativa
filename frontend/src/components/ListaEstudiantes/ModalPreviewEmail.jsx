import { useEffect, useState, useRef, useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';
import ComprobanteGenerator from '../ComprobanteGenerator';
import PropTypes from 'prop-types';
import '../../estilos/modalM.css';
import service from '../../services/serviceInscripcion';
import { notificacionesService } from '../../services/notificacionesService';
import { notificacionesEstudiantesService } from '../../services/notificacionesEstudiantesService';

const ModalPreviewEmail = ({ open, estudiante, onClose, onSent }) => {
  const [loading, setLoading] = useState(false);
  const alertCtx = useContext(AlertContext);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('Notificación importante - CEIJA5');
  const messageRef = useRef();
  const [estadoDoc, setEstadoDoc] = useState({ subidos: [], faltantes: [], porcentajeCompletado: 0 });

  useEffect(() => {
    if (!open || !estudiante) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener datos completos del estudiante
        const resp = await service.getEstudiantePorDNI(estudiante.dni);
        // Adaptar estructura para comprobante y notificación
        let est = { ...estudiante };
        let insc = {};
        let documentacion = [];
        if (resp && resp.estudiante) {
          est = { ...est, ...resp.estudiante };
        }
        if (resp && resp.inscripcion) {
          insc = resp.inscripcion;
          est = { ...est, ...insc };
        }
        if (resp && resp.documentacion) {
          documentacion = resp.documentacion;
        } else if (est.documentacion) {
          documentacion = est.documentacion;
        }
        // Si no hay plan ni curso, mostrar mensaje claro
        const planKey = insc.planAnio || insc.cursoPlan || est.planAnio || est.cursoPlan;
        const requeridos = planKey ? ComprobanteGenerator.getDocsRequeridos(planKey) : [];
        const presentados = [];
        const faltantes = [];
        if (requeridos.length > 0 && Array.isArray(documentacion)) {
          requeridos.forEach(docReq => {
            const docEncontrado = documentacion.find(doc => {
              const coincideNombre = doc.descripcionDocumentacion === docReq;
              const tieneArchivo = doc.archivoDocumentacion && doc.archivoDocumentacion !== null && doc.archivoDocumentacion !== '';
              const noEsFaltante = doc.estadoDocumentacion !== 'Faltante';
              return coincideNombre && tieneArchivo && noEsFaltante;
            });
            if (docEncontrado) presentados.push(ComprobanteGenerator.getNombreLegible(docReq));
            else faltantes.push(ComprobanteGenerator.getNombreLegible(docReq));
          });
        }
        setEstadoDoc({ subidos: presentados, faltantes, requeridos });

        const modalidad = insc.modalidad || est.modalidad || 'Sin modalidad';
        const plan = insc.cursoPlan || insc.plan || est.planAnio || est.cursoPlan || 'Sin plan';
            // Usar la misma función de formato que el comprobante para consistencia
            const fecha = ComprobanteGenerator.formatearFecha(insc.fechaInscripcion || est.fechaInscripcion);

        // Construir mensaje base (más estructurado; incluye ventanas de reinscripción según modalidad)
        let mensaje = `Estimado/a ${est.nombre || ''} ${est.apellido || ''},\n\n`;
        mensaje += `Le informamos sobre su estado de inscripción en CEIJA5. A continuación encontrará un resumen y los pasos recomendados:\n\n`;
        mensaje += `Resumen de su inscripción:\n`;
        mensaje += `- Modalidad: ${modalidad}\n`;
        mensaje += `- Curso/Plan: ${plan}\n`;
        mensaje += `- Fecha de inscripción: ${fecha}\n\n`;

        // Documentación presentada (lista detallada, nombres legibles)
        mensaje += `Documentación presentada:\n`;
        if (presentados.length > 0) {
          presentados.forEach(doc => {
            mensaje += `  • ${doc}\n`;
          });
        } else if (!planKey) {
          mensaje += `  No disponible (sin plan/año asignado)\n`;
        } else {
          mensaje += `  Ninguno\n`;
        }

        // Documentación faltante (lista detallada, nombres legibles)
        mensaje += `Documentación faltante:\n`;
        if (faltantes.length > 0) {
          faltantes.forEach(doc => {
            mensaje += `  • ${doc}\n`;
          });
        } else if (!planKey) {
          mensaje += `  No disponible (sin plan/año asignado)\n`;
        } else {
          mensaje += `  Ninguno\n`;
        }
        mensaje += `\n`;

        // Re-inscripción / preinscripción según modalidad
        const modalidadLower = String(modalidad).toLowerCase();
        if (!est.activo) {
          mensaje += `Importante: Usted figura como INACTIVO en el sistema. Para reinscribirse, tenga en cuenta las siguientes ventanas:\n`;
          mensaje += `- Presencial: reinscripción del 20 de febrero al 31 de marzo (documentación completa requerida).\n`;
          mensaje += `- Semipresencial: reinscripción del 20 de febrero al 31 de octubre (documentación completa requerida).\n`;
          mensaje += `Preinscripción vía web: disponible desde noviembre hasta el 20 de febrero (puede preinscribirse online y completar documentación luego).\n\n`;
          if (modalidadLower.includes('presencial')) {
            mensaje += `Recomendación: Complete la documentación antes del 20/02 para asegurar plaza en la modalidad Presencial.\n\n`;
          } else if (modalidadLower.includes('semipresencial') || modalidadLower.includes('semi')) {
            mensaje += `Recomendación: Preinscríbase en línea desde noviembre y confirme su documentación antes del 20/02 para asegurar continuidad.\n\n`;
          } else {
            mensaje += `Recomendación: Verifique fechas y opciones de preinscripción en la administración.\n\n`;
          }
        } else {
          // Activo: recordatorio leve si faltan documentos
          if (faltantes.length > 0) {
            mensaje += `Por favor, complete la documentación faltante para mantener su inscripción activa y evitar bloqueos administrativos.\n\n`;
          }
        }

        mensaje += `Si necesita ayuda, contacte a la administración o responda a este correo.\n\nAtentamente,\nCEIJA5 - Administración`;

        setBody(mensaje);
        setSubject(`Notificación CEIJA5 - ${modalidad} - ${plan}`);
      } catch (error) {
        console.error('Error al preparar previsualización de email:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, estudiante]);

  // Auto-resize textarea so it expands with content and modal overlay handles scrolling
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    // reset height to auto then set to scrollHeight to fit content
    el.style.height = 'auto';
    const sh = el.scrollHeight;
    el.style.height = Math.max(sh, 120) + 'px';
  }, [body, open]);

  // Ya no se usa stateListToString, usamos join(', ') y nombres legibles

  const handleSend = async () => {
    if (!estudiante) return;
    try {
      setLoading(true);
      const docsToSend = Array.isArray(estadoDoc.subidos) && estadoDoc.subidos.length > 0 ? estadoDoc.subidos : (Array.isArray(estudiante.documentos) ? estudiante.documentos : []);
      const result = await notificacionesEstudiantesService.enviarEmailIndividual(estudiante.dni, { subject, body, attachComprobante: true, documentos: docsToSend });
      if (result && result.success) {
        if (alertCtx && alertCtx.showSuccess) alertCtx.showSuccess('Email enviado correctamente');
        if (typeof onSent === 'function') onSent(true, result);
      } else {
        if (alertCtx && alertCtx.showError) alertCtx.showError('No se pudo enviar el email');
        if (typeof onSent === 'function') onSent(false, result);
      }
    } catch (err) {
      console.error('Error al enviar email desde modal:', err);
      if (alertCtx && alertCtx.showError) alertCtx.showError('Error al enviar email: ' + (err.message || '')); 
      if (typeof onSent === 'function') onSent(false, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${escapeHtml(body)}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('\"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  if (!open) return null;

  return (
    <div className="modal-reportes-overlay">
      <div className="modal-reportes-contenido" style={{ maxWidth: 720 }}>
        <div className="modal-reportes-header">
          <h3>Previsualizar Email - {estudiante?.dni}</h3>
          <button className="btn-cerrar-modal" onClick={onClose}>✖</button>
        </div>
        <div className="modal-reportes-body">
          <div style={{ marginBottom: 12 }}>
            <label><strong>Asunto:</strong></label>
            <input style={{ width: '100%', padding: 8, marginTop: 6 }} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label><strong>Mensaje:</strong></label>
            <textarea ref={messageRef} style={{ width: '100%', padding: 10, marginTop: 6, resize: 'vertical', overflow: 'hidden' }} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {/* Mostrar documentos presentados y faltantes de forma clara y legible */}
          <div style={{ marginTop: 12 }}>
            <label><strong>Documentación presentada:</strong></label>
            <div style={{ marginTop: 6 }}>
              {Array.isArray(estadoDoc.subidos) && estadoDoc.subidos.length > 0 ? (
                <ul style={{ margin: '6px 0 0 18px' }}>
                  {estadoDoc.subidos.map((d, i) => (
                    <li key={i} style={{ color: '#495057' }}>{d}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#6b7280', marginTop: 6 }}>Ninguno</div>
              )}
            </div>
            <label style={{ marginTop: 10, display: 'block' }}><strong>Documentación faltante:</strong></label>
            <div style={{ marginTop: 6 }}>
              {Array.isArray(estadoDoc.faltantes) && estadoDoc.faltantes.length > 0 ? (
                <ul style={{ margin: '6px 0 0 18px' }}>
                  {estadoDoc.faltantes.map((d, i) => (
                    <li key={i} style={{ color: '#b91c1c' }}>{d}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#6b7280', marginTop: 6 }}>Ninguno</div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-reportes-footer" style={{ display: 'flex', gap: 8, padding: 16, justifyContent: 'flex-end' }}>
          <button className="btn-reporte" onClick={handlePrint}>🖨️ Imprimir</button>
          <button className="btn-reporte-avanzado" onClick={handleSend} disabled={loading}>{loading ? 'Enviando...' : 'Enviar Email'}</button>
          <button className="btn-cerrar-modal" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

ModalPreviewEmail.propTypes = {
  open: PropTypes.bool.isRequired,
  estudiante: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSent: PropTypes.func
};

export default ModalPreviewEmail;
