import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import '../estilos/modalUniforme.css'; // Estilos uniformes
import '../estilos/botones.css'; // Estilos de botones
import serviceDatos from '../services/serviceDatos';
import BotonCargando from '../components/BotonCargando';
import Input from '../components/Input';
import CloseButton from '../components/CloseButton';
import VolverButton from '../components/VolverButton';
import { AlertContext } from '../context/AlertContext'; // Sistema unificado de alertas


const BusquedaDNI = ({
    onEstudianteEncontrado,
    onClose,
    onVolver,
    modalidadId,
    esConsultaDirecta = false,
    modoModificacion = false,
    modoEliminacion = false
}) => {
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Usar sistema unificado de alertas
    const { showError, showWarning } = useContext(AlertContext);

    // Log de depuración para modalidadId y AlertContext
    console.log('🟦 modalidadId en BusquedaDNI:', modalidadId);
    console.log('🔔 AlertContext methods:', { showError: !!showError, showWarning: !!showWarning });
    
    // Estado de depuración para ver si AlertContext funciona
    const [debugAlert, setDebugAlert] = useState('');

    const handleChange = (e) => {
        // Solo permitir números en el input
        const soloDigitos = e.target.value.replace(/\D/g, '');
        setDni(soloDigitos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dni || dni.length < 7) {
            console.log('🔴 Mostrando error: DNI muy corto');
            setDebugAlert('ERROR: DNI debe tener al menos 7 dígitos');
            showError('El DNI debe tener al menos 7 dígitos.');
            return;
        }
        if (dni.length > 8) {
            console.log('🔴 Mostrando error: DNI muy largo');
            setDebugAlert('ERROR: DNI no puede tener más de 8 dígitos');
            showError('El DNI no puede tener más de 8 dígitos.');
            return;
        }

        setLoading(true);
        setDebugAlert(''); // Limpiar debug

        try {
            const resultado = await serviceDatos.getEstudianteCompletoByDni(Number(dni), modalidadId);
            setTimeout(() => {
                setLoading(false);

                // Si el backend responde con error, determinar el tipo de error
                if (!resultado.success) {
                    console.log('❌ Backend responde con error:', resultado);
                    // Si el error indica que no se encontró el estudiante
                    if (resultado.error && (resultado.error.includes('no encontrado') || resultado.error.includes('404'))) {
                        console.log('🔴 Mostrando error: estudiante no encontrado');
                        setDebugAlert('ERROR: No existe un estudiante registrado con ese DNI');
                        showError('No existe un estudiante registrado con ese DNI.');
                    } else {
                        console.log('🔴 Mostrando error: sin inscripción en modalidad');
                        setDebugAlert('ERROR: No existe inscripción en la modalidad seleccionada');
                        showError('No existe inscripción en la modalidad seleccionada.');
                    }
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // Verificar si el estudiante está inactivo
                if (resultado.estudiante && resultado.estudiante.activo === 0) {
                    console.log('🟡 Mostrando warning: estudiante inactivo');
                    setDebugAlert('WARNING: El estudiante está inactivo en el sistema');
                    showWarning('El estudiante está inactivo en el sistema.');
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // Si no hay inscripción, mostrar error
                if (!resultado.inscripcion) {
                    console.log('🔴 Mostrando error: sin inscripción');
                    setDebugAlert('ERROR: No existe inscripción en la modalidad seleccionada');
                    showError('No existe inscripción en la modalidad seleccionada.');
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // Éxito - proceder con el estudiante encontrado
                console.log('✅ Estudiante encontrado exitosamente');
                setDebugAlert(''); // Limpiar debug
                onEstudianteEncontrado({
                    success: true,
                    estudiante: resultado.estudiante,
                    domicilio: resultado.domicilio,
                    inscripcion: resultado.inscripcion,
                    documentacion: resultado.documentacion
                });
            }, 2000);
        } catch {
            setLoading(false);
            console.log('🔴 Mostrando error: problema de consulta');
            setDebugAlert('ERROR: Hubo un problema al realizar la consulta');
            showError('Hubo un problema al realizar la consulta.');
        }
    };

    return (
        <div className="modal-overlay-uniforme">
            <div className="modal-container-uniforme">
                {/* Contenedor de botones superior */}
                {!esConsultaDirecta && (
                    <div className="modal-header-buttons-uniforme">
                        {onVolver && <VolverButton onClick={onVolver} className="boton-principal" />}
                        {onClose && <CloseButton onClose={onClose} className="boton-principal" />}
                    </div>
                )}
                
                <div className="modal-header-uniforme">
                    <h2 className="modal-title-uniforme">
                        {modoEliminacion ? "Eliminar Estudiante por DNI" : 
                         modoModificacion ? "Modificar Estudiante por DNI" : 
                         "Consulta de Estudiante por DNI"}
                    </h2>
                </div>
                
                <div className="modal-content-uniforme">
                    <form onSubmit={handleSubmit} className="form-uniforme">
                        <div className="input-group-uniforme">
                            <Input
                                label="DNI"
                                placeholder={modoEliminacion ? "Ingrese el DNI del estudiante que desea eliminar" : 
                                           modoModificacion ? "Ingrese el DNI del estudiante que desea modificar" : 
                                           "Ingresa el DNI"}
                                type="text"
                                registro={{
                                    value: dni,
                                    onChange: handleChange,
                                }}
                            />
                            {/* Debug alert display */}
                            {debugAlert && (
                                <div style={{background: 'red', color: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px'}}>
                                    <strong>DEBUG:</strong> {debugAlert}
                                </div>
                            )}
                        </div>
                        <div className="button-group-uniforme">
                            <BotonCargando loading={loading} className="btn-uniforme btn-primary-uniforme">
                                {modoEliminacion ? "Buscar para Eliminar" : 
                                 modoModificacion ? "Buscar para Modificar" : 
                                 "Buscar"}
                            </BotonCargando>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/**
 * Props:
 * - onEstudianteEncontrado (function, required): Callback when a student is found.
  accion: PropTypes.oneOf(['consultar', 'editar', 'eliminar']), // ajusta la lista según tus acciones permitidas
 * - accion (string, optional): Action type.
 */
BusquedaDNI.propTypes = {
  onEstudianteEncontrado: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired, // Callback para el botón "Cerrar"
  onVolver: PropTypes.func, // Callback para el botón "Volver"
  esConsultaDirecta: PropTypes.bool, // Indica si es consulta directa (oculta botón cerrar)
  modoModificacion: PropTypes.bool, // Indica si está en modo modificación
  modoEliminacion: PropTypes.bool, // Indica si está en modo eliminación
  modalidadId: PropTypes.number, // <-- agrega aquí
};

export default BusquedaDNI;