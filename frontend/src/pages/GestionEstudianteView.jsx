import PropTypes from 'prop-types';
import RegistroEstd from './RegistroEstd';
import '../estilos/estilosInscripcion.css';

const GestionEstudianteView = ({
    onClose,
    onBack, // Nuevo prop para navegación hacia atrás
    previews,
    handleFileChange,
    handleChange,
    accion,
    handleSubmit,
    submitForm,
    validateForm,
    submitHandler,
    setFieldValue,
    values,
    isAdmin,
    isWebUser, // Nuevo prop para usuario web
    isSubmitting,
    completarRegistro, // Nuevo prop para completar registro
    completarRegistroWeb, // Nuevo prop para ID del registro web
    datosRegistroWeb, // Nuevo prop para datos del registro web
    tipoRegistro // Nuevo prop para tipo de registro
}) => {
    return (
        <div className={`formulario-inscripcion-${isAdmin ? 'adm' : 'est'}`}>
            {/* Botones manejados directamente por RegistroEstd - No duplicar aquí */}
            
            <RegistroEstd
                modalidad={values.modalidad}
                previews={previews}
                handleFileChange={handleFileChange}
                handleChange={handleChange}
                accion={accion}
                handleSubmit={handleSubmit}
                submitForm={submitForm}
                validateForm={validateForm}
                submitHandler={submitHandler}
                setFieldValue={setFieldValue}
                values={values}
                isAdmin={isAdmin}
                isWebUser={isWebUser} // Pasar prop de usuario web
                isSubmitting={isSubmitting}
                completarRegistro={completarRegistro} // Pasar el prop
                completarRegistroWeb={completarRegistroWeb} // Pasar ID del registro web
                datosRegistroWeb={datosRegistroWeb} // Pasar datos del registro web
                tipoRegistro={tipoRegistro} // Pasar el tipo de registro
                onClose={onClose} // Botón cerrar
                onVolver={onBack} // Botón volver - usar onBack
            />
        </div>
    );
};

GestionEstudianteView.propTypes = {
    onClose: PropTypes.func,
    onBack: PropTypes.func, // Función para navegación hacia atrás
    navigate: PropTypes.func,
    previews: PropTypes.object.isRequired,
    handleFileChange: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    accion: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitForm: PropTypes.func,
    validateForm: PropTypes.func,
    submitHandler: PropTypes.func,
    setFieldValue: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isWebUser: PropTypes.bool, // Indicar si es usuario web
    isSubmitting: PropTypes.bool.isRequired,
    completarRegistro: PropTypes.string, // DNI del registro a completar
    completarRegistroWeb: PropTypes.string, // ID del registro web a completar
    datosRegistroWeb: PropTypes.object, // Datos completos del registro web
    tipoRegistro: PropTypes.oneOf(['pendiente', 'web']), // Tipo de registro
};

export default GestionEstudianteView;
