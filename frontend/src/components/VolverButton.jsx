
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';
import '../estilos/botones.css';
import '../estilos/botonClose.css';

const VolverButton = ({ onClick, className }) => {
    return (
        <button
            className={className ? className : 'volver-button'}
            onClick={onClick}
            style={{
                minWidth: '28px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#f0f0f0',
                color: '#333',
                border: '1px solid #ccc',
                padding: 0
            }}
        >
            <FaArrowLeft />
        </button>
    );
};

VolverButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default VolverButton;