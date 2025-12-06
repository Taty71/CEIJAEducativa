// Objetivo: Componente para mostrar un carrusel de imágenes
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Importar los estilos del carrusel
import { Carousel } from 'react-responsive-carousel';
import '../estilos/slideImg.css';
import slideimge from '../assets/images/ce5n.png';

const SlideImg = () => {
    return (
    <div className="carousel-wrapper">
            <h1 className="carousel-title">C.E.I.J.A 5</h1>
        <Carousel
            showArrows={true}
            autoPlay={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
            interval={3000}
            className="carousel-container" // Clase CSS para el contenedor del carrusel
        >
            <div> 
                <img src={slideimge}  alt="Imagen 1" className="carousel-image" /> 
            </div> 
            <div> 
                <img src={slideimge} alt="Imagen 2" className="carousel-image" /> 
            </div> 
            <div> 
                <img src={slideimge} alt="Imagen 1" className="carousel-image" /> 
            </div> 
        </Carousel>
    </div>
    );
}

export default SlideImg;
