import PropTypes from 'prop-types';
import RegistroPendienteItem from './RegistroPendienteItem';

const ListaRegistrosPendientes = ({ 
    registros,
    cargandoRegistros,
    mapeoDocumentos,
    enviandoEmail,
    onCompletar,
    onEliminar,
    onEnviarEmail,
    obtenerInfoVencimiento,
    onReiniciarAlarma,
    getTipoIcon,
    formatearTipo
}) => {
    if (cargandoRegistros) {
        return (
            <div className="estado-cargando">
                <div>⏳</div>
                <div>Cargando registros pendientes...</div>
            </div>
        );
    }

    if (registros.length === 0) {
        return (
            <div className="estado-vacio">
                <div>📋</div>
                <div>No hay registros pendientes</div>
            </div>
        );
    }

    return (
        <>
            {registros.map((registro, index) => (
                <RegistroPendienteItem
                    key={registro.id || index}
                    registro={registro}
                    index={index}
                    mapeoDocumentos={mapeoDocumentos}
                    enviandoEmail={enviandoEmail}
                    onCompletar={onCompletar}
                    onEliminar={onEliminar}
                    onEnviarEmail={onEnviarEmail}
                    obtenerInfoVencimiento={obtenerInfoVencimiento}
                    onReiniciarAlarma={onReiniciarAlarma}
                    getTipoIcon={getTipoIcon}
                    formatearTipo={formatearTipo}
                />
            ))}
        </>
    );
};

ListaRegistrosPendientes.propTypes = {
    registros: PropTypes.array.isRequired,
    cargandoRegistros: PropTypes.bool.isRequired,
    mapeoDocumentos: PropTypes.object.isRequired,
    enviandoEmail: PropTypes.bool.isRequired,
    onCompletar: PropTypes.func.isRequired,
    onEliminar: PropTypes.func.isRequired,
    onEnviarEmail: PropTypes.func.isRequired,
    obtenerInfoVencimiento: PropTypes.func.isRequired,
    onReiniciarAlarma: PropTypes.func.isRequired,
    getTipoIcon: PropTypes.func.isRequired,
    formatearTipo: PropTypes.func.isRequired
};

export default ListaRegistrosPendientes;