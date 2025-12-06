// Script para actualizar rutas de archivos en Registros_Pendientes.json
// Cambia '/archivosDocumentacion/' por '/archivosPendientes/' en todos los campos de archivos

const fs = require('fs');
const path = require('path');

const pendientesPath = path.join(__dirname, 'data', 'Registros_Pendientes.json');

fs.readFile(pendientesPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error leyendo Registros_Pendientes.json:', err);
        return;
    }
    let registros = JSON.parse(data);
    let cambios = 0;
    registros.forEach(registro => {
        if (registro.archivos) {
            Object.keys(registro.archivos).forEach(key => {
                if (typeof registro.archivos[key] === 'string' && registro.archivos[key].includes('/archivosDocumentacion/')) {
                    registro.archivos[key] = registro.archivos[key].replace('/archivosDocumentacion/', '/archivosPendientes/');
                    cambios++;
                }
            });
        }
    });
    if (cambios > 0) {
        fs.writeFile(pendientesPath, JSON.stringify(registros, null, 2), err => {
            if (err) {
                console.error('Error escribiendo Registros_Pendientes.json:', err);
            } else {
                console.log(`Actualización completa: ${cambios} rutas modificadas.`);
            }
        });
    } else {
        console.log('No se encontraron rutas para actualizar.');
    }
});
