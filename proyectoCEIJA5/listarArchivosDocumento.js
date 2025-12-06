// Script para listar archivos en la carpeta archivosDocumento y verificar si existen
const fs = require('fs');
const path = require('path');

const carpeta = path.join(__dirname, 'archivosDocumento');

function listarArchivos() {
    if (!fs.existsSync(carpeta)) {
        console.error('La carpeta no existe:', carpeta);
        return;
    }
    const archivos = fs.readdirSync(carpeta);
    console.log('Archivos en', carpeta + ':');
    archivos.forEach(archivo => {
        console.log(' -', archivo);
    });
}

listarArchivos();
