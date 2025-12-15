// src/components/Navbar.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import '../estilos/estilosHome.css';

const Navbar = ({ onModalopen }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        toggleMenu();
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
                        <li className="opcMenu">
                            <button onClick={() => scrollToSection('nuestra-escuela')}>Nuestra Escuela</button>
                        </li>
                        <li className="opcMenu">
                            <button onClick={() => { onModalopen('modalidad'); toggleMenu(); }}>Modalidad</button>
                        </li>
                        <li className="opcMenu">
                            <button onClick={() => scrollToSection('contacto')}>Contáctanos</button>
                        </li>
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
