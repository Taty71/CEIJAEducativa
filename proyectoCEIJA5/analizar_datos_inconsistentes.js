const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ceija5_redone'
};

async function analizarDatosInconsistentes() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a MySQL');
        
        console.log('\n=== ANÁLISIS DE DATOS INCONSISTENTES ===\n');
        
        // 1. Estudiantes con datos problemáticos
        console.log('📋 1. ESTUDIANTES CON DATOS PROBLEMÁTICOS:');
        console.log('─'.repeat(60));
        
        const estudiantesProblematicos = await connection.query(`
            SELECT 
                id,
                nombre,
                apellido,
                paisEmision,
                fechaNacimiento
            FROM estudiantes 
            WHERE 
                paisEmision IS NULL 
                OR paisEmision = '' 
                OR paisEmision = 'nannan'
                OR nombre LIKE '%nannan%'
                OR apellido LIKE '%nannan%'
            ORDER BY id
        `);
        
        if (estudiantesProblematicos[0].length > 0) {
            console.log(`Encontrados ${estudiantesProblematicos[0].length} estudiantes con datos problemáticos:`);
            estudiantesProblematicos[0].forEach(est => {
                console.log(`- ID: ${est.id} | ${est.nombre} ${est.apellido} | País: ${est.paisEmision || 'NULL'}`);
            });
        } else {
            console.log('✅ No se encontraron estudiantes con datos problemáticos');
        }
        
        // 2. Estudiantes sin inscripciones
        console.log('\n📋 2. ESTUDIANTES SIN INSCRIPCIONES:');
        console.log('─'.repeat(60));
        
        const estudiantesSinInscripciones = await connection.query(`
            SELECT 
                e.id,
                e.nombre,
                e.apellido,
                e.dni
            FROM estudiantes e
            LEFT JOIN inscripciones i ON e.id = i.idEstudiante
            WHERE i.idEstudiante IS NULL
            ORDER BY e.id
        `);
        
        if (estudiantesSinInscripciones[0].length > 0) {
            console.log(`Encontrados ${estudiantesSinInscripciones[0].length} estudiantes sin inscripciones:`);
            estudiantesSinInscripciones[0].forEach(est => {
                console.log(`- ID: ${est.id} | ${est.nombre} ${est.apellido} | DNI: ${est.dni}`);
            });
        } else {
            console.log('✅ Todos los estudiantes tienen inscripciones');
        }
        
        // 3. Inscripciones con modalidades inválidas
        console.log('\n📋 3. INSCRIPCIONES CON MODALIDADES PROBLEMÁTICAS:');
        console.log('─'.repeat(60));
        
        const inscripcionesProblematicas = await connection.query(`
            SELECT 
                i.id,
                i.idEstudiante,
                e.nombre,
                e.apellido,
                i.idModalidad,
                m.modalidad
            FROM inscripciones i
            LEFT JOIN estudiantes e ON i.idEstudiante = e.id
            LEFT JOIN modalidades m ON i.idModalidad = m.id
            WHERE 
                i.idModalidad NOT IN (1, 2)
                OR m.modalidad IS NULL
            ORDER BY i.id
        `);
        
        if (inscripcionesProblematicas[0].length > 0) {
            console.log(`Encontradas ${inscripcionesProblematicas[0].length} inscripciones con modalidades problemáticas:`);
            inscripcionesProblematicas[0].forEach(insc => {
                console.log(`- Inscripción ID: ${insc.id} | Estudiante: ${insc.nombre} ${insc.apellido} | Modalidad ID: ${insc.idModalidad} | Modalidad: ${insc.modalidad || 'INVÁLIDA'}`);
            });
        } else {
            console.log('✅ Todas las inscripciones tienen modalidades válidas');
        }
        
        // 4. Resumen de modalidades en uso
        console.log('\n📊 4. RESUMEN DE MODALIDADES EN USO:');
        console.log('─'.repeat(60));
        
        const resumenModalidades = await connection.query(`
            SELECT 
                m.modalidad,
                COUNT(i.id) as cantidad_inscripciones
            FROM modalidades m
            LEFT JOIN inscripciones i ON m.id = i.idModalidad
            GROUP BY m.id, m.modalidad
            ORDER BY m.id
        `);
        
        resumenModalidades[0].forEach(modalidad => {
            console.log(`- ${modalidad.modalidad}: ${modalidad.cantidad_inscripciones} inscripciones`);
        });
        
        // 5. Estudiantes con datos completos vs incompletos
        console.log('\n📊 5. RESUMEN GENERAL:');
        console.log('─'.repeat(60));
        
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
        
        console.log(`Total de estudiantes: ${total}`);
        console.log(`Estudiantes con datos completos: ${completos}`);
        console.log(`Estudiantes con datos incompletos: ${incompletos}`);
        console.log(`Porcentaje de datos válidos: ${((completos/total)*100).toFixed(1)}%`);
        
        console.log('\n=== FIN DEL ANÁLISIS ===\n');
        
    } catch (error) {
        console.error('❌ Error durante el análisis:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar el análisis
analizarDatosInconsistentes();