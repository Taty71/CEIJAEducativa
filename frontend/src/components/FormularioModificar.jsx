import { Form, Field, ErrorMessage } from 'formik';
import PropTypes from 'prop-types';
import ModalidadSelection from './ModalidadSelection';
import { DatosPersonales } from './DatosPersonales';
import { Domicilio } from './Domicilio';
import EstadoInscripcion from './EstadoInscripcion';
import BotonCargando from './BotonCargando';
import ModalDocumentacion from './ModalDocumentacion'; // Verifica este import
import AlertaMens from './AlertaMens';
import { useState } from 'react';

const FormularioModificar = ({
    values,
    handleChange,
    setFieldValue,
    isSubmitting,
    resetForm,
    previews,
    handleFileChange,
    alert,
    isAdmin,
    accion,
    documentacion,
    setPreviews,
    initialValues, // <-- Add this prop
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeModal = () => setIsModalOpen(false);

    console.log('Documentación:', documentacion);
    console.log('Previews:', previews);
    console.log('Values:', values);
    console.log('Alert:', alert);
    console.log('handleFileChange:', handleFileChange);
    console.log('setPreviews:', setPreviews);

    return (
        <Form encType="multipart/form-data" className="formulario-inscripcion-adm">
            {/* Título del formulario */}
            <div className="form-header">
                <h2 className="form-title">Modificar Estudiante</h2>
            </div>
            
            <div className="formd">
                <DatosPersonales values={values} handleChange={handleChange} />
                <Domicilio values={values} handleChange={handleChange} />
                <div className="form-group">
                    <label>Fecha de inscripción:</label>
                    <Field
                        type="date"
                        name="fechaInscripcion"
                        className="form-control"
                        value={values.fechaInscripcion || ''} // Asegúrate de que no sea undefined
                    />
                    <ErrorMessage name="fechaInscripcion" component="div" className="error" />
                </div>

                <div className="form-eleccion">
                    <ModalidadSelection
                        modalidad={values.modalidad || ''}
                        modalidadId={Number(values.modalidadId) || 0}
                        setFieldValue={setFieldValue}
                        values={values}
                        showMateriasList={values.planAnio !== '' && values.modalidad !== ''}
                        handleChange={handleChange}
                    />
                </div>
                <div className="left-container">
                    <button type="button" className="buttonD" onClick={() => setIsModalOpen(true)}>
                        Ver Documentación
                    </button>
                    {isAdmin && (
                        <EstadoInscripcion
                            value={values.idEstadoInscripcion}
                            handleChange={(e) => setFieldValue('idEstadoInscripcion', e.target.value)}
                        />
                    )}
                </div>
                <div className="right-container">
                    {isSubmitting ? (
                        <BotonCargando loading={true}>{accion || 'Modificando...'}</BotonCargando>
                    ) : (
                        <>
                            <button type="submit" className="buttonF">{accion || 'Modificar'}</button>
                            <button
                                type="button"
                                className="buttonF"
                                onClick={() => {
                                    resetForm({ values: initialValues || values });
                                    setPreviews({});
                                }}
                            >
                                Limpiar
                            </button>
                        </>
                    )}
                </div>
            </div>
         
            {isModalOpen && (
                     <ModalDocumentacion
                        onClose={closeModal}
                        documentacion={documentacion}
                      />
             )}


            {alert.text && <AlertaMens text={alert.text} variant={alert.variant} />}
            {previews && Object.keys(previews).length > 0 && (
                <div>
                    {Object.entries(previews).map(([key, value]) => (
                        <div key={key}>
                            <p>{key}</p>
                            {value?.url && <img src={value.url} alt={`Vista previa de ${key}`} />}
                        </div>
                    ))}
                </div>
            )}
            <div>
                <h3>Documentación del Estudiante</h3>
                {Array.isArray(documentacion) && documentacion.length > 0 ? (
                    <ul>
                        {documentacion.map((doc) => (
                            <li key={doc.idDocumentaciones}>
                                <p><strong>{doc.descripcionDocumentacion}</strong></p>
                                <p>Estado: {doc.estadoDocumentacion}</p>
                                <p>Fecha de Entrega: {doc.fechaEntrega || 'No entregado'}</p>
                                {doc.archivoDocumentacion && (
                                    <a href={doc.archivoDocumentacion} target="_blank" rel="noopener noreferrer">
                                        Ver archivo
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No se encontró documentación para esta inscripción.</p>
                )}
            </div>
        </Form>
    );
};

FormularioModificar.propTypes = {
    initialValues: PropTypes.object, // <-- Add this prop type
    values: PropTypes.shape({
        modalidad: PropTypes.string,
        modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        planAnio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        idEstadoInscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fechaInscripcion: PropTypes.string, // Añadido para validación de props
    }).isRequired,
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    resetForm: PropTypes.func.isRequired,
    previews: PropTypes.object.isRequired,
    handleFileChange: PropTypes.func.isRequired,
    alert: PropTypes.shape({
        text: PropTypes.string,
        variant: PropTypes.string,
    }).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    accion: PropTypes.string,
    documentacion: PropTypes.arrayOf(
        PropTypes.shape({
            idDocumentaciones: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            descripcionDocumentacion: PropTypes.string,
            estadoDocumentacion: PropTypes.string,
            fechaEntrega: PropTypes.string,
            archivoDocumentacion: PropTypes.string,
        })
    ).isRequired,
    setPreviews: PropTypes.func.isRequired, // Asegúrate de que esta prop se pase correctamente
};

export default FormularioModificar;
