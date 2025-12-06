// Servicio para migrar datos de localStorage a archivo JSON
export const migracionService = {
    // Migrar registros de localStorage al archivo JSON del backend
    migrarRegistrosLocalStorage: async () => {
        try {
            // Obtener registros del localStorage
            const registrosLocalStorage = JSON.parse(localStorage.getItem('registrosSinDocumentacion') || '[]');
            
            if (registrosLocalStorage.length === 0) {
                throw new Error('No hay registros en localStorage para migrar');
            }

            console.log(`📦 Iniciando migración de ${registrosLocalStorage.length} registros desde localStorage...`);

            // Enviar al backend
            const response = await fetch('/api/notificaciones/migrar-localStorage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    registrosLocalStorage: registrosLocalStorage 
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al migrar registros');
            }
            
            console.log(`✅ Migración exitosa: ${data.registrosMigrados} registros migrados`);
            return data;
            
        } catch (error) {
            console.error('Error al migrar registros desde localStorage:', error);
            throw error;
        }
    },

    // Verificar qué registros están en localStorage
    verificarRegistrosLocalStorage: () => {
        try {
            const registrosLocalStorage = JSON.parse(localStorage.getItem('registrosSinDocumentacion') || '[]');
            
            console.log(`📋 Encontrados ${registrosLocalStorage.length} registros en localStorage:`);
            
            registrosLocalStorage.forEach((registro, index) => {
                console.log(`  ${index + 1}. ${registro.nombre} ${registro.apellido} - DNI: ${registro.dni || registro.id}`);
            });

            return {
                cantidad: registrosLocalStorage.length,
                registros: registrosLocalStorage
            };
            
        } catch (error) {
            console.error('Error al verificar localStorage:', error);
            return { cantidad: 0, registros: [] };
        }
    },

    // Limpiar localStorage después de migración exitosa
    limpiarLocalStorageDespuesMigracion: () => {
        try {
            const backup = localStorage.getItem('registrosSinDocumentacion');
            
            // Crear backup con timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            localStorage.setItem(`registrosSinDocumentacion_backup_${timestamp}`, backup);
            
            // Limpiar registros originales
            localStorage.removeItem('registrosSinDocumentacion');
            
            console.log('✅ localStorage limpiado, backup creado');
            return true;
            
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
            return false;
        }
    },

    // Función completa de migración con confirmación
    ejecutarMigracionCompleta: async () => {
        try {
            // 1. Verificar registros
            const verificacion = migracionService.verificarRegistrosLocalStorage();
            
            if (verificacion.cantidad === 0) {
                return {
                    success: false,
                    message: 'No hay registros para migrar'
                };
            }

            console.log(`🚀 Iniciando migración completa de ${verificacion.cantidad} registros...`);

            // 2. Migrar al JSON
            const resultadoMigracion = await migracionService.migrarRegistrosLocalStorage();

            // 3. Si migración exitosa, limpiar localStorage
            if (resultadoMigracion.success) {
                const limpiezaExitosa = migracionService.limpiarLocalStorageDespuesMigracion();
                
                return {
                    success: true,
                    message: `Migración completa: ${resultadoMigracion.registrosMigrados} registros migrados`,
                    registrosMigrados: resultadoMigracion.registrosMigrados,
                    localStorageLimpiado: limpiezaExitosa
                };
            } else {
                throw new Error(resultadoMigracion.message);
            }

        } catch (error) {
            console.error('Error en migración completa:', error);
            return {
                success: false,
                message: `Error en migración: ${error.message}`
            };
        }
    }
};

// Función para ejecutar desde consola del navegador
window.migrarRegistrosPendientes = migracionService.ejecutarMigracionCompleta;
window.verificarLocalStorage = migracionService.verificarRegistrosLocalStorage;