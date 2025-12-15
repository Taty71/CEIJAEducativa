
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import trashIcon from '../assets/logos/trash.png'; // Import trash icon
import CloseButton from './CloseButton';
import { DocumentacionNameToId } from '../utils/DocumentacionMap';
import '../estilos/estilosModalDocumentacion.css';
import { useGlobalAlerts } from '../hooks/useGlobalAlerts';

const estadosPosibles = ['Entregado', 'Faltante'];

const ModalDocumentacion = ({ onClose, documentacion, onGuardarCambios }) => {
  // Copiamos la documentación para poder modificar localmente
  const [docsEdit, setDocsEdit] = useState([]);
  const { showError, showSuccess } = useGlobalAlerts();

  useEffect(() => {
    // Clonamos y añadimos campo para archivo temporal (File) y url preview
    const docsConArchivos = documentacion.map(doc => ({
      ...doc,
      nuevoArchivo: null,
      previewUrl: doc.archivoDocumentacion || null,
    }));
    setDocsEdit(docsConArchivos);
  }, [documentacion]);

  const handleEstadoChange = (id, nuevoEstado) => {
    setDocsEdit(prev =>
      prev.map(doc =>
        doc.idDocumentaciones === id ? { ...doc, estadoDocumentacion: nuevoEstado } : doc
      )
    );
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación según tipo de documento (Foto o Documento)
    if (id === DocumentacionNameToId.foto) {
      // Es una Foto: solo JPG/PNG
      const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedPhotoTypes.includes(file.type)) {
        showError('Se permiten formato jpg, png en el caso foto');
        return;
      }
    } else {
      // Es un Documento: PDF o JPG/PNG
      const allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedDocTypes.includes(file.type)) {
        showError('Se permiten formato pdf, jpg en documentos');
        return;
      }
    }

    // Validación de tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('El archivo es demasiado grande. Máximo permitido: 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);

    setDocsEdit(prev =>
      prev.map(doc =>
        doc.idDocumentaciones === id
          ? { ...doc, nuevoArchivo: file, previewUrl: url }
          : doc
      )
    );
    showSuccess('Archivo subido correctamente');
  };

  const handleQuitarArchivo = (id) => {
    setDocsEdit(prev =>
      prev.map(doc =>
        doc.idDocumentaciones === id
          ? { ...doc, nuevoArchivo: null, previewUrl: null, archivoDocumentacion: null, estadoDocumentacion: 'Faltante' }
          : doc
      )
    );
    showSuccess('Archivo eliminado correctamente');
  };

  const handleGuardar = () => {
    // Mandar toda la info editada para actualizar en backend
    onGuardarCambios(docsEdit);
  };

  return (
    <div className="modal">
      <div className="modal-documentacion">
        <CloseButton onClose={onClose} variant="modal" />
        <h3 className="modal-h3">Documentación del Estudiante</h3>
        {docsEdit.length > 0 ? (
          <table className="modal-doc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha de Entrega</th>
                <th>Archivo / Vista Previa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docsEdit.map(doc => (
                <tr key={doc.idDocumentaciones}>
                  <td>{doc.idDocumentaciones}</td>
                  <td>{doc.descripcionDocumentacion}</td>
                  <td>
                    <select
                      value={doc.estadoDocumentacion}
                      onChange={(e) => handleEstadoChange(doc.idDocumentaciones, e.target.value)}
                    >
                      {estadosPosibles.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </td>
                  <td>{doc.fechaEntrega || 'No entregado'}</td>
                  <td>
                    {doc.previewUrl ? (
                      <>
                        <a href={doc.previewUrl} target="_blank" rel="noopener noreferrer">
                          Ver archivo
                        </a>
                        <br />
                        {doc.nuevoArchivo && <small>(Archivo nuevo listo para subir)</small>}
                      </>
                    ) : (
                      <span className="sin-archivo">Sin archivo</span>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(doc.idDocumentaciones, e)}
                    />
                  </td>
                  <td>
                    {(doc.archivoDocumentacion || doc.nuevoArchivo) && (
                      <button
                        type="button"
                        onClick={() => handleQuitarArchivo(doc.idDocumentaciones)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Eliminar documento"
                      >
                        <img src={trashIcon} alt="Eliminar" style={{ width: '20px', height: '20px' }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No se encontró documentación para esta inscripción.</p>
        )}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleGuardar}>Guardar Cambios</button>
          <button onClick={onClose} style={{ marginLeft: '1rem' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

ModalDocumentacion.propTypes = {
  onClose: PropTypes.func.isRequired,
  documentacion: PropTypes.array.isRequired,
  onGuardarCambios: PropTypes.func.isRequired,
};

export default ModalDocumentacion;
