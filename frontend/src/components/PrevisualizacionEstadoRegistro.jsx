import PropTypes from 'prop-types';
import { obtenerEstadoDocumentacion } from '../utils/registroSinDocumentacion';

const PrevisualizacionEstadoRegistro = ({ files, previews, values }) => {
    const estadoDoc = obtenerEstadoDocumentacion(
        files, 
        previews, 
        values.modalidad, 
        values.planAnio, 
        values.modulos
    );
    
    if (!estadoDoc) return null;
    
    const esCompleto = estadoDoc.completo;
    const estadoFinal = esCompleto ? 'PROCESADO' : 'PENDIENTE';
    
    return (
        <div style={{
            background: esCompleto 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)'
                : 'linear-gradient(135deg, #fff3e0 0%, #ffe8cc 100%)',
            border: `2px solid ${esCompleto ? '#4caf50' : '#ff9800'}`,
            borderRadius: '10px',
            padding: '15px',
            margin: '15px 0',
            fontSize: '0.9rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
            }}>
                <div>
                    <strong style={{ 
                        color: esCompleto ? '#2e7d32' : '#e65100',
                        fontSize: '1rem'
                    }}>
                        {esCompleto ? '✅ Registro será PROCESADO' : '⚠️ Registro quedará PENDIENTE'}
                    </strong>
                </div>
                <div style={{
                    backgroundColor: esCompleto ? '#4caf50' : '#ff9800',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    {estadoFinal}
                </div>
            </div>
            
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '10px'
            }}>
                <div style={{ marginBottom: '8px' }}>
                    <strong>📊 Estado de Documentación:</strong>
                </div>
                <div style={{ marginLeft: '10px' }}>
                    <div>📎 Documentos subidos: <strong>{estadoDoc.cantidadSubidos}/{estadoDoc.totalDocumentos}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                        <strong>Criterio:</strong> {values.modalidad} - {
                            values.modalidad === 'Presencial' 
                                ? `${values.planAnio}° Año` 
                                : `Plan ${values.modulos || values.planAnio}`
                        }
                    </div>
                    {estadoDoc.documentosSubidos.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#2e7d32' }}>
                            ✅ Subidos: {estadoDoc.documentosSubidos.map(doc => {
                                const nombres = {
                                    "foto": "Foto",
                                    "archivo_dni": "DNI", 
                                    "archivo_cuil": "CUIL",
                                    "archivo_fichaMedica": "Ficha Médica",
                                    "archivo_partidaNacimiento": "Partida Nacimiento",
                                    "archivo_solicitudPase": "Solicitud Pase",
                                    "archivo_analiticoParcial": "Analítico Parcial",
                                    "archivo_certificadoNivelPrimario": "Certificado Primario"
                                };
                                return nombres[doc] || doc;
                            }).join(', ')}
                        </div>
                    )}
                    {estadoDoc.documentosFaltantes?.length > 0 && (
                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#e65100' }}>
                            ⚠️ Faltantes: {estadoDoc.nombresDocumentosFaltantes.join(', ')}
                        </div>
                    )}
                </div>
            </div>
            
            <div style={{
                backgroundColor: esCompleto ? '#e8f5e8' : '#fff3e0',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${esCompleto ? '#c8e6c9' : '#ffcc02'}`
            }}>
                <strong style={{ color: esCompleto ? '#2e7d32' : '#e65100' }}>
                    {esCompleto ? '🎉 Resultado:' : '📢 Importante:'}
                </strong>
                <div style={{ 
                    marginTop: '5px', 
                    color: esCompleto ? '#2e7d32' : '#e65100',
                    lineHeight: '1.4'
                }}>
                    {esCompleto ? (
                        <>
                            • El registro se guardará con estado <strong>PROCESADO</strong><br/>
                            • La inscripción estará completa con toda la documentación<br/>
                            • El estudiante podrá iniciar sus estudios
                        </>
                    ) : (
                        <>
                            • El registro se guardará con estado <strong>PENDIENTE</strong><br/>
                            • Se generará una notificación administrativa<br/>
                            • El estudiante debe completar los documentos faltantes<br/>
                            • Solo se procesará cuando esté la documentación completa
                        </>
                    )}
                </div>
            </div>
            
            {values.nombre && values.apellido && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: '#666'
                }}>
                    <strong>Estudiante:</strong> {values.nombre} {values.apellido} 
                    {values.dni && ` (DNI: ${values.dni})`}
                    {values.email && ` • ${values.email}`}
                </div>
            )}
        </div>
    );
};

PrevisualizacionEstadoRegistro.propTypes = {
    files: PropTypes.object.isRequired,
    previews: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
};

export default PrevisualizacionEstadoRegistro;