import PropTypes from 'prop-types';
import { useState } from 'react';
import '../estilos/consultaEstd.css';
import '../estilos/eliminarEstd.css';
import '../estilos/modalUniforme.css';
import '../estilos/botones.css';
import CloseButton from '../components/CloseButton';
import VolverButton from '../components/VolverButton';

// Función para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const EliminarEstd = ({ data, onClose, onVolver, onEliminar }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Si por alguna razón el objeto no trae success true, mostramos mensaje genérico
    if (!data?.success) {
        return (
            <div className="eliminar-overlay">
                <div className="modal-container">
                    <CloseButton onClose={onClose} />
                    <p>No se encontraron datos para el estudiante.</p>
                </div>
            </div>
        );
    }

    // Desestructuramos directamente
    const { estudiante, domicilio, inscripcion, documentacion } = data;

    const handleEliminar = () => {
        setShowConfirmDialog(true);
    };

    const handleTipoEliminacion = (tipo) => {
        // Llamar al callback del padre con el tipo de eliminación
        onEliminar(tipo);
        setShowConfirmDialog(false);
    };

    const cancelarEliminacion = () => {
        setShowConfirmDialog(false);
    };

    return (
        <div className="eliminar-overlay">
            <div className="modal-container">
                <div className="modal-header-buttons-uniforme modal-header-buttons-small">
                    <VolverButton onClick={onVolver} className="boton-principal boton-small" />
                    <CloseButton onClose={onClose} className="boton-principal boton-small" />
                </div>
                <div className="modal-header-uniforme">
                    <h2 className="modal-title-uniforme">Eliminar Estudiante</h2>
                </div>
                
                <div className="eliminar-warning-message">
                    ⚠️ Seleccione el tipo de eliminación: puede desactivar el estudiante (recomendado) para mantener los datos en la base de datos pero ocultarlo de las listas, o eliminarlo definitivamente de la base de datos (acción irreversible)
                </div>
                
                <div className="consultaEstdRow">
                    {/* Datos Personales */}
                    <div className="consultaEstdSection">
                        <h3>Datos Personales</h3>
                        <p><strong>Nombre:</strong> {estudiante?.nombre || 'No especificado'}</p>
                        <p><strong>Apellido:</strong> {estudiante?.apellido || 'No especificado'}</p>
                        <p><strong>DNI:</strong> {estudiante?.dni || 'No especificado'}</p>
                        <p><strong>CUIL:</strong> {estudiante?.cuil || 'No especificado'}</p>
                        <p><strong>Email:</strong> {estudiante?.email || 'Sin email registrado'}</p>
                        <p><strong>Fecha de Nacimiento:</strong> {formatDate(estudiante?.fechaNacimiento)}</p>
                        <p><strong>Tipo de Documento:</strong> {estudiante?.tipoDocumento || 'DNI'}</p>
                        <p><strong>País de Emisión:</strong> {estudiante?.paisEmision || 'Argentina'}</p>
                    </div>

                    {/* Domicilio */}
                    <div className="consultaEstdSection">
                        <h3>Domicilio</h3>
                        {domicilio ? (
                            <>
                                <p><strong>Calle:</strong> {domicilio.calle || 'No especificado'}</p>
                                <p><strong>Número:</strong> {domicilio.numero || 'No especificado'}</p>
                                <p><strong>Barrio:</strong> {domicilio.barrio || 'No especificado'}</p>
                                <p><strong>Localidad:</strong> {domicilio.localidad || 'No especificado'}</p>
                                <p><strong>Provincia:</strong> {domicilio.provincia || 'No especificado'}</p>
                            </>
                        ) : (
                            <p>No se encontraron datos de domicilio.</p>
                        )}
                    </div>

                    {/* Información Académica */}
                    <div className="consultaEstdSection">
                        <h3>Información Académica</h3>
                        {inscripcion ? (
                            <>
                                <p><strong>Modalidad:</strong> {inscripcion.modalidad || 'No especificada'}</p>
                                <p><strong>Curso / Plan:</strong> {inscripcion.plan || inscripcion.planAnio || 'No especificado'}</p>
                                <p><strong>Módulo:</strong> {inscripcion.modulo || inscripcion.modulos || 'No especificado'}</p>
                                <p><strong>Estado de Inscripción:</strong> {inscripcion.estado || 'No especificado'}</p>
                                <p><strong>Fecha de Inscripción:</strong> {formatDate(inscripcion.fechaInscripcion)}</p>
                            </>
                        ) : (
                            <p>No se encontraron datos de inscripción.</p>
                        )}
                    </div>
                </div>

                {/* Documentación */}
                <div className="consultaEstdSection">
                    <h3>Documentación</h3>
                    {documentacion && documentacion.length > 0 ? (
                        <div className="eliminar-documentacion-grid">
                            {documentacion.map((doc, index) => (
                                <div key={index} className="eliminar-documento-card">
                                    <div className="eliminar-doc-header">
                                        <strong>{doc.descripcionDocumentacion || 'Documento'}</strong>
                                        <span className={`eliminar-doc-estado ${doc.estadoDocumentacion?.toLowerCase()}`}>
                                            {doc.estadoDocumentacion || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="eliminar-doc-details">
                                        <small>📅 {formatDate(doc.fechaEntrega)}</small>
                                        {doc.archivoDocumentacion && (
                                            <small className="eliminar-doc-archivo">📎 {doc.archivoDocumentacion.split('/').pop()}</small>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No se encontró documentación asociada.</p>
                    )}
                </div>

                {/* Foto */}
                {estudiante?.foto && (
                    <div className="consultaEstdSection">
                        <h3>Foto</h3>
                        <div className="eliminar-foto-container">
                            <img 
                                src={estudiante.foto} 
                                alt={`Foto de ${estudiante.nombre} ${estudiante.apellido}`}
                                className="estudiante-foto"
                            />
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="consultaEstdButtons">
                    <button 
                        onClick={onClose}
                        className="eliminar-btn-cancelar"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleEliminar}
                        className="eliminar-btn-eliminar"
                    >
                        🗑️ Eliminar Estudiante
                    </button>
                </div>

                {/* Diálogo de confirmación personalizado - SIN overlay adicional */}
                {showConfirmDialog && (
                    <div className="eliminar-confirm-dialog">
                        <h3 className="eliminar-confirm-title">
                            Opciones de Eliminación
                        </h3>
                        <p className="eliminar-confirm-message">
                            ¿Qué desea hacer con el estudiante{' '}
                            <strong>{estudiante?.nombre} {estudiante?.apellido}</strong>{' '}
                            (DNI: <strong>{estudiante?.dni}</strong>)?
                        </p>
                        
                        <div className="eliminar-confirm-options">
                            <button 
                                onClick={() => handleTipoEliminacion('logica')}
                                className="eliminar-btn-logica"
                            >
                                <div className="eliminar-btn-logica-title">
                                    🔒 Desactivar Estudiante (Recomendado)
                                </div>
                                <div className="eliminar-btn-logica-desc">
                                    El estudiante quedará oculto pero sus datos se conservarán en la base de datos
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => handleTipoEliminacion('fisica')}
                                className="eliminar-btn-fisica"
                            >
                                <div className="eliminar-btn-fisica-title">
                                    🗑️ Eliminar Permanentemente
                                </div>
                                <div className="eliminar-btn-fisica-desc">
                                    Se eliminará completamente de la base de datos. Esta acción no se puede deshacer
                                </div>
                            </button>
                        </div>
                        
                        <button 
                            onClick={cancelarEliminacion}
                            className="eliminar-btn-cancelar-dialog"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

EliminarEstd.propTypes = {
    data: PropTypes.shape({
        success: PropTypes.bool.isRequired,
        estudiante: PropTypes.object.isRequired,
        domicilio: PropTypes.object,
        inscripcion: PropTypes.object,
        documentacion: PropTypes.arrayOf(
            PropTypes.shape({
                idDocumentaciones: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                descripcionDocumentacion: PropTypes.string,
                estadoDocumentacion: PropTypes.string,
                fechaEntrega: PropTypes.string,
                archivoDocumentacion: PropTypes.string,
            })
        ),
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onVolver: PropTypes.func.isRequired,
    onEliminar: PropTypes.func.isRequired,
};

export default EliminarEstd;
