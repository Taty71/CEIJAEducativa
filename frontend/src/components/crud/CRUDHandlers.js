import { useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';
import serviceInscripcion from '../../services/serviceInscripcion';
import { construirEstudianteCompleto } from '../../utils/utilsEstudiante';
import {
    handleEstudianteEncontrado,
    handleAccionEstudiante,
    handleVolverAOpciones,
    handleVolverALista,
    handleVolverABusquedaDNI,
    handleVolverDesdeVisor,
    handleCerrarVisorAOpciones,
} from '../../utils/handlersCrud';

/**
 * Hook personalizado que maneja todas las acciones CRUD
 */
export const useCRUDHandlers = ({
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
}) => {
    const { showSuccess, showError } = useContext(AlertContext);

    // Handler para estudiante encontrado en búsqueda DNI
    const onEstudianteEncontrado = (resultado) => {
        if (modoModificacion) {
            if (resultado?.success && resultado.estudiante) {
                const estudianteCompleto = construirEstudianteCompleto(resultado);
                setEstudiante(estudianteCompleto);
                setVistaAnterior(vistaActual);
                setVistaActual('visor');
            }
        } else {
            handleEstudianteEncontrado(
                resultado,
                setEstudiante,
                setVistaAnterior,
                vistaActual,
                setVistaActual
            );
        }
    };

    // Handler para estudiante encontrado en búsqueda DNI para eliminación
    const onEstudianteEncontradoEliminacion = (resultado) => {
        if (resultado?.success && resultado.estudiante) {
            const estudianteCompleto = construirEstudianteCompleto(resultado);
            setEstudiante(estudianteCompleto);
            setVistaActual('confirmarEliminacion');
        } else {
            showError(resultado?.error || 'Error al buscar estudiante');
        }
    };

    // Handler para acciones desde la lista
    const onAccionLista = (accion, estudianteSeleccionado) => {
        if (accion === 'Eliminar') {
            setEstudiante(construirEstudianteCompleto(estudianteSeleccionado));
            setVistaActual('confirmarEliminacion');
        } else {
            handleAccionEstudiante(
                accion,
                estudianteSeleccionado,
                setEstudiante,
                setVistaAnterior,
                vistaActual,
                setVistaActual,
                setModoModificacion
            );
        }
    };

    // Handler para acciones desde la lista en modo modificación
    const onAccionListaModificacion = (accion, estudianteSeleccionado) => {
        if (accion === 'Ver') {
            handleAccionEstudiante(
                'Ver',
                estudianteSeleccionado,
                setEstudiante,
                setVistaAnterior,
                vistaActual,
                setVistaActual,
                setModoModificacion
            );
        } else if (accion === 'Modificar') {
            handleAccionEstudiante(
                'Modificar',
                estudianteSeleccionado,
                setEstudiante,
                setVistaAnterior,
                vistaActual,
                setVistaActual,
                setModoModificacion
            );
        } else if (accion === 'Eliminar') {
            setEstudiante(construirEstudianteCompleto(estudianteSeleccionado));
            setVistaActual('confirmarEliminacion');
        } else {
            handleAccionEstudiante(
                accion,
                estudianteSeleccionado,
                setEstudiante,
                setVistaAnterior,
                vistaActual,
                setVistaActual,
                setModoModificacion
            );
        }
    };

    // Handler para modificar estudiante desde el visor
    const handleModificar = async (datosActualizados, seccion) => {
        if (!datosActualizados.dni) {
            showError('El DNI es obligatorio para modificar.');
            return;
        }
        
        let datosParaBackend = {};
        let config = {};

        // SIEMPRE enviar TODOS los datos del estudiante, actualizando solo la sección modificada
        const estudianteCompleto = {
            // Datos personales
            nombre: estudiante.nombre || '',
            apellido: estudiante.apellido || '',
            dni: estudiante.dni,
            cuil: estudiante.cuil || '',
            email: estudiante.email || '',
            fechaNacimiento: estudiante.fechaNacimiento || null,
            tipoDocumento: estudiante.tipoDocumento || 'DNI',
            paisEmision: estudiante.paisEmision || 'Argentina',
            // Domicilio
            calle: estudiante.calle || '',
            numero: estudiante.numero || '',
            provincia: estudiante.provincia || '',
            localidad: estudiante.localidad || '',
            barrio: estudiante.barrio || '',
            // Académica - SIEMPRE incluir los IDs actuales
            modalidadId: estudiante.modalidadId || estudiante.modalidad_id || '',
            planAnioId: estudiante.planAnioId || estudiante.planAnio_id || '',
            modulosId: estudiante.modulosId || estudiante.modulos_id || '',
            estadoInscripcionId: estudiante.estadoInscripcionId || estudiante.estadoInscripcion_id || '',
        };

        // Actualizar solo los campos de la sección modificada
        if (seccion === 'academica') {
            estudianteCompleto.modalidadId = datosActualizados.modalidadId || estudiante.modalidadId;
            estudianteCompleto.planAnioId = datosActualizados.planAnioId || estudiante.planAnioId;
            estudianteCompleto.modulosId = datosActualizados.modulosId || estudiante.modulosId;
            estudianteCompleto.estadoInscripcionId = datosActualizados.estadoInscripcionId || estudiante.estadoInscripcionId;
            
            // Validaciones antes de enviar
            if (!estudianteCompleto.modalidadId) {
                showError('Selecciona una modalidad válida.');
                return;
            }
            if (!estudianteCompleto.planAnioId) {
                showError('Selecciona un plan válido.');
                return;
            }
            if (!estudianteCompleto.modulosId) {
                showError('Selecciona un módulo válido.');
                return;
            }
            if (!estudianteCompleto.estadoInscripcionId) {
                showError('Selecciona un estado de inscripción válido.');
                return;
            }
            
            datosParaBackend = estudianteCompleto;
        } else if (seccion === 'personales') {
            estudianteCompleto.nombre = datosActualizados.nombre || estudiante.nombre;
            estudianteCompleto.apellido = datosActualizados.apellido || estudiante.apellido;
            estudianteCompleto.cuil = datosActualizados.cuil || estudiante.cuil;
            estudianteCompleto.email = datosActualizados.email || estudiante.email;
            estudianteCompleto.fechaNacimiento = datosActualizados.fechaNacimiento || estudiante.fechaNacimiento;
            estudianteCompleto.tipoDocumento = datosActualizados.tipoDocumento || estudiante.tipoDocumento;
            estudianteCompleto.paisEmision = datosActualizados.paisEmision || estudiante.paisEmision;
            
            datosParaBackend = estudianteCompleto;
        } else if (seccion === 'domicilio') {
            estudianteCompleto.calle = datosActualizados.calle || estudiante.calle;
            estudianteCompleto.numero = datosActualizados.numero || estudiante.numero;
            estudianteCompleto.provincia = datosActualizados.provincia || estudiante.provincia;
            estudianteCompleto.localidad = datosActualizados.localidad || estudiante.localidad;
            estudianteCompleto.barrio = datosActualizados.barrio || estudiante.barrio;
            
            // Validaciones específicas para domicilio
            if (!estudianteCompleto.provincia || estudianteCompleto.provincia.trim() === '') {
                showError('La provincia es obligatoria.');
                return;
            }
            if (!estudianteCompleto.localidad || estudianteCompleto.localidad.trim() === '') {
                showError('La localidad es obligatoria.');
                return;
            }
            if (!estudianteCompleto.barrio || estudianteCompleto.barrio.trim() === '') {
                showError('El barrio es obligatorio.');
                return;
            }
            
            // Validar que los IDs académicos estén presentes
            if (!estudianteCompleto.planAnioId) {
                showError('El plan de año es obligatorio para modificar.');
                return;
            }
            if (!estudianteCompleto.modalidadId) {
                showError('La modalidad es obligatoria para modificar.');
                return;
            }
            if (!estudianteCompleto.modulosId) {
                showError('El módulo es obligatorio para modificar.');
                return;
            }
            if (!estudianteCompleto.estadoInscripcionId) {
                showError('El estado de inscripción es obligatorio para modificar.');
                return;
            }
            
            datosParaBackend = estudianteCompleto;
        } else if (seccion === 'documentacion') {
            // Validación de detalleDocumentacion
            try {
                JSON.parse(datosActualizados.detalleDocumentacion);
            } catch {
                showError('Error en el formato de la documentación.');
                return;
            }
            const formData = new FormData();
            // Incluir todos los datos del estudiante en FormData
            Object.entries(estudianteCompleto).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });
            formData.append('detalleDocumentacion', datosActualizados.detalleDocumentacion);
            if (datosActualizados.archivos) {
                Object.entries(datosActualizados.archivos).forEach(([docName, file]) => {
                    formData.append(docName, file);
                });
            }
            datosParaBackend = formData;
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
        }

        // Log para depuración
        console.log(`Datos enviados al backend (${seccion}):`, datosParaBackend);

        try {
            const response = await serviceInscripcion.updateEstd(datosParaBackend, datosActualizados.dni, config);
            console.log("✅ Estudiante actualizado:", response);

            if (response.success) {
                // Actualizar solo los campos modificados en el estado local
                setEstudiante(prevEstudiante => ({ ...prevEstudiante, ...datosActualizados }));
                showSuccess('Datos actualizados correctamente');
            } else {
                showError(response.message || 'Error al actualizar');
            }
        } catch (error) {
            console.error("❌ Error al modificar estudiante:", error.message);
            showError('Error al guardar los cambios. Verifica que todos los campos estén completos.');
        }
    };

    // Handler para eliminar estudiante
    const handleEliminar = async (tipoEliminacion) => {
        try {
            let response;
            let mensaje;
            if (tipoEliminacion === 'fisica') {
                response = await serviceInscripcion.deleteEstd(estudiante.dni);
                mensaje = 'Estudiante eliminado permanentemente de la base de datos';
            } else if (tipoEliminacion === 'logica') {
                response = await serviceInscripcion.deactivateEstd(estudiante.dni);
                mensaje = 'Estudiante desactivado exitosamente. El estudiante ya no aparecerá en las listas de consulta';
            }
            if (response.error) {
                showError(response.error);
            } else if (response.success || !response.error) {
                showSuccess(mensaje);
                setRefreshKey(prev => prev + 1);
                setTimeout(() => {
                    handleVolverALista(setVistaActual, setEstudiante);
                }, 2000);
            } else {
                showError('Ocurrió un error inesperado durante la eliminación');
            }
        } catch {
            showError('Error al procesar la eliminación del estudiante');
        }
    };

    // Handlers de navegación
    const navHandlers = {
        volverAOpciones: () => handleVolverAOpciones(modoModificacion, modoEliminacion, setVistaActual, setEstudiante),
        volverABusquedaDNI: () => handleVolverABusquedaDNI(setVistaActual, setEstudiante, setVistaAnterior),
        volverALista: () => handleVolverALista(setVistaActual, setEstudiante),
        volverDesdeVisor: () => handleVolverDesdeVisor(
            vistaAnterior,
            () => handleVolverABusquedaDNI(setVistaActual, setEstudiante, setVistaAnterior),
            () => handleVolverALista(setVistaActual, setEstudiante)
        ),
        cerrarVisorAOpciones: () => handleCerrarVisorAOpciones(setVistaActual, setEstudiante, setModoModificacion)
    };

    return {
        onEstudianteEncontrado,
        onEstudianteEncontradoEliminacion,
        onAccionLista,
        onAccionListaModificacion,
        handleModificar,
        handleEliminar,
        navHandlers
    };
};