import PropTypes from 'prop-types';

const DocumentacionEditor = ({ loading, handleGuardarCambios, onClose, setFormData, documentacion }) => {
  // Maneja la carga de archivos para cada documento faltante
  const handleFileChange = (e, docId) => {
    const file = e.target.files[0];
    setFormData(prev => {
      // Guarda el archivo bajo el id del documento
      const archivos = prev.archivos ? { ...prev.archivos } : {};
      archivos[docId] = file;
      return { ...prev, archivos };
    });
  };

  return (
    <div className="tarjeta tarjeta-editor tarjeta-pequena">
      <div className="tarjeta-header">
        <h3>Documentación del Estudiante</h3>
      </div>
      <div className="tarjeta-contenido">
        {Array.isArray(documentacion) && documentacion.length > 0 ? (
          <ul className="documentacion-lista">
            {documentacion.map((doc) => {
              const tieneArchivo = !!doc.archivoDocumentacion;
              return (
                <li key={doc.idDocumentaciones} className={`documento-item ${tieneArchivo ? '' : 'faltante'}`}>
                  <span className="documento-nombre">{doc.descripcionDocumentacion}</span>
                  <span className="documento-estado">{doc.estadoDocumentacion}</span>
                  {tieneArchivo ? (
                    <a
                      href={doc.archivoDocumentacion.startsWith('http') ? doc.archivoDocumentacion : `http://localhost:5000${doc.archivoDocumentacion}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ver-archivo-mini"
                    >
                      Ver archivo
                    </a>
                  ) : (
                    <>
                      <input
                        type="file"
                        onChange={e => handleFileChange(e, doc.idDocumentaciones)}
                        className="input-cargar-archivo"
                      />
                      <span className="documento-faltante">Faltante</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="no-documentacion">
            <p>No se encontró documentación para esta inscripción.</p>
          </div>
        )}
      </div>
      <div className="tarjeta-acciones">
        <button className="btn-guardar-seccion" onClick={handleGuardarCambios} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Documentos'}
        </button>
        <button className="btn-cancelar-seccion" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

DocumentacionEditor.propTypes = {
  loading: PropTypes.bool.isRequired,
  handleGuardarCambios: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  documentacion: PropTypes.arrayOf(
    PropTypes.shape({
      idDocumentaciones: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      descripcionDocumentacion: PropTypes.string,
      estadoDocumentacion: PropTypes.string,
      archivoDocumentacion: PropTypes.string,
    })
  ),
};

export default DocumentacionEditor;
