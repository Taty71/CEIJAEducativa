import React from 'react';
import './ModalFooter.css';

const noop = () => {};

export default function ModalFooter({
  onUrgentes = noop,
  onTodos = noop,
  onReporteTxt = noop,
  onReporteExcel = noop,
  onReportePdf = noop,
  onExtensionInscripcion = noop,
  onTest7Dias = noop,
  onVerificarDuplicados = noop,
  onLimpiarDuplicados = noop,
}) {
  return (
    <footer className="mrp-footer" role="contentinfo">
      <div className="mrp-footer__inner">
        <div className="mrp-col mrp-col--notifications">
          <h4 className="mrp-title">Notificaciones por Email</h4>
          <div className="mrp-row">
            <button className="mrp-btn mrp-btn--primary" onClick={onUrgentes}>
              ⚡ Urgentes
            </button>
          </div>
          <div className="mrp-row mrp-row--spacer" />
          <div className="mrp-row">
            <button className="mrp-btn mrp-btn--secondary" onClick={onTodos}>
              📧 Todos
            </button>
          </div>
          <div className="mrp-notes">
            <p><strong>Notificar:</strong> Email individual con documentos presentados/faltantes y días restantes</p>
            <p><strong>Urgentes:</strong> Solo estudiantes con ≤3 días para completar</p>
            <p><strong>Todos:</strong> Notificar a todos los estudiantes pendientes</p>
          </div>
        </div>

        <div className="mrp-col mrp-col--reports">
          <h4 className="mrp-title">Reportes y Descargas</h4>
          <div className="mrp-vertical-buttons">
            <button className="mrp-btn mrp-btn--outline" onClick={onReporteTxt}>Reporte TXT</button>
            <button className="mrp-btn mrp-btn--outline" onClick={onReporteExcel}>Reporte Excel</button>
            <button className="mrp-btn mrp-btn--outline" onClick={onReportePdf}>Reporte PDF</button>
            <button className="mrp-btn mrp-btn--primary" onClick={onExtensionInscripcion}>Extensión Inscripción</button>
          </div>
        </div>

        <div className="mrp-col mrp-col--verify">
          <h4 className="mrp-title">Verificación</h4>
          <div className="mrp-vertical-buttons">
            <button className="mrp-btn mrp-btn--outline" onClick={onTest7Dias}>Test 7 días</button>
            <button className="mrp-btn mrp-btn--outline" onClick={onVerificarDuplicados}>Verificar duplicados</button>
            <button className="mrp-btn mrp-btn--outline" onClick={onLimpiarDuplicados}>Limpiar duplicados</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
