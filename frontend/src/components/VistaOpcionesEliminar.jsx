import ConsultaOpciones from './ConsultaOpciones';
import PropTypes from 'prop-types';

const VistaOpcionesEliminar = ({ onSeleccion, onClose, modalidadId, modalidadFiltrada }) => (
    <ConsultaOpciones 
        onSeleccion={onSeleccion}
        onClose={onClose}
        tituloModal="Seleccionar Tipo de Eliminación"
        descripcionModal="Elija cómo desea eliminar estudiantes"
        esModificacion={false}
        titulo="Eliminar "
        modalidadId={modalidadId}
        modalidadFiltrada={modalidadFiltrada}
    />
);

VistaOpcionesEliminar.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaOpcionesEliminar;
