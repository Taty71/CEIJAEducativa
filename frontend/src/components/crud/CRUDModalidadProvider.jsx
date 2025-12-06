import PropTypes from 'prop-types';
import { CRUDModalidadContext } from './CRUDModalidadContext';

/**
 * Proveedor del contexto de modalidad
 */
export const CRUDModalidadProvider = ({ 
    children,
    modalidad,
    modalidadId,
    user
}) => {
    // Calcular modalidadIdFinal
    const modalidadIdFinal = typeof modalidadId !== 'undefined' && modalidadId !== null 
        ? modalidadId 
        : (modalidad !== undefined && modalidad !== null && modalidad !== '' && !isNaN(Number(modalidad)) 
            ? Number(modalidad) 
            : undefined);

    // Calcular modalidadFiltrada para usuarios no admin
    const modalidadFiltrada = user?.rol === 'admDirector' ? undefined : modalidad;

    const contextValue = {
        modalidad,
        modalidadId,
        modalidadIdFinal,
        modalidadFiltrada,
        user
    };

    return (
        <CRUDModalidadContext.Provider value={contextValue}>
            {children}
        </CRUDModalidadContext.Provider>
    );
};

CRUDModalidadProvider.propTypes = {
    children: PropTypes.node.isRequired,
    modalidad: PropTypes.string,
    modalidadId: PropTypes.number,
    user: PropTypes.object
};