module.exports = async function buscarOInsertarProvincia(db, nombreProvincia) {
    console.log('🌍 [buscarOInsertarProvincia] Recibido:', { nombreProvincia, tipo: typeof nombreProvincia });
    
    // Si nombreProvincia es null, undefined o vacío, usar valor por defecto
    if (!nombreProvincia || nombreProvincia === null || nombreProvincia === undefined || nombreProvincia === '') {
        console.log('⚠️ [buscarOInsertarProvincia] Provincia vacía/nula, usando por defecto');
        nombreProvincia = 'Buenos Aires';
    }
    
    // Si viene un ID numérico, devolverlo directamente
    if (!isNaN(nombreProvincia) && Number.isInteger(Number(nombreProvincia))) {
        const provincia = { id: Number(nombreProvincia) };
        console.log('🔢 [buscarOInsertarProvincia] ID numérico directo:', provincia);
        return provincia;
    }
    
    // Buscar por nombre (para compatibilidad con registros existentes)
    const [provinciaResult] = await db.query('SELECT id FROM provincias WHERE nombre = ?', [nombreProvincia]);
    if (provinciaResult.length > 0) {
        const provincia = { id: provinciaResult[0].id };
        console.log('🔍 [buscarOInsertarProvincia] Provincia encontrada:', provincia);
        return provincia;
    } else {
        const [newProvincia] = await db.query('INSERT INTO provincias (nombre) VALUES (?)', [nombreProvincia]);
        const provincia = { id: newProvincia.insertId };
        console.log('✨ [buscarOInsertarProvincia] Provincia creada:', provincia);
        return provincia;
    }
};