import PropTypes from 'prop-types';
import '../estilos/modalVerListaEstd.css';
import CloseButton from '../components/CloseButton';
import serviceInscripcion from '../services/serviceInscripcion';

// Función para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const ConsultaEstd = ({ data, onClose }) => {
    // Si por alguna razón el objeto no trae success true, mostramos mensaje genérico
    if (!data?.success) {
        return (
            <div className="modal-overlay-verestd">
                <div className="modal-container-verestd">
                    <div className="modal-header-verestd">
                        <CloseButton onClose={onClose} className="boton-principal boton-small" />
                    </div>
                    <p>No se encontraron datos para el estudiante.</p>
                </div>
            </div>
        );
    }

    // Desestructuramos directamente
    const { estudiante, domicilio, inscripcion, documentacion } = data;

    // Generar comprobante de inscripción
    const handleGenerarComprobante = async () => {
        // Obtener estado documental y generar comprobante con toda la info relevante
        const estadoDoc = await serviceInscripcion.getEstadoDocumental(inscripcion.idInscripcion);
        if (!estadoDoc.success) {
            // Manejar error
            return;
        }
        // Unificar todos los datos relevantes para el comprobante
        const comprobanteData = {
            // Datos personales
            nombre: estudiante?.nombre,
            apellido: estudiante?.apellido,
            dni: estudiante?.dni,
            cuil: estudiante?.cuil,
            email: estudiante?.email,
            fechaNacimiento: estudiante?.fechaNacimiento,
            tipoDocumento: estudiante?.tipoDocumento,
            paisEmision: estudiante?.paisEmision,
            activo: estudiante?.activo,
            // Domicilio
            domicilio: domicilio || {},
            // Inscripción
            modalidad: inscripcion?.modalidad,
            planAnio: inscripcion?.planAnio || inscripcion?.plan,
            cursoPlan: inscripcion?.plan,
            modulo: inscripcion?.modulo || inscripcion?.modulos,
            estadoInscripcion: inscripcion?.estado,
            fechaInscripcion: inscripcion?.fechaInscripcion,
            // Documentación
            documentacion: documentacion || [],
            // Estado documental
            requeridos: estadoDoc.requeridos,
            presentados: estadoDoc.presentados || [], // Aseguramos array
            faltantes: estadoDoc.faltantes || [] // Aseguramos array
        };
        // Aseguramos que presentados y faltantes sean solo arrays de nombres
        if (Array.isArray(comprobanteData.presentados)) {
            comprobanteData.presentados = comprobanteData.presentados.map(nombre => typeof nombre === 'string' ? nombre : nombre.descripcionDocumentacion);
        }
        if (Array.isArray(comprobanteData.faltantes)) {
            comprobanteData.faltantes = comprobanteData.faltantes.map(nombre => typeof nombre === 'string' ? nombre : nombre.descripcionDocumentacion);
        }
        // Log para depuración
        console.log('✅ Documentos presentados:', comprobanteData.presentados);
        console.log('❌ Documentos faltantes:', comprobanteData.faltantes);
        import('../components/ComprobanteGenerator').then(mod => {
            mod.default.generar(comprobanteData);
        });
    };

    console.log('DOMICILIO RECIBIDO:', domicilio); // en ConsultaEstd.jsx
    console.log('ESTUDIANTE RECIBIDO:', estudiante); // en VisorEstudiante.jsx

    return (
        <div className="modal-overlay-verestd">
            <div className="modal-container-verestd">
                <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 20 }}>
                    <CloseButton onClose={onClose} className="boton-small" />
                </div>
                <div className="modal-header-verestd" style={{ paddingRight: 40 }}>
                    <div>
                        <h2 className="modal-title-verestd">Datos del estudiante {estudiante?.nombre || ''} {estudiante?.apellido || ''}</h2>
                        <p className="modal-subtitle-verestd">Información detallada del registro académico</p>
                    </div>
                    <button className="btn-uniforme btn-secondary-uniforme" onClick={handleGenerarComprobante}>
                       📄 Emitir Comprobante
                    </button>
                </div>
                <div className="modal-content-verestd">
                    <div className="consultaEstdRow">
                        {/* Datos Personales */}
                        <div className="tarjeta-verestd">
                            <div className="tarjeta-header-verestd">Datos Personales</div>
                            <div>
                                <div className="dato-item-verestd">
                                    <label>Nombre:</label> 
                                    <span>{estudiante?.nombre || 'No especificado'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>Apellido:</label> 
                                    <span>{estudiante?.apellido || 'No especificado'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>DNI:</label> 
                                    <span>{estudiante?.dni || 'No especificado'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>CUIL:</label> 
                                    <span>{estudiante?.cuil || 'No especificado'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>Email:</label> 
                                    <span>{estudiante?.email || 'Sin email registrado'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>Fecha de Nacimiento:</label> 
                                    <span>{formatDate(estudiante?.fechaNacimiento)}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>Tipo de Documento:</label> 
                                    <span>{estudiante?.tipoDocumento || 'DNI'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>País de Emisión:</label> 
                                    <span>{estudiante?.paisEmision || 'Argentina'}</span>
                                </div>
                                <div className="dato-item-verestd">
                                    <label>Estado:</label> 
                                    <span className={`estado-badge-verestd ${estudiante?.activo ? '' : 'estado-inactivo-verestd'}`}>
                                        {estudiante?.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Domicilio */}
                        <div className="tarjeta-verestd">
                            <div className="tarjeta-header-verestd">Domicilio</div>
                            <div>
                                {domicilio ? (
                                    <>
                                        <div className="dato-item-verestd">
                                            <label>Calle:</label> 
                                            <span>{domicilio.calle || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Número:</label> 
                                            <span>{domicilio.numero || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Barrio:</label> 
                                            <span>{domicilio.barrio || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Localidad:</label> 
                                            <span>{domicilio.localidad || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Provincia:</label> 
                                            <span>{domicilio.provincia || 'No especificado'}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="dato-item-verestd">
                                        <span>No se encontraron datos de domicilio.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Información Académica */}
                        <div className="tarjeta-verestd">
                            <div className="tarjeta-header-verestd">Información Académica</div>
                            <div>
                                {inscripcion ? (
                                    <>
                                        <div className="dato-item-verestd">
                                            <label>Modalidad:</label> 
                                            <span>{inscripcion.modalidad || 'No especificada'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Curso / Plan:</label> 
                                            <span>{inscripcion.plan || inscripcion.planAnio || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Módulo:</label> 
                                            <span>{inscripcion.modulo || inscripcion.modulos || 'No especificado'}</span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Estado de Inscripción:</label> 
                                            <span className={`estado-badge-verestd ${inscripcion.estado?.toLowerCase() === 'pendiente' ? 'estado-pendiente-verestd' : ''}`}>
                                                {inscripcion.estado || 'No especificado'}
                                            </span>
                                        </div>
                                        <div className="dato-item-verestd">
                                            <label>Fecha de Inscripción:</label> 
                                            <span>{formatDate(inscripcion?.fechaInscripcion)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="dato-item-verestd">
                                        <span>No se encontraron datos de inscripción.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Documentación */}
                    <div className="documentacion-verestd">
                        <h4>Documentación Presentada</h4>
                        {documentacion && Array.isArray(documentacion) && documentacion.length > 0 ? (
                            <table className="tabla-documentacion-verestd">
                                <thead>
                                    <tr>
                                        <th>Documento</th>
                                        <th>Estado</th>
                                        <th>Fecha de Entrega</th>
                                        <th>Archivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentacion.map((doc, index) => (
                                        <tr key={index}>
                                            <td>{doc.descripcionDocumentacion || 'Documento sin nombre'}</td>
                                            <td>
                                                <span className={`estado-badge-verestd ${doc.estadoDocumentacion?.toLowerCase() === 'pendiente' ? 'estado-pendiente-verestd' : ''} ${doc.estadoDocumentacion?.toLowerCase() === 'faltante' ? 'estado-inactivo-verestd' : ''}`}>
                                                    {doc.estadoDocumentacion || 'Faltante'}
                                                </span>
                                            </td>
                                            <td>{doc.fechaEntrega ? formatDate(doc.fechaEntrega) : 'No entregado'}</td>
                                            <td>
                                                {doc.archivoDocumentacion ? (
                                                    <a href={doc.archivoDocumentacion} target="_blank" rel="noopener noreferrer">
                                                        Ver
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#aaa' }}>Sin archivo</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#888', margin: '10px 0 0 0' }}>
                                No se encontró documentación registrada para este estudiante.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

ConsultaEstd.propTypes = {
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
};

export default ConsultaEstd;