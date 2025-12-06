const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

const ENCUESTAS_FILE = path.join(__dirname, '../data/encuestas-satisfaccion.json');

// Asegurar que existe el directorio data
async function asegurarDirectorio() {
    const dir = path.dirname(ENCUESTAS_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Función para leer el archivo JSON
async function leerEncuestas() {
    try {
        await asegurarDirectorio();
        const data = await fs.readFile(ENCUESTAS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, crear uno nuevo
        const datosIniciales = {
            encuestas: [],
            estadisticas: {
                total: 0,
                promedio_facilidad: 0,
                promedio_claridad: 0,
                ultima_actualizacion: null
            }
        };
        await fs.writeFile(ENCUESTAS_FILE, JSON.stringify(datosIniciales, null, 2));
        return datosIniciales;
    }
}

// Función para guardar encuestas
async function guardarEncuestas(datos) {
    await asegurarDirectorio();
    await fs.writeFile(ENCUESTAS_FILE, JSON.stringify(datos, null, 2));
}

// Función para calcular estadísticas
function calcularEstadisticas(encuestas) {
    if (encuestas.length === 0) {
        return {
            total: 0,
            promedio_facilidad: 0,
            promedio_claridad: 0,
            ultima_actualizacion: null
        };
    }

    const encuestasCompletas = encuestas.filter(e => e.completada);
    const sumaFacilidad = encuestasCompletas.reduce((sum, e) => 
        sum + (e.respuestas.facilidad_uso || 0), 0);
    const sumaClaridad = encuestasCompletas.reduce((sum, e) => 
        sum + (e.respuestas.claridad_informacion || 0), 0);

    return {
        total: encuestas.length,
        promedio_facilidad: encuestasCompletas.length > 0 
            ? (sumaFacilidad / encuestasCompletas.length).toFixed(2)
            : 0,
        promedio_claridad: encuestasCompletas.length > 0
            ? (sumaClaridad / encuestasCompletas.length).toFixed(2)
            : 0,
        ultima_actualizacion: new Date().toISOString()
    };
}

// POST - Guardar nueva encuesta (sin autenticación, viene del formulario web)
router.post('/encuestas-satisfaccion', async (req, res) => {
    try {
        const { dni, fecha, respuestas, completada, modalidad } = req.body;

        const datos = await leerEncuestas();

        const nuevaEncuesta = {
            id: Date.now(),
            dni_estudiante: dni,
            modalidad: modalidad || 'presencial', // Guardar la modalidad
            fecha: fecha || new Date().toISOString(),
            respuestas,
            completada: completada || false,
            created_at: new Date().toISOString()
        };

        datos.encuestas.push(nuevaEncuesta);
        datos.estadisticas = calcularEstadisticas(datos.encuestas);

        await guardarEncuestas(datos);

        console.log('✅ Encuesta guardada en JSON para DNI:', dni, '- Modalidad:', modalidad);

        res.status(201).json({ 
            success: true, 
            message: 'Encuesta guardada correctamente',
            id: nuevaEncuesta.id
        });
    } catch (error) {
        console.error('❌ Error guardando encuesta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al guardar la encuesta',
            error: error.message 
        });
    }
});

// GET - Obtener encuestas filtradas por modalidad (requiere autenticación)
router.get('/encuestas-satisfaccion', async (req, res) => {
    try {
        const { modalidad } = req.query;
        const datos = await leerEncuestas();
        
        let encuestasFiltradas = datos.encuestas;
        
        // Filtrar por modalidad si se especifica
        if (modalidad) {
            encuestasFiltradas = datos.encuestas.filter(e => 
                e.modalidad && e.modalidad.toLowerCase() === modalidad.toLowerCase()
            );
        }
        
        res.json({ 
            success: true, 
            encuestas: encuestasFiltradas,
            total: encuestasFiltradas.length
        });
    } catch (error) {
        console.error('❌ Error obteniendo encuestas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener encuestas',
            error: error.message 
        });
    }
});

// GET - Obtener estadísticas por modalidad
router.get('/encuestas-satisfaccion/estadisticas', async (req, res) => {
    try {
        const { modalidad } = req.query;
        const datos = await leerEncuestas();
        
        let encuestasParaEstadisticas = datos.encuestas;
        
        if (modalidad) {
            encuestasParaEstadisticas = datos.encuestas.filter(e => 
                e.modalidad && e.modalidad.toLowerCase() === modalidad.toLowerCase()
            );
        }
        
        const estadisticas = calcularEstadisticas(encuestasParaEstadisticas);
        
        res.json({ 
            success: true, 
            estadisticas
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});

// GET - Exportar PDF profesional (nuevo)
router.get('/encuestas-satisfaccion/exportar-pdf', async (req, res) => {
    try {
        const { modalidad } = req.query;
        const datos = await leerEncuestas();
        
        let encuestasParaPDF = datos.encuestas;
        let tituloModalidad = 'Todas las Modalidades';
        
        if (modalidad) {
            encuestasParaPDF = datos.encuestas.filter(e => 
                e.modalidad && e.modalidad.toLowerCase() === modalidad.toLowerCase()
            );
            tituloModalidad = modalidad.charAt(0).toUpperCase() + modalidad.slice(1);
        }
        
        const estadisticas = calcularEstadisticas(encuestasParaPDF);
        
        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'A4', 
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Encuestas_Satisfaccion_${tituloModalidad.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        
        doc.pipe(res);
        
        // === ENCABEZADO PROFESIONAL ===
        doc.fillColor('#2d4177')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('CEIJA 5 La Calera - Cba', { align: 'center' });
        
        doc.fillColor('#6c757d')
           .fontSize(11)
           .font('Helvetica')
           .text('Educación Integral para Jóvenes y Adultos', { align: 'center' });
        
        doc.moveDown(0.3);
        doc.strokeColor('#2d4177')
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(1);
        
        // === TÍTULO PRINCIPAL ===
        doc.fillColor('#2d4177')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('ENCUESTAS DE SATISFACCIÓN', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // === INFORMACIÓN GENERAL ===
        doc.fillColor('#000')
           .fontSize(11)
           .font('Helvetica')
           .text(`Modalidad: ${tituloModalidad}`, 70)
           .text(`Total de encuestas: ${estadisticas.total}`, 70)
           .text(`Fecha de generación: ${new Date().toLocaleDateString('es-AR')}`, 70);
        
        doc.moveDown(1);
        
        // === ESTADÍSTICAS GENERALES ===
        doc.fillColor('#2d4177')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('ESTADÍSTICAS GENERALES', 70);
        
        doc.moveDown(0.5);
        
        // Tabla de estadísticas
        const tableTop = doc.y;
        const col1X = 70;
        const col2X = 300;
        const rowHeight = 25;
        
        // Header de tabla
        doc.fillColor('#2d4177')
           .rect(col1X, tableTop, 475, rowHeight)
           .fill();
        
        doc.fillColor('#fff')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Métrica', col1X + 10, tableTop + 8)
           .text('Valor', col2X + 10, tableTop + 8);
        
        // Filas de datos
        let currentY = tableTop + rowHeight;
        const estadisticasData = [
            ['Facilidad de Uso Promedio', `${estadisticas.promedio_facilidad} ⭐`],
            ['Claridad de Información Promedio', `${estadisticas.promedio_claridad} ⭐`],
            ['Última Actualización', new Date(estadisticas.ultima_actualizacion).toLocaleString('es-AR')]
        ];
        
        estadisticasData.forEach((row, index) => {
            const fillColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
            doc.fillColor(fillColor)
               .rect(col1X, currentY, 475, rowHeight)
               .fill();
            
            doc.fillColor('#000')
               .fontSize(10)
               .font('Helvetica')
               .text(row[0], col1X + 10, currentY + 8)
               .text(row[1], col2X + 10, currentY + 8);
            
            currentY += rowHeight;
        });
        
        doc.moveDown(2);
        
        // === DETALLE DE ENCUESTAS ===
        if (encuestasParaPDF.length > 0) {
            doc.addPage();
            
            doc.fillColor('#2d4177')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('DETALLE DE ENCUESTAS', 70);
            
            doc.moveDown(0.5);
            
            encuestasParaPDF.slice(0, 20).forEach((encuesta, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }
                
                doc.fillColor('#2d4177')
                   .fontSize(11)
                   .font('Helvetica-Bold')
                   .text(`Encuesta #${index + 1}`, 70);
                
                doc.fillColor('#000')
                   .fontSize(9)
                   .font('Helvetica')
                   .text(`DNI: ${encuesta.dni_estudiante || 'N/A'}`, 70)
                   .text(`Modalidad: ${encuesta.modalidad || 'N/A'}`, 70)
                   .text(`Fecha: ${new Date(encuesta.fecha).toLocaleDateString('es-AR')}`, 70);
                
                if (encuesta.respuestas) {
                    doc.text(`Facilidad: ${encuesta.respuestas.facilidad_uso || 'N/A'} ⭐`, 70);
                    doc.text(`Claridad: ${encuesta.respuestas.claridad_informacion || 'N/A'} ⭐`, 70);
                    
                    if (encuesta.respuestas.sugerencias) {
                        doc.text(`Sugerencias: ${encuesta.respuestas.sugerencias.substring(0, 100)}...`, 70);
                    }
                }
                
                doc.moveDown(0.8);
            });
            
            if (encuestasParaPDF.length > 20) {
                doc.fillColor('#6c757d')
                   .fontSize(9)
                   .font('Helvetica-Oblique')
                   .text(`(Mostrando las primeras 20 de ${encuestasParaPDF.length} encuestas)`, { align: 'center' });
            }
        }
        
        // === PIE DE PÁGINA ===
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            
            doc.fillColor('#6c757d')
               .fontSize(8)
               .font('Helvetica')
               .text(
                   `Generado: ${new Date().toLocaleString('es-AR')}`,
                   50,
                   doc.page.height - 30,
                   { align: 'left' }
               );
            
            doc.text(
                `Página ${i + 1} de ${pages.count}`,
                0,
                doc.page.height - 30,
                { align: 'right' }
            );
        }
        
        doc.end();
        
    } catch (error) {
        console.error('❌ Error exportando PDF:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al exportar PDF de encuestas' 
        });
    }
});

// GET - Exportar JSON (mantener existente)
router.get('/encuestas-satisfaccion/exportar', async (req, res) => {
    try {
        const { modalidad } = req.query;
        const datos = await leerEncuestas();
        
        let datosExportar = datos;
        
        if (modalidad) {
            datosExportar = {
                encuestas: datos.encuestas.filter(e => 
                    e.modalidad && e.modalidad.toLowerCase() === modalidad.toLowerCase()
                ),
                estadisticas: calcularEstadisticas(datos.encuestas.filter(e => 
                    e.modalidad && e.modalidad.toLowerCase() === modalidad.toLowerCase()
                ))
            };
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=encuestas-${modalidad || 'todas'}-${new Date().toISOString().split('T')[0]}.json`);
        res.send(JSON.stringify(datosExportar, null, 2));
    } catch (error) {
        console.error('❌ Error exportando encuestas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al exportar encuestas' 
        });
    }
});

module.exports = router;
