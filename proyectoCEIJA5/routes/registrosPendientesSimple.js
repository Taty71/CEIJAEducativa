const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Ruta del archivo JSON donde se guardarán los registros pendientes  
const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');

// Función para asegurar que existe el directorio y el archivo
const ensureFileExists = async () => {
    const dir = path.dirname(REGISTROS_PENDIENTES_PATH);
    
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    
    try {
        await fs.access(REGISTROS_PENDIENTES_PATH);
    } catch {
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify([], null, 2));
    }
};

// POST: Crear registro pendiente simple (sin archivos) - para debugging
router.post('/simple', async (req, res) => {
    try {
        await ensureFileExists();
        
        console.log('📋 [registros-pendientes-simple] Datos recibidos:', req.body);
        
        const nuevoRegistro = {
            dni: req.body.dni || '',
            timestamp: new Date().toISOString(),
            fechaRegistro: new Date().toLocaleDateString('es-AR'),
            horaRegistro: new Date().toLocaleTimeString('es-AR'),
            tipo: 'REGISTRO_PENDIENTE',
            estado: 'PENDIENTE',
            tipoRegistro: req.body.tipoRegistro || 'SIN_DOCUMENTACION',
            datos: {
                nombre: req.body.nombre || '',
                apellido: req.body.apellido || '',
                dni: req.body.dni || '',
                cuil: req.body.cuil || '',
                email: req.body.email || '',
                telefono: req.body.telefono || '',
                fechaNacimiento: req.body.fechaNacimiento || '',
                tipoDocumento: req.body.tipoDocumento || 'DNI',
                paisEmision: req.body.paisEmision || 'Argentina',
                calle: req.body.calle || '',
                numero: req.body.numero || '',
                barrio: req.body.barrio || '',
                localidad: req.body.localidad || '',
                provincia: req.body.provincia || '',
                codigoPostal: req.body.codigoPostal || '',
                modalidad: req.body.modalidad || '',
                modalidadId: req.body.modalidadId || null,
                planAnio: req.body.planAnio || '',
                modulos: req.body.modulos || '',
                idModulo: req.body.idModulo || null,
                administrador: req.body.administrador || 'admin',
                motivoPendiente: req.body.motivoPendiente || 'Documentación incompleta'
            },
            archivos: {}, // Sin archivos en esta versión simple
            observaciones: req.body.observaciones || `Registro pendiente creado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`
        };

        // Leer registros existentes
        const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
        const registros = JSON.parse(data);
        
        // Verificar si ya existe un registro con el mismo DNI
        const registroExistente = registros.findIndex(r => r.dni === nuevoRegistro.dni);
        
        if (registroExistente !== -1) {
            // Actualizar registro existente
            registros[registroExistente] = {
                ...registros[registroExistente],
                ...nuevoRegistro,
                fechaActualizacion: new Date().toISOString()
            };
            console.log(`🔄 Registro pendiente SIMPLE actualizado - DNI: ${nuevoRegistro.dni}`);
        } else {
            // Agregar nuevo registro
            registros.push(nuevoRegistro);
            console.log(`✅ Nuevo registro pendiente SIMPLE creado - DNI: ${nuevoRegistro.dni}`);
        }
        
        // Guardar archivo actualizado
        await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
        
        res.status(201).json({
            message: 'Registro pendiente simple guardado exitosamente',
            registro: nuevoRegistro
        });
        
    } catch (error) {
        console.error('Error al crear registro pendiente simple:', error);
        res.status(500).json({ 
            error: 'Error al guardar el registro pendiente simple',
            message: error.message 
        });
    }
});

module.exports = router;