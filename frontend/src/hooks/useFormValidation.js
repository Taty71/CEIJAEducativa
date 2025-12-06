import { useMemo } from 'react';
import { formularioInscripcionSchema } from '../validaciones/ValidacionSchemaYup.jsx';

/**
 * Hook personalizado para manejo de validaciones del formulario
 * @param {Object} values - Valores del formulario
 */
export const useFormValidation = (values) => {
    
    // Campos obligatorios base (utilizados para UX rápida)
    // Incluimos 'sexo' condicionalmente cuando tipoDocumento === 'DNI'
    const tipoDocumento = values ? values.tipoDocumento : undefined;
    const camposObligatorios = useMemo(() => {
        const base = ['nombre', 'apellido', 'dni', 'cuil', 'fechaNacimiento', 
            'calle', 'numero', 'barrio', 'localidad', 'provincia', 
            'email', 'telefono'];
        if (tipoDocumento === 'DNI') {
            return [...base, 'sexo'];
        }
        return base;
    }, [tipoDocumento]);

    // Validar campos obligatorios (simple check de presencia)
    const validateRequiredFields = useMemo(() => {
        return camposObligatorios.filter((campo) => values[campo] === undefined || values[campo] === null || values[campo] === '');
    }, [values, camposObligatorios]);

    // Usar Yup (formularioInscripcionSchema) como fuente única de validación
    const validationErrors = useMemo(() => {
        try {
            // validateSync lanzará si hay errores; abortEarly:false para obtener todos
            formularioInscripcionSchema.validateSync(values, { abortEarly: false });
            return {};
        } catch (err) {
            const errors = {};
            if (err && err.inner && err.inner.length) {
                err.inner.forEach(e => {
                    if (e.path && !errors[e.path]) {
                        errors[e.path] = e.message;
                    }
                });
            } else if (err && err.path) {
                errors[err.path] = err.message;
            }
            return errors;
        }
    }, [values]);

    // Estado general de validación: no hay errores de Yup y no faltan campos básicos
    const isFormValid = useMemo(() => {
        return Object.keys(validationErrors).length === 0 && validateRequiredFields.length === 0;
    }, [validationErrors, validateRequiredFields.length]);

    return {
        validateRequiredFields,
        validationErrors,
        isFormValid,
        camposObligatorios
    };
};