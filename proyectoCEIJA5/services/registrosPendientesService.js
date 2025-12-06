const fs = require('fs').promises;
const path = require('path');

// Ruta del archivo JSON donde se guardan los registros pendientes
const REGISTROS_PENDIENTES_PATH = path.join(__dirname, '..', 'data', 'Registros_Pendientes.json');

class RegistrosPendientesService {
    
    // Asegurar que existe el archivo
    async ensureFileExists() {
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
    }

    // Obtener todos los registros pendientes
    async obtenerRegistros() {
        try {
            await this.ensureFileExists();
            const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
            const registros = JSON.parse(data);
            
            // Transformar datos para compatibilidad con el sistema de emails
            return registros.map(registro => ({
                id: registro.dni,
                nombre: registro.datos?.nombre || '',
                apellido: registro.datos?.apellido || '',
                dni: registro.dni,
                email: registro.datos?.email || '',
                telefono: registro.datos?.telefono || '',
                modalidad: registro.datos?.modalidad || '',
                fechaCreacion: registro.timestamp,
                fechaVencimiento: this.calcularFechaVencimiento(registro.timestamp),
                estado: registro.estado,
                archivos: registro.archivos || {},
                documentosSubidos: Object.keys(registro.archivos || {}),
                tieneDocumentacion: Object.keys(registro.archivos || {}).length > 0,
                tipoRegistro: Object.keys(registro.archivos || {}).length === 0 ? 'SIN_DOCUMENTACION' : 'DOCUMENTACION_INCOMPLETA'
            }));
            
        } catch (error) {
            console.error('Error al obtener registros pendientes:', error);
            return [];
        }
    }

    // Obtener un registro específico por DNI
    async obtenerRegistroPorDni(dni) {
        const registros = await this.obtenerRegistros();
        return registros.find(r => r.dni === dni);
    }

    // Obtener registros urgentes (próximos a vencer)
    async obtenerRegistrosUrgentes(diasUmbral = 3) {
        const registros = await this.obtenerRegistros();
        const ahora = new Date();
        
        return registros.filter(registro => {
            const fechaVencimiento = new Date(registro.fechaVencimiento);
            const msRestantes = fechaVencimiento.getTime() - ahora.getTime();
            const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
            
            return diasRestantes <= diasUmbral && registro.email && registro.email.includes('@');
        });
    }

    // Obtener registros con emails válidos
    async obtenerRegistrosConEmail() {
        const registros = await this.obtenerRegistros();
        return registros.filter(r => r.email && r.email.includes('@'));
    }

    // Calcular fecha de vencimiento (7 días después de la creación)
    calcularFechaVencimiento(fechaCreacion) {
        const fecha = new Date(fechaCreacion);
        fecha.setDate(fecha.getDate() + 7);
        return fecha.toISOString();
    }

    // Actualizar estado de un registro
    async actualizarEstado(dni, nuevoEstado, observaciones = null) {
        try {
            await this.ensureFileExists();
            const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
            const registros = JSON.parse(data);
            
            const indiceRegistro = registros.findIndex(r => r.dni === dni);
            
            if (indiceRegistro === -1) {
                throw new Error(`Registro con DNI ${dni} no encontrado`);
            }
            
            registros[indiceRegistro].estado = nuevoEstado;
            registros[indiceRegistro].fechaActualizacion = new Date().toISOString();
            
            if (observaciones) {
                registros[indiceRegistro].observaciones = observaciones;
            }
            
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
            
            console.log(`✅ Estado actualizado - DNI: ${dni}, Nuevo estado: ${nuevoEstado}`);
            return registros[indiceRegistro];
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    }

    // Marcar registro como completado
    async completarRegistro(dni) {
        return await this.actualizarEstado(dni, 'COMPLETADO', 'Registro completado y procesado');
    }

    // Eliminar registro procesado
    async eliminarRegistro(dni) {
        try {
            await this.ensureFileExists();
            const data = await fs.readFile(REGISTROS_PENDIENTES_PATH, 'utf8');
            let registros = JSON.parse(data);
            
            const registroOriginal = registros.find(r => r.dni === dni);
            
            if (!registroOriginal) {
                throw new Error(`Registro con DNI ${dni} no encontrado`);
            }
            
            registros = registros.filter(r => r.dni !== dni);
            
            await fs.writeFile(REGISTROS_PENDIENTES_PATH, JSON.stringify(registros, null, 2));
            
            console.log(`🗑️ Registro eliminado - DNI: ${dni}`);
            return registroOriginal;
            
        } catch (error) {
            console.error('Error al eliminar registro:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async obtenerEstadisticas() {
        const registros = await this.obtenerRegistros();
        const ahora = new Date();
        
        return {
            total: registros.length,
            pendientes: registros.filter(r => r.estado === 'PENDIENTE').length,
            completados: registros.filter(r => r.estado === 'COMPLETADO').length,
            vencidos: registros.filter(r => {
                const fechaVencimiento = new Date(r.fechaVencimiento);
                return fechaVencimiento < ahora;
            }).length,
            urgentes: registros.filter(r => {
                const fechaVencimiento = new Date(r.fechaVencimiento);
                const msRestantes = fechaVencimiento.getTime() - ahora.getTime();
                const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
                return diasRestantes <= 3 && diasRestantes >= 0;
            }).length,
            conEmail: registros.filter(r => r.email && r.email.includes('@')).length,
            sinEmail: registros.filter(r => !r.email || !r.email.includes('@')).length
        };
    }
}

module.exports = new RegistrosPendientesService();