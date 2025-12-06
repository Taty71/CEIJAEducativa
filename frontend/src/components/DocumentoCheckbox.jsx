// src/components/DocumentoCheckbox.jsx
import PropTypes from 'prop-types';

const DocumentoCheckbox = ({ label, name, preview, onFileChange }) => {
    return (
        <div className="doc-item">
            <label>{label}</label>
            <input
                type="file"
                name={name}
                onChange={(e) => onFileChange(e, name)}
            />
            <input
                type="checkbox"
                checked={Boolean(preview)}
                readOnly
                disabled
                title={preview ? "Entregado" : "Faltante"}
            />
        </div>
    );
};

DocumentoCheckbox.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    preview: PropTypes.object,
    onFileChange: PropTypes.func.isRequired,
};

export default DocumentoCheckbox;
