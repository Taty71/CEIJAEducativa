import { useEffect, useState, useRef, useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';
import ComprobanteGenerator from '../ComprobanteGenerator';
import PropTypes from 'prop-types';
import '../../estilos/modalM.css';
import service from '../../services/serviceInscripcion';
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
        const fecha = ComprobanteGenerator.formatearFecha(insc.fechaInscripcion || est.fechaInscripcion);

        // Construir mensaje HTML con estilos
        let mensajeHTML = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">`;
        mensajeHTML += `<h2 style="color: #2d4177; border-bottom: 2px solid #2d4177; padding-bottom: 10px;">Notificación de Estado de Inscripción</h2>`;
        mensajeHTML += `<p>Estimado/a <strong>${est.nombre || ''} ${est.apellido || ''}</strong>,</p>`;
        mensajeHTML += `<p>Le informamos sobre su estado de inscripción en CEIJA5. A continuación encontrará un resumen y los pasos recomendados:</p>`;

        mensajeHTML += `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">`;
        mensajeHTML += `<h3 style="color: #2d4177; margin-top: 0;">Resumen de su inscripción:</h3>`;
        mensajeHTML += `<ul style="list-style-type: none; padding-left: 0;">`;
        mensajeHTML += `<li><strong>Modalidad:</strong> ${modalidad}</li>`;
        mensajeHTML += `<li><strong>Curso/Plan:</strong> ${plan}</li>`;
        mensajeHTML += `<li><strong>Fecha de inscripción:</strong> ${fecha}</li>`;
        mensajeHTML += `</ul>`;
        mensajeHTML += `</div>`;

        // Documentación presentada
        mensajeHTML += `<h4 style="color: #2d4177; margin-bottom: 10px;">Documentación presentada:</h4>`;
        if (presentados.length > 0) {
          mensajeHTML += `<ul>`;
          presentados.forEach(doc => {
            mensajeHTML += `<li>${doc}</li>`;
          });
          mensajeHTML += `</ul>`;
        } else if (!planKey) {
          mensajeHTML += `<p><em>No disponible (sin plan/año asignado)</em></p>`;
        } else {
          mensajeHTML += `<p><em>Ninguno</em></p>`;
        }

        // Documentación faltante
        mensajeHTML += `<h4 style="color: #c0392b; margin-bottom: 10px;">Documentación faltante:</h4>`;
        if (faltantes.length > 0) {
          mensajeHTML += `<ul>`;
          faltantes.forEach(doc => {
            mensajeHTML += `<li style="color: #c0392b;">${doc}</li>`;
          });
          mensajeHTML += `</ul>`;
        } else if (!planKey) {
          mensajeHTML += `<p><em>No disponible (sin plan/año asignado)</em></p>`;
        } else {
          mensajeHTML += `<p><em>Ninguno</em></p>`;
        }

        // Re-inscripción / preinscripción
        const modalidadLower = String(modalidad).toLowerCase();
        if (!est.activo) {
          mensajeHTML += `<div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">`;
          mensajeHTML += `<strong>Importante:</strong> Usted figura como <strong>INACTIVO</strong> en el sistema. Para reinscribirse, tenga en cuenta las siguientes ventanas:<br/>`;
          mensajeHTML += `<ul>`;
          mensajeHTML += `<li><strong>Presencial:</strong> reinscripción del 20 de febrero al 31 de marzo (documentación completa requerida).</li>`;
          mensajeHTML += `<li><strong>Semipresencial:</strong> reinscripción del 20 de febrero al 31 de octubre (documentación completa requerida).</li>`;
          mensajeHTML += `</ul>`;
          mensajeHTML += `<p>Preinscripción vía web: disponible desde noviembre hasta el 20 de febrero.</p>`;

          if (modalidadLower.includes('presencial')) {
            mensajeHTML += `<p><strong>Recomendación:</strong> Complete la documentación antes del 20/02 para asegurar plaza en la modalidad Presencial.</p>`;
          } else if (modalidadLower.includes('semipresencial') || modalidadLower.includes('semi')) {
            mensajeHTML += `<p><strong>Recomendación:</strong> Preinscríbase en línea desde noviembre y confirme su documentación antes del 20/02 para asegurar continuidad.</p>`;
          } else {
            mensajeHTML += `<p><strong>Recomendación:</strong> Verifique fechas y opciones de preinscripción en la administración.</p>`;
          }
          mensajeHTML += `</div>`;
        } else {
          if (faltantes.length > 0) {
            mensajeHTML += `<p style="margin-top: 20px;">Por favor, complete la documentación faltante para mantener su inscripción activa y evitar bloqueos administrativos.</p>`;
          }
        }

        mensajeHTML += `<p style="margin-top: 30px;">Si necesita ayuda, contacte a la administración o responda a este correo.</p>`;
        mensajeHTML += `<p>Atentamente,<br/><strong>CEIJA5 - Administración</strong></p>`;
        mensajeHTML += `</div>`;

        setBody(mensajeHTML);
        setSubject(`Notificación CEIJA5 - ${modalidad} - ${plan}`);
      } catch (error) {
        console.error('Error al preparar previsualización de email:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, estudiante]);

  const handleSend = async () => {
    if (!estudiante) return;
    try {
      setLoading(true);
      const docsToSend = Array.isArray(estadoDoc.subidos) && estadoDoc.subidos.length > 0 ? estadoDoc.subidos : (Array.isArray(estudiante.documentos) ? estudiante.documentos : []);
      // Enviar el body HTML directamente
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
    printWindow.document.write(body);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!open) return null;

  return (
    <div className="modal-reportes-overlay">
      <div className="modal-reportes-contenido" style={{ maxWidth: 800, borderRadius: '12px', overflow: 'hidden', padding: 0 }}>
        {/* Header con estilo azul */}
        <div className="modal-reportes-header" style={{
          background: '#2d4177',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 'none'
        }}>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem', color: 'white' }}>Previsualizar Email - {estudiante?.dni}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-reportes-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#495057' }}>Asunto:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#495057' }}>Mensaje (Vista Previa):</label>
            <div
              contentEditable
              dangerouslySetInnerHTML={{ __html: body }}
              onInput={(e) => setBody(e.currentTarget.innerHTML)}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                backgroundColor: 'white',
                overflowY: 'auto',
                fontFamily: 'Arial, sans-serif'
              }}
            />
            <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: 5 }}>Puede editar el contenido directamente en el recuadro.</p>
          </div>
        </div>

        <div className="modal-reportes-footer" style={{
          padding: '15px 20px',
          background: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10
        }}>
          <button
            className="btn-reporte"
            onClick={handlePrint}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            🖨️ Imprimir
          </button>
          <button
            className="btn-reporte-avanzado"
            onClick={handleSend}
            disabled={loading}
            style={{
              background: loading ? '#a5b4fc' : '#2d4177',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(45, 65, 119, 0.2)'
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Email'}
          </button>
          <button
            className="btn-cerrar-modal"
            onClick={onClose}
            style={{
              background: 'white',
              color: '#495057',
              border: '1px solid #ced4da',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Cancelar
          </button>
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
