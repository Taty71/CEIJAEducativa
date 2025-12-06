import EliminarEstd from '../pages/EliminarEstd';
import PropTypes from 'prop-types';

const VistaEliminar = ({ data, onClose, onVolver, onEliminar, modalidadId }) => (
    <EliminarEstd 
        data={data}
        onClose={onClose}
        onVolver={onVolver}
        onEliminar={onEliminar}
        modalidadId={modalidadId}
    />
);

VistaEliminar.propTypes = {
    data: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onVolver: PropTypes.func.isRequired,
    onEliminar: PropTypes.func.isRequired,
    modalidadId: PropTypes.number.isRequired
};

export default VistaEliminar;
