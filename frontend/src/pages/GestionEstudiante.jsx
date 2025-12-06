import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { formularioInscripcionSchema } from '../validaciones/ValidacionSchemaYup.jsx';
import PropTypes from 'prop-types';
import useGestionDocumentacion from '../hooks/useGestionDocumentacion';
import { useInitialValues } from '../hooks/useInitialValues';
import { useRegistroWebData } from '../hooks/useRegistroWebData';
import { useSubmitHandler } from '../hooks/useSubmitHandler';
import GestionEstudianteView from './GestionEstudianteView';

const GestionEstudiante = ({ modalidad, accion, isAdmin, completarRegistro, isWebUser, onClose, onBack, datosRegistroPendiente }) => {
    const navigate = useNavigate();
    
    // Hooks personalizados
    const {
        files,
        previews,
        handleFileChange,
        buildDetalleDocumentacion,
        resetArchivos,
    } = useGestionDocumentacion();

    const { completarWebParam, datosRegistroWeb } = useRegistroWebData(modalidad);
    const initialValues = useInitialValues(modalidad, completarRegistro, datosRegistroWeb, datosRegistroPendiente);
    const { handleSubmit: handleSubmitForm } = useSubmitHandler(
        files, 
        previews, 
        resetArchivos, 
        buildDetalleDocumentacion
    );

    // Hook para formulario de estudiante

    // Wrapper para el handleSubmit que incluye los parámetros específicos del componente
    const handleSubmit = async (values, formikBag) => {
        // El useSubmitHandler ya maneja todos los mensajes a través del sistema unificado de alertas
        const result = await handleSubmitForm(
            values, 
            formikBag, 
            accion, 
            isAdmin, 
            isWebUser, 
            completarWebParam, 
            modalidad
        );

        return result; // Devolver el resultado para que RegistroEstd.jsx lo detecte
    };

    // Función simplificada para manejo de archivos - usar solo useGestionDocumentacion
    const handleFileChangeWithValidation = (e, field, setFieldValue) => {
        // Pasar directamente al hook useGestionDocumentacion
        handleFileChange(e, field, setFieldValue);
    };

    return (
        <>

            <Formik
                initialValues={initialValues}
                validationSchema={formularioInscripcionSchema}
                validateOnChange={true}
                validateOnBlur={true}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <GestionEstudianteView
                        onClose={onClose}
                        onBack={onBack}
                        navigate={navigate}
                        previews={previews}
                        accion={accion}
                        isAdmin={isAdmin}
                        isWebUser={isWebUser}
                        handleFileChange={handleFileChangeWithValidation}
                        submitHandler={handleSubmitForm}
                        completarRegistro={completarRegistro}
                        completarRegistroWeb={completarWebParam}
                        datosRegistroWeb={datosRegistroWeb}
                        {...formikProps}
                    />
                )}
            </Formik>
        </>
    );
};

GestionEstudiante.propTypes = {
    modalidad: PropTypes.string.isRequired,
    accion: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    completarRegistro: PropTypes.string,
    isWebUser: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onBack: PropTypes.func,
    datosRegistroPendiente: PropTypes.object,
};

export default GestionEstudiante;