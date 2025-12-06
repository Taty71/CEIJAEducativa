import GestionEstudiante from '../pages/GestionEstudiante';
import PropTypes from 'prop-types';

const VistaRegistro = ({ modalidad, isAdmin, onClose, modalidadId, modalidadFiltrada }) => (
    <GestionEstudiante 
        modalidad={modalidad}
        accion="Registrar"
        isAdmin={isAdmin}
        onClose={onClose}
        modalidadId={modalidadId}
        modalidadFiltrada={modalidadFiltrada}
    />
);

VistaRegistro.propTypes = {
    modalidad: PropTypes.string,
    isAdmin: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaRegistro;
