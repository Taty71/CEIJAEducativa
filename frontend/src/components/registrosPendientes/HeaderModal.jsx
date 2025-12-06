import PropTypes from 'prop-types';
import CloseButton from '../CloseButton';

const HeaderModal = ({ 
    cantidadTotal, 
    fechaActualizacion, 
    onCerrar 
}) => {
    return (
        <div className="modal-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e0e0e0'
        }}>
            <div>
                <h2 style={{ margin: 0, color: '#e7cdcdff' }}>
                    📋 Registros Pendientes
                </h2>
                <div style={{
                    fontSize: '0.9rem',
                    color: '#aba6a6ff',
                    marginTop: '5px'
                }}>
                    Total: <strong>{cantidadTotal}</strong> registros
                    {fechaActualizacion && (
                        <span style={{ marginLeft: '15px' }}>
                            📅 Actualizado: {fechaActualizacion}
                        </span>
                    )}
                </div>
            </div>
            <CloseButton onClose={onCerrar} className="cerrar-button" />
        </div>
    );
};

HeaderModal.propTypes = {
    cantidadTotal: PropTypes.number.isRequired,
    fechaActualizacion: PropTypes.string,
    onCerrar: PropTypes.func.isRequired
};

export default HeaderModal;