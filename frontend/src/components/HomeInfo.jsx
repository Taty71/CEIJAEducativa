import SlideImg from '../components/SlideImg';
import LogoCE from '../assets/images/ceija5Educ.png';

const HomeInfo = () => {
    return (
        <div className="school-info">
            <div className="school-image">
                <SlideImg />
            </div>
            <div className="text-overlay">
                <p className="textE">Educando para la libertad</p>
                <p>San Martín 772 - La Calera - Córdoba</p>
            </div>
            <div className="logo">
                <img src={LogoCE} alt="Logo Proyecto" className="logo" />
            </div>
        </div>
    );
};

export default HomeInfo;

