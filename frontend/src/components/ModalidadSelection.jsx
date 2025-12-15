// src/components/ModalidadSelection.jsx
import PropTypes from 'prop-types';
import { useEffect, useRef, memo } from 'react';
import PlanAnioSelector from './PlanAnioSelector';

const ModalidadSelection = memo(({ modalidad, modalidadId, handleChange, setFieldValue, values, showMateriasList, division, isAdmin, estadoInscripcion }) => {
    const prevValuesRef = useRef();

    // Solo hacer log cuando cambien valores importantes
    useEffect(() => {
        if (import.meta.env.DEV) {
            const currentImportantValues = {
                modalidad,
                planAnio: values.planAnio,
                modalidadId,
                showMateriasList
            };

            const prevValues = prevValuesRef.current;

            // Solo hacer log si es el primer render o si cambió algo importante
            if (!prevValues ||
                prevValues.modalidad !== modalidad ||
                prevValues.planAnio !== values.planAnio ||
                prevValues.modalidadId !== modalidadId ||
                prevValues.showMateriasList !== showMateriasList) {

                console.log(`[ModalidadSelection] Modalidad: ${modalidad}, planAnio: ${values.planAnio}, modalidadId: ${modalidadId}, showMateriasList: ${showMateriasList}`);

                prevValuesRef.current = currentImportantValues;
            }
        }
    }, [modalidad, values.planAnio, modalidadId, showMateriasList]);

    // Para nuevos registros, asegurar value controlado (string vacío si no hay valor)
    // Normalizar planAnio como string para evitar inconsistencias entre number/string
    const planAnioValue = values.planAnio !== undefined && values.planAnio !== null ? String(values.planAnio) : '';
    return (
        <div className="form-eleccion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h3 style={{ margin: 0, flex: 1 }}>Información Académica</h3>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ width: '100%', marginBottom: 8 }}>
                    <label htmlFor="modalidad"><strong>Modalidad:</strong></label>
                    <select
                        id="modalidad"
                        name="modalidad"
                        value={modalidad || ''}
                        onChange={e => {
                            const val = e.target.value;
                            setFieldValue('modalidad', val);
                            setFieldValue('modalidadId', val === 'Presencial' ? 1 : val === 'Semipresencial' ? 2 : '');
                        }}
                    >
                        <option value="">Seleccionar Modalidad</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Semipresencial">Semipresencial</option>
                    </select>
                </div>
                <div className="form-group" style={{ width: '100%' }}>
                    <PlanAnioSelector
                        modalidad={modalidad}
                        modalidadId={modalidadId}
                        value={planAnioValue}
                        setFieldValue={setFieldValue}
                        showMateriasList={showMateriasList}
                        handleChange={handleChange}
                        division={division}
                        isAdmin={isAdmin}
                        estadoInscripcion={estadoInscripcion}
                    />
                </div>
            </div>
        </div>
    );
});

// Agregar displayName para React DevTools
ModalidadSelection.displayName = 'ModalidadSelection';

ModalidadSelection.propTypes = {
    modalidad: PropTypes.string.isRequired,
    modalidadId: PropTypes.number.isRequired,
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    showMateriasList: PropTypes.bool.isRequired,
    division: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isAdmin: PropTypes.bool,
    estadoInscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ModalidadSelection;
