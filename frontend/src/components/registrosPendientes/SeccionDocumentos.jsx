import PropTypes from 'prop-types';

const SeccionDocumentos = ({ estadoDoc, mapeoDocumentos }) => {
    return (
        <div className="documentos-container">
            {/* Indicador de que los datos vienen de la BD */}
            {estadoDoc.desdeBD && (
                <div className="info-desde-bd" style={{
                    backgroundColor: '#e3f2fd',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '0.9em',
                    color: '#1976d2',
                    border: '1px solid #90caf9'
                }}>
                    ℹ️ Documentación guardada en base de datos (archivosDocumento)
                </div>
            )}

            {/* Documentos subidos */}
            {estadoDoc.subidos.length > 0 && (
                <div className="seccion-documentos documentos-subidos">
                    <strong>✅ Documentos subidos:</strong>
                    <ul>
                        {estadoDoc.subidos.map(doc => (
                            <li key={doc}>
                                {mapeoDocumentos[doc] || doc}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Documentos faltantes */}
            {estadoDoc.faltantes.length > 0 && (
                <div className="seccion-documentos documentos-faltantes">
                    <strong>⚠️ Documentos faltantes:</strong>
                    <ul>
                        {estadoDoc.faltantes.map(doc => (
                            <li key={doc}>
                                {estadoDoc.documentosAlternativos && doc === estadoDoc.documentosAlternativos.preferido ? 
                                    `${mapeoDocumentos[doc] || doc} (o alternativamente: ${mapeoDocumentos[estadoDoc.documentosAlternativos.alternativa] || estadoDoc.documentosAlternativos.alternativa})` :
                                    mapeoDocumentos[doc] || doc
                                }
                            </li>
                        ))}
                    </ul>
                    {/* Información sobre documentos alternativos */}
                    {estadoDoc.documentosAlternativos && estadoDoc.faltantes.includes(estadoDoc.documentosAlternativos.preferido) && (
                        <div className="info-alternativos">
                            ℹ️ {estadoDoc.documentosAlternativos.descripcion}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

SeccionDocumentos.propTypes = {
    estadoDoc: PropTypes.object.isRequired,
    mapeoDocumentos: PropTypes.object.isRequired
};

export default SeccionDocumentos;