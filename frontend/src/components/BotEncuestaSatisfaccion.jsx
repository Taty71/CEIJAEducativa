import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useGlobalAlerts } from '../hooks/useGlobalAlerts';
import hoodieIcon from '../assets/logos/hoodie.png';
import '../estilos/BotEncuestaSatisfaccion.css';

const BotEncuestaSatisfaccion = ({ isOpen, onClose, dniEstudiante, modalidad }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [isMinimized, setIsMinimized] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    // Usar el hook de alertas globales del sistema
    const { showError: showErrorAlert, showSuccess: showSuccessAlert, showInfo, confirmAction } = useGlobalAlerts();

    // Preguntas de la encuesta
    const questions = [
        {
            id: 'facilidad_uso',
            type: 'rating',
            question: '¿Qué tan fácil te resultó completar el formulario de inscripción?',
            options: [1, 2, 3],
            labels: ['Difícil', 'Regular', 'Fácil']
        },
        {
            id: 'claridad_informacion',
            type: 'rating',
            question: '¿La información solicitada fue clara y comprensible?',
            options: [1, 2, 3],
            labels: ['Confusa', 'Clara', 'Muy clara']
        },
        {
            id: 'tiempo_completado',
            type: 'multiple',
            question: '¿Cuánto tiempo te tomó completar el formulario?',
            options: [
                'Menos de 10 minutos',
                '10-15 minutos',
                'Más de 15 minutos'
            ]
        },
        {
            id: 'problemas_encontrados',
            type: 'multiple',
            question: '¿Encontraste algún problema durante el proceso?',
            options: [
                'Ninguno',
                'Dificultad con el formulario',
                'Problemas al adjuntar documentación'
            ]
        },
        {
            id: 'sugerencias',
            type: 'text',
            question: '¿Tienes alguna sugerencia para mejorar el proceso de inscripción?',
            placeholder: 'Escribe tus comentarios aquí... (opcional)'
        }
    ];

    // Auto-abrir el bot después de 2 segundos si está habilitado
    useEffect(() => {
        if (isOpen && !isMinimized) {
            const timer = setTimeout(() => {
                // Iniciar encuesta automáticamente
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMinimized]);

    const handleResponse = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleNext();
    };

    const handleSubmit = async () => {
        try {
            // Preparar datos para envío
            const encuestaData = {
                dni: dniEstudiante,
                modalidad: modalidad || 'presencial',
                fecha: new Date().toISOString(),
                respuestas: responses,
                completada: true
            };

            // Enviar al backend usando axios
            const response = await axios.post('/api/encuestas-satisfaccion', encuestaData);

            if (response.data.success) {
                console.log('✅ Encuesta enviada correctamente');
                setShowThankYou(true);

                // Mostrar mensaje de éxito usando el sistema de alertas
                setTimeout(() => {
                    showSuccessAlert('¡Gracias por completar la encuesta de satisfacción!');
                }, 500);

                // Cerrar después de 3 segundos
                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        } catch (error) {
            console.error('Error enviando encuesta:', error);

            // Mostrar error usando el sistema de alertas
            showErrorAlert('No se pudo enviar la encuesta. Por favor, inténtalo nuevamente.');

            // Permitir cerrar incluso si falla el envío
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    };

    const handleClose = async () => {
        const confirmed = await confirmAction('Lo siento por intentar ocupar más de tu tiempo, tu opinión es muy valiosa. ¿Deseas cerrar la encuesta?');
        if (confirmed) {
            onClose();
        }
        // Si cancela (confirmed = false), la encuesta permanece abierta
    };

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <div className="bot-encuesta-minimizado" onClick={() => setIsMinimized(false)}>
                <span className="bot-icono">💬</span>
                <span className="bot-texto">Encuesta de satisfacción</span>
            </div>
        );
    }

    if (showThankYou) {
        return (
            <div className="bot-encuesta-container">
                <div className="bot-encuesta-header">
                    <div className="bot-avatar">
                        <img src={hoodieIcon} alt="Bot" className="bot-avatar-img" />
                    </div>
                    <h3>¡Gracias!</h3>
                </div>
                <div className="bot-encuesta-body">
                    <div className="thank-you-message">
                        <div className="thank-you-icon">✨</div>
                        <h4>Tu opinión es muy valiosa</h4>
                        <p>Gracias por ayudarnos a mejorar el proceso de inscripción.</p>
                        <p>¡Bienvenido/a a CEIJA 5!</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentStep];
    const hasResponse = responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== '';

    return (
        <div className="bot-encuesta-container">
            <div className="bot-encuesta-header">
                <div className="bot-avatar">
                    <img src={hoodieIcon} alt="Bot" className="bot-avatar-img" />
                </div>
                <div className="bot-header-info">
                    <h3>Encuesta de Satisfacción</h3>
                    <span className="bot-progress">Pregunta {currentStep + 1} de {questions.length}</span>
                </div>
                <div className="bot-header-actions">
                    <button
                        className="bot-btn-minimize"
                        onClick={() => setIsMinimized(true)}
                        title="Minimizar"
                    >
                        ➖
                    </button>
                    <button
                        className="bot-btn-close"
                        onClick={handleClose}
                        title="Cerrar"
                    >
                        ✖
                    </button>
                </div>
            </div>

            <div className="bot-encuesta-body">
                <div className="bot-message">
                    <p className="bot-question">{currentQuestion.question}</p>
                </div>

                <div className="bot-response-area">
                    {currentQuestion.type === 'rating' && (
                        <div className="rating-container">
                            {currentQuestion.options.map((value, index) => (
                                <button
                                    key={value}
                                    className={`rating-btn ${responses[currentQuestion.id] === value ? 'selected' : ''}`}
                                    onClick={() => handleResponse(currentQuestion.id, value)}
                                >
                                    <span className="rating-number">{value}</span>
                                    <span className="rating-label">{currentQuestion.labels[index]}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'multiple' && (
                        <div className="multiple-choice-container">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option}
                                    className={`choice-btn ${responses[currentQuestion.id] === option ? 'selected' : ''}`}
                                    onClick={() => handleResponse(currentQuestion.id, option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'text' && (
                        <div className="text-input-container">
                            <textarea
                                className="text-input"
                                placeholder={currentQuestion.placeholder}
                                value={responses[currentQuestion.id] || ''}
                                onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                                rows="4"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bot-encuesta-footer">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                </div>
                <div className="bot-navigation">
                    <button
                        className="btn-nav btn-previous"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        ← Anterior
                    </button>
                    <button
                        className="btn-nav btn-skip"
                        onClick={handleSkip}
                    >
                        Omitir
                    </button>
                    <button
                        className="btn-nav btn-next"
                        onClick={handleNext}
                        disabled={!hasResponse && currentQuestion.type !== 'text'}
                    >
                        {currentStep === questions.length - 1 ? 'Enviar ✓' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

BotEncuestaSatisfaccion.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    dniEstudiante: PropTypes.string,
    modalidad: PropTypes.string
};

export default BotEncuestaSatisfaccion;
