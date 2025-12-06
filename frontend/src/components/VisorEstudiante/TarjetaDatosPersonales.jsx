import { useState } from 'react';
import { formatearFecha } from '../../utils/fecha.jsx';
import PropTypes from 'prop-types';
const TarjetaDatosPersonales = ({ estudiante, onModificar, isConsulta }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ ...estudiante });

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    };
    const handleGuardar = () => {
        if (onModificar) onModificar({ ...estudiante, ...formData });
        setEditMode(false);
    };
    const handleCancelar = () => {
        setFormData({ ...estudiante });
        setEditMode(false);
    };
    return (
        <div className="tarjeta">
            <div className="tarjeta-header">
                <h3>Datos Personales</h3>
                {!isConsulta && (
                    <button className="btn-editar-seccion" onClick={() => setEditMode(true)} title="Editar datos personales">✏️</button>
                )}
            </div>
            <div className="tarjeta-contenido" style={{ overflow: 'visible' }}>
                <div className="dato-item">
                    <label>Nombre:</label>
                    {editMode ? (
                        <input value={formData.nombre || ''} onChange={e => handleInputChange('nombre', e.target.value)} />
                    ) : (
                        <span>{estudiante.nombre}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Apellido:</label>
                    {editMode ? (
                        <input value={formData.apellido || ''} onChange={e => handleInputChange('apellido', e.target.value)} />
                    ) : (
                        <span>{estudiante.apellido}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>DNI:</label>
                    {editMode ? (
                        <input value={formData.dni || ''} onChange={e => handleInputChange('dni', e.target.value)} />
                    ) : (
                        <span>{estudiante.dni}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>CUIL:</label>
                    {editMode ? (
                        <input value={formData.cuil || ''} onChange={e => handleInputChange('cuil', e.target.value)} />
                    ) : (
                        <span>{estudiante.cuil}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Email:</label>
                    {editMode ? (
                        <input value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                    ) : (
                        <span>{estudiante.email || 'No registrado'}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Fecha de Nacimiento:</label>
                    {editMode ? (
                        <input type="date" value={formData.fechaNacimiento || ''} onChange={e => handleInputChange('fechaNacimiento', e.target.value)} />
                    ) : (
                        <span>{formatearFecha(estudiante.fechaNacimiento)}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>Tipo de Documento:</label>
                    {editMode ? (
                        <select value={formData.tipoDocumento || 'DNI'} onChange={e => handleInputChange('tipoDocumento', e.target.value)}>
                            <option value="DNI">DNI</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                    ) : (
                        <span>{estudiante.tipoDocumento || 'DNI'}</span>
                    )}
                </div>
                <div className="dato-item">
                    <label>País de Emisión:</label>
                    {editMode ? (
                        <input value={formData.paisEmision || 'Argentina'} onChange={e => handleInputChange('paisEmision', e.target.value)} />
                    ) : (
                        <span>{estudiante.paisEmision || 'Argentina'}</span>
                    )}
                </div>
                {/* Mostrar foto si existe (en edición y visualización) */}
                {(formData.foto || estudiante.foto) && (
                    <div className="dato-item" style={{ marginTop: '1em' }}>
                        <label>Foto:</label>
                        <img
                            src={(formData.foto || estudiante.foto).startsWith('http')
                                ? (formData.foto || estudiante.foto)
                                : `http://localhost:5000${formData.foto || estudiante.foto}`}
                            alt={`Foto de ${formData.nombre || estudiante.nombre} ${formData.apellido || estudiante.apellido}`}
                            style={{ maxWidth: '120px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        />
                    </div>
                )}
            </div>
            {editMode && (
                <div className="visor-acciones" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button className="btn-guardar-seccion" onClick={handleGuardar} style={{ marginRight: '1rem' }}>Guardar</button>
                    <button className="btn-cancelar-seccion" onClick={handleCancelar}>Cancelar</button>
                </div>
            )}
        </div>
    );
};
TarjetaDatosPersonales.propTypes = {
    estudiante: PropTypes.object.isRequired,
    onModificar: PropTypes.func,
    isConsulta: PropTypes.bool
};
export default TarjetaDatosPersonales;
