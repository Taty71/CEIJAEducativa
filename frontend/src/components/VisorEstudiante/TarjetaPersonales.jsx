import PropTypes from 'prop-types';


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
    const fotoSrc = formData.foto || estudiante.foto;
    const isString = typeof fotoSrc === 'string' && fotoSrc.trim() !== '';

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
                        {isString ? (
                            <img
                                src={
                                    fotoSrc.startsWith('http')
                                        ? fotoSrc
                                        : fotoSrc.startsWith('/')
                                        ? `http://localhost:5000${fotoSrc}`
                                        : `http://localhost:5000/${fotoSrc}`
                                }
                                alt={`Foto de ${formData.nombre || estudiante.nombre} ${formData.apellido || estudiante.apellido}`}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = '/img/default-avatar.png';
                                }}
                            />
                        ) : (
                            <img
                                src="/img/default-avatar.png"
                                alt="Foto del estudiante"
                                style={{ width: '64px', height: '64px', borderRadius: '50%' }}
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
                    <label>DNI:</label>
                    <span>{estudiante.dni}</span>
                </div>
                <div className="dato-item">
                    <label>CUIL:</label>
                    {editMode.personales ? (
                        <input value={formData.cuil || ''} onChange={e => handleInputChange('cuil', e.target.value)} />
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
