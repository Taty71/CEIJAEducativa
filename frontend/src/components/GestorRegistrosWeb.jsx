import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import serviceRegistrosWeb from '../services/serviceRegistrosWeb';
import { calcularEstadoDocumentacionWeb } from '../utils/calcularEstadoDocumentacionWeb';
import { useAlerts } from '../hooks/useAlerts';
import AlertaMens from './AlertaMens';
import BotonCargando from './BotonCargando';
import CloseButton from './CloseButton';
import ModalDocumentacionExistente from './ModalDocumentacionExistente';

import '../estilos/RegistrosPendientes.css';

const GestorRegistrosWeb = ({ onClose, onRegistroSeleccionado, isAdmin = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        showSuccess,
        showError,
        showWarning,
        alerts,
        removeAlert,
        modal,
        closeModal
    } = useAlerts();
    const [registros, setRegistros] = useState([]);
    // Mantener contadores en cliente calculados a partir del array `registros`
    const [stats, setStats] = useState({ total: 0, pendientes: 0, procesados: 0, anulados: 0 });

    // Estado para modal de actualización de documentación
    const [mostrarModalActualizacion, setMostrarModalActualizacion] = useState(false);
    const [datosEstudianteExistente, setDatosEstudianteExistente] = useState(null);

    // Usar stats del backend para los contadores
    const contadoresVisuales = stats;
    const [loading, setLoading] = useState(true);
    // const [procesando, setProcesando] = useState('');
    const [filtro, setFiltro] = useState('TODOS'); // TODOS, PENDIENTE, PROCESADO, ANULADO
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [registroAEliminar, setRegistroAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);



    // Cargar registros web al montar el componente
    // Cargar registros web y estadísticas al montar y al volver del formulario
    useEffect(() => {
        const inicializar = async () => {
            await cargarRegistrosWeb();

            // Verificar si hay datos de estudiante existente en sessionStorage
            const params = new URLSearchParams(location.search);
            if (params.get('mostrarActualizacion') === 'true') {
                const datosGuardados = sessionStorage.getItem('estudianteExistente');
                if (datosGuardados) {
                    try {
                        const datos = JSON.parse(datosGuardados);
                        setDatosEstudianteExistente(datos);
                        setMostrarModalActualizacion(true);
                        sessionStorage.removeItem('estudianteExistente');
                        console.log('📋 Mostrando modal de actualización para estudiante existente');
                    } catch (error) {
                        console.error('Error al parsear datos de estudiante existente:', error);
                    }
                }
            }
        };
        inicializar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.key]);

    // Escuchar actualizaciones provenientes del backend (cuando un registro web fue marcado PROCESADO)
    useEffect(() => {
        const handler = (e) => {
            try {
                const updated = e.detail;
                if (!updated) return;

                console.log('🔔 Evento registroWeb:actualizado recibido:', updated);

                setRegistros(prev => {
                    const idx = prev.findIndex(r => r.id === updated.id);
                    let newList;

                    if (idx !== -1) {
                        // Actualizar el registro existente
                        const procesado = ['PROCESADO_Y_Completa', 'PROCESADO_A_PENDIENTES', 'PROCESADO', 'Completa'].includes(updated.estado);
                        newList = [...prev];
                        newList[idx] = { ...updated, procesado };
                        console.log('✅ Registro actualizado en memoria:', updated.datos?.dni, '→', updated.estado);
                    } else {
                        // Si no existe, agregarlo (caso raro)
                        const procesado = ['PROCESADO_Y_Completa', 'PROCESADO_A_PENDIENTES', 'PROCESADO', 'Completa'].includes(updated.estado);
                        newList = [...prev, { ...updated, procesado }];
                        console.log('➕ Nuevo registro agregado:', updated.datos?.dni);
                    }

                    // Recalcular contadores inmediatamente
                    const nuevosStats = calcularContadoresFromRegistros(newList);
                    console.log('📊 Contadores actualizados:', nuevosStats);
                    setStats(nuevosStats);

                    return newList;
                });
            } catch (err) {
                console.warn('⚠️ Error procesando evento registroWeb:actualizado', err.message);
            }
        };

        window.addEventListener('registroWeb:actualizado', handler);
        return () => window.removeEventListener('registroWeb:actualizado', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarRegistrosWeb = async () => {
        try {
            setLoading(true);
            const [data, statsBackend] = await Promise.all([
                serviceRegistrosWeb.obtenerRegistrosWeb(),
                serviceRegistrosWeb.obtenerStats()
            ]);

            console.log('📥 Registros web cargados:', data?.length || 0);

            // Añadir flag procesado derivado del estado para uso local
            const enriched = (data || []).map(r => {
                const procesado = ['PROCESADO_Y_Completa', 'PROCESADO_A_PENDIENTES', 'PROCESADO', 'Completa'].includes(r.estado);
                return { ...r, procesado };
            });

            setRegistros(enriched);

            // Usar estadísticas del backend (incluyen históricos)
            console.log('📊 Stats backend:', statsBackend);
            setStats(statsBackend);

        } catch (error) {
            console.error('Error al cargar registros web:', error);
            showError('Error al cargar los registros web: ' + error.message);
        } finally {
            setLoading(false);
        }
    };



    // Calcula los contadores a partir del array de registros en memoria
    const calcularContadoresFromRegistros = (list = registros) => {
        const total = (list || []).length;
        // PENDIENTE: solo los que están en estado PENDIENTE (nunca procesados)
        const pendientes = (list || []).filter(r =>
            r.estado === 'PENDIENTE' || r.estado === 'pendiente'
        ).length;
        // PROCESADOS: incluye PROCESADO_Y_Completa y PROCESADO_A_PENDIENTES
        const procesados = (list || []).filter(r =>
            r.estado === 'PROCESADO_Y_Completa' ||
            r.estado === 'PROCESADO_A_PENDIENTES' ||
            r.estado === 'PROCESADO' ||
            r.estado === 'Completa' ||
            r.estado === 'Completa' ||
            r.estado === 'procesado_y_Completa' ||
            r.estado === 'procesado_a_pendientes'
        ).length;
        const anulados = (list || []).filter(r =>
            r.estado === 'ANULADO' || r.estado === 'anulado'
        ).length;
        return { total, pendientes, procesados, anulados };
    };

    // Estado visual amigable para mostrar en la interfaz
    function getEstadoVisual(registro) {
        // Mapear los valores válidos de estado a los visuales
        const estado = (registro.estado || '').toUpperCase();

        if (estado === 'PROCESADO_Y_Completa') return 'PROCESADO Y Completa';
        if (estado === 'PROCESADO_A_PENDIENTES') return 'PROCESADO A PENDIENTES';
        if (estado === 'Completa' || estado === 'PROCESADO') return 'PROCESADO';
        if (estado === 'ANULADO') return 'ANULADO';
        if (estado === 'PENDIENTE') return 'PENDIENTE';

        // Cualquier otro valor, mostrar en mayúsculas
        return estado || 'DESCONOCIDO';
    }
    const manejarProcesarRegistro = async (registro) => {
        // Solo navegar al formulario de edición, NO procesar automáticamente
        if (onRegistroSeleccionado) {
            const registroCompleto = {
                ...registro,
                archivos: registro.archivos || {},
            };
            const datosWebEncoded = encodeURIComponent(JSON.stringify(registroCompleto));
            const rutaDestino = isAdmin
                ? `/dashboard/formulario-inscripcion-adm?accion=Registrar&modalidad=${registro.datos.modalidad || ''}&completarWeb=${registro.id}&datosWeb=${datosWebEncoded}&origen=registros-web`
                : `/preinscripcion-estd?accion=Registrar&modalidad=${registro.datos.modalidad || ''}&completarWeb=${registro.id}&datosWeb=${datosWebEncoded}&origen=registros-web`;
            navigate(rutaDestino);
        }
        // El procesamiento se hará en el formulario, no aquí
    };

    // Función para iniciar el proceso de eliminación
    const iniciarEliminar = (registro) => {
        setRegistroAEliminar(registro);
        setMostrarConfirmacion(true);
    };

    // Función para confirmar y ejecutar la eliminación
    const confirmarEliminacion = async () => {
        if (!registroAEliminar) return;

        setEliminando(true);
        // setMostrarConfirmacion(false); // Mantener modal un momento o cerrar antes? Mejor cerrar antes si usamos toast

        try {
            const response = await serviceRegistrosWeb.eliminarRegistroWeb(registroAEliminar.id);
            setMostrarConfirmacion(false);

            if (response.esProcesado) {
                showSuccess(`🧹 Registro limpiado de la lista (histórico guardado)`);
            } else {
                showSuccess(`🗑️ Solicitud de ${registroAEliminar.datos.apellido} eliminada permanentemente`);
            }

            await cargarRegistrosWeb();
        } catch (error) {
            console.error('Error al eliminar registro:', error);
            showError('❌ Error al eliminar registro: ' + error.message);
            setMostrarConfirmacion(false);
        } finally {
            setEliminando(false);
            setRegistroAEliminar(null);
        }
    };

    // Función para cancelar la eliminación
    const cancelarEliminacion = () => {
        setMostrarConfirmacion(false);
        setRegistroAEliminar(null);
    };

    // Filtrar registros según el estado visual, no solo el estado real
    const filtrarRegistros = () => {
        if (filtro === 'TODOS') return registros;
        if (filtro === 'PROCESADO') {
            // Contar como procesados los que son 'Completa', 'PROCESADO' o 'PROCESADO A PENDIENTES'
            return registros.filter(registro => {
                const estadoVisual = getEstadoVisual(registro);
                return estadoVisual === 'PROCESADO' || estadoVisual === 'PROCESADO A PENDIENTES';
            });
        }
        if (filtro === 'PENDIENTE') {
            // Solo los que nunca fueron procesados: estado visual 'PENDIENTE'
            return registros.filter(registro => {
                const estadoVisual = getEstadoVisual(registro);
                return estadoVisual === 'PENDIENTE';
            });
        }
        // Otros filtros (anulado, etc)
        return registros.filter(registro => {
            const estadoVisual = getEstadoVisual(registro);
            return estadoVisual === filtro;
        });
    };

    const formatearFecha = (timestamp) => {
        const fecha = new Date(timestamp);
        return fecha.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const registrosFiltrados = filtrarRegistros();

    if (loading) {
        return (
            <div className="gestor-registros-web">
                <div className="gestor-modal-container">
                    <div className="gestor-header">
                        <h2>🌐 Gestión de Registros Web</h2>
                        <CloseButton onClose={onClose} className="cerrar-button" />
                    </div>
                    <div className="gestor-content">
                        <div className="loading-container">
                            <BotonCargando loading={true}>Cargando registros web...</BotonCargando>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Actualizar el estado visual en la lista si el registro fue procesado localmente
    const registrosVisuales = registrosFiltrados.map(r => {
        // Si el registro fue procesado localmente, reflejar el cambio visual
        const registroLocal = registros.find(reg => reg.id === r.id);
        return registroLocal ? { ...r, estado: registroLocal.estado } : r;
    });

    // Generar PDF de Registros Web (Reporte Completo por Secciones)
    const generarReportePDFWeb = () => {
        try {
            if (!registros || registros.length === 0) {
                showWarning('No hay registros para generar el reporte.');
                return;
            }

            const listaPendientes = registros.filter(r => {
                const estado = (r.estado || '').toUpperCase();
                return estado === 'PENDIENTE' || estado === 'REGISTRO_WEB_PENDIENTE';
            }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const listaProcesados = registros.filter(r => {
                const estado = (r.estado || '').toUpperCase();
                return ['PROCESADO_Y_COMPLETA', 'PROCESADO', 'COMPLETA', 'PROCESADO_A_PENDIENTES'].includes(estado) ||
                    estado.includes('PROCESADO');
            }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            let yPosition = 20;
            let pageNum = 1;

            // Función para dibujar encabezado
            const imprimirEncabezado = () => {
                doc.setTextColor(45, 65, 119);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('CEIJA5 LA CALERA CBA', pageWidth / 2, 20, { align: 'center' });

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Educacion Integral de Jóvenes y Adultos', pageWidth / 2, 25, { align: 'center' });

                doc.setDrawColor(0, 0, 255);
                doc.setLineWidth(0.5);
                doc.line(margin, 27, pageWidth - margin, 27);

                doc.setTextColor(45, 65, 119);
                doc.setFontSize(16);
                doc.text('REPORTE DE REGISTROS PRE-INSCRIPCIONES WEB', pageWidth / 2, 35, { align: 'center' });

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(`Fecha: ${new Date().toLocaleString('es-AR')}`, pageWidth / 2, 42, { align: 'center' });

                return 50; // Nueva posición Y inicial
            };

            const addFooter = (pageNum) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                const footerText = `Reporte CEIJA5 - Registros Web`;
                const pageText = `Página ${pageNum}`;
                const yFooter = doc.internal.pageSize.height - 10;
                doc.text(footerText, margin, yFooter, { align: 'left' });
                doc.text(pageText, pageWidth - margin, yFooter, { align: 'right' });
            };

            const imprimirLista = (titulo, lista) => {
                if (lista.length === 0) return;

                // Título de Sección
                if (yPosition > 240) { // Si queda poco espacio, saltar página antes del título
                    addFooter(pageNum);
                    doc.addPage();
                    pageNum++;
                    yPosition = imprimirEncabezado();
                }

                doc.setFillColor(240, 240, 240);
                doc.rect(margin, yPosition, pageWidth - margin * 2, 10, 'F');
                doc.setTextColor(45, 65, 119);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${titulo} (${lista.length})`, margin + 5, yPosition + 7);
                yPosition += 15;

                lista.forEach((registro, index) => {
                    if (yPosition > 250) {
                        addFooter(pageNum);
                        doc.addPage();
                        pageNum++;
                        yPosition = imprimirEncabezado();
                        // Repetir título de sección si salta página
                        doc.setFillColor(240, 240, 240);
                        doc.rect(margin, yPosition, pageWidth - margin * 2, 10, 'F');
                        doc.setTextColor(45, 65, 119);
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${titulo} (Cont.)`, margin + 5, yPosition + 7);
                        yPosition += 15;
                    }

                    const nombreCompleto = `${registro.datos.apellido}, ${registro.datos.nombre}`;
                    const dni = registro.datos.dni || 'Sin DNI';
                    const email = registro.datos.email || 'Sin Email';
                    const telefono = registro.datos.telefono || 'Sin Teléfono';
                    const modalidad = registro.datos.modalidad || 'No especificada';
                    const fechaRegistro = formatearFecha(registro.timestamp);
                    const estadoDoc = calcularEstadoDocumentacionWeb(registro);

                    // Item
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`${index + 1}. ${nombreCompleto}`, margin, yPosition);
                    yPosition += 5;

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.text(`DNI: ${dni} | Fecha: ${fechaRegistro} | Tel: ${telefono}`, margin + 5, yPosition);
                    yPosition += 5;
                    doc.text(`Email: ${email} | Modalidad: ${modalidad}`, margin + 5, yPosition);
                    yPosition += 5;

                    // Estado Doc
                    const cleanMensaje = estadoDoc.mensaje.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,;:\(\)\-@\/]/g, '').replace(/\s+/g, ' ').trim();
                    let colorEstado = [0, 0, 0];
                    if (estadoDoc.esCompleto) colorEstado = [0, 128, 0];
                    else if (estadoDoc.mensaje.includes('Faltan')) colorEstado = [180, 0, 0]; // Rojo para faltantes en reporte

                    doc.setTextColor(...colorEstado);
                    doc.setFontSize(8);
                    const textoDoc = `Doc: ${cleanMensaje}`;
                    const linesDoc = doc.splitTextToSize(textoDoc, pageWidth - margin * 2 - 5);
                    doc.text(linesDoc, margin + 5, yPosition);
                    yPosition += (linesDoc.length * 4) + 2;

                    // Adjuntos
                    if (registro.archivos && Object.keys(registro.archivos).length > 0) {
                        doc.setTextColor(0, 0, 0);
                        const archivosTexto = Object.keys(registro.archivos).map(tipo => {
                            const mapNombres = { 'foto': 'Foto', 'archivo_dni': 'DNI', 'archivo_cuil': 'CUIL', 'archivo_fichaMedica': 'Ficha Méd.', 'archivo_partidaNacimiento': 'Partida Nac.', 'archivo_certificadoNivelPrimario': 'Cert. Primario' };
                            return mapNombres[tipo] || tipo;
                        }).join(', ');
                        const textAdj = `Adjuntos: ${archivosTexto}`;
                        const linesAdj = doc.splitTextToSize(textAdj, pageWidth - margin * 2 - 5);
                        doc.text(linesAdj, margin + 5, yPosition);
                        yPosition += (linesAdj.length * 4);
                    }

                    yPosition += 4;
                    doc.setDrawColor(220, 220, 220);
                    doc.line(margin, yPosition, pageWidth - margin, yPosition); // Separador item
                    yPosition += 6;
                });

                yPosition += 10; // Espacio tras sección
            };

            // Ejecución
            yPosition = imprimirEncabezado();

            imprimirLista('REGISTROS PENDIENTES', listaPendientes);
            imprimirLista('REGISTROS PROCESADOS / HISTÓRICOS (EN LISTA)', listaProcesados);

            addFooter(pageNum);
            doc.save('reporte_registros_web_completo.pdf');

        } catch (error) {
            console.error('Error al generar PDF:', error);
            showError('Error al crear el PDF: ' + error.message);
        }
    };

    return (
        <>
            <AlertaMens alerts={alerts} onCloseAlert={removeAlert} modal={modal} onCloseModal={closeModal} mode="floating" />
            <div className="gestor-registros-web">
                <div className="gestor-modal-container">
                    <div className="gestor-header">
                        <h2>🌐 Gestión de Registros Pre-InscripcionesWeb</h2>
                        <CloseButton onClose={onClose} className="cerrar-button" />
                    </div>

                    <div className="gestor-content">
                        {/* Primera fila: Estadísticas en horizontal */}
                        <div className="stats-container-horizontal">
                            <div className="stat-card">
                                <div className="stat-number">{contadoresVisuales.total}</div>
                                <div className="stat-label">Total</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{contadoresVisuales.pendientes}</div>
                                <div className="stat-label">Pendientes</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{contadoresVisuales.procesados}</div>
                                <div className="stat-label">Procesados</div>
                            </div>
                        </div>

                        {/* Segunda fila: Controles y filtros */}
                        <div className="controles-container">
                            <div className="filtros-container">
                                <label htmlFor="filtro-estado">Filtrar por estado:</label>
                                <select
                                    id="filtro-estado"
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                >
                                    <option value="TODOS">Todos los registros</option>
                                    <option value="PENDIENTE">Solo pendientes</option>
                                    <option value="PROCESADO">Solo procesados</option>
                                </select>
                            </div>

                            <button
                                className="refresh-button"
                                onClick={() => {
                                    cargarRegistrosWeb();
                                }}
                            >
                                🔄 Actualizar
                            </button>

                            <button
                                className="btn-export-pdf"
                                onClick={generarReportePDFWeb}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    marginLeft: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                📄 Exportar PDF
                            </button>
                        </div>

                        {/* Tercera fila: Lista de registros */}
                        <div className="registros-container">
                            {registrosVisuales.length === 0 ? (
                                <div className="sin-registros">
                                    <h3>📭 No hay registros web {filtro === 'TODOS' ? '' : filtro.toLowerCase()}</h3>
                                    <p>Los registros aparecerán aquí cuando los usuarios completen el formulario web.</p>
                                </div>
                            ) : (
                                <div className="registros-lista">
                                    {registrosVisuales.map((registro) => {
                                        // Calcular estado real de documentación
                                        const estadoDocReal = calcularEstadoDocumentacionWeb(registro);
                                        return (
                                            <div key={registro.id} className="registro-item">
                                                <div className="registro-header">
                                                    <div className="registro-datos">
                                                        <h3 className="registro-nombre">
                                                            {registro.datos.apellido}, {registro.datos.nombre}
                                                        </h3>
                                                        <div className="registro-info-principal">
                                                            <strong>DNI: {registro.datos.dni}</strong>
                                                        </div>
                                                        <div className="registro-info">Email: {registro.datos.email}</div>
                                                        <div className="registro-info">Teléfono: {registro.datos.telefono}</div>
                                                        <div className="registro-info">Modalidad: {registro.datos.modalidad}</div>
                                                        <div className="registro-info">
                                                            Domicilio: {registro.datos.calle} {registro.datos.numero}, {registro.datos.localidad}
                                                        </div>
                                                        {/* Mostrar documentos adjuntos */}
                                                        {registro.archivos && Object.keys(registro.archivos).length > 0 && (
                                                            <div className="registro-documentos documentos-subidos">
                                                                <strong>📎 Documentos adjuntos ({Object.keys(registro.archivos).length}):</strong>
                                                                <ul>
                                                                    {Object.entries(registro.archivos).map(([tipo, ruta]) => {
                                                                        const nombreDocumento = {
                                                                            'foto': '📷 Foto',
                                                                            'archivo_dni': '📄 DNI',
                                                                            'archivo_cuil': '📄 CUIL',
                                                                            'archivo_fichaMedica': '🏥 Ficha Médica',
                                                                            'archivo_partidaNacimiento': '📜 Partida de Nacimiento',
                                                                            'archivo_solicitudPase': '📝 Solicitud de Pase',
                                                                            'archivo_analiticoParcial': '📊 Analítico Parcial',
                                                                            'archivo_certificadoNivelPrimario': '🎓 Certificado Primario'
                                                                        }[tipo] || `📎 ${tipo}`;

                                                                        return (
                                                                            <li key={tipo} style={{ marginBottom: '2px' }}>
                                                                                <span className="doc-presentado">✅ {nombreDocumento}</span>
                                                                                <small className="doc-nombre-archivo">({ruta.split('/').pop()})</small>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                                <div className="info-al-completar">
                                                                    💡 Al completar inscripción se mostrarán estos documentos para verificar
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Mensaje si no hay documentos */}
                                                        {(!registro.archivos || Object.keys(registro.archivos).length === 0) && (
                                                            <div className="registro-documentos documentos-faltantes">
                                                                <span className="sin-documentos">⚠️ Sin documentos adjuntos - Deberá completar toda la documentación</span>
                                                            </div>
                                                        )}
                                                        <div className="registro-info">
                                                            <small>Fecha: {formatearFecha(registro.timestamp)}</small>
                                                        </div>
                                                        {/* Mostrar estado real de documentación calculado en tiempo real */}
                                                        <div className="registro-info">
                                                            <strong>Estado de Documentación:</strong>
                                                            <span style={{
                                                                color: estadoDocReal.esCompleto ? '#4caf50' : '#ff9800',
                                                                marginLeft: '5px'
                                                            }}>
                                                                {estadoDocReal.mensaje}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="registro-acciones">
                                                        <span
                                                            className={`estado-badge estado-${getEstadoVisual(registro).toLowerCase().replace(/ /g, '-')}`}
                                                        >
                                                            {getEstadoVisual(registro)}
                                                        </span>

                                                        {/* TODOS los registros web deben permitir completar inscripción */}
                                                        <button
                                                            className="btn-procesar"
                                                            onClick={() => {
                                                                if (registro.estado === 'PROCESADO_A_PENDIENTES') {
                                                                    showWarning('⚠️ Este registro ya fue procesado y movido a Registros Pendientes por falta de documentación.');
                                                                    return;
                                                                }
                                                                if (registro.estado === 'PROCESADO_Y_Completa') {
                                                                    showSuccess(`✅ Este estudiante ya está registrado en la base de datos.\n\nNombre: ${registro.datos.nombre} ${registro.datos.apellido}\nDNI: ${registro.datos.dni}`);
                                                                    return;
                                                                }
                                                                manejarProcesarRegistro(registro);
                                                            }}
                                                            disabled={registro.estado === 'PROCESADO_A_PENDIENTES' || registro.estado === 'PROCESADO_Y_Completa'}
                                                            title={
                                                                registro.estado === 'PENDIENTE'
                                                                    ? 'Completar inscripción del registro web'
                                                                    : registro.estado === 'PROCESADO_Y_Completa'
                                                                        ? 'Este estudiante ya está registrado en la base de datos'
                                                                        : registro.estado === 'PROCESADO_A_PENDIENTES'
                                                                            ? 'Registro verificado pero faltan documentos (movido a pendientes)'
                                                                            : 'Gestionar registro web'
                                                            }
                                                            style={{
                                                                opacity: (registro.estado === 'PROCESADO_A_PENDIENTES' || registro.estado === 'PROCESADO_Y_Completa') ? 0.6 : 1,
                                                                cursor: (registro.estado === 'PROCESADO_A_PENDIENTES' || registro.estado === 'PROCESADO_Y_Completa') ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            {registro.estado === 'PENDIENTE' ? (
                                                                '✅ Completar Inscripción'
                                                            ) : registro.estado === 'PROCESADO_Y_Completa' ? (
                                                                '✅ Procesado y Completa'
                                                            ) : registro.estado === 'PROCESADO_A_PENDIENTES' ? (
                                                                // Mostrar texto claro cuando el admin verificó pero faltan documentos
                                                                '⏳ Pendiente (faltan documentos)'
                                                            ) : registro.estado === 'ANULADO' ? (
                                                                '� Reactivar Registro'
                                                            ) : (
                                                                '📝 Gestionar Registro'
                                                            )}
                                                        </button>

                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => iniciarEliminar(registro)}
                                                            title="Eliminar registro"
                                                            disabled={eliminando}
                                                        >
                                                            {eliminando && registroAEliminar?.id === registro.id ? (
                                                                <BotonCargando loading={true} size="small">
                                                                    Eliminando...
                                                                </BotonCargando>
                                                            ) : (
                                                                '🗑️ Eliminar'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>



                        {/* Modal de confirmación para eliminar */}
                        {mostrarConfirmacion && registroAEliminar && (
                            <div className="modal-confirmacion-overlay">
                                <div className="modal-confirmacion">
                                    <h3>
                                        {['PROCESADO_Y_Completa', 'PROCESADO', 'Completa'].some(s => (registroAEliminar.estado || '').includes(s))
                                            ? 'Limpiar Registro Procesado'
                                            : 'Confirmar Eliminación'}
                                    </h3>
                                    <p>
                                        {['PROCESADO_Y_Completa', 'PROCESADO', 'Completa'].some(s => (registroAEliminar.estado || '').includes(s)) ? (
                                            <>
                                                Este registro ya fue procesado. Se <strong>limpiará de la lista</strong> para ahorrar espacio,
                                                pero el contador de estadísticas de procesados <strong>se mantendrá</strong>.
                                            </>
                                        ) : (
                                            <>
                                                ⚠️ ¿Está seguro de que desea eliminar permanentemente la solicitud pendiente de{' '}
                                                <strong>{registroAEliminar.datos.apellido}, {registroAEliminar.datos.nombre}</strong>?
                                                <br />Se perderá toda la información.
                                            </>
                                        )}
                                    </p>
                                    <p className="dni-info">DNI: {registroAEliminar.datos.dni}</p>
                                    <div className="modal-botones">
                                        <button
                                            className="btn-confirmar-eliminar"
                                            onClick={confirmarEliminacion}
                                            disabled={eliminando}
                                        >
                                            {eliminando ? (
                                                <BotonCargando loading={true} size="small">
                                                    Eliminando...
                                                </BotonCargando>
                                            ) : (
                                                'Aceptar'
                                            )}
                                        </button>
                                        <button
                                            className="btn-cancelar-eliminar"
                                            onClick={cancelarEliminacion}
                                            disabled={eliminando}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal de actualización de documentación */}
                        {mostrarModalActualizacion && datosEstudianteExistente && (
                            <ModalDocumentacionExistente
                                estudiante={datosEstudianteExistente.estudiante}
                                inscripciones={datosEstudianteExistente.inscripciones}
                                archivosNuevos={datosEstudianteExistente.archivosNuevos}
                                onClose={() => {
                                    setMostrarModalActualizacion(false);
                                    setDatosEstudianteExistente(null);
                                    // Recargar registros para reflejar cambios
                                    cargarRegistrosWeb();
                                }}
                                onActualizar={(resultado) => {
                                    console.log('✅ Documentación actualizada:', resultado);
                                    showSuccess(`Documentación actualizada: ${resultado.cantidadArchivos} archivo(s)`);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

GestorRegistrosWeb.propTypes = {
    onClose: PropTypes.func.isRequired,
    onRegistroSeleccionado: PropTypes.func, // Función para manejar cuando se selecciona un registro
    isAdmin: PropTypes.bool, // Indica si el usuario actual es administrador
};

export default GestorRegistrosWeb;