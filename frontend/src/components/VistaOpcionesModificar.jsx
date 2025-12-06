import ConsultaOpciones from './ConsultaOpciones';
import PropTypes from 'prop-types';

const VistaOpcionesModificar = ({ onSeleccion, onClose, modalidadId, modalidadFiltrada }) => (
    <ConsultaOpciones 
        onSeleccion={onSeleccion}
        titulo=""
        onClose={onClose}
        tituloModal="Seleccionar Tipo de Modificación"
        descripcionModal="Elija cómo desea modificar estudiantes"
        esModificacion={true}
        modalidadId={modalidadId}
        modalidadFiltrada={modalidadFiltrada}
    />
);

VistaOpcionesModificar.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaOpcionesModificar;
