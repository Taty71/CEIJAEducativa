import PropTypes from 'prop-types';
import { useEffect } from 'react';
import CursoPlanSelector from './CursoPlanSelector';  // corregido nombre
import Input from '../Input';
import { formatearFecha } from '../../utils/fecha';
import { useModulosYEstados } from '../../hooks/useModulosYEstados'; // asegúrate que exista
// import eliminado: usePlanesPorModalidad

const TarjetaAcademica = ({
  estudiante,
  editMode,
  setEditMode,
  handleInputChange,
  isConsulta,
  modalidad: modalidadProp,
  planes = [],
}) => {

  // Recibe formData como prop desde VisorEstudiante, si existe
  const formData = (estudiante && estudiante.formData) ? estudiante.formData : estudiante;

  // Calculo modalidad y otros a partir de props y estado local
  // Prioridad: prop > formData > estudiante
  const modalidad = modalidadProp !== undefined ? modalidadProp : (formData.modalidad !== undefined ? formData.modalidad : estudiante?.modalidad || '');
  // modalidadId y modulosId ya no se usan directamente, solo se calculan para selects, así que no los defino si no se usan

  // Debug para planAnioId
  const planIdParaHook = formData.cursoPlanId || formData.planAnioId;
  // Solo log una vez para evitar loops
  // Debug logging removido para evitar renders infinitos

  const [modulos, estadosInscripcion] = useModulosYEstados(
    editMode.academica,
    planIdParaHook,
    modalidad
  );

  // Inicializar selects automáticamente al entrar en edición académica
  useEffect(() => {
    if (editMode.academica) {
      // Inicializar plan si está vacío
      if ((!formData.planAnioId && !formData.cursoPlanId) && planes && planes.length > 0 && planes[0] && planes[0].id) {
        handleInputChange('planAnioId', planes[0].id);
        handleInputChange('cursoPlanId', planes[0].id); // Para compatibilidad
        if (planes[0].plan) {
          handleInputChange('cursoPlan', planes[0].plan);
          handleInputChange('planAnio', planes[0].plan);
        }
      }
      // Inicializar módulo si está vacío
      if ((!formData.modulosId || formData.modulosId === '') && modulos && modulos.length > 0 && modulos[0] && modulos[0].id) {
        handleInputChange('modulosId', modulos[0].id);
      }
      // Inicializar estado de inscripción si está vacío
      if ((!formData.estadoInscripcionId || formData.estadoInscripcionId === '') && estadosInscripcion && estadosInscripcion.length > 0 && estadosInscripcion[0] && estadosInscripcion[0].id) {
        handleInputChange('estadoInscripcionId', estadosInscripcion[0].id);
      }
    }
    // eslint-disable-next-line
  }, [editMode.academica, planes, modulos, estadosInscripcion]);

  const handleEditar = () => {
    setEditMode(prev => ({ ...prev, academica: true }));
  };

  return (
    <div className="tarjeta" style={{ padding: '1rem' }}>
      <div className="tarjeta-header">
        <h3>Información Académica</h3>
        {!isConsulta && (
          <button onClick={handleEditar}>✏️</button>
        )}
      </div>

      <div className="tarjeta-contenido">
        {editMode.academica ? (
          <div className="tarjeta-academica-edicion">
            <div className="modalidad-info" style={{ marginBottom: '10px' }}>
              <strong>Modalidad:</strong> <span className="modalidad-elegida">{modalidad || 'Sin datos'}</span>
            </div>
            <CursoPlanSelector
              planes={planes}
              value={{
                planAnioId: formData.planAnioId || formData.cursoPlanId || '',
                cursoPlan: formData.cursoPlan || formData.planAnio || ''
              }}
              setFieldValue={(campo, valor) => handleInputChange(campo, valor)}
            />
            <Input
              label="Módulo"
              name="modulosId"
              type="select"
              options={[{ value: '', label: 'Seleccionar módulo' }, ...modulos.map(m => ({ value: m.id, label: m.modulo }))]}
              registro={{
                value: formData.modulosId || '',
                onChange: (e) => handleInputChange('modulosId', e.target.value)
              }}
            />
            <Input
              label="Estado de Inscripción"
              name="estadoInscripcionId"
              type="select"
              options={[{ value: '', label: 'Seleccionar estado' }, ...estadosInscripcion.map(ei => ({ value: ei.id, label: ei.descripcionEstado }))]}
              registro={{
                value: formData.estadoInscripcionId !== undefined && formData.estadoInscripcionId !== ''
                  ? formData.estadoInscripcionId
                  : (estudiante?.estadoInscripcionId || 1),
                onChange: (e) => handleInputChange('estadoInscripcionId', e.target.value)
              }}
            />
            <Input
              label="Fecha de Inscripción"
              name="fechaInscripcion"
              type="date"
              registro={{
                value: formData.fechaInscripcion || estudiante?.fechaInscripcion || '',
                onChange: (e) => handleInputChange('fechaInscripcion', e.target.value),
              }}
            />
          </div>
        ) : (
          <div className="tarjeta-academica">
            <p>Modalidad: {modalidad || 'Sin datos'}</p>
            <p>Curso/Plan: {estudiante?.planAnio || estudiante?.cursoPlan || formData?.planAnio || formData?.cursoPlan || 'Sin datos'}</p>
            <p>Módulo: {estudiante?.modulos || estudiante?.modulo || formData?.modulos || formData?.modulo || 'Sin datos'}</p>
            <p>Estado de Inscripción: {estudiante?.estadoInscripcion || formData?.estadoInscripcion || 'Sin datos'}</p>
            <p>Fecha de Inscripción: {
              estudiante?.fechaInscripcion
                ? formatearFecha(estudiante.fechaInscripcion)
                : formData?.fechaInscripcion
                  ? formatearFecha(formData.fechaInscripcion)
                  : 'No registrada'
            }</p>
          </div>
        )}
      </div>
    </div>
  );
};

TarjetaAcademica.propTypes = {
  estudiante: PropTypes.object.isRequired,
  editMode: PropTypes.object,
  isConsulta: PropTypes.bool,
  handleInputChange: PropTypes.func,
  setEditMode: PropTypes.func,
  modalidad: PropTypes.string,
  modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  modulosId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  planes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      descripcionAnioPlan: PropTypes.string
    })
  )
};
export default TarjetaAcademica;
