import { useContext } from 'react';
import { CRUDModalidadContext } from './CRUDModalidadContext';

/**
 * Hook para usar el contexto de modalidad
 */
export const useCRUDModalidad = () => {
    const context = useContext(CRUDModalidadContext);
    if (!context) {
        throw new Error('useCRUDModalidad debe ser usado dentro de CRUDModalidadProvider');
    }
    return context;
};