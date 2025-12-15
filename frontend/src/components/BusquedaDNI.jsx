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

    const handleChange = (e) => {
        // Solo permitir números en el input
        const soloDigitos = e.target.value.replace(/\D/g, '');
        setDni(soloDigitos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dni || dni.length < 7) {
            showError('El DNI debe tener al menos 7 dígitos.');
            return;
        }
        if (dni.length > 8) {
            showError('El DNI no puede tener más de 8 dígitos.');
            return;
        }

        setLoading(true);

        try {
            const resultado = await serviceDatos.getEstudianteCompletoByDni(Number(dni), modalidadId);
            setTimeout(() => {
                setLoading(false);

                // Si el backend responde con error, determinar el tipo de error
                if (!resultado.success) {

                    // Verificar si el estudiante no fue encontrado
                    if (resultado.error && (
                        resultado.error.includes('Estudiante no encontrado') ||
                        resultado.error.includes('no encontrado')
                    )) {
                        showError(`El DNI ${dni} no existe en los registros del sistema.`);
                    }
                    // Verificar si el estudiante está inactivo específicamente
                    else if (resultado.error && resultado.error.includes('inactivo')) {
                        showWarning('El estudiante está inactivo en el sistema.');
                    }
                    // Verificar si el error indica falta de inscripción en modalidad
                    else if (resultado.error && resultado.error.includes('No existe inscripción en la modalidad')) {
                        showError('El estudiante no está inscripto en la modalidad seleccionada.');
                    }
                    // Fallback para otros errores
                    else {
                        showError(`El DNI ${dni} no existe en los registros del sistema.`);
                    }
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // Solo verificar inactivo si el estudiante existe y la consulta fue exitosa
                // Robust check for inactive status (handles 0, false, "0")
                if (resultado.estudiante && (resultado.estudiante.activo === 0 || resultado.estudiante.activo === false || resultado.estudiante.activo === '0')) {
                    showWarning('El estudiante está inactivo en el sistema.');
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // Si no hay inscripción, mostrar error
                if (!resultado.inscripcion) {
                    showError('El estudiante no está inscripto en la modalidad seleccionada.');
                    onEstudianteEncontrado(null); // Limpia el estudiante en el padre
                    return;
                }

                // NUEVO: Verificar explícitamente que la modalidad coincida (si tenemos modalidadId)
                if (modalidadId && resultado.inscripcion.modalidadId && Number(resultado.inscripcion.modalidadId) !== Number(modalidadId)) {
                    showError('El estudiante está inscripto en otra modalidad.');
                    onEstudianteEncontrado(null);
                    return;
                }

                // Éxito - proceder con el estudiante encontrado
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
            showError(`No se pudo verificar el DNI ${dni}. Por favor, inténtelo nuevamente.`);
        }
    };

    return (
        <div className="modal-overlay-uniforme">
            <div className="modal-container-uniforme">
                {/* Contenedor de botones superior */}
                {!esConsultaDirecta && (
                    <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                        {onVolver && <VolverButton onClick={onVolver} className="boton-principal boton-small" />}
                        {onClose && <CloseButton onClose={onClose} className="boton-principal boton-small" />}
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
                        </div>
                        <div className="button-group-uniforme">
                            <BotonCargando loading={loading} className="btn-uniforme btn-primary-uniforme" type="submit">
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