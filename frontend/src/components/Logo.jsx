import { useNavigate } from 'react-router-dom';
import LogoCE from '../assets/images/ceija5Educ.png';
import '../estilos/estilosLogo.css';

export const Logo = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <h1 className="title">C.E.I.J.A 5</h1>
            <div
                className="logoProyecto"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
                title="Ir a inicio"
            >
                <img src={LogoCE} alt="Logo Proyecto" className="logo" />
            </div>
        </>
    );
};