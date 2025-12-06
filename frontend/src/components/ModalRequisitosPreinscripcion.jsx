import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../estilos/ModalRequisitosPreinscripcion.css';

const ModalRequisitosPreinscripcion = ({ modalidad, onClose }) => {
    const navigate = useNavigate();

    const handleContinuar = () => {
        onClose();
        navigate(`/preinscripcion-estd?modalidad=${modalidad}&web=true`);
    };

    return (
        <div className="modal-requisitos-overlay">
            <div className="modal-requisitos-container">
                <div className="modal-requisitos-header">
                    <div className="requisitos-icon">📋</div>
                    <h2>Antes de comenzar tu preinscripción</h2>
                    <button className="btn-close-requisitos" onClick={onClose}>✖</button>
                </div>

                <div className="modal-requisitos-body">
                    <div className="alerta-importante">
                        <div className="alerta-icon">⚠️</div>
                        <p>Por favor, asegúrate de tener listos los siguientes documentos digitalizados</p>
                    </div>

                    <div className="documentos-requeridos">
                        <h3>📄 Documentos Requeridos</h3>
                        <div className="doc-grid">
                            <div className="doc-card">
                                <span className="doc-icon">📷</span>
                                <span className="doc-name">Foto 4x4</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">🆔</span>
                                <span className="doc-name">DNI (frente y dorso)</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">📋</span>
                                <span className="doc-name">CUIL</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">🏥</span>
                                <span className="doc-name">Ficha Médica CUS</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">📜</span>
                                <span className="doc-name">Partida de Nacimiento</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">📝</span>
                                <span className="doc-name">Solicitud de Pase</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">📊</span>
                                <span className="doc-name">Analítico Parcial</span>
                            </div>
                            <div className="doc-card">
                                <span className="doc-icon">🎓</span>
                                <span className="doc-name">Certificado Nivel Primario</span>
                            </div>
                        </div>
                    </div>

                    <div className="especificaciones-tecnicas">
                        <h3>💾 Especificaciones Técnicas</h3>
                        <div className="specs-list">
                            <div className="spec-item">
                                <span className="spec-label">Formatos aceptados:</span>
                                <span className="spec-value">PDF, JPG, JPEG, PNG</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Tamaño máximo por archivo:</span>
                                <span className="spec-value">5 MB</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Calidad recomendada:</span>
                                <span className="spec-value">Imágenes claras y legibles</span>
                            </div>
                        </div>
                    </div>

                    <div className="consejos-box">
                        <h4>💡 Consejos útiles</h4>
                        <ul>
                            <li>Asegúrate de que los documentos sean legibles</li>
                            <li>Escanea o fotografía en buena iluminación</li>
                            <li>Verifica que toda la información sea visible</li>
                            <li>Ten todos los archivos listos antes de comenzar</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-requisitos-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-continuar" onClick={handleContinuar}>
                        ✓ Tengo todo listo, continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

ModalRequisitosPreinscripcion.propTypes = {
    modalidad: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ModalRequisitosPreinscripcion;
