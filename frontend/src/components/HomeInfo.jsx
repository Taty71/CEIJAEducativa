import SlideImg from '../components/SlideImg';
import LogoCE from '../assets/images/ceija5Educ.png';

const HomeInfo = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="school-info">
            <div className="school-image">
                <SlideImg />
            </div>
            <div className="text-overlay">
                <p className="textE">Educando para la libertad</p>
                <p>San Martín 772 - La Calera - Córdoba</p>
            </div>
            <div className="logo" onClick={scrollToTop} style={{ cursor: 'pointer' }} title="Volver al inicio">
                <img src={LogoCE} alt="Logo Proyecto" className="logo" />
            </div>
        </div>
    );
};

export default HomeInfo;

