import PropTypes from 'prop-types';
import { generarListadoEstudiantesPDF, generarListadoCombinadoPDF } from './reportes/reportesBasicos';
import { normalizarTexto } from './reportes/utils';
// import { useAlerts } from '../../hooks/useAlerts';

// `activo` es tinyint(1) en la BD (1=activo, 0=inactivo). Usamos Number() para comparar.
const opciones = [
  {
    label: 'Activos + Inscripción Pendiente',
    filtro: (e) => Number(e.activo) === 1 && (String(e.estadoInscripcion || '').toLowerCase() === 'pendiente'),
    nombre: 'Activos_Pendiente',
    titulo: 'Estudiantes Activos con Inscripción Pendiente',
  },
  {
    label: 'Activos + Inscripción Completa',
    filtro: (e) => Number(e.activo) === 1 && (String(e.estadoInscripcion || '').toLowerCase() === 'completa'),
    nombre: 'Activos_Completa',
    titulo: 'Estudiantes Activos con Inscripción Completa',
  },
  {
    label: 'Inactivos + Inscripción Completa',
    filtro: (e) => Number(e.activo) === 0 && (String(e.estadoInscripcion || '').toLowerCase() === 'completa'),
    nombre: 'Inactivos_Completa',
    titulo: 'Estudiantes Inactivos con Inscripción Completa',
  },
  {
    label: 'Inactivos + Inscripción Pendiente',
    filtro: (e) => Number(e.activo) === 0 && (String(e.estadoInscripcion || '').toLowerCase() === 'pendiente'),
    nombre: 'Inactivos_Pendiente',
    titulo: 'Estudiantes Inactivos con Inscripción Pendiente',
  },
];

const ModalReportesEstudiantes = ({ open, onClose, estudiantes, showInfo }) => {
  if (!open) return null;

  const generarPDF = (filtro, nombre, titulo) => {
    const lista = estudiantes.filter(filtro);
    if (lista.length === 0) {
      showInfo(`No hay registro de estudiantes para: ${titulo}`);
      return;
    }
    // Usar la función estandarizada
    generarListadoEstudiantesPDF(lista, titulo, nombre);
  };

  // Genera un único PDF que contiene las 4 secciones
  const generarPDFTodos = () => {
    // Para simplificar y mantener consistencia, generamos reportes individuales secuencialmente
    // O idealmente deberíamos tener una función combinada.
    // Como solución rápida para "unificar formato", llamaremos a la función individual múltiples veces?
    // No, el usuario espera un solo archivo.
    // Implementaremos una lógica básica aquí usando el estilo nuevo, o importaremos una función combinada.
    // Por ahora, para garantizar el estilo "prolijo", usaremos los mismos componentes visuales pero en un loop.

    // NOTA: Para no duplicar lógica compleja de autoTable aquí, lo ideal sería mover toda la lógica a reportesBasicos.js
    // A falta de tiempo para una refactorización mayor, invocaré una alerta diciendo que esta función
    // se actualizará o intentaré hacer lo mejor posible.
    // REALIDAD: El usuario pidió unificar.

    // Opción: Iterar opciones y generar un PDF con autoTable.

    // Recopilar datos y usar función combinada
    const secciones = opciones.map(op => ({
      titulo: op.titulo,
      data: estudiantes.filter(op.filtro)
    })).filter(s => s.data.length > 0);

    if (secciones.length === 0) {
      showInfo('No hay datos para generar el reporte combinado.');
      return;
    }

    generarListadoCombinadoPDF(secciones, "Todos_Reportes");
  };

  return (
    <div className="modal-reportes-overlay">
      <div className="modal-reportes-contenido">
        <div className="modal-reportes-header">
          <h3>Emitir Reportes PDF</h3>
          <button className="btn-cerrar-modal" onClick={onClose}>✖</button>
        </div>
        <div className="modal-reportes-body">
          <p>Elige el reporte que deseas emitir:</p>
          <div className="reportes-grid">
            {opciones.map((op) => (
              <button
                key={op.nombre}
                className="btn-reporte-accion"
                onClick={() => generarPDF(op.filtro, op.nombre, op.titulo)}
              >
                {op.label}
              </button>
            ))}
            <button
              key="Todos_Reportes"
              className="btn-reporte-accion btn-reporte-todos"
              onClick={() => generarPDFTodos()}
            >
              Emitir Todos los Reportes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

ModalReportesEstudiantes.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  estudiantes: PropTypes.array.isRequired,
  showInfo: PropTypes.func.isRequired,
};

export default ModalReportesEstudiantes;
