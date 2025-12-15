import PropTypes from 'prop-types';
import { useEffect } from 'react';
import CursoPlanSelector from './CursoPlanSelector';  // corregido nombre
import Input from '../Input';
import { formatearFecha } from '../../utils/fecha';
import { useModulosYEstados } from '../../hooks/useModulosYEstados'; // asegúrate que exista
// import eliminado: usePlanesPorModalidad

import service from '../../services/serviceObtenerAcad';
import { useState } from 'react';

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

  // Cargamos módulos siempre si NO es consulta para poder reparar IDs faltantes
  // Antes solo se cargaba si editMode.academica era true, lo que rompía la validación al guardar sin editar
  const [modulos, estadosInscripcion] = useModulosYEstados(
    !isConsulta,
    planIdParaHook,
    modalidad
  );

  const [divisiones, setDivisiones] = useState([]);
  const [loadingDivisiones, setLoadingDivisiones] = useState(false);

  const isPresencial = modalidad && String(modalidad).trim().toUpperCase() === 'PRESENCIAL';

  // Efecto para obtener divisiones si es Presencial
  useEffect(() => {
    if (!isPresencial || !planIdParaHook) {
      setDivisiones([]);
      return;
    }

    const fetchDivisiones = async () => {
      setLoadingDivisiones(true);
      try {
        const response = await service.getDivisiones(planIdParaHook);
        if (response && Array.isArray(response)) {
          setDivisiones(response);
        } else {
          console.error("Respuesta inválida de divisiones:", response);
          setDivisiones([]);
        }
      } catch (err) {
        console.error("Error cargando divisiones:", err);
      } finally {
        setLoadingDivisiones(false);
      }
    };
    fetchDivisiones();
  }, [isPresencial, planIdParaHook]); // Usar isPresencial en dependencia para reaccionar a cambios

  // Inicializar selects automáticamente al entrar en edición académica
  // EFECTO DE REPARACIÓN DE DATOS (Auto-fix IDs faltantes)
  // Se ejecuta cuando cargan las listas para asegurar que los IDs internos coincidan con los nombres mostrados
  useEffect(() => {
    // 1. Reparar Plan/Año
    // Revisamos si falta el ID pero tenemos el nombre (en formData o estudiante)
    const currentPlanId = formData.planAnioId || formData.cursoPlanId;
    const currentPlanName = formData.planAnio || formData.cursoPlan || estudiante.planAnio || estudiante.cursoPlan;

    if ((!currentPlanId || currentPlanId === '') && currentPlanName && planes && planes.length > 0) {
      // Intentar coincidencia exacta o laxa
      const itemEncontrado = planes.find(p =>
        (p.descripcionAnioPlan && p.descripcionAnioPlan.trim().toLowerCase() === currentPlanName.trim().toLowerCase()) ||
        (p.plan && p.plan.trim().toLowerCase() === currentPlanName.trim().toLowerCase())
      );
      if (itemEncontrado) {
        // console.log('🔧 [AUTO-REPAIR] Restaurando ID de Plan:', itemEncontrado.id, 'para:', currentPlanName);
        handleInputChange('planAnioId', itemEncontrado.id);
        handleInputChange('cursoPlanId', itemEncontrado.id);
      }
    }

    // 2. Reparar Módulos (Solo Semipresencial)
    if (!isPresencial) {
      const currentModuloId = formData.modulosId;
      const currentModuloName = formData.modulos || formData.modulo || estudiante.modulos || estudiante.modulo;

      if ((!currentModuloId || currentModuloId === '') && currentModuloName && modulos && modulos.length > 0) {
        const itemEncontrado = modulos.find(m =>
          m.modulo && m.modulo.trim().toLowerCase() === currentModuloName.trim().toLowerCase()
        );
        if (itemEncontrado) {
          // console.log('🔧 [AUTO-REPAIR] Restaurando ID de Módulo:', itemEncontrado.id, 'para:', currentModuloName);
          handleInputChange('modulosId', itemEncontrado.id);
        }
      }
    }

    // 3. Reparar Divisiones (Solo Presencial)
    if (isPresencial) {
      const currentDivId = formData.idDivision;
      const currentDivName = formData.division || estudiante.division;

      if ((!currentDivId || currentDivId === '') && currentDivName && divisiones && divisiones.length > 0) {
        const itemEncontrado = divisiones.find(d =>
          d.division && d.division.trim().toLowerCase() === currentDivName.trim().toLowerCase()
        );
        if (itemEncontrado) {
          // console.log('🔧 [AUTO-REPAIR] Restaurando ID de División:', itemEncontrado.id, 'para:', currentDivName);
          handleInputChange('idDivision', itemEncontrado.id);
        }
      }
    }

    // 4. Reparar Estado de Inscripción (Both)
    const currentEstadoId = formData.estadoInscripcionId;
    const currentEstadoName = formData.estadoInscripcion || estudiante.estadoInscripcion;

    console.log('🔍 [DEBUG REPAIR] Estado:', { currentEstadoId, currentEstadoName, estadosDisponibles: estadosInscripcion });

    if ((!currentEstadoId || currentEstadoId === '') && currentEstadoName && estadosInscripcion && estadosInscripcion.length > 0) {
      const itemEncontrado = estadosInscripcion.find(e =>
        e.descripcionEstado && e.descripcionEstado.trim().toLowerCase() === currentEstadoName.trim().toLowerCase()
      );
      if (itemEncontrado) {
        console.log('🔧 [AUTO-REPAIR] Restaurando ID de Estado:', itemEncontrado.id, 'para:', currentEstadoName);
        handleInputChange('estadoInscripcionId', itemEncontrado.id);
      } else {
        console.warn('⚠️ [AUTO-REPAIR] No se encontró coincidencia para el estado:', currentEstadoName);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planes, modulos, divisiones, isPresencial, estudiante?.id]); // Ejecutar cuando las listas o el estudiante cambien

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

            {/* Ocultar selector de Módulo si es Presencial */}
            {!isPresencial && (
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
            )}

            {/* Mostrar División si es Presencial */}
            {isPresencial && (
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>División</label>
                {loadingDivisiones ? (
                  <p>Cargando divisiones...</p>
                ) : (
                  <select
                    className="form-control"
                    name="idDivision"
                    value={formData.idDivision || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      handleInputChange('idDivision', selectedId);
                      // Buscar el nombre de la división y actualizarlo también para reflejo inmediato en UI
                      const selectedDiv = divisiones.find(d => String(d.id) === String(selectedId));
                      if (selectedDiv) {
                        handleInputChange('division', selectedDiv.division);
                      } else {
                        handleInputChange('division', '');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  >
                    <option value="">Seleccionar División</option>
                    {divisiones.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.division}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

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
            <p>{isPresencial ? 'Año / Curso:' : 'Plan:'} {estudiante?.planAnio || estudiante?.cursoPlan || formData?.planAnio || formData?.cursoPlan || 'Sin datos'}</p>

            {/* Mostrar División solo si es Presencial */}
            {isPresencial ? (
              <p>División: {estudiante?.division || formData?.division || 'Sin asignación'}</p>
            ) : (
              <p>Módulo: {estudiante?.modulos || estudiante?.modulo || formData?.modulos || formData?.modulo || 'Sin datos'}</p>
            )}

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
