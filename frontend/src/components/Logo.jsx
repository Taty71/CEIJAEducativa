import LogoCE from '../assets/images/ceija5Educ.png';
import '../estilos/estilosLogo.css';

export const Logo = () => {
    return (
        <>
            <h1 className="title">C.E.I.J.A 5</h1>
            <div className="logoProyecto">
                <img src={LogoCE} alt="Logo Proyecto" className="logo" />
            </div>
        </>
    );
};