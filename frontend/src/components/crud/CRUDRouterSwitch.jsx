import VistaOpciones from '../VistaOpciones';
import VistaOpcionesModificar from '../VistaOpcionesModificar';
import VistaOpcionesEliminar from '../VistaOpcionesEliminar';
import VistaBusquedaDNI from '../VistaBusquedaDNI';
import VistaListaEstudiantes from '../VistaListaEstudiantes';
import VistaRegistro from '../VistaRegistro';
import VistaModificar from '../VistaModificar';
import VistaVisor from '../VistaVisor';
import VistaEliminar from '../VistaEliminar';
import { construirEstudianteCompleto } from '../../utils/utilsEstudiante';
import PropTypes from 'prop-types';

/**
 * Componente que maneja el router/switch de todas las vistas CRUD
 */
const CRUDRouterSwitch = ({
    vistaActual,
    setVistaActual,
    estudiante,
    setEstudiante,
    modalidadIdFinal,
    modalidad,
    modalidadFiltrada,
    vistaInicial,
    modoModificacion,
    isAdmin,
    soloListar,
    refreshKey,
    setRefreshKey,
    handlers,
    onClose
}) => {
    switch (vistaActual) {
        case 'opciones':
            return (
                <VistaOpciones 
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onSeleccion={(opcion) => {
                        if (opcion === 'dni') {
                            setVistaActual('busquedaDNI');
                        } else if (opcion === 'inscripciones') {
                            setVistaActual('lista');
                        }
                    }}
                    onClose={onClose}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}
                />
            );

        case 'opcionesModificar':
            return (
                <VistaOpcionesModificar 
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onSeleccion={(opcion) => {
                        if (opcion === 'dni') {
                            setVistaActual('busquedaDNI');
                        } else if (opcion === 'inscripciones') {
                            setVistaActual('listaModificar');
                        }
                    }}
                    onClose={onClose}
                />
            );

        case 'busquedaDNI':
            return (
                <VistaBusquedaDNI 
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onEstudianteEncontrado={handlers.onEstudianteEncontrado}
                    onClose={onClose}
                    onVolver={vistaInicial === 'busquedaDNI' && !modoModificacion ? null : handlers.navHandlers.volverAOpciones}
                    esConsultaDirecta={vistaInicial === 'busquedaDNI' && !modoModificacion}
                    modoModificacion={modoModificacion}
                />
            );

        case 'lista':
        case 'listaModificar':
            return (
                <VistaListaEstudiantes
                    soloListar={soloListar}
                    refreshKey={refreshKey}
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onAccion={modoModificacion ? handlers.onAccionListaModificacion : handlers.onAccionLista}
                    onClose={onClose}
                    onVolver={() => setVistaActual('opciones')}
                />
            );

        case 'opcionesEliminar':
            return (
                <VistaOpcionesEliminar 
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onSeleccion={(opcion) => {
                        if (opcion === 'dni') {
                            setVistaActual('busquedaDNIEliminar');
                        } else if (opcion === 'inscripciones') {
                            setVistaActual('listaEliminar');
                        }
                    }}
                    onClose={onClose}
                />
            );

        case 'busquedaDNIEliminar':
            return (
                <VistaBusquedaDNI 
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onEstudianteEncontrado={handlers.onEstudianteEncontradoEliminacion}
                    onClose={handlers.navHandlers.volverAOpciones}
                    onVolver={handlers.navHandlers.volverAOpciones}
                    modoEliminacion={true}
                />
            );

        case 'listaEliminar':
            return (
                <VistaListaEstudiantes
                    soloListar={false}
                    refreshKey={refreshKey}
                    modalidadId={modalidadIdFinal}
                    modalidad={modalidad}
                    modalidadFiltrada={modalidadFiltrada}
                    onAccion={(accion, estudianteSeleccionado) => {
                        if (accion === 'Ver' || accion === 'Eliminar') {
                            const estudianteCompleto = construirEstudianteCompleto(estudianteSeleccionado);
                            setEstudiante(estudianteCompleto);
                            setVistaActual('confirmarEliminacion');
                        }
                    }}
                    onClose={handlers.navHandlers.volverAOpciones}
                    onVolver={handlers.navHandlers.volverAOpciones}
                />
            );

        case 'registro':
            return (
                <VistaRegistro 
                    modalidad={estudiante?.modalidad || 'Presencial'}
                    isAdmin={isAdmin}
                    onClose={handlers.navHandlers.volverAOpciones}
                />
            );

        case 'modificar':
            return (
                <VistaModificar 
                    idInscripcion={estudiante?.idInscripcion}
                    isAdmin={isAdmin}
                    estudiante={estudiante}
                    onSuccess={() => {
                        setRefreshKey(prev => prev + 1);
                        setVistaActual('lista');
                        handlers.showSuccess('Estudiante modificado exitosamente.');
                    }}
                />
            );

        case 'visor': {
            let esConsulta = false;
            let esEliminacion = false;
            if (estudiante?.esConsultaDesdeModificacion) {
                esConsulta = true;
            } else if (estudiante?.esEliminacionDesdeModificacion) {
                esEliminacion = true;
            } else if (!modoModificacion) {
                esConsulta = true;
            }

            return (
                <VistaVisor 
                    estudiante={estudiante}
                    onClose={modoModificacion
                        ? handlers.navHandlers.volverAOpciones
                        : handlers.navHandlers.cerrarVisorAOpciones
                    }
                    onVolver={handlers.navHandlers.volverDesdeVisor}
                    onModificar={handlers.handleModificar}
                    isConsulta={esConsulta}
                    isEliminacion={esEliminacion}
                />
            );
        }

        case 'confirmarEliminacion':
            return (
                <VistaEliminar 
                    data={{
                        success: true,
                        estudiante: {
                            nombre: estudiante?.nombre,
                            apellido: estudiante?.apellido,
                            dni: estudiante?.dni,
                            cuil: estudiante?.cuil,
                            fechaNacimiento: estudiante?.fechaNacimiento,
                            tipoDocumento: estudiante?.tipoDocumento,
                            paisEmision: estudiante?.paisEmision
                        },
                        domicilio: {
                            calle: estudiante?.calle,
                            numero: estudiante?.numero,
                            barrio: estudiante?.barrio,
                            localidad: estudiante?.localidad,
                            provincia: estudiante?.provincia
                        },
                        inscripcion: {
                            modalidad: estudiante?.modalidad,
                            plan: estudiante?.planAnio,
                            modulo: estudiante?.modulo,
                            estado: estudiante?.estadoInscripcion,
                            fechaInscripcion: estudiante?.fechaInscripcion
                        },
                        documentacion: estudiante?.documentacion || []
                    }}
                    onClose={handlers.navHandlers.volverAOpciones}
                    onVolver={handlers.navHandlers.volverAOpciones}
                    onEliminar={handlers.handleEliminar}
                />
            );

        default:
            return null;
    }
};

CRUDRouterSwitch.propTypes = {
    vistaActual: PropTypes.string.isRequired,
    setVistaActual: PropTypes.func.isRequired,
    estudiante: PropTypes.object,
    setEstudiante: PropTypes.func.isRequired,
    modalidadIdFinal: PropTypes.number,
    modalidad: PropTypes.string,
    modalidadFiltrada: PropTypes.string,
    vistaInicial: PropTypes.string,
    modoModificacion: PropTypes.bool,
    isAdmin: PropTypes.bool,
    soloListar: PropTypes.bool,
    refreshKey: PropTypes.number,
    setRefreshKey: PropTypes.func,
    handlers: PropTypes.object.isRequired,
    onClose: PropTypes.func
};

export default CRUDRouterSwitch;