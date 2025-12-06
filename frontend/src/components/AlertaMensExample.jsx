import { useState } from 'react';
import AlertaMens from './AlertaMens';
import { useAlerts } from '../hooks/useAlerts';

/**
 * Componente de ejemplo que muestra cómo usar AlertaMens unificado
 * Demuestra todos los modos disponibles: simple, floating y modal
 */
const AlertaMensExample = () => {
    // Usar el hook personalizado para alertas
    const {
        alerts,
        modal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        hideLoading,
        showConfirmModal,
        closeModal,
        removeAlert
    } = useAlerts();

    const [simpleAlert, setSimpleAlert] = useState(null);

    // Función para alerta simple
    const showSimpleAlert = (variant, text) => {
        setSimpleAlert({ variant, text });
    };

    // Función para mostrar loading y después completada
    const handleAsyncOperation = async () => {
        showLoading('Procesando operación...');
        
        // Simular operación async
        setTimeout(() => {
            hideLoading();
            showSuccess('🎉 Operación completada');
        }, 3000);
    };

    // Función para confirmar acción
    const handleConfirmAction = () => {
        showConfirmModal(
            '¿Está seguro de eliminar este elemento? Esta acción no se puede deshacer.',
            () => {
                showSuccess('Elemento eliminado correctamente');
            },
            () => {
                showInfo('Acción cancelada por el usuario');
            }
        );
    };

    return (
        <div className="alert-example" style={{ padding: '20px' }}>
            <h2>🚨 Ejemplos de AlertaMens Unificado</h2>
            
            {/* Botones para alertas simples (legacy) */}
            <div style={{ marginBottom: '20px' }}>
                <h3>1. Alertas Simples (Centradas)</h3>
                <button onClick={() => showSimpleAlert('info', 'Información importante')}>
                    Info Simple
                </button>
                <button onClick={() => showSimpleAlert('success', '🎉 Operación completada')}>
                    Operación Exitosa Simple
                </button>
                <button onClick={() => showSimpleAlert('error', 'Error en la operación')}>
                    Error Simple
                </button>
                <button onClick={() => showSimpleAlert('warning', 'Advertencia: Revisa los datos')}>
                    Advertencia Simple
                </button>
            </div>

            {/* Botones para alertas flotantes */}
            <div style={{ marginBottom: '20px' }}>
                <h3>2. Alertas Flotantes (Esquina superior derecha)</h3>
                <button onClick={() => showInfo('Nueva información disponible')}>
                    Info Flotante
                </button>
                <button onClick={() => showSuccess('Registro guardado correctamente')}>
                    Operación Exitosa Flotante
                </button>
                <button onClick={() => showError('Error al conectar con el servidor')}>
                    Error Flotante
                </button>
                <button onClick={() => showWarning('Campos requeridos faltantes')}>
                    Advertencia Flotante
                </button>
                <button onClick={handleAsyncOperation}>
                    Operación Async (Loading → Completada)
                </button>
            </div>

            {/* Botones para modal */}
            <div style={{ marginBottom: '20px' }}>
                <h3>3. Modal de Confirmación</h3>
                <button onClick={handleConfirmAction}>
                    Modal de Confirmación
                </button>
            </div>

            {/* Renderizar AlertaMens según el modo */}
            
            {/* Alerta Simple */}
            {simpleAlert && (
                <AlertaMens
                    mode="simple"
                    text={simpleAlert.text}
                    variant={simpleAlert.variant}
                    duration={3000}
                    onClose={() => setSimpleAlert(null)}
                />
            )}

            {/* Alertas Flotantes y Modal */}
            <AlertaMens
                mode="floating"
                alerts={alerts}
                modal={modal}
                onCloseAlert={removeAlert}
                onCloseModal={closeModal}
            />

            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4>📚 Cómo usar el sistema unificado:</h4>
                <pre style={{ fontSize: '14px', overflow: 'auto' }}>
{`// 1. Usando el hook useAlerts (Recomendado)
import { useAlerts } from '../hooks/useAlerts';

const MiComponente = () => {
    const { 
        alerts, modal, 
        showSuccess, showError, showWarning, showInfo,
        showConfirmModal, removeAlert, closeModal
    } = useAlerts();

    const handleOperation = () => {
        showSuccess('🎉 Operación completada');
    };

    const handleDelete = () => {
        showConfirmModal(
            '¿Confirmar eliminación?',
            () => showSuccess('Eliminado'),
            () => showInfo('Cancelado')
        );
    };

    return (
        <>
            <button onClick={handleOperation}>Realizar operación</button>
            <button onClick={handleDelete}>Eliminar</button>
            
            {/* Renderizar alertas */}
            <AlertaMens
                mode="floating"
                alerts={alerts}
                modal={modal}
                onCloseAlert={removeAlert}
                onCloseModal={closeModal}
            />
        </>
    );
};

// 2. Alerta Simple (legacy - retrocompatible)
<AlertaMens 
    text="Mi mensaje" 
    variant="success" 
    duration={3000}
    onClose={() => console.log('Cerrado')}
/>

// 3. Modo Manual (sin hook)
<AlertaMens
    mode="floating"
    alerts={[
        { type: 'success', message: 'Operación completada' },
        { type: 'loading', message: 'Cargando...' }
    ]}
    modal={{
        show: true,
        message: '¿Confirmar?',
        onConfirm: () => console.log('OK'),
        onCancel: () => console.log('Cancel')
    }}
    onCloseAlert={(index) => removeAlert(index)}
    onCloseModal={() => setModal(null)}
/>`}
                </pre>
            </div>

            <style>{`
                .alert-example button {
                    margin: 5px;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    background: #007bff;
                    color: white;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .alert-example button:hover {
                    background: #0056b3;
                }
            `}</style>
        </div>
    );
};

export default AlertaMensExample;