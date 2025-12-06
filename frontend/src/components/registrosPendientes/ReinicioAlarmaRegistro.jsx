import jsPDF from "jspdf";
import "jspdf-autotable";
import PropTypes from "prop-types";
import { useContext } from "react";
import { AlertContext } from "../../context/AlertContext";

/**
 * Componente para generar y descargar un PDF de estudiantes con reinicio de alarma (extensión de inscripción).
 * Solo puede ser autorizado por el director.
 * @param {Object[]} registrosPendientes - Lista de registros pendientes (array de objetos).
 */
function ReinicioAlarmaRegistro({ registrosPendientes = [], modoBarra = false }) {
  // Filtrar estudiantes con alarma reiniciada activa
  const estudiantesConExtension = registrosPendientes.filter(
    (reg) => reg.alarmaReiniciada
  );
  const { showInfo } = useContext(AlertContext);

  const handleDescargarPDF = () => {
    if (!estudiantesConExtension.length) {
      showInfo("No hay estudiantes con extensión de inscripción activa.");
      return;
    }
    const doc = new jsPDF();
    // Encabezado institucional
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 153); // Azul oscuro
    doc.setFont("helvetica", "bold");
    doc.text("CEIJA5 LA CALERA CBA", 105, 18, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Reporte de estudiantes con extensión de inscripción (reinicio de alarma)",
      105,
      28,
      { align: "center" }
    );
    doc.setFontSize(10);
    doc.text(
      `Fecha de generación: ${new Date().toLocaleString()}`,
      105,
      36,
      { align: "center" }
    
    );
    // Tabla de datos
    
    const columns = [
      { header: "Apellido y Nombre", dataKey: "nombre" },
      { header: "DNI", dataKey: "dni" },
      { header: "Modalidad", dataKey: "modalidad" },
      { header: "Año/Plan", dataKey: "planAnio" },
      { header: "Fecha reinicio", dataKey: "fechaReinicio" },
      { header: "Motivo", dataKey: "motivoExtension" },
      { header: "Días", dataKey: "diasExtension" },
      { header: "Autorización", dataKey: "autorizacion" },
    ];
    const rows = estudiantesConExtension.map((reg) => ({
      nombre: `${reg.datos.apellido} ${reg.datos.nombre}`,
      dni: reg.dni,
      modalidad: reg.datos.modalidad,
      planAnio: reg.datos.planAnio,
      fechaReinicio: reg.fechaReinicio
        ? new Date(reg.fechaReinicio).toLocaleDateString()
        : "-",
      motivoExtension: reg.motivoExtension || "-",
      diasExtension: reg.diasExtension || "-",
      autorizacion: "Director/a",
    }));
    doc.autoTable({
      startY: 42,
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 51, 153], textColor: 255, fontStyle: "bold" },
      margin: { left: 10, right: 10 },
      didDrawPage: () => {
        // Encabezado en cada página
        doc.setFontSize(16);
        doc.setTextColor(0, 51, 153);
        doc.setFont("helvetica", "bold");
        doc.text("CEIJA5 LA CALERA CBA", 105, 18, { align: "center" });
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Reporte de estudiantes con extensión de inscripción (reinicio de alarma)",
          105,
          28,
          { align: "center" }
        );
        doc.setFontSize(10);
        doc.text(
          `Fecha de generación: ${new Date().toLocaleString()}`,
          105,
          36,
          { align: "center" }
        );
      },
    });
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Autorización: Director/a | Página ${i} de ${pageCount}`,
        105,
        290,
        { align: "center" }
      );
    }
    doc.save("reporte_extension_inscripcion.pdf");
  };

  if (modoBarra) {
    return (
      <button
        onClick={handleDescargarPDF}
        className="btn-unificado"
        title="Descargar PDF de extensiones de inscripción"
      >
        📑 Extensión Inscripción
      </button>
    );
  }
  // Modo central (fallback, no se usa en barra)
  return (
    <div style={{ margin: "1em 0", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onClick={handleDescargarPDF}
        className="btn-unificado"
      >
        📑 Extensión Inscripción
      </button>
    </div>
  );
}

ReinicioAlarmaRegistro.propTypes = {
  registrosPendientes: PropTypes.array.isRequired,
  modoBarra: PropTypes.bool,
};

export default ReinicioAlarmaRegistro;