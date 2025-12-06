
import { useEffect, useState, useCallback } from 'react';
import service from '../services/serviceInscripcion';
import serviceListaEstudiantes from '../services/serviceListaEstudiantes';
import serviceEstados from '../services/serviceObtenerAcad';
import FormatError from '../utils/MensajeError';
import '../estilos/listaEstudiantes.css';
import '../estilos/listaEstudiantesNueva.css';
import '../estilos/estilosInscripcion.css';
import CloseButton from '../components/CloseButton';
import PropTypes from 'prop-types';
// Componentes divididos
import PanelControles from '../components/ListaEstudiantes/PanelControles';
import BuscadorDNI from '../components/BuscadorDNI';
import TablaEstudiantes from '../components/ListaEstudiantes/TablaEstudiantes';
import PaginacionControles from '../components/ListaEstudiantes/PaginacionControles';
import ResumenEstadisticas from '../components/ListaEstudiantes/ResumenEstadisticas';
import ConsultaEstd from './ConsultaEstd';
import ModalPreviewEmail from '../components/ListaEstudiantes/ModalPreviewEmail';
import ModalReportesEstudiantes from '../components/ListaEstudiantes/ModalReportesEstudiantes';
import { useAlerts } from '../hooks/useAlerts';

const ListaEstudiantes = ({ onClose, refreshKey = 0, modalidad }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroActivo, setFiltroActivo] = useState('todos');

  const [modoBusqueda, setModoBusqueda] = useState(false);
  const [estadosInscripcion, setEstadosInscripcion] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [inicialApellido] = useState('');

  const [totalRegistros, setTotalRegistros] = useState({ total: 0, activos: 0, inactivos: 0 });
  const limit = 5; // show 5 records per page

  const cargarEstudiantes = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError('');
      // determinar modalidadId numérico a partir de la prop `modalidad` (1=Presencial,2=Semipresencial)
      let modalidadIdToSend = undefined;
      if (modalidad && typeof modalidad === 'string') {
        const m = modalidad.trim().toLowerCase();
        if (m === 'presencial') modalidadIdToSend = 1;
        else if (m === 'semipresencial') modalidadIdToSend = 2;
      }

      // enviar también el filtro de estado de inscripción (estadoFiltro) y la modalidadId al backend
      // Usar la nueva ruta que no fuerza activos por defecto cuando se pide 'todos'
      let response;
      if (filtroActivo === 'todos') {
        response = await service.getPaginatedAllEstudiantes(currentPage, limit, filtroActivo, modalidadIdToSend, estadoFiltro, inicialApellido);
      } else {
        response = await service.getPaginatedEstudiantes(currentPage, limit, filtroActivo, modalidadIdToSend, estadoFiltro, inicialApellido);
      }

      if (response.success) {
        // Obtener totales filtrados por modalidad: activos e inactivos por separado
        let activosCount = 0;
        let inactivosCount = 0;
        try {
          const respAct = await service.getPaginatedEstudiantes(1, 1, 'activos', modalidadIdToSend, estadoFiltro, inicialApellido);
          const respInact = await service.getPaginatedEstudiantes(1, 1, 'desactivados', modalidadIdToSend, estadoFiltro, inicialApellido);
          activosCount = respAct && respAct.total ? Number(respAct.total) : 0;
          inactivosCount = respInact && respInact.total ? Number(respInact.total) : 0;
        } catch (errTotals) {
          console.warn('No se pudieron obtener totales filtrados, fallback a cálculo local', errTotals);
          // Fallback: intentar calcular a partir de los estudiantes recibidos
          const list = Array.isArray(response.estudiantes) ? response.estudiantes : [];
          activosCount = list.filter(e => e.activo === true || e.activo === 1).length;
          inactivosCount = list.filter(e => e.activo === false || e.activo === 0).length;
        }

        const totales = {
          total: activosCount + inactivosCount,
          activos: activosCount,
          inactivos: inactivosCount
        };

        setEstudiantes(response.estudiantes || []);
        setTotalRegistros(totales);
        setTotalPages(response.totalPages || 1);
        setError('');
        setLoading(false);
      } else {
        const errorMessage = FormatError({ mensaje: response.error });
        setError(errorMessage || 'Error al cargar estudiantes');
        setEstudiantes([]);
        setTotalRegistros({ total: 0, activos: 0, inactivos: 0 });
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = FormatError(err);
      setError(errorMessage);
      setEstudiantes([]);
      setTotalRegistros({ total: 0, activos: 0, inactivos: 0 });
      setLoading(false);
    }
  }, [filtroActivo, limit, estadoFiltro, inicialApellido, modalidad]);

  useEffect(() => {
    cargarEstudiantes(page);
  }, [page, cargarEstudiantes, refreshKey]);


  useEffect(() => {
    cargarEstudiantes(1);
  }, [filtroActivo, cargarEstudiantes]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        console.log('🔍 Cargando estados de inscripción...');
        const data = await serviceEstados.getEstadosInscripcion();
        console.log('📊 Estados recibidos:', data);

        if (Array.isArray(data)) {
          setEstadosInscripcion(data);
        } else if (data && data.estados && Array.isArray(data.estados)) {
          setEstadosInscripcion(data.estados);
        } else if (data && data.success && Array.isArray(data.data)) {
          setEstadosInscripcion(data.data);
        } else {
          console.warn('⚠️ Formato de datos de estados no reconocido:', data);
          setEstadosInscripcion([]);
        }
      } catch (error) {
        console.error('❌ Error al cargar estados:', error);
        setEstadosInscripcion([]);
      }
    };
    fetchEstados();
  }, []);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-AR');
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleEmitirComprobante = async (estudiante) => {
    try {
      setLoading(true);
      // Solicitar al servicio que genere el comprobante PDF y lo devuelva como blob
      const blob = await serviceListaEstudiantes.generarComprobante(estudiante.dni);
      if (!blob) throw new Error('Respuesta inválida al generar comprobante');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Comprobante_${estudiante.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error('🚨 Error en handleEmitirComprobante:', error);
      const errorMessage = error.message || 'Error al generar el comprobante';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const [consultaData, setConsultaData] = useState(null);
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEstudiante, setPreviewEstudiante] = useState(null);
  const [modalReportesOpen, setModalReportesOpen] = useState(false);
  const [estudiantesReporte, setEstudiantesReporte] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const { showInfo } = useAlerts();

  const handleVerEstudiante = async (estudiante) => {
    try {
      setLoading(true);
      // Determinar modalidadId a enviar según la modalidad del modal (prop)
      let modalidadIdToSend = undefined;
      if (modalidad && typeof modalidad === 'string') {
        const m = modalidad.trim().toLowerCase();
        if (m === 'presencial') modalidadIdToSend = 1;
        else if (m === 'semipresencial') modalidadIdToSend = 2;
      }
      const respuesta = await service.getEstudiantePorDNI(estudiante.dni, modalidadIdToSend);
      if (respuesta && respuesta.success) {
        setConsultaData(respuesta);
        setConsultaOpen(true);
      } else {
        setError('No se pudieron obtener los datos completos del estudiante.');
      }
    } catch (err) {
      console.error('Error al obtener datos completos del estudiante:', err);
      setError('Error al obtener datos del estudiante.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewNotificacion = (estudiante) => {
    setPreviewEstudiante(estudiante);
    setPreviewOpen(true);
  };

  const handleSentFromPreview = (success, result) => {
    if (success) {
      setError('Email enviado exitosamente.');
      // opcional: recargar lista o actualizar estado
      cargarEstudiantes(page);
    } else {
      setError(result && result.message ? result.message : (result && result.error ? result.error : 'Error al enviar email'));
    }
    setTimeout(() => setError(''), 4000);
    setPreviewOpen(false);
    setPreviewEstudiante(null);
  };

  // Abrir modal de reportes: cargar todos los estudiantes para el reporte según modalidad/estado
  const handleAbrirModalReportes = async () => {
    setLoadingReporte(true);
    try {
      let modalidadIdToSend = undefined;
      if (modalidad && typeof modalidad === 'string') {
        const m = modalidad.trim().toLowerCase();
        if (m === 'presencial') modalidadIdToSend = 1;
        else if (m === 'semipresencial') modalidadIdToSend = 2;
      }
      // Import dinámico para evitar ciclos y cargar función específica
      const getAllEstudiantesPorModalidad = (await import('../services/getAllEstudiantesPorModalidad')).default;
      const resp = await getAllEstudiantesPorModalidad(modalidadIdToSend, estadoFiltro);
      if (resp && resp.success && Array.isArray(resp.estudiantes)) {
        setEstudiantesReporte(resp.estudiantes);
      } else {
        setEstudiantesReporte([]);
        showInfo('No se pudieron cargar todos los estudiantes para el reporte.');
      }
    } catch (err) {
      console.error('Error al cargar estudiantes para reportes:', err);
      setEstudiantesReporte([]);
      showInfo('Error al cargar estudiantes para el reporte.');
    } finally {
      setLoadingReporte(false);
      setModalReportesOpen(true);
    }
  };

  const handleBuscarPorDNI = async (dni) => {
    if (!dni || !dni.trim()) {
      setError('Por favor, ingresa un DNI válido');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Usar el endpoint de búsqueda para respetar filtroActivo (todos/activos/desactivados)
      const resp = await service.buscarEstudiantes(dni.trim(), undefined, estadoFiltro, 1, 1, filtroActivo);
      let estudianteEncontrado = null;
      if (resp && resp.success && Array.isArray(resp.estudiantes) && resp.estudiantes.length > 0) {
        estudianteEncontrado = resp.estudiantes[0];
      }

      // Si no encontramos con la búsqueda (por ejemplo por formato), hacer fallback al endpoint por DNI
      if (!estudianteEncontrado) {
        const respDirect = await service.getEstudiantePorDNI(dni);
        if (respDirect && respDirect.success && respDirect.estudiante) {
          estudianteEncontrado = {
            id: respDirect.estudiante.id,
            dni: respDirect.estudiante.dni,
            nombre: respDirect.estudiante.nombre,
            apellido: respDirect.estudiante.apellido,
            email: respDirect.estudiante.email || null,
            activo: respDirect.estudiante.activo,
            fechaInscripcion: respDirect.inscripcion?.fechaInscripcion || null,
            modalidad: respDirect.inscripcion?.modalidad || respDirect.estudiante?.modalidad || 'Sin modalidad',
            cursoPlan: respDirect.inscripcion?.cursoPlan || 'Sin curso/plan',
            estadoInscripcion: 'Inscripto'
          };
        }
      }

      if (estudianteEncontrado) {
        const modalidadEstudiante = (estudianteEncontrado.modalidad || '').toString().trim().toLowerCase();
        const selectedModalidad = (modalidad || '').toString().trim().toLowerCase();
        if (selectedModalidad && selectedModalidad !== 'todas' && modalidadEstudiante !== selectedModalidad) {
          setError('El estudiante no pertenece a la modalidad seleccionada.');
          setEstudiantes([]);
          setLoading(false);
          return;
        }

        const estudianteFormateado = {
          id: estudianteEncontrado.id,
          dni: estudianteEncontrado.dni,
          nombre: estudianteEncontrado.nombre,
          apellido: estudianteEncontrado.apellido,
          email: estudianteEncontrado.email || null,
          activo: estudianteEncontrado.activo,
          fechaInscripcion: estudianteEncontrado.fechaInscripcion || null,
          modalidad: estudianteEncontrado.modalidad || 'Sin modalidad',
          cursoPlan: estudianteEncontrado.cursoPlan || 'Sin curso/plan',
          estadoInscripcion: estudianteEncontrado.estadoInscripcion || 'Inscripto'
        };

        setModoBusqueda(true);
        setEstudiantes([estudianteFormateado]);
        setTotalPages(1);
        setPage(1);
      } else {
        setError('No se encontró ningún estudiante con ese DNI');
        setEstudiantes([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error en handleBuscarPorDNI:', err);
      setError('Error al buscar el estudiante. Por favor, intenta nuevamente.');
      setEstudiantes([]);
      setLoading(false);
    }
  };

  // Buscar general por nombre, apellido o DNI (insensible a mayúsculas/minúsculas, coincidencia parcial, SIEMPRE sobre todos los estudiantes)
  const handleBuscarGeneral = async (term) => {
    if (!term || !term.trim()) {
      handleLimpiarBusqueda();
      return;
    }

    try {
      setLoading(true);
      setError('');
      let modalidadIdToSend = undefined;
      if (modalidad && typeof modalidad === 'string') {
        const m = modalidad.trim().toLowerCase();
        if (m === 'presencial') modalidadIdToSend = 1;
        else if (m === 'semipresencial') modalidadIdToSend = 2;
      }

      // La búsqueda NO debe estar limitada por el filtroActivo (activos/inactivos/todos)
      // Solo se filtra por modalidad y estado si corresponde
      const resp = await service.buscarEstudiantes(term.trim(), modalidadIdToSend, estadoFiltro, 1, limit, filtroActivo);
      if (resp && resp.success) {
        setModoBusqueda(true);
        setEstudiantes(resp.estudiantes || []);
        setTotalPages(resp.totalPages || 1);
        setPage(1);
        setTotalRegistros({
          total: resp.total || (Array.isArray(resp.estudiantes) ? resp.estudiantes.length : 0),
          activos: resp.activos || 0,
          inactivos: resp.inactivos || 0
        });
      } else {
        setModoBusqueda(true);
        setEstudiantes([]);
        setTotalPages(1);
        setPage(1);
        setTotalRegistros({ total: 0, activos: 0, inactivos: 0 });
        setError(resp && resp.error ? resp.error : 'No se encontraron resultados');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error en búsqueda general:', err);
      setError('Error al buscar. Intenta nuevamente.');
      setLoading(false);
    }
  };


  // Limpia solo la búsqueda, pero mantiene los filtros activos/inactivos/estado
  const handleLimpiarBusqueda = () => {
    setModoBusqueda(false);
    setError('');
    setPage(1);
    cargarEstudiantes(1);
  };

  // Limpia todos los filtros y búsqueda (usado por botón "Todos")
  const handleResetFiltros = () => {
    setModoBusqueda(false);
    setError('');
    setPage(1);
    setFiltroActivo('todos');
    setEstadoFiltro('');
    cargarEstudiantes(1);
  };

  const getTituloLista = () => {
    if (modoBusqueda) return 'Resultado de Búsqueda';
    if (modalidad && modalidad !== 'todas') return `Estudiantes - ${modalidad}`;
    return 'Lista de Estudiantes';
  };

  // Filtra los estudiantes según modalidad y estado de inscripción
  const estudiantesFiltrados = estudiantes.filter(e => {
    // Filtrar por modalidad (solo si se especifica una modalidad específica)
    if (modalidad && modalidad !== 'todas') {
      const mod = (e.modalidad || '').trim().toLowerCase();
      const modalidadFiltro = modalidad.trim().toLowerCase();
      if (mod !== modalidadFiltro) {
        return false;
      }
    }
    // Filtrar por estado de inscripción si está seleccionado
    if (estadoFiltro) {
      const estadoEstudiante = String(e.idEstadoInscripcion || e.estadoInscripcion || '');
      if (estadoEstudiante !== String(estadoFiltro)) {
        return false;
      }
    }
    // Filtrar por activos/desactivados
    if (filtroActivo === 'activos') {
      return e.activo === true || e.activo === 1;
    } else if (filtroActivo === 'desactivados') {
      return e.activo === false || e.activo === 0;
    }
    return true;
  });

  return (
    <div className="lista-estudiantes-container">
      {/* Header con título y botones de navegación */}
      <div className="lista-header-superior">
        {/* Title row */}
        <div className="fila-titulo-cerrar">
          <h2 className="lista-titulo">{getTituloLista()}</h2>
          {onClose && (
            <div className="cerrar-button-flotante">
              <CloseButton onClose={onClose} className="boton-small" />
            </div>
          )}
        </div>

        {/* Controls row: left = Ver Reportes + filters, right = buscador */}
        <div className="controls-row">
          <div className="controls-left">
            <div>
              <button
                className="btn-ver-reportes"
                onClick={handleAbrirModalReportes}
                title="Ver reportes PDF de estudiantes"
                disabled={loadingReporte}
              >
                📊 Ver Reportes
              </button>
              {modalReportesOpen && (
                <ModalReportesEstudiantes
                  open={modalReportesOpen}
                  onClose={() => setModalReportesOpen(false)}
                  estudiantes={estudiantesReporte}
                  showInfo={showInfo}
                />
              )}
            </div>
            <PanelControles
              filtroActivo={filtroActivo}
              setFiltroActivo={setFiltroActivo}
              estadosInscripcion={estadosInscripcion}
              estadoFiltro={estadoFiltro}
              setEstadoFiltro={setEstadoFiltro}
              onBuscarDNI={handleBuscarPorDNI}
              onBuscarGeneral={handleBuscarGeneral}
              onLimpiarBusqueda={handleLimpiarBusqueda}
              modoBusqueda={modoBusqueda}
              loading={loading}
              showSearch={false}
              showFilters={true}
              onResetFiltros={handleResetFiltros}
            />
          </div>

          <div className="controls-right">
            <BuscadorDNI
              onBuscar={handleBuscarPorDNI}
              onBuscarGeneral={handleBuscarGeneral}
              loading={loading}
              disabled={false}
              placeholder="Buscar por Nombre, Apellido o DNI..."
            />
          </div>
        </div>
      </div>

      {/* PanelControles moved into header for inline layout */}




      {/* Mensajes de error */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button
              className="btn-reintentar"
              onClick={() => cargarEstudiantes(page)}
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      )}

      <TablaEstudiantes
        estudiantes={estudiantesFiltrados}
        loading={loading}
        error={error}
        onEmitirComprobante={handleEmitirComprobante}
        onVerEstudiante={handleVerEstudiante}
        onPreviewNotificacion={handlePreviewNotificacion}
        formatearFecha={formatearFecha}
        modoBusqueda={modoBusqueda}
        onLimpiarBusqueda={handleLimpiarBusqueda}
        onRecargar={() => cargarEstudiantes(1)}
        page={page}
        totalPages={totalPages}
        limit={limit}
        hideActions={modalReportesOpen}
      />

      {consultaOpen && consultaData && (
        <ConsultaEstd data={consultaData} onClose={() => { setConsultaOpen(false); setConsultaData(null); }} />
      )}

      {previewOpen && previewEstudiante && (
        <ModalPreviewEmail
          open={previewOpen}
          estudiante={previewEstudiante}
          onClose={() => { setPreviewOpen(false); setPreviewEstudiante(null); }}
          onSent={handleSentFromPreview}
        />
      )}

      <PaginacionControles
        page={page}
        totalPages={totalPages}
        loading={loading}
        limit={limit}
        totalRegistros={estudiantesFiltrados.length}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      <ResumenEstadisticas totalRegistros={totalRegistros} />
    </div>
  );
};

ListaEstudiantes.propTypes = {
  onClose: PropTypes.func.isRequired,
  refreshKey: PropTypes.number,
  modalidad: PropTypes.string,
};

export default ListaEstudiantes;