import PropTypes from 'prop-types';
import CloseButton from './CloseButton';
import VolverButton from './VolverButton';
import "../estilos/modalUniforme.css";

const ConsultaOpciones = ({ onSeleccion, titulo = "", onClose, onVolver, tituloModal = "Seleccionar Tipo de Consulta", descripcionModal = "Elija cómo desea consultar estudiantes", esModificacion = false }) => {
    // Determinar el tipo de modal para colores diferenciados basado en el título del modal
    const tipoModal = tituloModal.includes("Eliminación") ? "eliminar" : 
                     tituloModal.includes("Modificación") ? "modificar" : "consultar";
    
    return (
        <div className="modal-overlay-uniforme">
            <div className={`modal-container-uniforme modal-${tipoModal}-uniforme`}>
                {/* Contenedor de botones superior */}
                <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                    {onVolver && <VolverButton onClick={onVolver} className="boton-principal boton-small" />}
                    <CloseButton onClose={onClose} className="boton-principal boton-small" />
                </div>
                <div className="modal-header-uniforme">
                    <h2 className="modal-title-uniforme">{tituloModal}</h2>
                    <p className="modal-subtitle-uniforme">{descripcionModal}</p>
                </div>
                <div className="opciones-container-uniforme">
                    <button 
                        className="opcion-uniforme-button" 
                        onClick={() => onSeleccion('dni')}
                    >
                        <div className="opcion-icono-uniforme">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </div>
                        <div className="opcion-contenido-uniforme">
                            <h3 className="opcion-titulo-uniforme">{titulo}{esModificacion ? "Modificar Estudiante por DNI" : titulo.includes("Eliminar") ? "Estudiante por DNI" : "Buscar Estudiante por DNI"}</h3>
                            <p className="opcion-descripcion-uniforme">Buscar un estudiante específico por su número de DNI</p>
                        </div>
                    </button>
                    <button 
                        className="opcion-uniforme-button" 
                        onClick={() => onSeleccion('inscripciones')}
                    >
                        <div className="opcion-icono-uniforme">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18"/>
                                <path d="M3 12h18"/>
                                <path d="M3 18h18"/>
                            </svg>
                        </div>
                        <div className="opcion-contenido-uniforme">
                            <h3 className="opcion-titulo-uniforme">{titulo}{esModificacion ? "Modificar Estudiantes" : titulo.includes("Eliminar") ? "Estudiantes" : "Ver Todos los Estudiantes"}</h3>
                            <p className="opcion-descripcion-uniforme">{esModificacion ? "Ver lista completa de estudiantes y seleccionar uno para modificar" : titulo.includes("Eliminar") ? "Ver lista completa de estudiantes y seleccionar uno para eliminar" : "Ver lista completa de estudiantes inscriptos en el sistema"}</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

ConsultaOpciones.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    titulo: PropTypes.string, // Prop opcional para personalizar el título
    onClose: PropTypes.func,
    onVolver: PropTypes.func,
    tituloModal: PropTypes.string,
    descripcionModal: PropTypes.string,
    esModificacion: PropTypes.bool, // Indica si está en modo modificación
};

export default ConsultaOpciones;