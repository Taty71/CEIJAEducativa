import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import '../estilos/alertaMens.css';

/**
 * Componente unificado de alertas que combina AlertaMens y AlertSystem
 * Puede mostrar alertas simples, flotantes, modales de confirmación y alertas de carga
 * @param {string} [text] - Texto para alerta simple (modo legacy)
 * @param {'info'|'success'|'error'|'warning'} [variant='info'] - Tipo de alerta simple
 * @param {number} [duration=4000] - Duración en ms antes del auto-cierre
 * @param {Function} [onClose] - Callback al cerrar alerta simple
 * @param {Array} [alerts] - Lista de alertas flotantes
 * @param {Object} [modal] - Modal de confirmación activo
 * @param {Function} [onCloseAlert] - Función para cerrar una alerta flotante
 * @param {Function} [onCloseModal] - Función para cerrar el modal
 * @param {'simple'|'floating'|'modal'} [mode='simple'] - Modo de visualización
 */
function AlertaMens({ 
    // Props para modo simple (legacy)
    text, 
    variant = 'info', 
    duration = 4000, 
    onClose,
    // Props para modo avanzado
    alerts,
    modal,
    onCloseAlert,
    onCloseModal,
    mode = 'simple'
}) {
    const [visible, setVisible] = useState(true);

    // Efecto para auto-cerrar alertas simples
    useEffect(() => {
        if (text && duration > 0 && mode === 'simple') {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [text, duration, onClose, mode]);

    // Funciones auxiliares para AlertSystem
    const getAlertIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            case 'loading':
                return '⟳';
            default:
                return 'ℹ';
        }
    };

    const getAlertTitle = (type) => {
        switch (type) {
            case 'success':
                return '';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Advertencia';
            case 'info':
                return 'Información';
            case 'loading':
                return 'Cargando...';
            default:
                return 'Notificación';
        }
    };

    // Modo simple (legacy) - alerta centrada
    if (mode === 'simple' && text) {
        if (!visible) return null;
        return (
            <div className={`alerta-mens alerta-${variant}`} style={{ 
                position: 'fixed', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 1000 
            }}>
                {text}
            </div>
        );
    }

    // Modo floating - alertas flotantes en la esquina
    if (mode === 'floating') {

        return (
            <>
                {/* Alertas Flotantes */}
                {alerts && alerts.length > 0 && (
                    <div className="alert-overlay">

                        {alerts.map((alert) => (
                            <div key={alert.id} className={`alert-container ${alert.type}`}>
                                <div className="alert-header">
                                    <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                                    <h4 className="alert-title">{getAlertTitle(alert.type)}</h4>
                                </div>
                                <p className="alert-message">{alert.message}</p>
                                {alert.type !== 'loading' && (
                                    <button 
                                        className="alert-close"
                                        onClick={() => onCloseAlert && onCloseAlert(alert.id)}
                                        aria-label="Cerrar alerta"
                                    >
                                        ×
                                    </button>
                                )}
                                {alert.type === 'loading' && (
                                    <div className="loading-bar">
                                        <div className="loading-progress"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Confirmación */}
                {modal && modal.show && (
                    <div className="alert-overlay modal-overlay">
                        <div className="alert-container modal-container">
                            <div className="alert-header">
                                <span className="alert-icon">❓</span>
                                <h4 className="alert-title">Confirmación</h4>
                            </div>
                            <p className="alert-message">{modal.message}</p>
                            <div className="alert-actions">
                                <button 
                                    className="btn-cancel"
                                    onClick={modal.onCancel || onCloseModal}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="btn-confirm"
                                    onClick={modal.onConfirm}
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return null;
}

AlertaMens.propTypes = {
    // Props para modo simple (legacy)
    text: PropTypes.string,
    variant: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
    duration: PropTypes.number,
    onClose: PropTypes.func,
    // Props para modo avanzado
    alerts: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'loading']).isRequired,
            message: PropTypes.string.isRequired
        })
    ),
    modal: PropTypes.shape({
        show: PropTypes.bool.isRequired,
        message: PropTypes.string.isRequired,
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func
    }),
    onCloseAlert: PropTypes.func,
    onCloseModal: PropTypes.func,
    mode: PropTypes.oneOf(['simple', 'floating', 'modal'])
};

export default AlertaMens;
