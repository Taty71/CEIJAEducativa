// frontend/src/components/Captcha.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../estilos/Captcha.css';

const Captcha = ({ onValidate }) => {
    const [captchaCode, setCaptchaCode] = useState('');
    const [userInput, setUserInput] = useState('');

    const generateCaptcha = () => {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setCaptchaCode(code);
        setUserInput('');
        onValidate(false);
    };

    useEffect(() => {
        generateCaptcha();
        // eslint-disable-next-line
    }, []);

    const handleChange = (e) => {
        const value = e.target.value.toUpperCase();
        setUserInput(value);
        onValidate(value === captchaCode);
    };

    return (
        <div className="captcha-container">
            <label className="captcha-label">Verificación de seguridad</label>
            <div className="captcha-box">
                <div className="captcha-code">{captchaCode}</div>
                <button 
                    type="button" 
                    onClick={generateCaptcha} 
                    className="captcha-refresh"
                    title="Generar nuevo código"
                >
                    ↻
                </button>
            </div>
            <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder="Ingresa el código"
                className="captcha-input"
                maxLength={6}
            />
        </div>
    );
};

Captcha.propTypes = {
    onValidate: PropTypes.func.isRequired
};

export default Captcha;