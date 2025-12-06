import PropTypes from 'prop-types';
import CloseButton from './CloseButton';
import '../estilos/modalUniforme.css'; // Estilos uniformes
import '../estilos/botones.css'; // Botones unificados

const OpcionesModificar = ({ onSeleccion, onClose }) => {
    return (
        <div className="modal-container-uniforme">
                <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                    <CloseButton onClose={onClose} className="boton-principal boton-small" />
                </div>
            <div className="modal-header-uniforme">
                <h2>Seleccionar Tipo de Modificación</h2>
                <p>Elija cómo desea modificar estudiantes</p>
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
                        <h3>Modificar Estudiante por DNI</h3>
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
                        <h3>Modificar Estudiantes</h3>
                        <p>Ver lista completa de estudiantes y seleccionar uno para modificar</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

OpcionesModificar.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default OpcionesModificar;
