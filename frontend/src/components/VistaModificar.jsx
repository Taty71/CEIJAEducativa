import ModificarEstd from '../pages/ModificarEstd';
import PropTypes from 'prop-types';

const VistaModificar = ({ idInscripcion, isAdmin, estudiante, onSuccess, modalidadId, modalidadFiltrada }) => (
    <ModificarEstd 
        idInscripcion={idInscripcion}
        accion="Modificar"
        isAdmin={isAdmin}
        estudiante={estudiante}
        onSuccess={onSuccess}
        modalidadId={modalidadId}
        onClose={() => onSuccess()}
        modalidadFiltrada={modalidadFiltrada}
    />
);

VistaModificar.propTypes = {
    idInscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isAdmin: PropTypes.bool.isRequired,
    estudiante: PropTypes.object,
    onSuccess: PropTypes.func.isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaModificar;
