import { useCRUDHandlers } from './crud/CRUDHandlers';
import CRUDRouterSwitch from './crud/CRUDRouterSwitch';
import { CRUDModalidadProvider } from './crud/CRUDModalidadProvider';
import PropTypes from 'prop-types';

/**
 * Componente principal de gestión CRUD refactorizado
 * Ahora está dividido en componentes más pequeños y manejables
 */
const GestionCRUDContenido = ({
    isAdmin,
    onClose,
    vistaInicial,
    soloListar,
    modalidad,
    modalidadId,
    user,
    vistaActual,
    setVistaActual,
    estudiante,
    setEstudiante,
    vistaAnterior,
    setVistaAnterior,
    refreshKey,
    setRefreshKey,
    modoModificacion,
    setModoModificacion,
    modoEliminacion
}) => {
    // Usar el sistema unificado de alertas y handlers
    const handlers = useCRUDHandlers({
        estudiante,
        setEstudiante,
        vistaActual,
        setVistaActual,
        vistaAnterior,
        setVistaAnterior,
        setRefreshKey,
        modoModificacion,
        modoEliminacion,
        setModoModificacion
    });

    return (
        <CRUDModalidadProvider
            modalidad={modalidad}
            modalidadId={modalidadId}
            user={user}
        >
            <CRUDRouterSwitch
                vistaActual={vistaActual}
                setVistaActual={setVistaActual}
                estudiante={estudiante}
                setEstudiante={setEstudiante}
                modalidadIdFinal={typeof modalidadId !== 'undefined' && modalidadId !== null ? modalidadId : (modalidad !== undefined && modalidad !== null && modalidad !== '' && !isNaN(Number(modalidad)) ? Number(modalidad) : undefined)}
                modalidad={modalidad}
                modalidadFiltrada={user?.rol === 'admDirector' ? undefined : modalidad}
                vistaInicial={vistaInicial}
                modoModificacion={modoModificacion}
                isAdmin={isAdmin}
                soloListar={soloListar}
                refreshKey={refreshKey}
                setRefreshKey={setRefreshKey}
                handlers={handlers}
                onClose={onClose}
            />
        </CRUDModalidadProvider>
    );
};

// Documentación de flujo de props:
// - modalidadId: number (id de modalidad, preferido para filtrado global, viene desde Preinscripcion/GestionCRUD)
// - modalidad: string (nombre de modalidad, solo para mostrar o fallback)
// - modalidadFiltrada: string (nombre de modalidad filtrada para usuarios no admin)
GestionCRUDContenido.propTypes = {
    isAdmin: PropTypes.bool,
    onClose: PropTypes.func,
    vistaInicial: PropTypes.string,
    soloListar: PropTypes.bool,
    modalidad: PropTypes.string,
    modalidadId: PropTypes.number,
    user: PropTypes.object,
    vistaActual: PropTypes.string.isRequired,
    setVistaActual: PropTypes.func.isRequired,
    estudiante: PropTypes.object,
    setEstudiante: PropTypes.func.isRequired,
    vistaAnterior: PropTypes.string,
    setVistaAnterior: PropTypes.func,
    refreshKey: PropTypes.number,
    setRefreshKey: PropTypes.func,
    modoModificacion: PropTypes.bool,
    setModoModificacion: PropTypes.func,
    modoEliminacion: PropTypes.bool
};

export default GestionCRUDContenido;