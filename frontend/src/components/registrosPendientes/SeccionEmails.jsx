import PropTypes from 'prop-types';

const SeccionEmails = ({ 
    enviandoEmail, 
    onEnviarUrgentes, 
    onEnviarTodos 
}) => {
    return (
        <div className="seccion-emails">
            <h4>📧 Notificaciones por Email</h4>
            <div className="botones-emails">
                <button 
                    onClick={onEnviarUrgentes}
                    className="boton-pendiente"
                    disabled={enviandoEmail}
                    title="Enviar emails solo a registros urgentes (próximos a vencer)"
                >
                    {enviandoEmail ? '⚡ Enviando...' : '⚡ Urgentes'}
                </button>
                <button 
                    onClick={onEnviarTodos}
                    className="boton-pendiente"
                    disabled={enviandoEmail}
                    title="Enviar email a todos los estudiantes con registros pendientes"
                >
                    {enviandoEmail ? '📧 Enviando...' : '📧 Todos'}
                </button>
            </div>
            <p className="info-emails">
                📧 <strong>Notificar:</strong> Email individual con documentos presentados/faltantes y días restantes<br/>
                ⚡ <strong>Urgentes:</strong> Solo estudiantes con ≤3 días para completar<br/>
                📬 <strong>Todos:</strong> Notificar a todos los estudiantes pendientes
            </p>
        </div>
    );
};

SeccionEmails.propTypes = {
    enviandoEmail: PropTypes.bool.isRequired,
    onEnviarUrgentes: PropTypes.func.isRequired,
    onEnviarTodos: PropTypes.func.isRequired
};

export default SeccionEmails;