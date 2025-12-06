import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Hook personalizado para obtener y procesar datos de registro web desde parámetros URL
 * @param {string} modalidad - Modalidad por defecto
 */
export const useRegistroWebData = (modalidad) => {
    const [searchParams] = useSearchParams();
    
    return useMemo(() => {
        const completarWebParam = searchParams.get('completarWeb');
        const datosWebParam = searchParams.get('datosWeb');
        
        if (!completarWebParam) return { completarWebParam: null, datosRegistroWeb: null };
        
        let datosRegistroWeb = null;
        
        // Intentar obtener datos completos del parámetro datosWeb
        if (datosWebParam) {
            try {
                const datosCompletos = JSON.parse(decodeURIComponent(datosWebParam));
                datosRegistroWeb = datosCompletos;
                console.log('🌐 [useRegistroWebData] Datos completos del registro web:', datosRegistroWeb);
            } catch (error) {
                console.error('🌐 [useRegistroWebData] Error al parsear datosWeb:', error);
            }
        }
        
        // Fallback: construir datos desde parámetros individuales (compatibilidad)
        if (!datosRegistroWeb) {
            datosRegistroWeb = {
                datos: {
                    dni: searchParams.get('dni') || '',
                    nombre: searchParams.get('nombre') || '',
                    apellido: searchParams.get('apellido') || '',
                    email: searchParams.get('email') || '',
                    telefono: searchParams.get('telefono') || '',
                    fechaNacimiento: searchParams.get('fechaNacimiento') || '',
                    calle: searchParams.get('calle') || '',
                    numero: searchParams.get('numero') || '',
                    localidad: searchParams.get('localidad') || '',
                    codigoPostal: searchParams.get('codigoPostal') || '',
                    provincia: searchParams.get('provincia') || '',
                    modalidad: searchParams.get('modalidad') || modalidad || ''
                },
                archivos: {}
            };
        }
        
        return { completarWebParam, datosRegistroWeb };
    }, [searchParams, modalidad]);
};