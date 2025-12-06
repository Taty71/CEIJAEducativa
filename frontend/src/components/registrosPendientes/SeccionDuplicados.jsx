import PropTypes from 'prop-types';
import '../../estilos/botones.css';

const SeccionDuplicados = ({ 
    estadoDuplicados, 
    limpiandoDuplicados,
    onVerificarDuplicados, 
    onLimpiarDuplicados, 
    onTestSistema7Dias,
    onCerrarEstadoDuplicados
}) => {
    return (
        <>
            {/* Botones para gestión de duplicados */}
            <div className="botones-duplicados" style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #e0e0e0'
            }}>
                <button 
                    onClick={onVerificarDuplicados}
                    className="boton-pendiente"
                    disabled={limpiandoDuplicados}
                    title="Verificar si existen registros duplicados para el mismo DNI"
                >
                    <span role="img" aria-label="Buscar">🔍</span> Verificar Duplicados
                </button>
                <button
                    onClick={onLimpiarDuplicados}
                    className="boton-pendiente"
                    disabled={limpiandoDuplicados || !(estadoDuplicados && estadoDuplicados.cantidadDuplicados > 0)}
                    title={`Encontrados ${estadoDuplicados && estadoDuplicados.cantidadDuplicados ? estadoDuplicados.cantidadDuplicados : 0} DNI(s) duplicados - Click para limpiar`}
                >
                    {limpiandoDuplicados
                        ? '⏳ Limpiando...'
                        : `🧹 Limpiar ${estadoDuplicados && estadoDuplicados.cantidadDuplicados ? estadoDuplicados.cantidadDuplicados : 0} Duplicado(s)`}
                </button>
                <button
                    onClick={onTestSistema7Dias}
                    className="boton-pendiente"
                    disabled={limpiandoDuplicados}
                    title="Probar funcionamiento del sistema de vencimiento de 7 días"
                >
                    <span role="img" aria-label="Test">🧪</span> Test 7 Días
                </button>
            </div>
            {/* Información de estado de duplicados */}
            {estadoDuplicados && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: '#f7f8fb',
                    border: `1px solid rgba(45,65,119,0.08)`,
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    position: 'relative',
                    color: 'var(--color-dark)'
                }}>
                    📊 <strong>Estado:</strong> {estadoDuplicados.totalRegistros} registros totales, {estadoDuplicados.dnisUnicos} DNI únicos
                    {estadoDuplicados.cantidadDuplicados > 0 && (
                        <div style={{ marginTop: '5px', color: 'var(--color-mid)' }}>
                            ⚠️ {estadoDuplicados.cantidadDuplicados} DNI(s) tienen registros duplicados
                        </div>
                    )}
                    <button
                        onClick={onCerrarEstadoDuplicados}
                        className="boton-cancelar-pill"
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            padding: '4px 8px',
                            fontSize: '0.8rem'
                        }}
                        title="Cerrar estado de duplicados"
                    >
                        ✖
                    </button>
                </div>
            )}
        </>
    );
};

SeccionDuplicados.propTypes = {
    estadoDuplicados: PropTypes.object,
    limpiandoDuplicados: PropTypes.bool.isRequired,
    onVerificarDuplicados: PropTypes.func.isRequired,
    onLimpiarDuplicados: PropTypes.func.isRequired,
    onTestSistema7Dias: PropTypes.func.isRequired,
    onCerrarEstadoDuplicados: PropTypes.func.isRequired
};

export default SeccionDuplicados;