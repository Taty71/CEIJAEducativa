import { NavLink, Navigate } from "react-router-dom";
import { useUserContext } from "../context/useUserContext";
import { Logo } from './Logo';
import LogoCE from '../assets/images/ceija5Educ.png';
import '../estilos/navMain.css';

const NavMain = () => {
    const context = useUserContext();

    if (!context || !context.user) {
        console.error("UserContext is not available");
        return <Navigate to="/" replace />;
    }

    const { user, setUser } = context;

    return (
        <>
            <nav className="nav-main">
                <div className="nav-header">
                    <div className="nav-text">
                        <h1 className="sistema-titulo"> CEIJA 5 </h1>
                        <p className="sistema-subtitulo"> SISTEMA DE GESTIÓN EDUCATIVA</p>
                    </div>
                    <img src={LogoCE} alt="Logo CEIJA 5" className="nav-logo" />
                </div>
                <div className="nav-links">
                    <NavLink to="/" className="nav-link">Inicio</NavLink>
                    <NavLink to="/dashboard" className="nav-link">Panel-Administracion</NavLink>
                </div>
                <div className="nav-user">
                    <span className="user-name">{user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1)}, {user.rol}</span>
                    <button
                        className="logout-button"
                        onClick={() => {
                            setUser(null);
                            localStorage.removeItem("user"); // Limpia el usuario en localStorage
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>
            {/* Logo fijo en esquina inferior derecha */}
            <div className="logo-fixed">
                <Logo />
            </div>
        </>
    );
};

export default NavMain;