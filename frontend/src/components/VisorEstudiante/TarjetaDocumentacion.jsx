import PropTypes from 'prop-types';
import { useState, useEffect, useContext, useMemo } from 'react';
import useGestionDocumentacion from '../../hooks/useGestionDocumentacion';
import { AlertContext } from '../../context/AlertContext';
import trashIcon from '../../assets/logos/trash.png'; // Import trash icon

const TarjetaDocumentacion = ({ estudiante, editMode, setEditMode, isConsulta, isEliminacion, onGuardar, onCancelar }) => {
    const [archivosSubidos, setArchivosSubidos] = useState({});

    // Memoizar la documentación para evitar renders innecesarios
    const documentacion = useMemo(() => {
        return estudiante?.documentacion || [];
    }, [estudiante?.documentacion]);

    // Usar el sistema unificado de alertas
    const { showSuccess, showWarning } = useContext(AlertContext);

    const {
        files,
        previews,
        handleFileChange,
        buildDetalleDocumentacion,
        resetArchivos,
        setPreviews
    } = useGestionDocumentacion();

    // Solo inicializar previews una vez cuando cambie la documentación
    useEffect(() => {
        if (documentacion.length > 0) {
            const inicialPreviews = {};
            documentacion.forEach(doc => {
                inicialPreviews[doc.descripcionDocumentacion] = {
                    url: doc.archivoDocumentacion
                        ? (doc.archivoDocumentacion.startsWith('http')
                            ? doc.archivoDocumentacion
                            : `http://localhost:5000${doc.archivoDocumentacion}`)
                        : null,
                    type: 'application/pdf',
                    file: null
                };
            });
            setPreviews(inicialPreviews);
        }
    }, [documentacion, setPreviews]);

    const handleSubirArchivo = (desc) => {
        if (previews[desc]?.file) {
            setArchivosSubidos(prev => ({ ...prev, [desc]: true }));
        }
    };

    const handleQuitarArchivo = (desc) => {
        setPreviews(prev => ({
            ...prev,
            [desc]: {
                ...prev[desc],
                url: null,
                file: null,
                uploaded: false,
                existente: false
            }
        }));
        setArchivosSubidos(prev => ({ ...prev, [desc]: false }));
    };

    return (
        <div className="tarjeta tarjeta-documentacion">
            <div className="tarjeta-header">
                <h3>Documentación Presentada</h3>
                {!isConsulta && !isEliminacion && (
                    <button onClick={() => setEditMode(true)} title="Editar documentación">✏️</button>
                )}
            </div>
            <div className="tarjeta-contenido">
                <div className="documentacion-lista-tarjeta">
                    {documentacion.map((doc, idx) => {
                        const desc = doc.descripcionDocumentacion;
                        const preview = previews[desc];
                        const fileSelected = preview?.file;
                        // Determine if we have a valid file (either existing URL or newly uploaded/selected)
                        const tieneArchivo = !!(preview?.url || fileSelected);
                        const fileUploaded = archivosSubidos[desc] || (preview?.existente && tieneArchivo);
                        // File URL for viewing
                        const fileUrl = preview?.url;

                        return (
                            <div key={doc.idDocumentaciones || idx} className={`documento-item-tarjeta ${!tieneArchivo ? 'faltante' : ''}`}>
                                <div className="documento-info">
                                    <span className="documento-icono" data-estado={tieneArchivo ? 'entregado' : 'faltante'}>
                                        {tieneArchivo ? '✓' : '✗'}
                                    </span>
                                    <span className="documento-nombre-corto">{desc}</span>
                                </div>
                                <div className="documento-acciones">
                                    {/* View Button */}
                                    {fileUrl && (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-ver-archivo-mini"
                                            title="Ver documento"
                                        >👁️ Ver archivo</a>
                                    )}

                                    {/* Edit Mode Controls */}
                                    {!isConsulta && editMode && (
                                        <>
                                            {/* Delete Button (Only if file exists) */}
                                            {tieneArchivo && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuitarArchivo(desc)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: '5px' }}
                                                    title="Eliminar documento"
                                                >
                                                    <img src={trashIcon} alt="Eliminar" style={{ width: '20px', height: '20px' }} />
                                                </button>
                                            )}

                                            {/* Upload Controls (Always visible to upload/replace) */}
                                            <input
                                                type="file"
                                                id={`file-input-${doc.idDocumentaciones || idx}`}
                                                className="input-cargar-archivo"
                                                style={{ display: 'none' }}
                                                title="Subir documento"
                                                onChange={e => handleFileChange(e, desc)}
                                            />
                                            <label htmlFor={`file-input-${doc.idDocumentaciones || idx}`} style={{ cursor: 'pointer', marginLeft: '5px' }} title="Seleccionar archivo">
                                                <span role="img" aria-label="Seleccionar archivo" style={{ fontSize: '1.3em' }}>📎</span>
                                            </label>

                                            {/* Upload Confirmation Button (Only if file selected to upload) */}
                                            {fileSelected && !fileUploaded && (
                                                <button
                                                    className="btn-subir-archivo-mini"
                                                    title="Subir archivo"
                                                    style={{ marginLeft: 6, background: '#e3fbe3' }}
                                                    onClick={() => handleSubirArchivo(desc)}
                                                >📤</button>
                                            )}
                                        </>
                                    )}

                                    {/* Status Indicators (Non-Edit Mode or just visual confirm) */}
                                    {!fileUrl && fileUploaded && !editMode && (
                                        <span className="documento-entregado" title="Archivo subido" style={{ color: 'green', fontSize: '1.3em', marginLeft: 8 }}>✔️</span>
                                    )}
                                    {!tieneArchivo && !editMode && (
                                        <span className="documento-faltante" title="Documento faltante">❌</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {editMode && (
                <div className="visor-acciones">
                    <button
                        className="btn-guardar-seccion"
                        onClick={() => {
                            const detalle = buildDetalleDocumentacion();
                            if (typeof onGuardar === 'function') {
                                onGuardar({ detalleDocumentacion: detalle, archivos: files });
                            }
                            showSuccess('¡Documentación modificada con éxito!');
                            setEditMode(false);
                        }}
                    >
                        Guardar cambios
                    </button>
                    <button
                        className="btn-cancelar-seccion"
                        onClick={() => {
                            resetArchivos();
                            if (typeof onCancelar === 'function') onCancelar();
                            setEditMode(false);
                            showWarning('Modificación cancelada.');
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

TarjetaDocumentacion.propTypes = {
    estudiante: PropTypes.object.isRequired,
    editMode: PropTypes.bool,
    setEditMode: PropTypes.func,
    isConsulta: PropTypes.bool,
    isEliminacion: PropTypes.bool,
    onGuardar: PropTypes.func,
    onCancelar: PropTypes.func
};

export default TarjetaDocumentacion;
