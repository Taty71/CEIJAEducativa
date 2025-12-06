import PropTypes from 'prop-types';
import '../estilos/botones.css';
import '../estilos/botonClose.css';

const CloseButton = ({ onClose, className }) => {
    const getClassName = () => {
        if (className) {
            return className;
        }
        return 'boton-principal';
    };

    return (
        <button
            className={`cerrar-button ${getClassName()}`}
            onClick={onClose}
        >
            ✖
        </button>
    );
};

CloseButton.propTypes = {
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default CloseButton;
