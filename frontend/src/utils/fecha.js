/**
 * Formatea una fecha a formato dd/mm/yyyy o retorna 'No disponible' si es inválida.
 * @param {string|Date} fecha
 * @returns {string}
 */
export function formatearFecha(fecha) {
    if (!fecha || fecha === 'No disponible') return 'No disponible';
    try {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return 'No disponible';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return 'No disponible';
    }
}