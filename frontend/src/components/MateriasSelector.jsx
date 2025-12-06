import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import service from "../services/serviceObtenerAcad";
import BotonCargando from "./BotonCargando";

const MateriasSelector = ({ idAreaEstudio }) => {
    const prevIdAreaEstudioRef = useRef();

    // Solo hacer log cuando cambie idAreaEstudio
    useEffect(() => {
        if (import.meta.env.DEV) {
            if (prevIdAreaEstudioRef.current !== idAreaEstudio) {
                console.log("[MateriasSelector] Valores para API de materias:", { idAreaEstudio });
                prevIdAreaEstudioRef.current = idAreaEstudio;
            }
        }
    }, [idAreaEstudio]);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchMaterias = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await service.getMateriasPorArea(idAreaEstudio);
            console.log("Respuesta de la API de materias:", response);

            if (Array.isArray(response)) {
                setMaterias(response);
            } else {
                setError("No se encontraron materias para esta área de estudio.");
            }
        } catch (error) {
            console.error("Error al obtener materias:", error);
            setError("Hubo un error al obtener las materias.");
        } finally {
            setLoading(false);
        }
    };

        if (idAreaEstudio) {
            fetchMaterias();
        }
    }, [idAreaEstudio]);

    return (
        <div className="form-group">
            <label htmlFor="materias"><strong>📖 Materias:</strong></label>
            <div className="materias-container">
                {loading ? (
                    <BotonCargando loading={loading} />
                ) : error ? (
                    <p style={{ color: '#e74c3c', fontStyle: 'italic', textAlign: 'center' }}>{error}</p>
                ) : materias.length > 0 ? (
                    <ul className="materias-list">
                        {materias.map((materia) => (
                            <li key={materia.id} className="materia-item">{materia.materia}</li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>No hay materias disponibles.</p>
                )}
            </div>
        </div>
    );
};

MateriasSelector.propTypes = {
    idAreaEstudio: PropTypes.number.isRequired,
};

export default MateriasSelector;