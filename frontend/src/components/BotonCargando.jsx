// Importamos los módulos necesarios
import '../estilos/modal.css';
import '../estilos/botonCargando.css';
import PropTypes from 'prop-types';
import { ClimbingBoxLoader } from 'react-spinners'; // Asegúrate de que este paquete esté instalado


const BotonCargando = ({ loading, children = "Cargando...", className = '', type = 'button', ...props }) => {
    const combinedClass = `boton-cargando ${className} ${loading ? 'disabled' : ''}`.trim();
    return (
        <button
            type={type}
            className={combinedClass}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <div className="spinner-overlay">
                    <ClimbingBoxLoader color="#2d4177" size={15} />
                </div>
            ) : (
                children
            )}
        </button>
    );
};

BotonCargando.propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node,
};

export default BotonCargando;