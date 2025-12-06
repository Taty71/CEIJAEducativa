import PropTypes from 'prop-types';

const InformacionAcademica = ({ formData, onInputChange }) => {
    const renderCampoEditable = (label, campo) => (
        <div className="campo-editable">
            <label>{label}:</label>
            <input
                type="text"
                value={formData[campo] || ''}
                onChange={(e) => onInputChange(campo, e.target.value)}
                className="input-edicion"
            />
        </div>
    );

    return (
        <div className="tarjeta-editor">
            <h3>Información Académica</h3>
            <div className="tarjeta-contenido-editor">
                {renderCampoEditable('Modalidad', 'modalidad')}
                {renderCampoEditable('Plan', 'planAnio')}
                {renderCampoEditable('Módulo', 'modulo')}
                {renderCampoEditable('Estado de Inscripción', 'estadoInscripcion')}
                {renderCampoEditable('Fecha de Inscripción', 'fechaInscripcion')}
            </div>
        </div>
    );
};

InformacionAcademica.propTypes = {
    formData: PropTypes.object.isRequired,
    onInputChange: PropTypes.func.isRequired,
};

export default InformacionAcademica;
