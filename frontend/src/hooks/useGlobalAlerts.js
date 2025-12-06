import { useContext } from 'react';
import { AlertContext } from '../context/alertContextDefinition';

/**
 * Hook para usar el contexto de alertas globales
 */
export const useGlobalAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useGlobalAlerts debe ser usado dentro de un AlertProvider');
    }
    return context;
};