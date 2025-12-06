
import PropTypes from 'prop-types';
import Input from '../Input';

/**
 * Selector de Curso/Plan filtrado por modalidad.
 * Recibe los planes ya filtrados como prop.
 */
const CursoPlanSelector = ({ planes, value, setFieldValue }) => {
    const handleCursoPlanChange = (e) => {
        const selectedPlanId = Number(e.target.value);
        setFieldValue('planAnioId', selectedPlanId);  // Cambiar a planAnioId
        setFieldValue('cursoPlanId', selectedPlanId); // Mantener cursoPlanId para compatibilidad

        // Busca el curso/plan seleccionado para setear también el nombre
        const cursoSeleccionado = planes && planes.find(p => p && p.id === selectedPlanId);
        if (cursoSeleccionado && cursoSeleccionado.plan) {
            setFieldValue('cursoPlan', cursoSeleccionado.plan);
            setFieldValue('planAnio', cursoSeleccionado.plan); // También planAnio
        }
    };

    return (
        <div className="curso-plan-selector">
            {(!planes || planes.length === 0) && (
                <div style={{ color: 'red', marginBottom: '0.5rem' }}>
                    ⚠️ No hay planes disponibles para la modalidad seleccionada.
                </div>
            )}
            <Input
                label="Curso / Plan"
                name="planAnioId"
                type="select"
                options={(() => {
                    const opciones = [
                        { value: '', label: 'Seleccionar curso/plan' },
                        ...(planes || []).filter(p => p && p.id && p.descripcionAnioPlan).map(p => ({
                            value: p.id,
                            label: p.descripcionAnioPlan
                        }))
                    ];
                    return opciones;
                })()}
                registro={{
                    value: (() => {
                        const valorOriginal = value.planAnioId || value.cursoPlanId || '';
                        const valorFinal = valorOriginal === '' ? '' : Number(valorOriginal);
                        return valorFinal;
                    })(),
                    onChange: handleCursoPlanChange
                }}
            />
        </div>
    );
};

CursoPlanSelector.propTypes = {
    planes: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            plan: PropTypes.string
        })
    ),
    value: PropTypes.object.isRequired, // Debe contener cursoPlanId y cursoPlan
    setFieldValue: PropTypes.func.isRequired
};

export default CursoPlanSelector;
