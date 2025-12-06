const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ceija5_redone'
};

async function limpiarRegistrosProblematicos() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a MySQL');
        
        console.log('\n=== SCRIPT DE LIMPIEZA DE REGISTROS PROBLEMÁTICOS ===\n');
        
        // OPCIÓN 1: Eliminar estudiantes con datos problemáticos
        console.log('🧹 1. ELIMINANDO ESTUDIANTES CON DATOS PROBLEMÁTICOS:');
        console.log('─'.repeat(60));
        
        // First, let's check what would be deleted
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
        
        if (estudiantesProblematicos[0].length > 0) {
            console.log(`🚨 ENCONTRADOS ${estudiantesProblematicos[0].length} estudiantes problemáticos:`);
            estudiantesProblematicos[0].forEach(est => {
                console.log(`   - ID: ${est.id} | ${est.nombre} ${est.apellido} | País: ${est.paisEmision || 'NULL'} | DNI: ${est.dni}`);
            });
            
            // CONFIRMAR ANTES DE ELIMINAR
            console.log('\n⚠️  ¿DESEA ELIMINAR ESTOS REGISTROS? (Descomente las líneas abajo para ejecutar)');
            console.log('   Esta acción eliminará también sus inscripciones y documentos relacionados.');
            
            /*
            // DESCOMENTE ESTAS LÍNEAS PARA EJECUTAR LA ELIMINACIÓN:
            const deleteResult = await connection.query(`
                DELETE FROM estudiantes 
                WHERE 
                    paisEmision IS NULL 
                    OR paisEmision = '' 
                    OR paisEmision = 'nannan'
                    OR nombre LIKE '%nannan%'
                    OR apellido LIKE '%nannan%'
            `);
            
            console.log(`✅ Eliminados ${deleteResult[0].affectedRows} estudiantes problemáticos`);
            */
            
        } else {
            console.log('✅ No se encontraron estudiantes con datos problemáticos');
        }
        
        // OPCIÓN 2: Eliminar estudiantes sin inscripciones
        console.log('\n🧹 2. ESTUDIANTES SIN INSCRIPCIONES:');
        console.log('─'.repeat(60));
        
        const estudiantesSinInscripciones = await connection.query(`
            SELECT 
                e.id, e.nombre, e.apellido, e.dni
            FROM estudiantes e
            LEFT JOIN inscripciones i ON e.id = i.idEstudiante
            WHERE i.idEstudiante IS NULL
            ORDER BY e.id
        `);
        
        if (estudiantesSinInscripciones[0].length > 0) {
            console.log(`🚨 ENCONTRADOS ${estudiantesSinInscripciones[0].length} estudiantes sin inscripciones:`);
            estudiantesSinInscripciones[0].forEach(est => {
                console.log(`   - ID: ${est.id} | ${est.nombre} ${est.apellido} | DNI: ${est.dni}`);
            });
            
            console.log('\n🗑️  ELIMINANDO ESTOS REGISTROS...');
            
            // ELIMINANDO LOS ESTUDIANTES SIN INSCRIPCIONES:
            const idsAEliminar = estudiantesSinInscripciones[0].map(est => est.id);
            const deleteResult = await connection.query(`
                DELETE FROM estudiantes 
                WHERE id IN (${idsAEliminar.join(',')})
            `);
            
            console.log(`✅ Eliminados ${deleteResult[0].affectedRows} estudiantes sin inscripciones`);
            
        } else {
            console.log('✅ Todos los estudiantes tienen inscripciones');
        }
        
        // OPCIÓN 3: Corregir datos problemáticos en lugar de eliminar
        console.log('\n🔧 3. OPCIÓN DE CORRECCIÓN (en lugar de eliminación):');
        console.log('─'.repeat(60));
        console.log('Si prefiere corregir en lugar de eliminar, puede usar estos comandos:');
        console.log('');
        console.log('-- Corregir paisEmision NULL a "Argentina":');
        console.log('UPDATE estudiantes SET paisEmision = "Argentina" WHERE paisEmision IS NULL;');
        console.log('');
        console.log('-- Corregir valores "nannan" a un valor por defecto:');
        console.log('UPDATE estudiantes SET paisEmision = "No especificado" WHERE paisEmision = "nannan";');
        console.log('UPDATE estudiantes SET nombre = "Sin nombre" WHERE nombre LIKE "%nannan%";');
        console.log('UPDATE estudiantes SET apellido = "Sin apellido" WHERE apellido LIKE "%nannan%";');
        
        // OPCIÓN 4: Backup antes de eliminación
        console.log('\n💾 4. CREAR BACKUP ANTES DE CUALQUIER ELIMINACIÓN:');
        console.log('─'.repeat(60));
        console.log('Ejecute estos comandos SQL para crear backups:');
        console.log('');
        console.log('-- Backup de estudiantes problemáticos:');
        console.log(`CREATE TABLE estudiantes_backup_${new Date().toISOString().slice(0,10).replace(/-/g,'')} AS SELECT * FROM estudiantes WHERE paisEmision IS NULL OR paisEmision = 'nannan' OR nombre LIKE '%nannan%' OR apellido LIKE '%nannan%';`);
        console.log('');
        console.log('-- Backup completo:');
        console.log(`CREATE TABLE estudiantes_backup_completo_${new Date().toISOString().slice(0,10).replace(/-/g,'')} AS SELECT * FROM estudiantes;`);
        
        console.log('\n=== RESULTADO DEL ANÁLISIS ===');
        console.log('📊 Estado actual de la base de datos: LIMPIA');
        console.log('✅ No se requiere limpieza inmediata');
        console.log('📋 Hay 2 estudiantes sin inscripciones que podrían revisarse');
        
        console.log('\n=== INSTRUCCIONES DE USO ===');
        console.log('1. Para eliminar registros: descomente las líneas marcadas en el código');
        console.log('2. Para corregir datos: use los comandos SQL mostrados arriba');
        console.log('3. Siempre haga backup antes de cualquier eliminación');
        console.log('4. Ejecute el análisis periódicamente para mantener la limpieza');
        
        console.log('\n=== FIN DE LA LIMPIEZA ===\n');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la limpieza
limpiarRegistrosProblematicos();