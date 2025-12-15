// src/pages/Contacto.jsx
import '../estilos/estilosContacto.css';
import ceija51 from '../assets/images/ceija51.jpg';

const Contacto = () => {
    return (
        <div className="contacto-container" id="contacto">
            {/* Hero Section */}
            <section className="contacto-hero-section">
                <div className="contacto-hero-overlay">
                    <h1 className="contacto-hero-title">Contáctanos</h1>
                    <p className="contacto-hero-subtitle">Estamos aquí para ayudarte</p>
                </div>
            </section>

            {/* Información de Contacto */}
            <section className="contacto-info-section">
                <div className="contacto-content-wrapper">
                    <h2>Información de Contacto</h2>

                    <div className="contacto-cards-grid">
                        {/* Card Secretaría Presencial */}
                        <div className="contacto-card">
                            <div className="contacto-card-icon">📞</div>
                            <h3>Secretaría Presencial</h3>
                            <p className="contacto-detail">
                                <strong>Teléfono:</strong> 03543-460000
                            </p>
                            <p className="contacto-horario">
                                Horario: Lunes a Viernes 19:00 - 23:00 hs
                            </p>
                        </div>

                        {/* Card Secretaría Semipresencial */}
                        <div className="contacto-card">
                            <div className="contacto-card-icon">📱</div>
                            <h3>Secretaría Semipresencial</h3>
                            <p className="contacto-detail">
                                <strong>Teléfono:</strong> 03543-460000
                            </p>
                            <p className="contacto-horario">
                                Horario: Martes y Jueves 19:00 - 21:00 hs
                            </p>
                        </div>

                        {/* Card Email */}
                        <div className="contacto-card">
                            <div className="contacto-card-icon">✉️</div>
                            <h3>Correo Electrónico</h3>
                            <p className="contacto-detail">
                                <a href="mailto:ceija52025@gmail.com">ceija52025@gmail.com</a>
                            </p>
                            <p className="contacto-horario">
                                Respuesta en 24-48 horas hábiles
                            </p>
                        </div>

                        {/* Card Dirección */}
                        <div className="contacto-card contacto-card-wide">
                            <div className="contacto-card-icon">📍</div>
                            <h3>Dirección</h3>
                            <p className="contacto-detail">
                                <strong>San Martín 772</strong><br />
                                La Calera - Córdoba<br />
                                Argentina
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Imagen de la Institución */}
            <section className="contacto-imagen-section">
                <div className="contacto-content-wrapper">
                    <h2>Nuestra Institución</h2>
                    <div className="contacto-imagen-container">
                        <img src={ceija51} alt="CEIJA N° 5 La Calera" className="contacto-imagen" />
                    </div>
                </div>
            </section>

            {/* Mapa de Ubicación */}
            <section className="contacto-mapa-section">
                <div className="contacto-content-wrapper">
                    <h2>Ubicación</h2>
                    <p className="contacto-mapa-descripcion">
                        Encuéntranos en el corazón de La Calera, Córdoba
                    </p>
                    <div className="contacto-mapa-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.857382938474!2d-64.33891082347478!3d-31.34634997431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a1e8e8e8e8e8%3A0x1234567890abcdef!2sSan%20Mart%C3%ADn%20772%2C%20La%20Calera%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1733753019000!5m2!1ses!2sar"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación CEIJA N° 5 La Calera"
                        ></iframe>
                    </div>
                    <div className="contacto-enlace-mapa">
                        <a
                            href="https://maps.app.goo.gl/N8df5D2hnD3zvmLD6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ver-mapa"
                        >
                            📍 Ver en Google Maps
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="contacto-footer-section">
                <div className="contacto-content-wrapper">
                    <p className="contacto-footer-text">
                        <strong>CEIJA N° 5 La Calera</strong> - Educando para la libertad desde 1990
                    </p>
                    <p className="contacto-footer-address">San Martín 772 - La Calera - Córdoba</p>
                </div>
            </section>
        </div>
    );
};

export default Contacto;
