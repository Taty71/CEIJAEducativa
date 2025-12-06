import { useState } from 'react';
import { useUserContext } from '../context/useUserContext';
// import PropTypes from 'prop-types';
import { useAlerts } from '../hooks/useAlerts';
import AlertaMens from './AlertaMens';
import GestionCRUDContenido from './GestionCRUDContenido';
// import BusquedaDNI from './BusquedaDNI';
// Importar PropTypes para GestionCRUDContenido
import PropTypes from 'prop-types';
import '../estilos/gestionCRUD.css';

const GestionCRUD = ({ isAdmin, onClose, vistaInicial = 'opciones', esModificacion = false, soloListar = false, modalidad, modalidadId, setAccion }) => {
    const { user } = useUserContext();
    
    // Calcular modalidadFiltrada según el rol del usuario
    const modalidadFiltrada = (() => {
        if (!user?.rol) return modalidad;
        
        switch (user.rol) {
            case 'administrador':
                return undefined; // Ve todas las modalidades
            case 'coordinador':
                return 'SEMIPRESENCIAL'; // Solo modalidad semipresencial
            case 'secretario':
                return 'PRESENCIAL'; // Solo modalidad presencial
            default:
                return modalidad; // Otros roles usan la modalidad pasada
        }
    })();
    const { 
        alerts, 
        modal, 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo,
        removeAlert,
        closeModal 
    } = useAlerts();
    const [vistaActual, setVistaActual] = useState(vistaInicial); // Usar vistaInicial como estado inicial
    const [estudiante, setEstudiante] = useState(null);
    
    // Función helper para mantener compatibilidad con componente hijo
    const setAlert = ({ text, variant }) => {
        switch (variant) {
            case 'success':
                showSuccess(text);
                break;
            case 'error':
                showError(text);
                break;
            case 'warning':
                showWarning(text);
                break;
            case 'info':
                showInfo(text);
                break;
            default:
                showInfo(text);
        }
    };
    
    // Estado mock para compatibilidad (ya no se usa directamente)
    const alert = { text: '', variant: '' };
    const [vistaAnterior, setVistaAnterior] = useState(null); // Para rastrear la vista anterior
    const [refreshKey, setRefreshKey] = useState(0); // Para forzar recarga de la lista
    // Inicializar modoModificacion basado en prop esModificacion o vista inicial
    const [modoModificacion, setModoModificacion] = useState(
        esModificacion || vistaInicial === 'opcionesModificar'
    );
    // Detectar si estamos en modo eliminación basado en la vista inicial
    const [modoEliminacion] = useState(
        vistaInicial === 'opcionesEliminar' || vistaInicial === 'busquedaDNIEliminar' || vistaInicial === 'listaEliminar'
    );

    // Las alertas se manejan automáticamente con useAlerts hook



    return (
        <div className="gestion-crud-container">
            {/* Sistema de alertas unificado */}
            <AlertaMens
                mode="floating"
                alerts={alerts}
                modal={modal}
                onCloseAlert={removeAlert}
                onCloseModal={closeModal}
            />
            <GestionCRUDContenido
                isAdmin={isAdmin}
                onClose={onClose}
                vistaInicial={vistaInicial}
                soloListar={soloListar}
                modalidadId={modalidadId}
                modalidad={modalidad}
                modalidadFiltrada={modalidadFiltrada}
                vistaActual={vistaActual}
                setVistaActual={setVistaActual}
                estudiante={estudiante}
                setEstudiante={setEstudiante}
                alert={alert}
                setAlert={setAlert}
                vistaAnterior={vistaAnterior}
                setVistaAnterior={setVistaAnterior}
                refreshKey={refreshKey}
                setRefreshKey={setRefreshKey}
                modoModificacion={modoModificacion}
                setModoModificacion={setModoModificacion}
                modoEliminacion={modoEliminacion}
                setAccion={setAccion}
            />
            {/* El formulario de BusquedaDNI solo debe renderizarse desde GestionCRUDContenido para evitar duplicados */}
        </div>
    );
};


GestionCRUD.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    vistaInicial: PropTypes.string,
    esModificacion: PropTypes.bool,
    soloListar: PropTypes.bool,
    modalidad: PropTypes.string,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Puede ser string o number
    setAccion: PropTypes.func,
};

// La validación de PropTypes para GestionCRUDContenido se movió a su propio archivo para evitar errores y seguir buenas prácticas.

export default GestionCRUD;
