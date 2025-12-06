// Módulo principal de servicios de registros pendientes
// Este archivo facilita las importaciones desde otros módulos

const config = require('./config');
const fileManager = require('./fileManager');
const documentValidator = require('./documentValidator');
const databaseManager = require('./databaseManager');
const controllers = require('./controllers');

module.exports = {
    // Configuración
    ...config,
    
    // Gestión de archivos
    ...fileManager,
    
    // Validación de documentos
    ...documentValidator,
    
    // Gestión de base de datos
    ...databaseManager,
    
    // Controladores
    ...controllers
};