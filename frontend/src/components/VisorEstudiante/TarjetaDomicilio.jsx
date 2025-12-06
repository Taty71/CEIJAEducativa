import PropTypes from 'prop-types';
import { useState } from 'react';

const TarjetaDomicilio = ({
    formData,
    editMode,
    setEditMode,
    handleInputChange,
    isConsulta
}) => {
    const [alerta] = useState(null);

   

    return (
        <div className="tarjeta tarjeta-domicilio" style={{ height: '520px' }}>
            {alerta && <div className={`alerta alerta-${alerta.variant}`}>{alerta.text}</div>}
            <div className="tarjeta-header">
                <h3>Domicilio</h3>
                {!isConsulta && (
                    <button onClick={() => setEditMode(prev => ({ ...prev, domicilio: true }))}>✏️</button>
                )}
            </div>

            <div className="tarjeta-contenido">
                {['calle', 'numero', 'barrio', 'localidad', 'provincia'].map(campo => (
                    <div className="dato-item" key={campo}>
                        <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}:</label>
                        {editMode.domicilio ? (
                            <input value={formData[campo] || ''} onChange={e => handleInputChange(campo, e.target.value)} />
                        ) : (
                            <span>{formData[campo] || ''}</span>
                        )}
                    </div>
                ))}
            </div>

          
        </div>
    );
};

TarjetaDomicilio.propTypes = {
    formData: PropTypes.object.isRequired,
    editMode: PropTypes.object.isRequired,
    isConsulta: PropTypes.bool,
    isEliminacion: PropTypes.bool,
    handleInputChange: PropTypes.func.isRequired,
    setEditMode: PropTypes.func.isRequired,
};

export default TarjetaDomicilio;
