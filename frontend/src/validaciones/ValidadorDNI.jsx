// src/components/ValidadorDni.jsx
import { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import serviceDatos from '../services/serviceDatos';

const ValidadorDni = () => {
    const { values, setFieldError } = useFormikContext();
    const [checkingDni, setCheckingDni] = useState(false);

    useEffect(() => {
        let cancelado = false;
        const validarDni = async () => {
            if (
                values.tipoDocumento === 'DNI' &&
                values.dni &&
                values.dni.toString().length === 8 &&
                !checkingDni
            ) {
                setCheckingDni(true);
                try {
                    const modalidadId = values.modalidadId || values.modalidad_id || values.modalidad;
                    const res = await serviceDatos.getEstudianteCompletoByDni(values.dni, modalidadId);
                    
                    if (!cancelado) {
                        if (res.error) {
                            // Si hay error, probablemente significa que el DNI no existe (disponible)
                            setFieldError('dni', undefined);
                        } else if (res.estudiante && res.estudiante.id) {
                            // Si se encuentra el estudiante, el DNI ya está registrado
                            setFieldError('dni', `El DNI ya está registrado para: ${res.estudiante.nombre} ${res.estudiante.apellido}`);
                        } else {
                            // Caso no esperado
                            setFieldError('dni', undefined);
                        }
                    }
                } catch (e) {
                    // Solo mostrar error de verificación para errores reales de servidor
                    setFieldError('dni', 'Error al verificar el DNI.');
                    console.error('Error al verificar el DNI:', e);
                } finally {
                    if (!cancelado) setCheckingDni(false);
                }
            }
        };

        validarDni();
        return () => {
        cancelado = true; // Previene actualizaciones de estado si se desmonta
    };
    }, [
        values.dni,
        values.tipoDocumento,
        values.modalidadId,
        values.modalidad_id,
        values.modalidad,
        setFieldError,
        checkingDni
    ]);

    return null; // No renderiza nada visible, solo actúa en segundo plano
};

export default ValidadorDni;
