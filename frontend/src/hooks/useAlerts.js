import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo de alertas flotantes y modales de confirmación
 */
export const useAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [modal, setModal] = useState({ show: false, message: '', onConfirm: null, onCancel: null });
    const [loading, setLoading] = useState(false);

    // Remover alerta por ID
    const removeAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    // Agregar nueva alerta flotante
    const addAlert = useCallback((type, message, duration = null) => {
        const newAlert = {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp: Date.now()
        };

        setAlerts(prev => [...prev, newAlert]);

        // Auto-remover después del tiempo especificado
        if (duration !== null) {
            setTimeout(() => {
                removeAlert(newAlert.id);
            }, duration);
        }

        return newAlert.id;
    }, [removeAlert]);

    // Limpiar todas las alertas
    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    // Mostrar alerta de éxito
    const showSuccess = useCallback((message) => {
        return addAlert('success', message || 'Operación completada exitosamente', 5000);
    }, [addAlert]);

    // Mostrar alerta de error
    const showError = useCallback((message) => {
        return addAlert('error', message || 'Ha ocurrido un error inesperado', 8000);
    }, [addAlert]);

    // Mostrar alerta de advertencia
    const showWarning = useCallback((message) => {
        return addAlert('warning', message || 'Advertencia', 6000);
    }, [addAlert]);

    // Mostrar alerta de información
    const showInfo = useCallback((message) => {
        return addAlert('info', message, 4000);
    }, [addAlert]);

    // Mostrar estado de carga
    const showLoading = useCallback((message = 'Cargando...') => {
        setLoading(true);
        return addAlert('loading', message, null); // Sin auto-remove
    }, [addAlert]);

    // Ocultar estado de carga
    const hideLoading = useCallback(() => {
        setLoading(false);
        // Remover solo las alertas de loading
        setAlerts(prev => prev.filter(alert => alert.type !== 'loading'));
    }, []);

    // Mostrar modal de confirmación
    const showConfirmModal = useCallback((message, onConfirm, onCancel = null) => {
        return new Promise((resolve) => {
            setModal({
                show: true,
                message: message || '¿Está seguro de realizar esta acción?',
                onConfirm: () => {
                    setModal({ show: false, message: '', onConfirm: null, onCancel: null });
                    if (onConfirm) onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setModal({ show: false, message: '', onConfirm: null, onCancel: null });
                    if (onCancel) onCancel();
                    resolve(false);
                }
            });
        });
    }, []);

    // Cerrar modal
    const closeModal = useCallback(() => {
        if (modal.onCancel) {
            modal.onCancel();
        }
        setModal({ show: false, message: '', onConfirm: null, onCancel: null });
    }, [modal]);

    // Confirmar acción (reemplaza window.confirm)
    const confirmAction = useCallback(async (message) => {
        return await showConfirmModal(message);
    }, [showConfirmModal]);

    // Manejar errores de validación
    const handleValidationErrors = useCallback((errors) => {
        if (Array.isArray(errors) && errors.length > 0) {
            const errorMessage = `Campos faltantes: ${errors.join(', ')}`;
            showError(errorMessage);
        } else if (typeof errors === 'object' && Object.keys(errors).length > 0) {
            const errorList = Object.entries(errors).map(([field, error]) => `${field}: ${error}`);
            const errorMessage = `Errores de validación:\n${errorList.join('\n')}`;
            showError(errorMessage);
        }
    }, [showError]);

    // Manejar respuestas de API
    const handleApiResponse = useCallback((response, successMessage = null) => {
        if (response.success) {
            showSuccess(successMessage || response.message || 'Operación exitosa');
            return true;
        } else {
            showError(response.error || response.message || 'Error en la operación');
            return false;
        }
    }, [showSuccess, showError]);

    return {
        // Estados
        alerts,
        modal,
        loading,
        
        // Funciones de alertas
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeAlert,
        clearAlerts,
        
        // Funciones de loading
        showLoading,
        hideLoading,
        
        // Funciones de modal
        showConfirmModal,
        closeModal,
        confirmAction,
        
        // Utilidades
        handleValidationErrors,
        handleApiResponse
    };
};