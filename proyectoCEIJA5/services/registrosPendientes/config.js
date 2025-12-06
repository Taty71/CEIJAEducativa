const path = require('path');
const multer = require('multer');

// Rutas de archivos y directorios
const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', '..', 'data', 'Registros_Pendientes.json');
const ARCHIVOS_PENDIENTES_PATH = path.join(__dirname, '..', '..', 'archivosPendientes');
const ARCHIVOS_DOCUMENTO_PATH = path.join(__dirname, '..', '..', 'archivosDocumento');

// Configurar multer para manejar archivos de registros pendientes
const storage = multer.diskStorage({
    // Carpeta donde se guardan los archivos de registros pendientes
    destination: (_req, _file, cb) => {
        cb(null, ARCHIVOS_PENDIENTES_PATH);
    },
    // Nombre del archivo: <nombre>_<apellido>_<dni>_<campo>.<ext>
    filename: (req, file, cb) => {
        const nombre = (req.body.nombre || 'sin_nombre').trim().replace(/\s+/g, '_');
        const apellido = (req.body.apellido || 'sin_apellido').trim().replace(/\s+/g, '_');
        const dni = (req.body.dni || 'sin_dni');
        const campo = file.fieldname; // archivo_dni, archivo_cuil, foto, etc.
        const ext = path.extname(file.originalname);
        
        const filename = `${nombre}_${apellido}_${dni}_${campo}${ext}`;
        console.log(`📎 [archivos-pendientes] Guardando archivo: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = {
    REGISTROS_PENDIENTES_PATH,
    ARCHIVOS_PENDIENTES_PATH,
    ARCHIVOS_DOCUMENTO_PATH,
    upload
};