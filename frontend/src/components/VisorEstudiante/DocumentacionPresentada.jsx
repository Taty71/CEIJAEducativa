import PropTypes from 'prop-types';

const Documentacion = ({ onFileChange, estudianteLocal }) => {
    const documentosRequeridos = [
        { nombre: 'foto', descripcion: 'Foto' },
        { nombre: 'archivo_dni', descripcion: 'DNI' },
        { nombre: 'archivo_cuil', descripcion: 'CUIL' },
        { nombre: 'archivo_partidaNacimiento', descripcion: 'Partida de Nacimiento' },
        { nombre: 'archivo_fichaMedica', descripcion: 'Ficha Médica' },
    ];

    return (
        <div className="tarjeta-editor">
            <h3>Documentación Presentada</h3>
            <div className="tarjeta-contenido-editor">
                {documentosRequeridos.map((doc, index) => {
                    const archivoExistente = estudianteLocal.documentacion?.find(d => d.nombreArchivo === doc.nombre);
                    return (
                        <div key={index} className="campo-documentacion">
                            <label>{doc.descripcion}:</label>
                            {archivoExistente ? (
                                <span>Archivo existente: {archivoExistente.archivoDocumentacion}</span>
                            ) : (
                                <input
                                    type="file"
                                    onChange={(e) => onFileChange(doc.nombre, e.target.files[0])}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

Documentacion.propTypes = {
    onFileChange: PropTypes.func.isRequired,
    estudianteLocal: PropTypes.object.isRequired,
};

export default Documentacion;
