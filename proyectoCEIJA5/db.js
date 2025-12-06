const mysql = require('mysql2/promise');

// Configuración de la conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ceija5_redone',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar la conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
})();

// Asegurarnos de que la tabla archivos_estudiantes exista (evita errores en tiempo de ejecución)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archivos_estudiantes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idEstudiante INT NOT NULL,
        tipoArchivo VARCHAR(100),
        rutaArchivo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (idEstudiante)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Verificación/creación de tabla archivos_estudiantes completada');
  } catch (err) {
    console.warn('No se pudo crear/verificar la tabla archivos_estudiantes:', err.message);
  }
})();

module.exports = pool; // Exporta la conexión con soporte para promesas