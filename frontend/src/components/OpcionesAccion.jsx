import PropTypes from 'prop-types';
import CloseButton from './CloseButton';
import '../estilos/modalUniforme.css'; // Estilos uniformes
import '../estilos/botones.css'; // Estilos de botones

const OpcionesAccion = ({ accion, onSeleccion, onClose }) => {
    const configuraciones = {
        Consultar: {
            titulo: 'Seleccionar Tipo de Consulta',
            descripcion: 'Elija cómo desea consultar estudiantes',
            opcionDNI: {
                titulo: 'Consultar Estudiante por DNI',
                descripcion: 'Buscar un estudiante específico por su número de DNI',
                icono: '🔍'
            },
            opcionLista: {
                titulo: 'Consultar Estudiantes Inscriptos',
                descripcion: 'Ver lista completa de estudiantes inscriptos',
                icono: '📋'
            }
        },
        Modificar: {
            titulo: 'Seleccionar Tipo de Modificación',
            descripcion: 'Elija cómo desea modificar estudiantes',
            opcionDNI: {
                titulo: 'Modificar Estudiante por DNI',
                descripcion: 'Buscar un estudiante específico por su número de DNI',
                icono: '🔍'
            },
            opcionLista: {
                titulo: 'Modificar Estudiantes',
                descripcion: 'Ver lista completa de estudiantes y seleccionar uno para modificar',
                icono: '📋'
            }
        },
        Eliminar: {
            titulo: 'Seleccionar Tipo de Eliminación',
            descripcion: 'Elija cómo desea eliminar estudiantes',
            opcionDNI: {
                titulo: 'Eliminar Estudiante por DNI',
                descripcion: 'Buscar un estudiante específico por su número de DNI',
                icono: '🔍'
            },
            opcionLista: {
                titulo: 'Eliminar Estudiantes',
                descripcion: 'Ver lista completa de estudiantes y seleccionar uno para eliminar',
                icono: '📋'
            }
        }
    };

    const config = configuraciones[accion] || configuraciones.Consultar;

    return (
        <div className="modal-overlay-uniforme">
            <div className="modal-container-uniforme">
                <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                    <CloseButton onClose={onClose} className="boton-principal boton-small" />
                </div>
                
                <div className="modal-header-uniforme">
                    <h2 className="modal-title-uniforme">{config.titulo}</h2>
                    <p className="modal-subtitle-uniforme">{config.descripcion}</p>
                </div>

                <div className="modal-content-uniforme">
                    <div className="opciones-container-uniforme">
                        <button 
                            className="opcion-uniforme-button" 
                            onClick={() => onSeleccion('dni')}
                        >
                            <div className="opcion-icono-uniforme">
                                {config.opcionDNI.icono}
                            </div>
                            <div className="opcion-contenido-uniforme">
                                <h3 className="opcion-titulo-uniforme">{config.opcionDNI.titulo}</h3>
                                <p className="opcion-descripcion-uniforme">{config.opcionDNI.descripcion}</p>
                            </div>
                        </button>
                        
                        <button 
                            className="opcion-uniforme-button" 
                            onClick={() => onSeleccion('lista')}
                        >
                            <div className="opcion-icono-uniforme">
                                {config.opcionLista.icono}
                            </div>
                            <div className="opcion-contenido-uniforme">
                                <h3 className="opcion-titulo-uniforme">{config.opcionLista.titulo}</h3>
                                <p className="opcion-descripcion-uniforme">{config.opcionLista.descripcion}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

OpcionesAccion.propTypes = {
    accion: PropTypes.oneOf(['Consultar', 'Modificar', 'Eliminar']).isRequired,
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default OpcionesAccion;
