import { useState } from "react";
import PropTypes from "prop-types";
import "../estilos/Modal.css";
import { useAlerts } from "../hooks/useAlerts";
import AlertaMens from "../components/AlertaMens";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import BotonCargando from "../components/BotonCargando";
import Captcha from "../components/Captcha";
import serviceUsuario from "../services/serviceUsuario";

import { yupResolver } from "@hookform/resolvers/yup";
import { userValidationSchema } from '../validaciones/ValidacionSchemaYup';

const RegisterButton = ({ onClose, onLoginClick }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(userValidationSchema) });
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const { alerts, modal, showSuccess, showError, removeAlert, closeModal } =
    useAlerts();

  const mostrarAlerta = (text, variant) => {
    switch (variant) {
      case "success":
        showSuccess(text);
        break;
      case "error":
        showError(text);
        break;
      default:
        showSuccess(text);
    }
  };

  const onSubmit = async (data) => {
    if (!captchaValid) {
      mostrarAlerta('Por favor, completa la verificación de seguridad', 'error');
      return;
    }

    setLoading(true);
    console.log("Form Data:", data);

    try {
      const response = await serviceUsuario.postUser(data);
      setTimeout(() => {
        setLoading(false);
        if (response?.message === "Usuario creado exitosamente") {
          mostrarAlerta(
            "Registro exitoso. Ahora puedes iniciar sesión.",
            "success"
          );
          setTimeout(() => {
            onLoginClick();
          }, 2000);
        } else {
          mostrarAlerta(
            response?.message || "Error en el registro",
            "error"
          );
        }
      }, 2000);
    } catch (error) {
      mostrarAlerta(
        error.response?.data?.message ||
          "Error del servidor. Intenta nuevamente.",
        "error"
      );
      console.error("Error en registro:", error);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="login-box">
          <AlertaMens
            mode="floating"
            alerts={alerts}
            modal={modal}
            onCloseAlert={removeAlert}
            onCloseModal={closeModal}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="back-button"
          >
            ✖
          </button>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <Input
                label="Nombre"
                placeholder="Nombre"
                registro={{ ...register("nombre") }}
                error={errors.nombre?.message}
              />
              <Input
                label="Apellido"
                placeholder="Apellido"
                registro={{ ...register("apellido") }}
                error={errors.apellido?.message}
              />
              <Input
                label="Email"
                placeholder="Email"
                registro={{ ...register("email") }}
                error={errors.email?.message}
              />
              <Input
                label="Contraseña"
                placeholder="Password"
                type="password"
                registro={{ ...register("password") }}
                error={errors.password?.message}
              />
              <div className="form-select-wrapper">
                <label>Rol</label>
                <select {...register("rol")} className="form-select">
                  <option value="Administrador">Administrador</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Bedel">Bedel</option>
                </select>
                {errors.rol && <span className="error-message">{errors.rol.message}</span>}
              </div>
            </div>
            
            <div className="captcha-section">
              <Captcha onValidate={setCaptchaValid} />
            </div>

            <div className="button-container" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
              <BotonCargando loading={loading} type="submit">
                Registrarse
              </BotonCargando>
            </div>
            <p className="register-text">
              ¿Ya tienes cuenta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLoginClick();
                }}
                className="register-link"
              >
                Inicia sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

RegisterButton.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
};

export default RegisterButton;
