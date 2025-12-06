const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔄 Probando conexión a la base de datos...');
        console.log('📋 Configuración:', {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            database: process.env.DB_NAME || 'ceija5_redone'
        });

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ceija5_redone'
        });

        console.log('✅ Conexión exitosa a la base de datos');

        // Probar consulta simple
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM estudiantes');
        console.log('📊 Total de estudiantes en la base de datos:', rows[0].total);

        // Probar consulta con filtro activos
        const [activos] = await connection.execute('SELECT COUNT(*) as total FROM estudiantes WHERE activo = 1');
        console.log('📊 Total de estudiantes activos:', activos[0].total);

        // Probar consulta con filtro inactivos
        const [inactivos] = await connection.execute('SELECT COUNT(*) as total FROM estudiantes WHERE activo = 0');
        console.log('📊 Total de estudiantes inactivos:', inactivos[0].total);

        await connection.end();
        console.log('✅ Prueba de conexión completada exitosamente');
    } catch (error) {
        console.error('🚨 Error al conectar con la base de datos:', error.message);
        console.error('🔍 Detalle del error:', error);
    }
}

testConnection();
