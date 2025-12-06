import PropTypes from 'prop-types';
import { useState } from 'react';

const ResumenDatosPreCargados = ({ values, tipo = 'pendiente' }) => {
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    
    // Mapeo de campos técnicos a nombres legibles
    const mapeoNombres = {
        nombre: 'Nombre',
        apellido: 'Apellido',
        tipoDocumento: 'Tipo de Documento',
        dni: 'DNI',
        paisEmision: 'País de Emisión',
        cuil: 'CUIL',
        fechaNacimiento: 'Fecha de Nacimiento',
        calle: 'Calle',
        numero: 'Número',
        barrio: 'Barrio',
        localidad: 'Localidad',
        codigoPostal: 'Código Postal',
        provincia: 'Provincia',
        email: 'Email',
        telefono: 'Teléfono',
        modalidad: 'Modalidad',
        planAnio: 'Plan de Año',
        modulos: 'Módulos',
    };

    // Obtener campos que tienen datos pre-cargados
    const camposPreCargados = Object.keys(values).filter(key => {
        const valor = values[key];
        return valor && 
               valor !== '' && 
               valor !== null && 
               valor !== undefined &&
               !key.startsWith('archivo_') && // Excluir archivos
               key !== 'modalidadId' && // Excluir IDs internos
               key !== 'idModulo' &&
               key !== 'idEstadoInscripcion' &&
               mapeoNombres[key]; // Solo incluir campos mapeados
    });

    const tipoTexto = tipo === 'pendiente' ? 'Registro Pendiente' : 'Registro Web';
    const iconoTipo = tipo === 'pendiente' ? '⏳' : '🌐';

    if (camposPreCargados.length === 0) {
        return null; // No mostrar si no hay campos pre-cargados
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
            border: '1px solid #3f51b5',
            borderRadius: '8px',
            padding: '15px',
            margin: '10px 0',
            fontSize: '0.9rem'
        }}>
            <div 
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
                onClick={() => setMostrarDetalle(!mostrarDetalle)}
            >
                <div>
                    <strong style={{ color: '#3f51b5' }}>
                        {iconoTipo} Datos cargados desde {tipoTexto}
                    </strong>
                    <span style={{ color: '#666', marginLeft: '10px' }}>
                        ({camposPreCargados.length} campos disponibles)
                    </span>
                </div>
                <button 
                    type="button"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#3f51b5',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '5px'
                    }}
                >
                    {mostrarDetalle ? '👆 Ocultar' : '👇 Ver detalle'}
                </button>
            </div>

            {mostrarDetalle && (
                <>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                    <p style={{ 
                        color: '#1976d2', 
                        margin: '0 0 10px 0', 
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                    }}>
                        ✏️ Todos estos campos son editables - puede hacer correcciones antes de enviar
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '8px',
                        marginTop: '10px'
                    }}>
                        {camposPreCargados.map(campo => (
                            <div 
                                key={campo}
                                style={{
                                    background: '#fff',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: '#333' }}>
                                    {mapeoNombres[campo]}:
                                </div>
                                <div style={{ color: '#666', marginTop: '2px' }}>
                                    {String(values[campo]).length > 30 
                                        ? String(values[campo]).substring(0, 30) + '...'
                                        : String(values[campo])
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '4px',
                        border: '1px solid #ffb74d'
                    }}>
                        <strong style={{ color: '#f57c00', fontSize: '0.8rem' }}>
                            💡 Importante:
                        </strong>
                        <ul style={{ 
                            margin: '5px 0 0 0', 
                            paddingLeft: '20px', 
                            fontSize: '0.8rem',
                            color: '#e65100'
                        }}>
                            <li>Revise todos los datos antes de continuar</li>
                            <li>Puede editar cualquier campo para hacer correcciones</li>
                            <li>Complete la documentación faltante para finalizar</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

ResumenDatosPreCargados.propTypes = {
    values: PropTypes.object.isRequired,
    tipo: PropTypes.oneOf(['pendiente', 'web']).isRequired,
};

export default ResumenDatosPreCargados;