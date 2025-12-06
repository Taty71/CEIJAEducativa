// src/components/Navbar.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import '../estilos/estilosHome.css';

const Navbar = ({ onModalopen }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="navbar">
            <button className="hamburger" onClick={toggleMenu}>
                ☰
            </button>
            {isOpen && (
                <div className="menu">
                    <button onClick={toggleMenu}>✖</button>
                    <ul>
                        <li className="opcMenu"><a href="#nuestra-escuela">Nuestra Escuela</a></li>
                        <li className="opcMenu">
                            <button onClick={() => { onModalopen('modalidad'); toggleMenu(); }}>Modalidad</button>
                        </li>
                        <li className="opcMenu"><a href="#contacto">Contáctanos</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};
Navbar.propTypes = {
    onModalopen: PropTypes.func.isRequired,
};

export default Navbar;
