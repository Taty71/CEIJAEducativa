import ConsultaOpciones from './ConsultaOpciones';

const VistaOpciones = ({ onSeleccion, onClose, modalidadId, modalidadFiltrada }) => (
    <ConsultaOpciones 
        onSeleccion={onSeleccion}
        titulo=""
        onClose={onClose}
        tituloModal="Seleccionar Tipo de Consulta"
        descripcionModal="Elija cómo desea consultar estudiantes"
        esModificacion={false}
        modalidadId={modalidadId}
        modalidadFiltrada={modalidadFiltrada}
    />
);

import PropTypes from 'prop-types';

VistaOpciones.propTypes = {
    onSeleccion: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaOpciones;
