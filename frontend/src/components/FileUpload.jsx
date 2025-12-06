import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFileHandler } from '../hooks/useFileHandler';
import '../estilos/FileUpload.css';

/**
 * Componente especializado para carga de archivos
 */
const FileUpload = ({ 
    label, 
    type = 'documento', 
    required = false, 
    value, 
    onChange, 
    disabled = false,
    accept
}) => {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    
    const { 
        validateFile, 
        generatePreview, 
        getFileInfo
    } = useFileHandler();
    
    const [preview, setPreview] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [errors, setErrors] = useState([]);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validar archivo
        const validation = validateFile(file, type);
        setErrors(validation.errors);

        if (validation.isValid) {
            // Generar preview si es imagen
            if (file.type.startsWith('image/')) {
                try {
                    const previewUrl = await generatePreview(file);
                    setPreview(previewUrl);
                } catch (error) {
                    console.error('Error generando preview:', error);
                }
            }

            // Obtener información del archivo
            setFileInfo(getFileInfo(file));
            
            // Llamar onChange
            onChange(file);
        } else {
            setPreview(null);
            setFileInfo(null);
            onChange(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const clearFile = () => {
        setPreview(null);
        setFileInfo(null);
        setErrors([]);
        onChange(null);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Determinar accept si no se proporciona
    const getAccept = () => {
        if (accept) return accept;
        
        switch (type) {
            case 'foto':
                return 'image/jpeg,image/jpg,image/png';
            case 'documento':
                return 'application/pdf,image/jpeg,image/jpg,image/png';
            default:
                return '';
        }
    };

    return (
        <div className="file-upload-container">
            <label className="file-upload-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            
            <div 
                className={`file-upload-zone ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={!disabled ? openFileSelector : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAccept()}
                    onChange={handleFileChange}
                    disabled={disabled}
                    className="file-input"
                />
                
                {!value ? (
                    <div className="upload-placeholder">
                        <div className="upload-icon">📁</div>
                        <div className="upload-text">
                            <p>Arrastra un archivo aquí o <span className="upload-link">selecciona uno</span></p>
                            <p className="upload-hint">
                                {type === 'foto' ? 'Imágenes: JPG, PNG (máx. 5MB)' : 'PDF o imágenes (máx. 10MB)'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="file-selected">
                        {preview && (
                            <div className="file-preview">
                                <img src={preview} alt="Preview" className="preview-image" />
                            </div>
                        )}
                        
                        <div className="file-details">
                            <div className="file-name">{fileInfo?.name}</div>
                            <div className="file-meta">
                                <span className="file-size">{fileInfo?.sizeFormatted}</span>
                                <span className="file-type">{fileInfo?.extension?.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        {!disabled && (
                            <button 
                                type="button" 
                                className="remove-file" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                aria-label="Eliminar archivo"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {errors.length > 0 && (
                <div className="file-errors">
                    {errors.map((error, index) => (
                        <div key={index} className="file-error">
                            ⚠ {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

FileUpload.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['foto', 'documento']),
    required: PropTypes.bool,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    accept: PropTypes.string
};

export default FileUpload;