import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../estilos/Modal.css';
import { useUserContext } from "../context/useUserContext";
import { useAlerts } from '../hooks/useAlerts';
import BotonCargando from '../components/BotonCargando';
import AlertaMens from '../components/AlertaMens';
import Captcha from '../components/Captcha';
import { useForm } from "react-hook-form";
import Input from '../components/Input';
import serviceUsuario from '../services/serviceUsuario';
import { yupResolver } from '@hookform/resolvers/yup'; 
import { loginValidationSchema } from '../validaciones/ValidacionSchemaYup';

const LoginButton = ({ onClose, onRegisterClick }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(loginValidationSchema) });
    const [loading, setLoading] = useState(false);
    const [captchaValid, setCaptchaValid] = useState(false);
    const { 
        alerts, 
        modal, 
        showSuccess, 
        showError,
        removeAlert,
        closeModal 
    } = useAlerts();
    const { setUser } = useUserContext();
    const navigate = useNavigate();

    const mostrarAlerta = (text, variant) => {
        switch (variant) {
            case 'success':
                showSuccess(text);
                break;
            case 'error':
                showError(text);
                break;
            default:
                showSuccess(text);
        }
    };

    const onSubmit = async (data) => {
        // Validar captcha antes de enviar
        if (!captchaValid) {
            mostrarAlerta('Por favor, completa la verificación de seguridad', 'error');
            return;
        }

        setLoading(true);
        console.log("Form", data);
        try {
            const response = await serviceUsuario.getUser(data);
            setTimeout(() => {
                setLoading(false);
                if (response?.token) {
                    const { nombre, rol, email } = response.user;
                    console.log(`Nombre: ${nombre}, Rol: ${rol}, Email: ${email}`);
                
                    localStorage.setItem('token', response.token);
                    console.log('Token guardado:', response.token);
                    
                    setUser({ nombre, rol, email });

                    mostrarAlerta(`Bienvenido, ${nombre}. Rol: ${rol}`, 'success');
                    console.log("Estado del usuario en el contexto:", { nombre, rol, email });
                    console.log('Redirigiendo al dashboard');
                    
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    mostrarAlerta(response?.message || 'Error en las credenciales', 'error');
                }
            }, 2000);
        } catch (error) {
            mostrarAlerta(error.response?.data?.message || 'Error del servidor. Intenta nuevamente.', 'error');
            console.error('Error en login:', error);
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="login-box">
                    <AlertaMens
                        mode="floating"
                        alerts={alerts}
                        modal={modal}
                        onCloseAlert={removeAlert}
                        onCloseModal={closeModal}
                    />
                    <button onClick={(e) => { e.preventDefault(); onClose(); }} className="back-button">✖</button>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input label="Email" placeholder="Email" registro={{ ...register("email") }} error={errors.email?.message} />
                        <Input label="Contraseña" placeholder="Password" type="password" registro={{ ...register("password") }} error={errors.password?.message} />
                        
                        <Captcha onValidate={setCaptchaValid} />
                        
                        <div className="button-container" style={{ justifyContent: 'flex-end' }}>
                            <BotonCargando loading={loading} type="submit">
                                Iniciar Sesión
                            </BotonCargando>
                        </div>
                        <p className="register-text">¿No tienes cuenta? 
                            <a href="#" onClick={(e) => { e.preventDefault(); onRegisterClick(); }} className="register-link">Regístrate</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

LoginButton.propTypes = {
    onClose: PropTypes.func.isRequired,
    onRegisterClick: PropTypes.func.isRequired,
};

export default LoginButton;