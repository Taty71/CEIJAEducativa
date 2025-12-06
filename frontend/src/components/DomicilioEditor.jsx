import PropTypes from 'prop-types';
import CampoEditable from './subcomponents/CampoEditable';
import SelectUbicacion from './SelectUbicacion';

const DomicilioEditor = ({ 
  formData, 
  handleInputChange, 
  loading, 
  handleGuardarCambios, 
  onClose,
  esAdmin = false 
}) => (
  <div className="tarjeta-editor tarjeta-pequena">
    <h3>Domicilio</h3>
    <div className="tarjeta-contenido-editor">
      <CampoEditable 
        label="Calle" 
        campo="calle" 
        formData={formData} 
        onInputChange={handleInputChange} 
      />
      <CampoEditable 
        label="Número" 
        campo="numero" 
        formData={formData} 
        onInputChange={handleInputChange} 
        tipo="number" 
      />
      
      <div className="campo-editable">
        <label>Provincia:</label>
        <SelectUbicacion
          tipo="provincia"
          name="provincia"
          value={formData.provincia || ''}
          onChange={handleInputChange}
          esAdmin={esAdmin}
          placeholder="Seleccione Provincia"
          className="form-control-editor"
        />
      </div>

      <div className="campo-editable">
        <label>Localidad:</label>
        <SelectUbicacion
          tipo="localidad"
          name="localidad"
          value={formData.localidad || ''}
          onChange={handleInputChange}
          dependeDe="provincia"
          valorDependencia={formData.provincia}
          esAdmin={esAdmin}
          placeholder="Seleccione Localidad"
          className="form-control-editor"
        />
      </div>

      <div className="campo-editable">
        <label>Barrio:</label>
        <SelectUbicacion
          tipo="barrio"
          name="barrio"
          value={formData.barrio || ''}
          onChange={handleInputChange}
          dependeDe="localidad"
          valorDependencia={formData.localidad}
          esAdmin={esAdmin}
          placeholder="Seleccione Barrio"
          className="form-control-editor"
        />
      </div>
    </div>
    <div className="tarjeta-acciones">
      <button className="btn-guardar-seccion" onClick={handleGuardarCambios} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Domicilio'}
      </button>
      <button className="btn-cancelar-seccion" onClick={onClose}>Cancelar</button>
    </div>
  </div>
);

DomicilioEditor.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  handleGuardarCambios: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  esAdmin: PropTypes.bool,
};

export default DomicilioEditor;
