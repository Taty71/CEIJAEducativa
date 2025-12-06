// handlersCrud.js
import { construirEstudianteCompleto } from './utilsEstudiante';

export function handleEstudianteEncontrado(resultado, setEstudiante, setVistaAnterior, vistaActual, setVistaActual) {
    if (resultado?.success && resultado.estudiante) {
        const estudianteCompleto = construirEstudianteCompleto(resultado);
        setEstudiante(estudianteCompleto);
        setVistaAnterior(vistaActual);
        setVistaActual('visor');
    }
}

export function handleEstudianteEncontradoParaModificar(resultado, setEstudiante, setVistaAnterior, vistaActual, setVistaActual, showError) {
    if (resultado?.success && resultado.estudiante) {
        const estudianteCompleto = construirEstudianteCompleto(resultado);
        setEstudiante(estudianteCompleto);
        setVistaAnterior(vistaActual);
        setVistaActual('visor');
    } else {
        showError(resultado?.error || 'No se encontró un estudiante con ese DNI');
    }
}

export function handleAccionEstudiante(accion, estudianteData, setEstudiante, setVistaAnterior, vistaActual, setVistaActual, setModoModificacion) {
    if (estudianteData) {
        let estudianteCompleto;
        if (accion === 'Modificar') {
            estudianteCompleto = construirEstudianteCompleto(estudianteData, 'modificarLista');
        } else if (accion === 'Ver') {
            estudianteCompleto = construirEstudianteCompleto(estudianteData, 'consultaModificacion');
        } else {
            estudianteCompleto = construirEstudianteCompleto(estudianteData);
        }
        setEstudiante(estudianteCompleto);
    }
    if (accion === 'Ver') {
        setVistaAnterior(vistaActual);
    }
    switch (accion) {
        case 'Registrar':
            setVistaActual('registro');
            break;
        case 'Modificar':
            setModoModificacion(true);
            setVistaActual('visor');
            break;
        case 'Eliminar':
            setVistaActual('opcionesEliminar');
            break;
        case 'Ver':
            setVistaActual('visor');
            break;
        default:
            break;
    }
}

export function handleModificarDesdeVisor(estudiante, setEstudiante, setVistaActual) {
    if (estudiante) {
        setEstudiante({ ...estudiante, vieneDelVisor: true });
    }
    setVistaActual('editor');
}

export function handleVolverAOpciones(modoModificacion, modoEliminacion, setVistaActual, setEstudiante) {
    if (modoModificacion) {
        setVistaActual('opcionesModificar');
    } else if (modoEliminacion) {
        setVistaActual('opcionesEliminar');
    } else {
        setVistaActual('opciones');
    }
    setEstudiante(null);
}

export function handleVolverALista(setVistaActual, setEstudiante) {
    setVistaActual('lista');
    setEstudiante(null);
}

// Función para el flujo alternativo: Cerrar = Modal anterior, Volver = Menú principal
export function handleCerrarAlternativo(modoModificacion, modoEliminacion, setVistaActual, setEstudiante) {
    // Cerrar lleva al modal anterior (mismo comportamiento que handleVolverAOpciones)
    if (modoModificacion) {
        setVistaActual('opcionesModificar');
    } else if (modoEliminacion) {
        setVistaActual('opcionesEliminar');
    } else {
        setVistaActual('opciones');
    }
    setEstudiante(null);
}

export function handleVolverAlternativo(setAccion) {
    // Volver lleva al menú principal
    setAccion(null);
}

export function handleVolverABusquedaDNI(setVistaActual, setEstudiante, setVistaAnterior) {
    setVistaActual('busquedaDNI');
    setEstudiante(null);
    setVistaAnterior(null);
}

export function handleVolverDesdeVisor(vistaAnterior, handleVolverABusquedaDNI, handleVolverALista) {
    if (vistaAnterior === 'busquedaDNI') {
        handleVolverABusquedaDNI();
    } else {
        handleVolverALista();
    }
}

export function handleCerrarVisorAOpciones(setVistaActual, setEstudiante, setModoModificacion) {
    setVistaActual('opciones');
    setEstudiante(null);
    setModoModificacion(false);
}

export function handleExito(showSuccess, setModoModificacion, handleVolverAOpciones) {
    showSuccess('Operación realizada con éxito');
    setTimeout(() => {
        setModoModificacion(false);
        handleVolverAOpciones();
    }, 2000);
}

export function handleSeleccionOpcion(opcion, setVistaActual) {
    if (opcion === 'dni') {
        setVistaActual('busquedaDNI');
    } else if (opcion === 'inscripciones') {
        setVistaActual('lista');
    } else if (opcion === 'eliminar') {
        setVistaActual('opcionesEliminar');
    }
}

export function handleSeleccionOpcionModificar(opcion, setModoModificacion, setVistaActual) {
    setModoModificacion(true);
    if (opcion === 'dni') {
        setVistaActual('busquedaDNI');
    } else if (opcion === 'inscripciones') {
        setVistaActual('lista');
    }
}

export function handleSeleccionOpcionEliminar(opcion, setVistaActual) {
    if (opcion === 'dni') {
        setVistaActual('busquedaDNIEliminar');
    } else if (opcion === 'inscripciones') {
        setVistaActual('listaEliminar');
    }
}
