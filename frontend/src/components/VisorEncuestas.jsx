import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../estilos/VisorEncuestas.css';
import { jsPDF } from 'jspdf';
import pdfIcon from '../assets/logos/pdf.png';
import { crearEncabezadoInstitucional, crearControlPaginas, normalizarTexto } from './ListaEstudiantes/reportes/utils';

const VisorEncuestas = ({ onClose, userRole }) => {
    const [encuestas, setEncuestas] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');

    // Determinar qué modalidad puede ver según el rol
    const modalidadPermitida = () => {
        if (userRole === 'admin') return null; // Admin ve todas
        if (userRole === 'secretario') return 'presencial';
        if (userRole === 'coordinador') return 'semipresencial';
        return null;
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarDatos = async () => {
        try {
            const modalidad = modalidadPermitida();
            const params = modalidad ? { modalidad } : {};

            // Cargar encuestas usando axios
            const respEncuestas = await axios.get('/api/encuestas-satisfaccion', { params });

            // Cargar estadísticas usando axios
            const respEstadisticas = await axios.get('/api/encuestas-satisfaccion/estadisticas', { params });

            if (respEncuestas.data.success) {
                setEncuestas(respEncuestas.data.encuestas);
            }

            if (respEstadisticas.data.success) {
                setEstadisticas(respEstadisticas.data.estadisticas);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // SOLO MANTENER LA FUNCIÓN PDF
    const generarReportePDF = async () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;

            // Usar encabezado estandarizado
            let y = crearEncabezadoInstitucional(doc, '');

            // Agregar título del reporte
            y += 10;
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(45, 65, 119);
            doc.text('Encuestas De Satisfacción', pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Crear control de páginas
            const { agregarPiePagina } = crearControlPaginas(doc);

            // Información general
            doc.setFontSize(11);
            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const modalidad = modalidadPermitida();
            const tituloModalidad = modalidad ? modalidad.charAt(0).toUpperCase() + modalidad.slice(1) : 'Todas';
            doc.text(`Modalidad: ${tituloModalidad}`, margin, y);
            y += 6;
            doc.text(`Total de encuestas: ${encuestas.length}`, margin, y);
            y += 6;
            doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-AR')}`, margin, y);
            y += 10;
            // Estadísticas tabla
            const stats = estadisticas || { promedio_facilidad: 0, promedio_claridad: 0, ultima_actualizacion: null };
            const tableTop = y;
            const col1X = margin;
            const col2X = pageWidth - margin - 60;
            const rowHeight = 10;
            // Header row
            doc.setFillColor(45, 65, 119);
            doc.rect(col1X, tableTop, pageWidth - 2 * margin, rowHeight, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text('Métrica', col1X + 2, tableTop + 7);
            doc.text('Valor', col2X + 2, tableTop + 7);
            let curY = tableTop + rowHeight;
            const rows = [
                ['Facilidad de Uso Promedio', `${stats.promedio_facilidad} ⭐`],
                ['Claridad de Información Promedio', `${stats.promedio_claridad} ⭐`],
                ['Última Actualización', stats.ultima_actualizacion ? new Date(stats.ultima_actualizacion).toLocaleString('es-AR') : 'N/A']
            ];
            rows.forEach((r, i) => {
                doc.setFillColor(i % 2 === 0 ? 248 : 255);
                doc.rect(col1X, curY, pageWidth - 2 * margin, rowHeight, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text(r[0], col1X + 2, curY + 7);
                doc.text(r[1], col2X + 2, curY + 7);
                curY += rowHeight;
            });
            y = curY + 10;

            // SECCIÓN: Estado y Recomendaciones
            const estado = getEstadoEncuestas();
            if (estado) {
                // Configurar fuente para cálculos
                doc.setFontSize(10);
                doc.setFont('Helvetica', 'normal');
                const msgLines = doc.splitTextToSize(estado.mensaje, pageWidth - (2 * margin) - 10);

                // Calcular altura de la caja
                let boxHeight = 10 + 7 + (msgLines.length * 5) + 5 + 6 + (estado.recomendaciones.length * 5) + 5;

                // Dibujar caja
                doc.setDrawColor(200, 200, 200);
                doc.setFillColor(250, 252, 255);
                doc.roundedRect(margin, y, pageWidth - (2 * margin), boxHeight, 3, 3, 'FD');

                let contentY = y + 10;

                // Título
                doc.setFontSize(12);
                doc.setFont('Helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(estado.titulo, margin + 5, contentY);
                contentY += 7;

                // Mensaje
                doc.setFontSize(10);
                doc.setFont('Helvetica', 'normal');
                doc.text(msgLines, margin + 5, contentY);
                contentY += (msgLines.length * 5) + 5;

                // Header Recomendaciones
                doc.setFont('Helvetica', 'bold');
                doc.setTextColor(45, 65, 119);
                doc.text('Acciones Recomendadas:', margin + 5, contentY);
                contentY += 6;

                // Lista Recomendaciones
                doc.setFont('Helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                estado.recomendaciones.forEach(rec => {
                    doc.text(`• ${rec}`, margin + 8, contentY);
                    contentY += 5;
                });

                y += boxHeight + 10;
            }

            // Detalle de encuestas (first 20)
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'bold');
            doc.text('DETALLE DE ENCUESTAS (primeras 20)', margin, y);
            y += 8;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            encuestas.slice(0, 20).forEach((enc, idx) => {
                if (y > doc.internal.pageSize.getHeight() - 30) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`#${idx + 1} | Modalidad: ${enc.modalidad || 'N/A'} | Fecha: ${new Date(enc.fecha).toLocaleDateString('es-AR')}`, margin, y);
                y += 5;
                doc.text(`Facilidad: ${enc.respuestas?.facilidad_uso || 'N/A'} ⭐  Claridad: ${enc.respuestas?.claridad_informacion || 'N/A'} ⭐`, margin, y);
                y += 5;
                if (enc.respuestas?.sugerencias) {
                    const sug = enc.respuestas.sugerencias.length > 100 ? enc.respuestas.sugerencias.substring(0, 100) + '...' : enc.respuestas.sugerencias;
                    doc.text(`Sugerencias: ${sug}`, margin, y);
                    y += 5;
                }
                y += 4;
            });

            // Footer usando función estandarizada
            agregarPiePagina();

            doc.save(`Encuestas_Satisfaccion_${tituloModalidad.replace(/\\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error al generar PDF:', error);
        }
    };
    // Función para determinar el estado según los promedios
    const getEstadoEncuestas = () => {
        if (!estadisticas) return null;

        const promedioGeneral = (parseFloat(estadisticas.promedio_facilidad) + parseFloat(estadisticas.promedio_claridad)) / 2;

        if (promedioGeneral >= 4.5) {
            return {
                tipo: 'excelente',
                emoji: '🌟',
                titulo: 'Sistema Excelente',
                mensaje: 'El sistema está funcionando de manera óptima. Los usuarios están muy satisfechos.',
                recomendaciones: [
                    'Mantener los estándares actuales',
                    'Documentar las buenas prácticas implementadas',
                    'Considerar implementar estas prácticas en otras áreas'
                ]
            };
        } else if (promedioGeneral >= 3.5) {
            return {
                tipo: 'bueno',
                emoji: '✅',
                titulo: 'Sistema Funcionando Bien',
                mensaje: 'El sistema tiene un buen desempeño general con algunas áreas de mejora.',
                recomendaciones: [
                    'Identificar puntos específicos de fricción en el proceso',
                    'Revisar comentarios de usuarios para mejoras incrementales',
                    'Priorizar las sugerencias más frecuentes'
                ]
            };
        } else if (promedioGeneral >= 2.5) {
            return {
                tipo: 'regular',
                emoji: '⚠️',
                titulo: 'Necesita Atención',
                mensaje: 'El sistema presenta problemas que requieren atención inmediata.',
                recomendaciones: [
                    'Analizar los problemas más reportados',
                    'Realizar mejoras en la documentación y ayudas visuales',
                    'Considerar capacitación adicional para usuarios',
                    'Revisar el flujo del proceso de inscripción'
                ]
            };
        } else {
            return {
                tipo: 'critico',
                emoji: '🚨',
                titulo: 'Acción Urgente Requerida',
                mensaje: 'El sistema presenta problemas graves que impactan significativamente la experiencia del usuario.',
                recomendaciones: [
                    'Convocar reunión urgente del equipo técnico',
                    'Identificar y resolver problemas críticos de inmediato',
                    'Implementar canales de soporte adicionales',
                    'Considerar rediseño de las secciones más problemáticas',
                    'Establecer plan de acción con plazos definidos'
                ]
            };
        }
    };

    const estadoActual = getEstadoEncuestas();

    const encuestasFiltradas = encuestas.filter(e => {
        if (filtro === 'ultimas') return encuestas.indexOf(e) < 10;
        if (filtro === 'mejores') return e.respuestas.facilidad_uso >= 4;
        if (filtro === 'peores') return e.respuestas.facilidad_uso <= 2;
        return true;
    });

    if (loading) {
        return (
            <div className="visor-encuestas-overlay">
                <div className="visor-loading">⏳ Cargando encuestas...</div>
            </div>
        );
    }

    const modalidadTexto = modalidadPermitida()
        ? modalidadPermitida().charAt(0).toUpperCase() + modalidadPermitida().slice(1)
        : 'Todas las modalidades';

    return (
        <div className="visor-encuestas-overlay">
            <div className="visor-encuestas-container">
                {/* Header */}
                <div className="visor-header">
                    <div className="header-title-section">
                        <h2>📊 Encuestas de Satisfacción</h2>
                        <span className="modalidad-badge">{modalidadTexto}</span>
                    </div>
                    <div className="header-actions">
                        {/* BOTÓN PDF MÁS PEQUEÑO Y DELICADO */}
                        <button className="btn-export-pdf" onClick={generarReportePDF} title="Exportar a PDF">
                            <img src={pdfIcon} alt="PDF" className="pdf-icon" />
                        </button>
                        <button className="btn-close-visor" onClick={onClose}>✖</button>
                    </div>
                </div>

                {/* Body con scroll único */}
                <div className="visor-encuestas-body">
                    {/* Estadísticas */}
                    {estadisticas && (
                        <div className="estadisticas-panel">
                            <div className="stat-card">
                                <span className="stat-label">Total Encuestas</span>
                                <span className="stat-value">{estadisticas.total}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Facilidad Promedio</span>
                                <span className="stat-value">{estadisticas.promedio_facilidad} ⭐</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Claridad Promedio</span>
                                <span className="stat-value">{estadisticas.promedio_claridad} ⭐</span>
                            </div>
                        </div>
                    )}

                    {/* Filtros - sticky */}
                    <div className="filtros-encuestas">
                        <button
                            className={filtro === 'todas' ? 'active' : ''}
                            onClick={() => setFiltro('todas')}
                        >
                            Todas ({encuestas.length})
                        </button>
                        <button
                            className={filtro === 'ultimas' ? 'active' : ''}
                            onClick={() => setFiltro('ultimas')}
                        >
                            Últimas 10
                        </button>
                        <button
                            className={filtro === 'mejores' ? 'active' : ''}
                            onClick={() => setFiltro('mejores')}
                        >
                            Mejores (4-5★)
                        </button>
                        <button
                            className={filtro === 'peores' ? 'active' : ''}
                            onClick={() => setFiltro('peores')}
                        >
                            A mejorar (1-2★)
                        </button>
                    </div>

                    {/* Lista de encuestas - SIN SCROLL PROPIO */}
                    <div className="encuestas-lista">
                        {encuestasFiltradas.length === 0 ? (
                            <p className="no-encuestas">📭 No hay encuestas disponibles</p>
                        ) : (
                            encuestasFiltradas.map(encuesta => (
                                <div key={encuesta.id} className="encuesta-card">
                                    <div className="encuesta-header-card">
                                        <div className="encuesta-info">
                                            <span className={`modalidad-tag ${encuesta.modalidad}`}>
                                                {encuesta.modalidad}
                                            </span>

                                        </div>
                                        <span className="fecha-encuesta">
                                            {new Date(encuesta.fecha).toLocaleString('es-AR')}
                                        </span>
                                    </div>

                                    <div className="encuesta-respuestas">
                                        <div className="respuesta-item">
                                            <span className="respuesta-label">Facilidad:</span>
                                            <span className="rating-stars">
                                                {'⭐'.repeat(encuesta.respuestas.facilidad_uso || 0)}
                                            </span>
                                        </div>
                                        <div className="respuesta-item">
                                            <span className="respuesta-label">Claridad:</span>
                                            <span className="rating-stars">
                                                {'⭐'.repeat(encuesta.respuestas.claridad_informacion || 0)}
                                            </span>
                                        </div>
                                        <div className="respuesta-item">
                                            <span className="respuesta-label">Tiempo:</span>
                                            <span>{encuesta.respuestas.tiempo_completado}</span>
                                        </div>
                                        {encuesta.respuestas.problemas_encontrados &&
                                            encuesta.respuestas.problemas_encontrados !== 'Ninguno' && (
                                                <div className="respuesta-item">
                                                    <span className="respuesta-label">Problemas:</span>
                                                    <span className="problema-badge">
                                                        {encuesta.respuestas.problemas_encontrados}
                                                    </span>
                                                </div>
                                            )}
                                        {encuesta.respuestas.sugerencias && (
                                            <div className="respuesta-item sugerencias">
                                                <span className="respuesta-label">💡 Sugerencias:</span>
                                                <p>{encuesta.respuestas.sugerencias}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Acciones Recomendadas */}
                    {estadoActual && (
                        <div className={`estado-sistema-footer estado-${estadoActual.tipo}`}>
                            <div className="estado-header-footer">
                                <span className="estado-emoji-footer">{estadoActual.emoji}</span>
                                <div className="estado-info-footer">
                                    <h3>{estadoActual.titulo}</h3>
                                    <p>{estadoActual.mensaje}</p>
                                </div>
                            </div>
                            <div className="estado-recomendaciones-footer">
                                <h4>📋 Acciones Recomendadas:</h4>
                                <ul>
                                    {estadoActual.recomendaciones.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

VisorEncuestas.propTypes = {
    onClose: PropTypes.func.isRequired,
    userRole: PropTypes.oneOf(['admin', 'secretario', 'coordinador']).isRequired
};

export default VisorEncuestas;
