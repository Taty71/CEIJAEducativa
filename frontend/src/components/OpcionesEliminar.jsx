import PropTypes from 'prop-types';
import CloseButton from './CloseButton';
import '../estilos/modalUniforme.css';
import '../estilos/botones.css';

const OpcionesEliminar = ({ onSeleccion, onClose }) => {
    return (
        <div className="modal-container-uniforme">
            {/* Contenedor de botones superior */}
            <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                <CloseButton onClose={onClose} className="boton-principal boton-small" />
            </div>
            {/* Header del modal */}
            <div className="modal-header-uniforme">
                <h2>Seleccionar tipo de eliminación</h2>
                <p>Elija cómo desea eliminar estudiantes</p>
            </div>
            {/* Opciones */}
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
                        <h3>Eliminar Estudiante por DNI</h3>
                        <p>Buscar un estudiante específico por su número de DNI</p>
                    </div>
                </button>
                <button 
                    className="opcion-uniforme-button" 
                    onClick={() => onSeleccion('lista')}
                >
                    <div className="opcion-icono-uniforme">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18"/>
                            <path d="M3 12h18"/>
                            <path d="M3 18h18"/>
                        </svg>
                    </div>
                    <div className="opcion-contenido-uniforme">
                        <h3>Ver a todos los estudiantes</h3>
                        <p>Ver lista completa de estudiantes inscriptos en el sistema</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

OpcionesEliminar.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default OpcionesEliminar;
