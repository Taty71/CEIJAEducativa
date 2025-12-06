import { useState } from 'react';
import DomicilioWeb from '../components/DomicilioWeb';
import '../estilos/formularioWeb.css';

const EjemploFormularioWeb = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        dni: '',
        domicilio: {}
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const handleDomicilioChange = (datosDomicilio) => {
        setFormData(prev => ({
            ...prev,
            domicilio: datosDomicilio
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');

        try {
            // Aquí envías los datos a tu API
            console.log('Datos del formulario:', formData);
            
            // Ejemplo de envío a API
            const response = await fetch('/api/estudiantes/registro-web', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMensaje('Registro enviado exitosamente');
                setFormData({ nombre: '', dni: '', domicilio: {} });
            } else {
                setMensaje('Error al enviar el registro');
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formulario-web-container">
            <h2>Registro de Estudiante - Formulario Web</h2>
            
            <form onSubmit={handleSubmit} className="formulario-web">
                {/* Datos personales */}
                <div className="seccion-formulario">
                    <h3>Datos Personales</h3>
                    
                    <div className="form-group">
                        <label>Nombre Apellido:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                            placeholder="Ingrese nombre y apellido"
                        />
                    </div>

                    <div className="form-group">
                        <label>DNI:</label>
                        <input
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                            placeholder="Ingrese DNI"
                        />
                    </div>
                </div>

                {/* Componente de domicilio */}
                <DomicilioWeb 
                    onDomicilioChange={handleDomicilioChange}
                    valoresIniciales={formData.domicilio}
                />

                {/* Mensaje de estado */}
                {mensaje && (
                    <div className={`mensaje ${mensaje.includes('Error') ? 'error' : 'success'}`}>
                        {mensaje}
                    </div>
                )}

                {/* Botón de envío */}
                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-submit"
                    >
                        {loading ? 'Enviando...' : 'Enviar Registro'}
                    </button>
                </div>

                {/* Debug info */}
                <details className="debug-info">
                    <summary>Ver datos del formulario (Debug)</summary>
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                </details>
            </form>
        </div>
    );
};

export default EjemploFormularioWeb;