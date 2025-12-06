import { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import '../estilos/ValidadorSintaxisDNI.css';

const ValidadorSintaxisDNI = ({ onValidationChange }) => {
    const { values, touched } = useFormikContext();
    const [dniError, setDniError] = useState('');
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (values.tipoDocumento === 'DNI') {
            const dni = values.dni || '';
            
            // NO validar si está vacío - eso lo hace Yup
            if (dni.length === 0) {
                setDniError('');
                setIsValid(true);
                if (onValidationChange) onValidationChange(true, '');
                return;
            }
            
            // Verificar si tiene caracteres no numéricos
            if (dni && !/^\d*$/.test(dni)) {
                setDniError('El DNI solo puede contener números, sin espacios ni puntos');
                setIsValid(false);
                if (onValidationChange) onValidationChange(false, 'El DNI solo puede contener números');
                return;
            }
            
            // Verificar longitud incorrecta (si tiene contenido pero no 8 dígitos)
            if (dni && dni.length > 0 && dni.length !== 8) {
                setDniError('El DNI debe tener exactamente 8 dígitos');
                setIsValid(false);
                if (onValidationChange) onValidationChange(false, 'El DNI debe tener exactamente 8 dígitos');
                return;
            }
            
            // Si llegó aquí, es válido
            setDniError('');
            setIsValid(true);
            if (onValidationChange) onValidationChange(true, '');
        } else {
            setDniError('');
            setIsValid(true);
            if (onValidationChange) onValidationChange(true, '');
        }
    }, [values.dni, values.tipoDocumento, onValidationChange]);

    // No renderizar nada si no hay error
    if (!dniError || isValid) {
        return null;
    }

    return (
        <div className="dni-syntax-error">
            <div className="error-banner">
                {dniError}
            </div>
        </div>
    );
};

ValidadorSintaxisDNI.propTypes = {
    onValidationChange: PropTypes.func
};

export default ValidadorSintaxisDNI;