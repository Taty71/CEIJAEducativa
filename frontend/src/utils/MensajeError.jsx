
const FormatError = (error) => {
    // Si el error tiene una clave "mensaje" o "message", retorna ese mensaje
    if (error?.mensaje) {
        return error.mensaje;
    }
    if (error?.message) {
        return error.message;
    }
    // Si no hay respuesta del servidor
    if (!error?.response) {
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    
    // Retorna el mensaje de error del backend si existe (soporta message o mensaje)
    const data = error.response.data;
    

    
    if (data?.message) return data.message;
    if (data?.mensaje) return data.mensaje;
    
    // Para errores 404, intentar extraer mensaje más específico
    if (error.response.status === 404 && data) {
        // Si data es un string, devolverlo directamente
        if (typeof data === 'string') return data;
        // Si data tiene alguna propiedad que pueda ser el mensaje
        if (data.error) return data.error;
        if (data.msg) return data.msg;
    }
    
    return 'Ocurrió un error inesperado.';
};

export default FormatError;

