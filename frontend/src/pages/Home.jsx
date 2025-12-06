// src/components/Home.jsx
import { useState } from 'react';
import Navbar from '../components/Navbar';
import LoginButton from './LoginButton';
import RegisterButton from './RegisterButton';
import Modalidad from '../components/Modalidad';
import '../estilos/estilosHome.css';
import HomeInfo from '../components/HomeInfo';


const Home = () => {
    const [activeModal, setActiveModal] = useState(null);

    const openModal = (modal) => {
        console.log("Abriendo modal:", modal); // 🔍 Debug
        setActiveModal(modal);
    };
    

    const closeModal = () => {
        setActiveModal(null);
    };
    

    return (
        <div className="home">
            <div className="barNav">
                <button onClick={() => openModal('login')} className="login-button">Iniciar Sesión</button>
                <Navbar onModalopen={() => openModal('modalidad')} />
               
            </div>
            {/* Renderiza los modales según el modal activo */}
            {activeModal === 'login' && (
                <LoginButton onClose={closeModal} onRegisterClick={() => openModal('register')} />
            )}
            {activeModal === 'register' && <RegisterButton onClose={closeModal} />}
            {activeModal === 'modalidad' && (
                <Modalidad 
                    isOpen={true} 
                    onClose={closeModal}
                    onSelectModalidad={(modalidadStr, modalidadId) => {
                        console.log(`📚 Modalidad seleccionada: ${modalidadStr} (ID: ${modalidadId})`);
                        // El componente Modalidad maneja internamente la navegación
                        // No necesitamos hacer nada aquí, solo log para debug
                    }}
                />
            )}

            <HomeInfo />
        </div>
    );
};

export default Home;
