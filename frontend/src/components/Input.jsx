import '../estilos/input.css';
import PropTypes from 'prop-types';

function Input(props) {
    const { label, type, name, placeholder, options = [], className, registro, error, forceNumber, ...rest } = props;

    // Solo convierte a número si forceNumber es true
    const handleChange = (e) => {
        if (forceNumber) {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            if (registro && typeof registro.onChange === 'function') {
                registro.onChange({ ...e, target: { ...e.target, value } });
            }
        } else if (registro && typeof registro.onChange === 'function') {
            registro.onChange(e);
        }
    };

    return (
        <div className="input-container">
            <label>{label}</label>
            {options.length > 0 ? (
                <select
                    name={name}
                    className={className}
                    {...registro}
                    {...rest}
                    onChange={handleChange}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type || 'text'}
                    name={name || ''}
                    placeholder={placeholder || ''}
                    {...registro}
                    {...rest}
                />
            )}
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}

Input.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    registro: PropTypes.object,
    error: PropTypes.any,
    className: PropTypes.string,
    onChange: PropTypes.func,
    forceNumber: PropTypes.bool, // Solo úsalo donde realmente necesites un número
};

export default Input;