import { useState } from 'react';
import PropTypes from 'prop-types';
import './ModalDocumentacionExistente.css';

const ModalDocumentacionExistente = ({ 
    estudiante, 
    inscripciones, 
    archivosNuevos, 
    onClose, 
    onActualizar 
}) => {
    const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(inscripciones[0]?.id_inscripcion || null);
    const [archivosAActualizar, setArchivosAActualizar] = useState([]);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // Obtener la inscripción seleccionada
    const inscripcion = inscripciones.find(i => i.id_inscripcion === inscripcionSeleccionada);

    // Preparar lista de archivos nuevos disponibles
    const archivosDisponibles = archivosNuevos ? Object.entries(archivosNuevos).map(([tipo, ruta]) => ({
        tipo,
        ruta,
        nombreArchivo: ruta.split('/').pop()
    })) : [];

    const handleToggleArchivo = (tipo) => {
        setArchivosAActualizar(prev => {
            if (prev.includes(tipo)) {
                return prev.filter(t => t !== tipo);
            } else {
                return [...prev, tipo];
            }
        });
    };

    const handleActualizar = async () => {
        if (archivosAActualizar.length === 0) {
            setMensaje({ tipo: 'warning', texto: 'Selecciona al menos un archivo para actualizar' });
            return;
        }

        if (!inscripcionSeleccionada) {
            setMensaje({ tipo: 'error', texto: 'Selecciona una inscripción' });
            return;
        }

        setProcesando(true);
        setMensaje(null);

        try {
            // Preparar archivos para enviar - obtener los archivos del servidor
            const formData = new FormData();
            
            for (const tipo of archivosAActualizar) {
                const archivoInfo = archivosDisponibles.find(a => a.tipo === tipo);
                if (archivoInfo && archivoInfo.ruta) {
                    // Obtener el archivo del servidor
                    const response = await fetch(`http://localhost:3006${archivoInfo.ruta}`);
                    const blob = await response.blob();
                    const file = new File([blob], archivoInfo.nombreArchivo, { type: blob.type });
                    formData.append('archivos', file);
                    console.log(`📎 Agregado archivo: ${tipo} (${archivoInfo.nombreArchivo})`);
                }
            }

            const resultado = await fetch(
                `http://localhost:3006/api/actualizar-documentacion-existente/${estudiante.dni}/${inscripcionSeleccionada}`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!resultado.ok) {
                const errorData = await resultado.json();
                throw new Error(errorData.error || 'Error al actualizar documentación');
            }

            const data = await resultado.json();

            // Emitir evento para actualizar la UI
            window.dispatchEvent(new CustomEvent('registroWeb:actualizado', { 
                detail: { 
                    dni: estudiante.dni, 
                    idInscripcion: inscripcionSeleccionada,
                    actualizacionDocumentacion: true 
                } 
            }));

            setMensaje({ 
                tipo: 'success', 
                texto: `✅ ${data.cantidadArchivos} archivo(s) actualizado(s) exitosamente` 
            });

            setTimeout(() => {
                if (onActualizar) onActualizar(data);
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error al actualizar:', error);
            setMensaje({ 
                tipo: 'error', 
                texto: `❌ Error: ${error.message}` 
            });
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-doc-existente" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📋 Estudiante Ya Registrado</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Información del estudiante */}
                    <div className="estudiante-info">
                        <h3>👤 {estudiante.nombre_completo}</h3>
                        <p><strong>DNI:</strong> {estudiante.dni}</p>
                        <p><strong>CUIL:</strong> {estudiante.cuil}</p>
                        <p><strong>Email:</strong> {estudiante.email}</p>
                    </div>

                    {/* Selector de inscripción */}
                    {inscripciones.length > 1 && (
                        <div className="inscripcion-selector">
                            <label>📚 Selecciona la inscripción a actualizar:</label>
                            <select 
                                value={inscripcionSeleccionada}
                                onChange={e => setInscripcionSeleccionada(parseInt(e.target.value))}
                            >
                                {inscripciones.map(insc => (
                                    <option key={insc.id_inscripcion} value={insc.id_inscripcion}>
                                        {insc.modalidad} - {insc.plan} - {insc.modulo} ({insc.anio_inscripcion})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Documentación actual */}
                    {inscripcion && (
                        <div className="documentacion-actual">
                            <h4>📄 Documentación Actual</h4>
                            {inscripcion.documentacion && inscripcion.documentacion.length > 0 ? (
                                <table className="tabla-documentos">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Archivo</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inscripcion.documentacion.map((doc, idx) => (
                                            <tr key={idx}>
                                                <td>{doc.tipo_documento}</td>
                                                <td className="archivo-nombre">
                                                    {doc.ruta_archivo?.split('/').pop() || 'No disponible'}
                                                </td>
                                                <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-docs">Sin documentación registrada</p>
                            )}
                        </div>
                    )}

                    {/* Archivos nuevos disponibles */}
                    {archivosDisponibles.length > 0 && (
                        <div className="archivos-nuevos">
                            <h4>📎 Archivos Nuevos Disponibles</h4>
                            <div className="archivos-lista">
                                {archivosDisponibles.map(archivo => (
                                    <div key={archivo.tipo} className="archivo-item">
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={archivosAActualizar.includes(archivo.tipo)}
                                                onChange={() => handleToggleArchivo(archivo.tipo)}
                                                disabled={procesando}
                                            />
                                            <span className="archivo-tipo">{archivo.tipo}</span>
                                            <span className="archivo-nombre-nuevo">{archivo.nombreArchivo}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensaje de estado */}
                    {mensaje && (
                        <div className={`mensaje mensaje-${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                        disabled={procesando}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleActualizar}
                        disabled={procesando || archivosAActualizar.length === 0}
                    >
                        {procesando ? 'Actualizando...' : `Actualizar (${archivosAActualizar.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

ModalDocumentacionExistente.propTypes = {
    estudiante: PropTypes.shape({
        dni: PropTypes.string.isRequired,
        cuil: PropTypes.string,
        nombre_completo: PropTypes.string.isRequired,
        email: PropTypes.string
    }).isRequired,
    inscripciones: PropTypes.arrayOf(PropTypes.shape({
        id_inscripcion: PropTypes.number.isRequired,
        modalidad: PropTypes.string,
        plan: PropTypes.string,
        modulo: PropTypes.string,
        anio_inscripcion: PropTypes.number,
        documentacion: PropTypes.arrayOf(PropTypes.shape({
            tipo_documento: PropTypes.string,
            ruta_archivo: PropTypes.string,
            fecha_subida: PropTypes.string
        }))
    })).isRequired,
    archivosNuevos: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onActualizar: PropTypes.func
};

export default ModalDocumentacionExistente;
