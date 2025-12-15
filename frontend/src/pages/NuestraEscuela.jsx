// src/pages/NuestraEscuela.jsx
import { useState } from 'react';
import '../estilos/estilosNuestraEscuela.css';

// Importar imágenes históricas
import f5 from '../assets/images/f5.jpg';
import f6 from '../assets/images/f6.jpg';
import f7 from '../assets/images/f7.jpg';
import f9 from '../assets/images/f9.jpg';
import f51 from '../assets/images/f51.jpg';
import f61 from '../assets/images/f61.jpg';
import f71 from '../assets/images/f71.jpg';
import f72 from '../assets/images/f72.jpg';
import f91 from '../assets/images/f91.jpg';
import farchivo2 from '../assets/images/farchivo2.jpg';

// Importar imágenes del cambio a CEIJA
import ceija51 from '../assets/images/ceija51.jpg';
import ceija52 from '../assets/images/ceija52.jpg';
import ceija53 from '../assets/images/ceija53.jpg';
import ceija54 from '../assets/images/ceija54.jpg';

const NuestraEscuela = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const imagenesHistoricas = [
        { src: f5, alt: "CENMA N° 309 - Instalaciones" },
        { src: f6, alt: "CENMA N° 309 - Vista exterior" },
        { src: f7, alt: "CENMA N° 309 - Aulas" },
        { src: f9, alt: "CENMA N° 309 - Actividades" },
        { src: f51, alt: "CENMA N° 309 - Estudiantes" },
        { src: f61, alt: "CENMA N° 309 - Interior" },
        { src: f71, alt: "CENMA N° 309 - Espacios" },
        { src: f72, alt: "CENMA N° 309 - Comunidad educativa" },
        { src: f91, alt: "CENMA N° 309 - Eventos" },
        { src: farchivo2, alt: "CENMA N° 309 - Archivo histórico" }
    ];

    const imagenesCEIJA = [
        { src: ceija51, alt: "Inauguración CEIJA N° 5 - 2024" },
        { src: ceija52, alt: "Acto de inauguración CEIJA N° 5" },
        { src: ceija53, alt: "Ceremonia CEIJA N° 5 La Calera" },
        { src: ceija54, alt: "Evento CEIJA N° 5" }
    ];

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="nuestra-escuela-container" id="nuestra-escuela">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay">
                    <h1 className="hero-title">Nuestra Historia</h1>
                    <p className="hero-subtitle">Más de 30 años educando para la libertad</p>
                </div>
            </section>

            {/* Introducción */}
            <section className="intro-section">
                <div className="content-wrapper">
                    <h2>El Sueño de una Comunidad</h2>
                    <p className="intro-text">
                        Hacia fines de la década del ochenta y principios de los noventa, un grupo de docentes,
                        profesionales y vecinos conjuntamente con las autoridades de la municipalidad y Rotary Club
                        empezaron a soñar para llevar a cabo la instalación en la ciudad de La Calera de una escuela
                        secundaria para adultos.
                    </p>
                </div>
            </section>

            {/* Línea de Tiempo */}
            <section className="timeline-section">
                <div className="content-wrapper">
                    <h2>Nuestra Trayectoria</h2>

                    {/* 1990 - Fundación */}
                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">1990</span>
                        </div>
                        <div className="timeline-content">
                            <h3>Fundación del CENMA N° 309</h3>
                            <p>
                                El día <strong>3 de septiembre de 1990</strong> se abren las puertas del colegio tan anhelado,
                                teniendo como flamante Directora a la profesora <strong>Coca, Estela</strong>, compartiendo las
                                instalaciones del Instituto Domingo Faustino Sarmiento, donde en la actualidad funciona el nivel
                                secundario de dicha institución.
                            </p>
                            <p>
                                El horario para las funciones de la escuela era a partir de las <strong>19 horas hasta las 23 horas</strong>,
                                el cual se mantiene en vigencia.
                            </p>
                        </div>
                    </div>

                    {/* 1994 - Nueva Sede */}
                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">1994</span>
                        </div>
                        <div className="timeline-content">
                            <h3>Traslado a Nueva Sede</h3>
                            <p>
                                La inscripción de estudiantes en busca de concluir sus estudios secundarios comenzó a ir en
                                aumento cada vez mayor, de tal forma que el espacio físico quedó reducido, lo que obligó a
                                buscar nuevas instalaciones para albergar la cantidad de estudiantes matriculados.
                            </p>
                            <p>
                                Así, la escuela de nivel primario <strong>Juan José Paso</strong> abre sus puertas para la
                                instalación de la escuela en horario nocturno CENMA N° 309 de Educación para Jóvenes y Adultos,
                                donde actualmente sigue sus funciones.
                            </p>
                        </div>
                    </div>

                    {/* 2004 - Terminalidad */}
                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">2004</span>
                        </div>
                        <div className="timeline-content">
                            <h3>Modalidad Terminalidad Educativa</h3>
                            <p>
                                Se abre la modalidad <strong>Terminalidad Educativa</strong> de manera semipresencial con la
                                Coordinación de la profesora <strong>Alabarze Susana</strong>, donde los estudiantes solo
                                concurren a tutorías dos días a la semana.
                            </p>
                        </div>
                    </div>

                    {/* 2021 - Nueva Dirección */}
                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">2021</span>
                        </div>
                        <div className="timeline-content">
                            <h3>Nueva Dirección</h3>
                            <p>
                                El Profesor Lic. <strong>Del Pazo Gonzalo</strong> asume la Dirección del CENMA N° 309,
                                acompañado por el secretario <strong>Sanchez José Luis</strong> y la secretaria auxiliar
                                <strong> Suarez Gabriela</strong>.
                            </p>
                            <p>
                                La Sede de Educación a Distancia queda a cargo de la Coordinadora <strong>Bordenave, Leonor Luján</strong>
                                y la Coordinadora Administrativa <strong>Rodriguez, Ivana Salomé</strong>.
                            </p>
                        </div>
                    </div>

                    {/* 2024 - Cambio a CEIJA */}
                    <div className="timeline-item timeline-highlight">
                        <div className="timeline-marker">
                            <span className="timeline-year">2024</span>
                        </div>
                        <div className="timeline-content">
                            <h3>Transformación en CEIJA N° 5</h3>
                            <p className="highlight-text">
                                El <strong>26 de agosto de 2024</strong>, el Ministerio de Educación de la Provincia de Córdoba
                                anuncia la transformación del CENMA N° 309 en <strong>CEIJA N° 5 La Calera</strong> (Centro
                                Educativo Integral de Jóvenes y Adultos).
                            </p>
                            <p>
                                El día <strong>19 de agosto</strong> comenzaron las actividades en el quinto Centro Educativo
                                Integral de Jóvenes y Adultos (CEIJA), creado por el Ministerio de Educación y la Secretaría
                                de Educación a través de la Dirección General de Educación de Jóvenes y Adultos (DGEJyA).
                            </p>
                            <p>
                                A partir de un convenio firmado entre el <strong>Ministerio de Educación</strong>, la
                                <strong> Municipalidad de La Calera</strong> y el <strong>Ministerio de Desarrollo Social y
                                    Promoción del Empleo (CEDER)</strong>, se brindará <strong>Formación Profesional</strong> a
                                las y los estudiantes del CEIJA La Calera. De este modo, podrán finalizar sus estudios primarios,
                                secundarios y a la vez certificar una formación profesional.
                            </p>
                            <p className="highlight-text">
                                La implementación de cada CEIJA se desarrolla en el marco de la meta planteada por el Ministerio
                                de Educación: <strong>innovar, conectar educación, trabajo y producción</strong>.
                            </p>
                            <p>
                                Asume como nueva Directora la Profesora <strong>[Nombre de la Nueva Directora]</strong>,
                                continuando el legado de más de 30 años de educación para jóvenes y adultos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Galería Histórica */}
            <section className="gallery-section">
                <div className="content-wrapper">
                    <h2>Galería Histórica</h2>
                    <p className="gallery-subtitle">CENMA N° 309 - Recuerdos de nuestra trayectoria</p>
                    <div className="gallery-grid">
                        {imagenesHistoricas.map((imagen, index) => (
                            <div
                                key={index}
                                className="gallery-item"
                                onClick={() => openModal(imagen)}
                            >
                                <img src={imagen.src} alt={imagen.alt} />
                                <div className="gallery-overlay">
                                    <span>Ver imagen</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Galería CEIJA 2024 */}
            <section className="gallery-section ceija-section">
                <div className="content-wrapper">
                    <h2>Inauguración CEIJA N° 5</h2>
                    <p className="gallery-subtitle">Agosto 2024 - Un nuevo capítulo en nuestra historia</p>
                    <div className="gallery-grid">
                        {imagenesCEIJA.map((imagen, index) => (
                            <div
                                key={index}
                                className="gallery-item"
                                onClick={() => openModal(imagen)}
                            >
                                <img src={imagen.src} alt={imagen.alt} />
                                <div className="gallery-overlay">
                                    <span>Ver imagen</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal para ver imágenes */}
            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>✖</button>
                        <img src={selectedImage.src} alt={selectedImage.alt} />
                        <p className="modal-caption">{selectedImage.alt}</p>
                    </div>
                </div>
            )}

            {/* Footer de la sección */}
            <section className="footer-section">
                <div className="content-wrapper">
                    <p className="footer-text">
                        <strong>CEIJA N° 5 La Calera</strong> - Educando para la libertad desde 1990
                    </p>
                    <p className="footer-address">San Martín 772 - La Calera - Córdoba</p>

                    {/* Botón volver al inicio */}
                    <button className="scroll-to-top-btn" onClick={scrollToTop}>
                        ↑ Volver al inicio
                    </button>
                </div>
            </section>
        </div>
    );
};

export default NuestraEscuela;
