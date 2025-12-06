import ListaEstudiantes from './ListaEstudiantesCRUD';
import ListaEstudiantesPages from '../pages/ListaEstudiantes';
import ErrorBoundary from './ErrorBoundary';
import PropTypes from 'prop-types';

const VistaListaEstudiantes = ({
    soloListar,
    refreshKey,
    modalidadFiltrada,
    modalidadId,
    onAccion,
    onClose,
    onVolver
}) => {
    const ComponenteListaEstudiantes = soloListar ? ListaEstudiantesPages : ListaEstudiantes;
    return (
        <ErrorBoundary>
            <ComponenteListaEstudiantes 
                refreshKey={refreshKey}
                modalidad={modalidadFiltrada}
                onAccion={onAccion}
                onClose={onClose}
                onVolver={onVolver}
                modalidadId={modalidadId}    
            />
        </ErrorBoundary>
    );
};

VistaListaEstudiantes.propTypes = {
    soloListar: PropTypes.bool,
    refreshKey: PropTypes.number.isRequired,
    modalidadFiltrada: PropTypes.string,
    onAccion: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onVolver: PropTypes.func.isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default VistaListaEstudiantes;
