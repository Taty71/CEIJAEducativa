module.exports = async function buscarOInsertarLocalidad(db, nombreLocalidad, idProvincia) {
    console.log('🏙️ [buscarOInsertarLocalidad] Recibido:', { nombreLocalidad, idProvincia, tipo: typeof nombreLocalidad });
    
    // Si nombreLocalidad es null, undefined o vacío, usar valor por defecto
    if (!nombreLocalidad || nombreLocalidad === null || nombreLocalidad === undefined || nombreLocalidad === '') {
        console.log('⚠️ [buscarOInsertarLocalidad] Localidad vacía/nula, usando por defecto');
        nombreLocalidad = 'Sin especificar';
    }
    
    // Si viene un ID numérico, devolverlo directamente
    if (!isNaN(nombreLocalidad) && Number.isInteger(Number(nombreLocalidad))) {
        const localidad = { id: Number(nombreLocalidad) };
        console.log('🔢 [buscarOInsertarLocalidad] ID numérico directo:', localidad);
        return localidad;
    }
    
    // Extraer el ID numérico si viene como objeto
    const idProvinciaNum = typeof idProvincia === 'object' && idProvincia.id ? idProvincia.id : idProvincia;
    console.log('🔢 [buscarOInsertarLocalidad] ID Provincia procesado:', idProvinciaNum);
    
    // Buscar por nombre y provincia (para compatibilidad con registros existentes)
    const [localidadResult] = await db.query(
        'SELECT id FROM localidades WHERE nombre = ? AND idProvincia = ?',
        [nombreLocalidad, idProvinciaNum]
    );
    if (localidadResult.length > 0) {
        const localidad = { id: localidadResult[0].id };
        console.log('🔍 [buscarOInsertarLocalidad] Localidad encontrada:', localidad);
        return localidad;
    } else {
        const [newLocalidad] = await db.query(
            'INSERT INTO localidades (nombre, idProvincia) VALUES (?, ?)',
            [nombreLocalidad, idProvinciaNum]
        );
        const localidad = { id: newLocalidad.insertId };
        console.log('✨ [buscarOInsertarLocalidad] Localidad creada:', localidad);
        return localidad;
    }
};