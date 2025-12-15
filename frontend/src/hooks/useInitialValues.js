import { useMemo } from 'react';
import { verificarRegistroPendiente } from '../utils/registroSinDocumentacion';

/**
 * Hook personalizado para generar valores iniciales del formulario
 * @param {string} modalidad - Modalidad seleccionada
 * @param {string} completarRegistro - DNI del registro pendiente a completar
 * @param {object} datosRegistroWeb - Datos del registro web a completar
 * @param {object} datosRegistroPendiente - Datos del registro pendiente desde URL
 * @param {string} completarRegistroWeb - ID del registro web a completar
 */
export const useInitialValues = (modalidad, completarRegistro, datosRegistroWeb, datosRegistroPendiente, completarRegistroWeb) => {
    // Buscar datos en sessionStorage SOLO si estamos completando un registro
    let datosSessionStorage = null;
    const esCompletarRegistro = !!(completarRegistro || completarRegistroWeb || datosRegistroPendiente || datosRegistroWeb);

    if (esCompletarRegistro) {
        try {
            // Priorizar datos de registro web si están disponibles
            const datosWebString = sessionStorage.getItem('datosRegistroWeb');
            const datosPendienteString = sessionStorage.getItem('datosRegistroPendiente');

            if (datosWebString) {
                datosSessionStorage = JSON.parse(datosWebString);
                console.log('📋 Datos de registro web encontrados en sessionStorage:', datosSessionStorage);
            } else if (datosPendienteString) {
                datosSessionStorage = JSON.parse(datosPendienteString);
                console.log('📋 Datos de registro pendiente encontrados en sessionStorage:', datosSessionStorage);
            }

            // NO eliminar sessionStorage aquí para permitir múltiples renderizaciones
            // Los datos se eliminarán cuando se complete el registro o se cierre la página
        } catch (error) {
            console.error('Error al parsear datos de sessionStorage:', error);
        }
    } else {
        // Si NO estamos completando registro, LIMPIAR sessionStorage
        console.log('🧹 Limpiando sessionStorage para nuevo registro');
        sessionStorage.removeItem('datosRegistroWeb');
        sessionStorage.removeItem('datosRegistroPendiente');
    }

    // Determinar qué datos usar - priorizar URL > sessionStorage > localStorage
    const registroPendiente = esCompletarRegistro ? (
        datosRegistroPendiente?.datos || datosRegistroWeb?.datos || datosSessionStorage ||
        (completarRegistro ? verificarRegistroPendiente(completarRegistro) : null) ||
        (completarRegistroWeb ? null : null) // Para registro web, los datos vienen de sessionStorage
    ) : null;

    return useMemo(() => {
        const baseValues = {
            nombre: '',
            apellido: '',
            tipoDocumento: 'DNI',
            dni: '',
            paisEmision: '',
            cuil: '',
            fechaNacimiento: '',
            calle: '',
            numero: '',
            barrio: '',
            localidad: '',
            provincia: '',
            email: '',
            telefono: '',
            modalidad: modalidad || '',
            modalidadId: modalidad === 'Presencial' ? 1 : modalidad === 'Semipresencial' ? 2 : 1,
            planAnio: '',
            modulos: '',
            idModulo: '',
            idEstadoInscripcion: 1,
            idDivision: null, // Campo para la división
            // Campos de documentación (archivos)
            archivo_dni: null,
            archivo_cuil: null,
            archivo_partidaNacimiento: null,
            archivo_fichaMedica: null,
            archivo_solicitudPase: null,
            archivo_analiticoParcial: null,
            archivo_certificadoNivelPrimario: null,
            foto: null,
        };

        // Si hay registro pendiente, pre-llenar campos
        if (registroPendiente) {
            console.log('📝 Pre-llenando formulario con registro pendiente:', registroPendiente);
            console.log('🏠 Datos de domicilio desde registro:', {
                calle: registroPendiente.calle,
                numero: registroPendiente.numero,
                provincia: registroPendiente.provincia,
                localidad: registroPendiente.localidad,
                barrio: registroPendiente.barrio
            });
            console.log('🎓 Datos académicos desde registro:', {
                modalidad: registroPendiente.modalidad,
                modalidadId: registroPendiente.modalidadId,
                modalidadIdParsed: parseInt(registroPendiente.modalidadId),
                planAnio: registroPendiente.planAnio,
                planAnioParsed: parseInt(registroPendiente.planAnio),
                modulos: registroPendiente.modulos,
                idModulo: registroPendiente.idModulo,
                idModuloArray: Array.isArray(registroPendiente.idModulo) ? registroPendiente.idModulo : 'No es array'
            });
            if (datosRegistroPendiente) {
                console.log('🌐 Datos desde URL de registro pendiente:', datosRegistroPendiente);
            }
            return {
                ...baseValues,
                nombre: registroPendiente.nombre || '',
                apellido: registroPendiente.apellido || '',
                dni: registroPendiente.dni || '',
                tipoDocumento: registroPendiente.tipoDocumento || 'DNI',
                cuil: registroPendiente.cuil || '',
                fechaNacimiento: registroPendiente.fechaNacimiento || '',
                paisEmision: registroPendiente.paisEmision || 'Argentina',
                calle: registroPendiente.calle || '',
                numero: registroPendiente.numero || '',
                barrio: registroPendiente.barrio || '',
                localidad: registroPendiente.localidad || '',
                provincia: registroPendiente.provincia || '',
                email: registroPendiente.email || '',
                telefono: registroPendiente.telefono || '',
                modalidad: registroPendiente.modalidad || modalidad || '',
                modalidadId: parseInt(registroPendiente.modalidadId) || (modalidad === 'Presencial' ? 1 : modalidad === 'Semipresencial' ? 2 : 1),
                planAnio: parseInt(registroPendiente.planAnio) || registroPendiente.planAnio || '',
                modulos: registroPendiente.modulos || '',
                idModulo: registroPendiente.idModulo || '',
            };
        }        // Si hay datos de registro web, pre-llenar campos
        if (datosRegistroWeb) {
            console.log('📝 Pre-llenando formulario con registro web:', datosRegistroWeb);
            return {
                ...baseValues,
                nombre: datosRegistroWeb.nombre || '',
                apellido: datosRegistroWeb.apellido || '',
                dni: datosRegistroWeb.dni || '',
                cuil: '', // Los registros web no tienen CUIL inicialmente
                fechaNacimiento: datosRegistroWeb.fechaNacimiento || '',
                calle: datosRegistroWeb.calle || '',
                numero: datosRegistroWeb.numero || '',
                barrio: '', // Los registros web no tienen barrio inicialmente
                localidad: datosRegistroWeb.localidad || '',
                provincia: datosRegistroWeb.provincia || '',
                email: datosRegistroWeb.email || '',
                telefono: datosRegistroWeb.telefono || '',
                modalidad: datosRegistroWeb.modalidad || modalidad || '',
                modalidadId: (datosRegistroWeb.modalidad === 'Presencial' ? 1 : datosRegistroWeb.modalidad === 'Semipresencial' ? 2 : 1),
                planAnio: '',
                modulos: '',
                idModulo: '',
            };
        }

        return baseValues;
    }, [modalidad, registroPendiente, datosRegistroWeb, datosRegistroPendiente]);
};