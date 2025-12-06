const db = require('./db');

async function checkFiles() {
    try {
        const [rows] = await db.query('SELECT archivoDocumentacion FROM detalle_inscripcion WHERE archivoDocumentacion LIKE "%Martin_Perez%"');
        console.log('Archivos de Martin Perez:', rows);
        
        const [allRows] = await db.query('SELECT archivoDocumentacion FROM detalle_inscripcion WHERE archivoDocumentacion LIKE "%archivosDocumento%"');
        console.log('Archivos con archivosDocumento (sin s):', allRows);
        
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFiles();
