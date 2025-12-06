import { useState, useEffect } from 'react';
import serviceObtenerAcad from '../services/serviceObtenerAcad';

/**
 * Custom hook para cargar módulos y estados de inscripción según el plan y la modalidad.
 * @param {boolean} editAcademica - Si está en modo edición académica.
 * @param {number|string} planAnioId - ID del plan/año seleccionado.
 * @param {string} modalidad - Modalidad seleccionada.
 * @returns {[Array, Array]} [modulos, estadosInscripcion]
 */
export function useModulosYEstados(editAcademica, planAnioId, modalidad) {
  const [modulos, setModulos] = useState([]);
  const [estadosInscripcion, setEstadosInscripcion] = useState([]);

  // 🔹 Cargar módulos según plan y modalidad
  useEffect(() => {
    let cancelado = false;
    async function cargarModulos() {
      if (editAcademica && planAnioId && modalidad) {
        try {
          const response = await serviceObtenerAcad.getModulos(planAnioId);
          if (!cancelado) setModulos(Array.isArray(response) ? response : []);
        } catch (error) {
          if (!cancelado) setModulos([]);
          console.error('Error al cargar módulos:', error);
        }
      } else {
        setModulos([]);
      }
    }
    cargarModulos();
    return () => { cancelado = true; };
  }, [editAcademica, planAnioId, modalidad]);

  // 🔹 Cargar estados de inscripción
  useEffect(() => {
    let cancelado = false;
    async function cargarEstados() {
      try {
        const response = await serviceObtenerAcad.getEstadosInscripcion();
        if (!cancelado) setEstadosInscripcion(Array.isArray(response) ? response : []);
      } catch (error) {
        if (!cancelado) setEstadosInscripcion([]);
        console.error('Error al cargar estados:', error);
      }
    }
    cargarEstados();
    return () => { cancelado = true; };
  }, []); // ✅ Se cargan siempre, incluso en consulta

  return [modulos, estadosInscripcion];
}
