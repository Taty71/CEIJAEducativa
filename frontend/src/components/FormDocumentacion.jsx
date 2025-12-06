import { useMemo } from 'react';
import PropTypes from 'prop-types';
import '../estilos/estilosFormDocumentacion.css';
import '../estilos/estilosCheckboxDoc.css';
import '../estilos/modalM.css';

const FormDocumentacion = ({ previews, handleFileChange, onClose, onProceedToRegister }) => {
    const faltaDocumento = useMemo(() => {
        return !["archivo_solicitudPase", "archivo_analiticoParcial", "archivo_certificadoNivelPrimario"].some(
            (doc) => previews?.[doc]?.url
        );
        }, [previews]);

    // Verificar si hay algún documento adjuntado
    const tieneDocumentosAdjuntados = useMemo(() => {
        const documentos = [
            "foto", "archivo_dni", "archivo_cuil", "archivo_fichaMedica", 
            "archivo_partidaNacimiento", "archivo_solicitudPase", 
            "archivo_analiticoParcial", "archivo_certificadoNivelPrimario"
        ];
        return documentos.some(doc => previews?.[doc]?.url);
    }, [previews]);

    // Función que se ejecuta al hacer clic en el botón (solo cerrar modal)
    const handleButtonClick = () => {
        // Siempre cerrar el modal, independientemente de si hay documentos
        // El registro se realizará cuando el usuario presione el botón "Registrar"
        if (tieneDocumentosAdjuntados && onProceedToRegister) {
            onProceedToRegister(); // Cerrar modal con callback
        } else {
            onClose(); // Cerrar modal directo
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ position: 'relative', maxWidth: 900, width: '98vw', minHeight: 400 }}>
                {/* Botón dinámico: Cerrar (X) u OK (✓) */}
                <button 
                    type="button"
                    onClick={handleButtonClick}
                    className="form-documentacion-close"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: tieneDocumentosAdjuntados ? '#28a745' : '#6c757d',
                        fontWeight: 'bold',
                        zIndex: 10,
                        padding: '5px',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={tieneDocumentosAdjuntados ? "Cerrar modal - Presiona 'Registrar' para enviar" : "Cerrar"}
                >
                    {tieneDocumentosAdjuntados ? '✓' : '×'}
                </button>
                <div className="form-documentacion">
                    <div className="form-h3">
                        <h3>
                            Documentación a presentar <br />
                            <span>Recuerda que debes presentarla al momento de la inscripción presencial</span>
                        </h3>
                    </div>
                    {faltaDocumento && (
                        <div style={{ color: '#4e53e6', marginBottom: 10 }}>
                            Recordar Documento faltante: Solicitud de Pase, Analítico Parcial/Pase ó Certificado Nivel Primario.
                        </div>
                    )}
                    <div className="form-doc-table">
                        <div className="doc-table-header">
                            <span>Entregado</span>
                            <span>Documento</span>
                            <span>Adjuntar Archivo</span>
                            <span>Vista Previa</span>
                        </div>
                        {[
                            { label: "Foto", name: "foto" },
                            { label: "DNI", name: "archivo_dni" },
                            { label: "CUIL", name: "archivo_cuil" },
                            { label: "Ficha Médica", name: "archivo_fichaMedica" },
                            { label: "Partida de Nacimiento", name: "archivo_partidaNacimiento" },
                            { label: "Solicitud Pase", name: "archivo_solicitudPase" },
                            { label: "Analítico Parcial/Pase", name: "archivo_analiticoParcial" },
                            { label: "Certificado Nivel Primario", name: "archivo_certificadoNivelPrimario" },
                        ].map(({ label, name }) => (
                            <div className="doc-table-row" key={name}>
                                {/* Checkbox entregado/faltante */}
                                <input
                                    type="checkbox"
                                    checked={!!previews[name]?.url}
                                    readOnly
                                    disabled
                                    className={previews[name]?.url ? 'archivo-adjunto' : ''}
                                    title={previews[name]?.url ? "Entregado" : "Faltante"}
                                />

                                {/* Nombre del documento */}
                                <span>{label}</span>
                                {/* Adjuntar archivo */}
                                <div className="input-container-doc">
                                    <input
                                        type="file"
                                        name={name}
                                        className="small-select"
                                        onChange={(e) => handleFileChange(e, name)}
                                        accept="image/*,application/pdf"
                                    />
                                </div>
                                {/* Vista previa */}
                                <div className="preview-container">
                                    {previews[name]?.url ? (
                                        <>
                                            {previews[name].type?.startsWith('image/') ? (
                                                <img src={previews[name].url} alt={`Vista previa de ${label}`} className="image-preview" />
                                            ) : previews[name].type === 'application/pdf' ? (
                                                <embed src={previews[name].url} type="application/pdf" className="pdf-preview" />
                                            ) : (
                                                <span className="archivo-desconocido">Archivo cargado</span>
                                            )}
                                            <div className="archivo-status">
                                                <span className={`archivo-subido ${previews[name].existente ? 'archivo-existente' : 'archivo-nuevo'}`}>
                                                    {previews[name].existente ? '📁 Archivo existente' : '✓ Archivo subido'}
                                                </span>
                                                <a
                                                    href={previews[name].url}
                                                    download={previews[name].nombreArchivo || `${label}_${new Date().toISOString().split('T')[0]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-ver"
                                                    title="Ver archivo"
                                                >
                                                    Ver
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="sin-archivo">Sin archivo</span>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Definir los propTypes
FormDocumentacion.propTypes = {
    previews: PropTypes.shape({
        foto: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_dni: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_cuil: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_partidaNacimiento: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_fichaMedica: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_solicitudPase: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
        archivo_analiticoParcial: PropTypes.shape({
        url: PropTypes.string,
        type: PropTypes.string,
        }),
        archivo_certificadoNivelPrimario: PropTypes.shape({
            url: PropTypes.string,
            type: PropTypes.string,
        }),
    }),

    handleFileChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onProceedToRegister: PropTypes.func, // Nueva prop opcional
};

export default FormDocumentacion;
