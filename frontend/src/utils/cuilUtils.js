/**
 * Calcula el dígito verificador para un CUIT/CUIL.
 * @param {string|number} prefijo - Prefijo del CUIT/CUIL (20, 23, 27, 30, etc.)
 * @param {string|number} dni - Número de documento (DNI)
 * @returns {number|null} El dígito verificador calculado (0-9) o null si el cálculo falla o los datos son inválidos.
 */
export const calcularDigitoVerificador = (prefijo, dni) => {
    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const pref = String(prefijo).padStart(2, '0');
    const d = String(dni).padStart(8, '0');
    const cuilSinDigito = pref + d; // 10 caracteres

    // Verificar que sean solo números y longitud correcta
    if (cuilSinDigito.length !== 10 || !/^\d{10}$/.test(cuilSinDigito)) {
        return null;
    }

    let suma = 0;
    for (let i = 0; i < 10; i++) {
        suma += parseInt(cuilSinDigito[i], 10) * multiplicadores[i];
    }

    const resto = suma % 11;
    let digito = 11 - resto;

    if (digito === 11) digito = 0;
    else if (digito === 10) digito = 9;

    return digito;
};

/**
 * Genera un CUIL completo basado en el DNI y el sexo.
 * @param {string|number} dni - Número de documento.
 * @param {string} sexo - Sexo/Género ('Masculino', 'Femenino', 'Empresa', 'Otro' o variaciones).
 * @returns {string|null} El CUIL formateado (XX-XXXXXXXX-X) o null si no se puede generar.
 */
export const generarCuil = (dni, sexo) => {
    if (!dni) return null;

    // Normalizar DNI
    const dniStr = String(dni).replace(/\D/g, '').padStart(8, '0');
    if (dniStr.length !== 8) return null; // Solo validamos DNI de 8 dígitos para simplificar, ajustar si es necesario

    // Determinar prefijo
    let prefijo = '20'; // Default Masculino / Otros
    const sexoNorm = String(sexo || '').toLowerCase().trim();

    if (['femenino', 'female', 'mujer', 'f'].includes(sexoNorm)) {
        prefijo = '27';
    } else if (['empresa', 'juridica', 'empresa_o_cuit'].includes(sexoNorm)) {
        prefijo = '30'; // Usualmente empresas son 30, aunque 23 también existe para personas físicas/jurídicas mixtas. 
        // El código original usaba 23 para 'Empresa', mantendremos consistencia si es necesario, 
        // pero '30' es lo estándar para empresas jurídicas puras. 
        // REVISIÓN: El código en DatosPersonales.jsx usaba '23' para 'empresa'.
        // Mantendremos '23' para consistencia con DatosPersonales.jsx si ese es el criterio del negocio,
        // o '30' si es "Persona Jurídica".
        // Dado que dice 'Empresa', suele ser 30, pero '23' puede ser hombres/mujeres con problemas de homonimia o monotributistas específicos.
        // Usaremos el mismo criterio que DatosPersonales.jsx por seguridad:
        // prefijo = '23'; 
    }

    // CONSISTENCIA CON DatosPersonales.jsx:
    // } else if (sexoVal === 'empresa' || sexoVal === 'juridica' || sexoVal === 'empresa_o_cuit') {
    //      prefijo = '23';
    // }
    if (['empresa', 'juridica', 'empresa_o_cuit'].includes(sexoNorm)) {
        prefijo = '23';
    }

    // Calcular dígito
    const digito = calcularDigitoVerificador(prefijo, dniStr);

    if (digito === null) return null;

    return `${prefijo}-${dniStr}-${digito}`;
};
