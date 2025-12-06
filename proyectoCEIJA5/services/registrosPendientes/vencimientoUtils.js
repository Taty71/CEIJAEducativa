// Utilidades para manejo de vencimientos de registros pendientes

// Función para calcular días restantes hasta vencimiento
const calcularDiasRestantes = (fechaRegistro) => {
    const fechaCreacion = new Date(fechaRegistro);
    const fechaVencimiento = new Date(fechaCreacion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 7); // 7 días por defecto
    
    const hoy = new Date();
    const diferencia = fechaVencimiento - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    return {
        diasRestantes,
        fechaVencimiento,
        estaVencido: diasRestantes < 0,
        estaPorVencer: diasRestantes <= 2 && diasRestantes >= 0
    };
};

// Función para determinar el estado de notificación
const determinarEstadoNotificacion = (registro) => {
    // Si tiene fecha de vencimiento personalizada (extensión)
    let fechaVencimiento;
    if (registro.fechaVencimiento) {
        fechaVencimiento = new Date(registro.fechaVencimiento);
    } else {
        // Usar fecha de registro + 7 días
        const fechaCreacion = new Date(registro.timestamp || registro.fechaRegistro);
        fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
    }
    
    const hoy = new Date();
    const diferencia = fechaVencimiento - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    let tipoNotificacion = 'normal';
    let mensaje = '';
    
    if (diasRestantes < 0) {
        tipoNotificacion = 'vencido';
        mensaje = `Vencido hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) > 1 ? 's' : ''}`;
    } else if (diasRestantes === 0) {
        tipoNotificacion = 'vence-hoy';
        mensaje = 'Vence hoy';
    } else if (diasRestantes <= 2) {
        tipoNotificacion = 'por-vencer';
        mensaje = `${diasRestantes} día${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''}`;
    } else {
        mensaje = `${diasRestantes} días restantes`;
    }
    
    return {
        diasRestantes,
        fechaVencimiento: fechaVencimiento.toISOString(),
        fechaVencimientoLocal: fechaVencimiento.toLocaleDateString('es-AR'),
        tipoNotificacion,
        mensaje,
        puedeReiniciarAlarma: tipoNotificacion === 'vencido' || tipoNotificacion === 'por-vencer',
        alarmaReiniciada: registro.alarmaReiniciada || false,
        extensionesAnteriores: registro.historialExtensiones?.length || 0
    };
};

// Función para generar mensaje de extensión
const generarMensajeExtension = (dias, motivo) => {
    return `Extensión de ${dias} día${dias > 1 ? 's' : ''} otorgada. Motivo: ${motivo}`;
};

module.exports = {
    calcularDiasRestantes,
    determinarEstadoNotificacion,
    generarMensajeExtension
};