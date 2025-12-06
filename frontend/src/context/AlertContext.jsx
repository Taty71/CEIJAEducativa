import PropTypes from 'prop-types';
import { useAlerts } from '../hooks/useAlerts';
import AlertaMens from '../components/AlertaMens';
import { AlertContext } from './alertContextDefinition.js';

/**
 * Provider global de alertas para toda la aplicación
 */
export const AlertProvider = ({ children }) => {
    const alertMethods = useAlerts();
    


    return (
        <AlertContext.Provider value={alertMethods}>
            {children}
            {/* AlertaMens global flotante */}
            <AlertaMens 
                alerts={alertMethods.alerts} 
                modal={alertMethods.modal}
                onCloseAlert={alertMethods.removeAlert}
                onCloseModal={alertMethods.closeModal}
                mode="floating"
            />
        </AlertContext.Provider>
    );
};

AlertProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Re-exportar AlertContext para que otros componentes puedan importarlo
export { AlertContext };