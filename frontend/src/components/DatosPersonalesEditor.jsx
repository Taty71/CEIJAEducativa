import PropTypes from 'prop-types';
import CampoEditable from './subcomponents/CampoEditable';

const DatosPersonalesEditor = ({ formData, handleInputChange, loading, handleGuardarCambios, onClose }) => (
  <div className="tarjeta-editor tarjeta-pequena">
    <h3>Datos Personales</h3>
    <div className="tarjeta-contenido-editor">
      <CampoEditable label="Nombre" campo="nombre" formData={formData} onInputChange={handleInputChange} />
      <CampoEditable label="Apellido" campo="apellido" formData={formData} onInputChange={handleInputChange} />
      <CampoEditable label="DNI" campo="dni" formData={formData} onInputChange={handleInputChange} tipo="number" />
      <CampoEditable label="CUIL" campo="cuil" formData={formData} onInputChange={handleInputChange} />
      <CampoEditable label="Email" campo="email" formData={formData} onInputChange={handleInputChange} tipo="email" />
      <CampoEditable label="Teléfono" campo="telefono" formData={formData} onInputChange={handleInputChange} tipo="tel" />
      <CampoEditable label="Fecha de Nacimiento" campo="fechaNacimiento" formData={formData} onInputChange={handleInputChange} tipo="date" />
      <CampoEditable label="Tipo de Documento" campo="tipoDocumento" formData={formData} onInputChange={handleInputChange} />
      <CampoEditable label="País de Emisión" campo="paisEmision" formData={formData} onInputChange={handleInputChange} />
    </div>
    <div className="tarjeta-acciones">
      <button className="btn-guardar-seccion" onClick={handleGuardarCambios} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Datos'}
      </button>
      <button className="btn-cancelar-seccion" onClick={onClose}>Cancelar</button>
    </div>
  </div>
);

DatosPersonalesEditor.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  handleGuardarCambios: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DatosPersonalesEditor;
