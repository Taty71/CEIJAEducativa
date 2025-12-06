import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MateriasSelector from './MateriasSelector';
import BotonCargando from './BotonCargando';
import AlertaMens from './AlertaMens';
import serviceObtenerAcad from '../services/serviceObtenerAcad';

const AreaEstudioSelector = ({ idModulo, modalidadId }) => {
    const prevValuesRef = useRef();

    // Solo hacer log cuando cambien los valores
    useEffect(() => {
        if (import.meta.env.DEV) {
            const currentValues = { idModulo, modalidadId };
            const prevValues = prevValuesRef.current;
            
            if (!prevValues || 
                prevValues.idModulo !== idModulo || 
                prevValues.modalidadId !== modalidadId) {
                
                console.log("[AreaEstudioSelector] Valores para API:", currentValues);
                prevValuesRef.current = currentValues;
            }
        }
    }, [idModulo, modalidadId]);
  
    const [areasEstudio, setAreasEstudio] = useState([]);
    const [loading] = useState(false);
    const [error] = useState(null);
    const [idAreaEstudio, setIdAreaEstudio] = useState("");
   
    const handleAreaEstudioChange = (e) => {
        setIdAreaEstudio(Number(e.target.value)); 
    };
    
  useEffect(() => {
    const fetchAreas = async () => {
        try {
            const response = await serviceObtenerAcad.getAreasEstudio(idModulo); // Llamada a la API con idModulo
            // La API devuelve directamente un array
            if (Array.isArray(response)) {
                setAreasEstudio(response);
            } else {
                console.error("La respuesta no es un array de áreas:", response);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    fetchAreas();
}, [idModulo]);
    
    return (
        <div className="form-group">
            <label htmlFor="areaEstudio"><strong>🎯 Área de Estudio:</strong></label>
            
            {loading ? (
                <BotonCargando loading={loading} /> // Muestra un spinner o mensaje de carga
            ) : error ? (
                <AlertaMens text={error} variant="error" /> // Muestra un mensaje de error
            ) : (
                <select id="areaEstudio" value={idAreaEstudio || ""} onChange={handleAreaEstudioChange}>
                    <option value="">Seleccionar Área de Estudio</option>
                    {areasEstudio && areasEstudio.length > 0 ? (
                        areasEstudio.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.nombre}
                            </option>
                        ))
                    ) : (
                        <option value="">No hay áreas de estudio disponibles</option>
                    )}
                </select>
            )}

    {idAreaEstudio ? (
        <div style={{ marginTop: '15px' }}>
            <MateriasSelector idAreaEstudio={idAreaEstudio} handleChange={handleAreaEstudioChange} />
        </div>
    ) : (
        <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
            Selecciona un área para ver las materias disponibles
        </p>
    )}
</div>
    )
}

AreaEstudioSelector.propTypes = {
    idModulo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    idAreaEstudio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AreaEstudioSelector;
