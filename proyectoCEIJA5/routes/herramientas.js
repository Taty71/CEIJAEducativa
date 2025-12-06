const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ceija5_redone'
};

// Función para analizar datos inconsistentes
async function analizarDatosInconsistentes() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // 1. Estudiantes con datos problemáticos
        const estudiantesProblematicos = await connection.query(`
            SELECT 
                id, nombre, apellido, paisEmision, dni
            FROM estudiantes 
            WHERE 
                paisEmision IS NULL 
                OR paisEmision = '' 
                OR paisEmision = 'nannan'
                OR nombre LIKE '%nannan%'
                OR apellido LIKE '%nannan%'
            ORDER BY id
        `);
        
        // 2. Estudiantes sin inscripciones
        const estudiantesSinInscripciones = await connection.query(`
            SELECT 
                e.id, e.nombre, e.apellido, e.dni
            FROM estudiantes e
            LEFT JOIN inscripciones i ON e.id = i.idEstudiante
            WHERE i.idEstudiante IS NULL
            ORDER BY e.id
        `);
        
        // 3. Inscripciones con modalidades inválidas
        const inscripcionesProblematicas = await connection.query(`
            SELECT 
                i.id, i.idEstudiante, e.nombre, e.apellido, i.idModalidad, m.modalidad
            FROM inscripciones i
            LEFT JOIN estudiantes e ON i.idEstudiante = e.id
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            WHERE 
                i.idModalidad NOT IN (1, 2)
                OR m.modalidad IS NULL
            ORDER BY i.id
        `);
        
        // 4. Resumen de modalidades
        const resumenModalidades = await connection.query(`
            SELECT 
                m.modalidad,
                COUNT(i.id) as cantidad_inscripciones
            FROM modalidades m
            LEFT JOIN inscripciones i ON m.id = i.idModalidad
            GROUP BY m.id, m.modalidad
            ORDER BY m.id
        `);
        
        // 5. Totales
        const totalEstudiantes = await connection.query('SELECT COUNT(*) as total FROM estudiantes');
        const estudiantesCompletos = await connection.query(`
            SELECT COUNT(*) as completos 
            FROM estudiantes 
            WHERE 
                paisEmision IS NOT NULL 
                AND paisEmision != '' 
                AND paisEmision != 'nannan'
                AND nombre NOT LIKE '%nannan%'
                AND apellido NOT LIKE '%nannan%'
        `);
        
        const total = totalEstudiantes[0][0].total;
        const completos = estudiantesCompletos[0][0].completos;
        const incompletos = total - completos;
        
        return {
            success: true,
            totalEstudiantes: total,
            estudiantesCompletos: completos,
            estudiantesIncompletos: incompletos,
            porcentajeValidez: Math.round((completos/total)*100),
            estudiantesProblematicos: estudiantesProblematicos[0].length,
            estudiantesSinInscripciones: estudiantesSinInscripciones[0].length,
            estudiantesSinInscripcionesDetalle: estudiantesSinInscripciones[0],
            inscripcionesProblematicas: inscripcionesProblematicas[0].length,
            modalidades: resumenModalidades[0],
            detalleProblematicos: estudiantesProblematicos[0]
        };
        
    } catch (error) {
        console.error('Error en análisis:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Función para limpiar registros problemáticos
async function limpiarRegistrosProblematicos() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Obtener estudiantes sin inscripciones antes de eliminar
        const estudiantesSinInscripciones = await connection.query(`
            SELECT 
                e.id, e.nombre, e.apellido, e.dni
            FROM estudiantes e
            LEFT JOIN inscripciones i ON e.id = i.idEstudiante
            WHERE i.idEstudiante IS NULL
            ORDER BY e.id
        `);
        
        let estudiantesEliminados = 0;
        let estudiantesEliminadosDetalle = [];
        
        // Solo eliminar si hay estudiantes sin inscripciones
        if (estudiantesSinInscripciones[0].length > 0) {
            estudiantesEliminadosDetalle = estudiantesSinInscripciones[0];
            
            // Eliminar estudiantes sin inscripciones
            const deleteResult = await connection.query(`
                DELETE FROM estudiantes 
                WHERE id IN (
                    SELECT * FROM (
                        SELECT e.id 
                        FROM estudiantes e
                        LEFT JOIN inscripciones i ON e.id = i.idEstudiante
                        WHERE i.idEstudiante IS NULL
                    ) as temp
                )
            `);
            
            estudiantesEliminados = deleteResult[0].affectedRows;
        }
        
        // También eliminar estudiantes con datos problemáticos si los hubiera
        const estudiantesProblematicos = await connection.query(`
            SELECT id, nombre, apellido, dni
            FROM estudiantes 
            WHERE 
                paisEmision IS NULL 
                OR paisEmision = '' 
                OR paisEmision = 'nannan'
                OR nombre LIKE '%nannan%'
                OR apellido LIKE '%nannan%'
        `);
        
        if (estudiantesProblematicos[0].length > 0) {
            const deleteProblematicos = await connection.query(`
                DELETE FROM estudiantes 
                WHERE 
                    paisEmision IS NULL 
                    OR paisEmision = '' 
                    OR paisEmision = 'nannan'
                    OR nombre LIKE '%nannan%'
                    OR apellido LIKE '%nannan%'
            `);
            
            estudiantesEliminados += deleteProblematicos[0].affectedRows;
            estudiantesEliminadosDetalle = [...estudiantesEliminadosDetalle, ...estudiantesProblematicos[0]];
        }
        
        return {
            success: true,
            estudiantesEliminados,
            estudiantesEliminadosDetalle,
            registrosCorregidos: 0,
            mensaje: estudiantesEliminados > 0 
                ? `Se eliminaron ${estudiantesEliminados} registros problemáticos`
                : 'No se encontraron registros problemáticos para eliminar'
        };
        
    } catch (error) {
        console.error('Error en limpieza:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ruta para analizar datos
router.post('/analizar-datos', async (req, res) => {
    try {
        console.log('🔍 Iniciando análisis de datos...');
        
        const resultado = await analizarDatosInconsistentes();
        
        console.log('✅ Análisis completado:', {
            total: resultado.totalEstudiantes,
            problematicos: resultado.estudiantesProblematicos,
            sinInscripciones: resultado.estudiantesSinInscripciones
        });
        
        res.json(resultado);
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
        res.status(500).json({
            error: true,
            mensaje: error.message || 'Error interno del servidor'
        });
    }
});

// Ruta para limpiar datos
router.post('/limpiar-datos', async (req, res) => {
    try {
        console.log('🧹 Iniciando limpieza de datos...');
        
        const resultado = await limpiarRegistrosProblematicos();
        
        console.log('✅ Limpieza completada:', {
            eliminados: resultado.estudiantesEliminados,
            corregidos: resultado.registrosCorregidos
        });
        
        res.json(resultado);
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
        res.status(500).json({
            error: true,
            mensaje: error.message || 'Error interno del servidor'
        });
    }
});

module.exports = router;