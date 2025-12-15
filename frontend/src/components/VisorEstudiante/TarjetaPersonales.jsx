import React from 'react';
import PropTypes from 'prop-types';
import defaultAvatar from '../../assets/logos/hoodie.png'; // Replaces missing /img/default-avatar.png
import { generarCuil } from '../../utils/cuilUtils';


const TarjetaPersonales = ({
    estudiante,
    formData,
    editMode,
    isConsulta,
    isEliminacion,
    handleInputChange,
    setEditMode,
    formatearFecha
}) => {
    // Importación de utilidad en el top-level no es posible con replace_file restringido a un bloque, 
    // pero podemos usar import dinámico o mover el require fuera si el entorno lo permite.
    // React estándar soporta imports arriba.
    // Voy a usar el require arriba si es posible, o mejor, simplemente importarlo standard.

    // ERROR: El tool replace_file_content edita un bloque. Tengo que pedir editar las líneas de arriba.
    // Esta llamada es para editar los imports.

    // Mejor estrategia: agregar el import arriba con un replace separado.

    const photoUrl = React.useMemo(() => {
        const src = formData.foto || estudiante.foto;
        if (!src || (typeof src === 'string' && src.trim() === '')) return null;

        let cleanSrc = src.replace(/\\/g, '/');
        if (!cleanSrc.startsWith('http')) {
            if (cleanSrc.startsWith('/')) cleanSrc = `http://localhost:5000${cleanSrc}`;
            else cleanSrc = `http://localhost:5000/${cleanSrc}`;
        }
        return `${cleanSrc}?t=${Date.now()}`;
    }, [formData.foto, estudiante.foto]);

    return (
        <div className="tarjeta tarjeta-personales" style={{ height: '520px', overflow: 'visible' }}>
            <div className="tarjeta-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3>Datos Personales</h3>
                    <span style={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.1em' }}>ID: {estudiante.id}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {/* FOTO DEL ESTUDIANTE ARRIBA DERECHA */}
                    <div className="foto-container" style={{ textAlign: 'right', marginBottom: 0, position: 'relative' }}>
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={`Foto de ${formData.nombre || estudiante.nombre} ${formData.apellido || estudiante.apellido}`}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover', display: 'block' }}
                                onError={(e) => {
                                    e.target.src = defaultAvatar;
                                }}
                            />
                        ) : (
                            <img
                                src={defaultAvatar}
                                alt="Foto del estudiante"
                                style={{ width: '64px', height: '64px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover', display: 'block' }}
                            />
                        )}
                    </div>
                    {/* Botón editar */}
                    {!isConsulta && !isEliminacion && (
                        <button onClick={() => setEditMode(prev => ({ ...prev, personales: true }))}>✏️</button>
                    )}
                </div>
            </div>
            <div className="tarjeta-contenido">
                <div className="dato-item">
                    <label>Apellido:</label>
                    {editMode.personales ? (
                        <input value={formData.apellido || ''} onChange={e => handleInputChange('apellido', e.target.value)} />
                    ) : (
                        <span>{estudiante.apellido}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Nombre:</label>
                    {editMode.personales ? (
                        <input value={formData.nombre || ''} onChange={e => handleInputChange('nombre', e.target.value)} />
                    ) : (
                        <span>{estudiante.nombre}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Tipo de Documento:</label>
                    {editMode.personales ? (
                        <input value={formData.tipoDocumento || ''} onChange={e => handleInputChange('tipoDocumento', e.target.value)} />
                    ) : (
                        <span>{estudiante.tipoDocumento}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Sexo / Género:</label>
                    {editMode.personales ? (
                        <select
                            value={formData.sexo || ''}
                            onChange={e => handleInputChange('sexo', e.target.value)}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        >
                            <option value="">Seleccione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Empresa">Empresa</option>
                            <option value="Otro">Otro</option>
                        </select>
                    ) : (
                        <span>{formData.sexo || estudiante.sexo || 'No especificado'}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>DNI:</label>
                    {/* DNI usually read-only in this view, keeping it as span based on original code, but ensuring we use it for calculation */}
                    <span>{estudiante.dni}</span>
                </div>
                <div className="dato-item">
                    <label>CUIL:</label>
                    {editMode.personales ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                            <input
                                value={formData.cuil || ''}
                                onChange={e => handleInputChange('cuil', e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!estudiante.dni) {
                                        alert('No hay DNI disponible para calcular el CUIL');
                                        return;
                                    }
                                    if (!formData.sexo) {
                                        alert('Debe seleccionar un sexo/género para calcular el CUIL');
                                        return;
                                    }

                                    const nuevoCuil = generarCuil(estudiante.dni, formData.sexo);

                                    if (nuevoCuil) {
                                        handleInputChange('cuil', nuevoCuil);
                                    } else {
                                        alert('No se pudo generar el CUIL. Verifique DNI y Sexo.');
                                    }
                                }}
                                title="Generar CUIL automáticamente"
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                🪄
                            </button>
                        </div>
                    ) : (
                        <span>{estudiante.cuil}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Email:</label>
                    {editMode.personales ? (
                        <input value={formData.email || ''} type="email" onChange={e => handleInputChange('email', e.target.value)} />
                    ) : (
                        <span>{estudiante.email}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Teléfono:</label>
                    {editMode.personales ? (
                        <input value={formData.telefono || ''} type="tel" onChange={e => handleInputChange('telefono', e.target.value)} />
                    ) : (
                        <span>{estudiante.telefono || 'No registrado'}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Fecha de Nacimiento:</label>
                    {editMode.personales ? (
                        <input
                            type="date"
                            value={formData.fechaNacimiento || ''}
                            onChange={e => handleInputChange('fechaNacimiento', e.target.value)}
                        />
                    ) : (
                        <span>{formatearFecha(estudiante.fechaNacimiento)}</span>
                    )}
                </div>

                <div className="dato-item">
                    <label>País de Emisión:</label>
                    {editMode.personales ? (
                        <input value={formData.paisEmision || ''} onChange={e => handleInputChange('paisEmision', e.target.value)} />
                    ) : (
                        <span>{estudiante.paisEmision}</span>
                    )}
                </div>
                {/* Foto y edición solo en header ahora */}
                {/*} {editMode.personales && (
                    <div className="visor-acciones">
                        <button className="btn-guardar-seccion" onClick={handleGuardarLocal}>Guardar</button>
                        <button className="btn-cancelar-seccion" onClick={handleCancelarLocal}>Cancelar</button>
                    </div>
                )}*/}
            </div>
        </div>
    );
}
TarjetaPersonales.propTypes = {
    estudiante: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    editMode: PropTypes.object.isRequired,
    isConsulta: PropTypes.bool,
    isEliminacion: PropTypes.bool,
    handleInputChange: PropTypes.func.isRequired,
    setEditMode: PropTypes.func.isRequired,
    formatearFecha: PropTypes.func.isRequired
};

export default TarjetaPersonales;
