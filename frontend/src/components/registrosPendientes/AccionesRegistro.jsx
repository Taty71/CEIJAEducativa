import PropTypes from 'prop-types';

const AccionesRegistro = ({ 
    registro, 
    info, 
    enviandoEmail, 
    onCompletar, 
    onEliminar, 
    onEnviarEmail,
    onReiniciarAlarma 
}) => {
    // Log eliminado para evitar spam en console

    // Si el registro está procesado, mostrar mensaje y solo botón de eliminar desactivado
    if (info.esProcesado) {
        return (
            <div className="registro-acciones">
                <span className="badge-unificado" style={{ marginRight: '10px' }}>
                    ✅ Registro Procesado y Completa - Documentación guardada en BD
                </span>
                <button
                    onClick={() => onEliminar(registro)}
                    className="btn-eliminar-unificado"
                    title="Eliminar este registro del listado de pendientes (ya está registrado y Completa en la base de datos)"
                    disabled={enviandoEmail}
                >
                    🗑️ Eliminar del Listado
                </button>
            </div>
        );
    }
    // Resto de acciones para registros NO procesados
    return (
        <div className="registro-acciones" style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '15px', 
            padding: '15px 10px 10px 10px',
            borderTop: '2px solid #2d4177',
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: '#f8f9fd',
            borderRadius: '0 0 8px 8px',
            minHeight: '50px',
            zIndex: 999,
            position: 'relative'
        }}>
            <div style={{ fontSize: '10px', color: 'var(--color-mid)', marginRight: '10px' }}>
                🔧 Botones de acción:
            </div>
            {/* Botón para completar/editar registro */}
            {!info.vencido && (
                <button
                    onClick={() => onCompletar(registro)}
                    className="btn-unificado"
                    title="Abrir formulario para completar la documentación y editar datos"
                    disabled={enviandoEmail}
                >
                    📝 Completar
                </button>
            )}
            {/* Botón para enviar email individual */}
            {(registro.datos?.email || registro.email) && (
                <button
                    onClick={() => onEnviarEmail(registro)}
                    className="btn-unificado"
                    disabled={enviandoEmail}
                    title={`Enviar notificación por email a ${registro.datos?.email || registro.email}`}
                    aria-disabled={enviandoEmail}
                >
                    {enviandoEmail ? '📧 Enviando...' : `📧 ${info.vencido ? 'Vencido' : 'Notificar'}`}
                </button>
            )}
            {/* Botón para reiniciar alarma - solo si está vencido o próximo a vencer Y puede reiniciar */}
            {(info.vencido || info.diasRestantes <= 3) && (
                <button
                    onClick={() => onReiniciarAlarma(registro)}
                    className="btn-unificado"
                    disabled={enviandoEmail}
                    title="Extender plazo de entrega por 7 días adicionales"
                    aria-disabled={enviandoEmail}
                >
                    ⏰ Reiniciar Alarma
                </button>
            )}
            {/* Botón para eliminar registro */}
            <button
                onClick={() => onEliminar(registro)}
                className="btn-eliminar-unificado"
                title="Eliminar este registro del listado de pendientes (usar después de que el estudiante esté registrado y Completa)"
                disabled={enviandoEmail}
            >
                🗑️ Eliminar del Listado
            </button>
        </div>
    );
};

AccionesRegistro.propTypes = {
    registro: PropTypes.object.isRequired,
    info: PropTypes.object.isRequired,
    enviandoEmail: PropTypes.bool.isRequired,
    onCompletar: PropTypes.func.isRequired,
    onEliminar: PropTypes.func.isRequired,
    onEnviarEmail: PropTypes.func.isRequired,
    onReiniciarAlarma: PropTypes.func.isRequired
};

export default AccionesRegistro;