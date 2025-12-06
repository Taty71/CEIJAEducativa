import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalidadModal from './ModalidadModal';
import CloseButton from './CloseButton';
import '../estilos/modalM.css';
import '../estilos/botones.css';

const Modalidad = ({ isOpen, onClose, onSelectModalidad }) => {
    const navigate = useNavigate(); // Hook para redirección
    const location = useLocation(); // Hook para obtener la ruta actual
    const [modalidad, setModalidad] = useState('');
    const [showModalidadModal, setShowModalidadModal] = useState(false); // Controlar el ModalidadModal
    
    // Obtener el usuario y su rol
    let user = null;
    try {
      // Si usas contexto, reemplaza por tu hook/contexto real
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    const rol = user?.rol;

    const handleModalOpen = (modalidadStr) => {
        setModalidad(modalidadStr);
        // Mapear modalidad string a modalidadId
        let modalidadId = null;
        if (modalidadStr === 'Presencial') modalidadId = 1;
        else if (modalidadStr === 'Semipresencial') modalidadId = 2;
        
        // Llamar callback si existe
        if (typeof onSelectModalidad === 'function') {
            onSelectModalidad(modalidadStr, modalidadId);
        }
        
        if (location.pathname === '/dashboard') {
            // Redirige a la página de inscripción con la modalidad como parámetro
            navigate(`/dashboard/formulario-inscripcion-adm?modalidad=${modalidadStr}`);
        } else {
            // Mostrar ModalidadModal para usuarios web
            setShowModalidadModal(true);
        }
    };

    const handleModalClose = () => {
        onClose();
    };

    const handleBackToSelector = () => {
        // Volver del ModalidadModal al selector de modalidades
        setShowModalidadModal(false);
        setModalidad('');
    };

    if (!isOpen) return null;

    // Definir las opciones según el rol
    let opciones = [];
    if (rol === 'administrador') {
      opciones = ['Presencial', 'Semipresencial'];
    } else if (rol === 'secretario') {
      opciones = ['Presencial'];
    } else if (rol === 'coordinador') {
      opciones = ['Semipresencial'];
    } else {
      // Para usuarios web (sin login) mostrar todas las opciones disponibles
      opciones = ['Presencial', 'Semipresencial'];
    }
    return (
      <div className="modal-overlay">
        {showModalidadModal ? (
          // Mostrar ModalidadModal con información detallada
          <ModalidadModal 
            modalidad={modalidad} 
            onClose={handleModalClose}
            onBackToSelector={handleBackToSelector}
          />
        ) : (
          // Mostrar selector de modalidades
          <div className="modal-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Elija una Modalidad</h2>
              <CloseButton onClose={handleModalClose} className="cerrar-button modal-close" />
            </div>
            <div className="modal-buttons">
              {opciones.map((opcion) => (
                <button
                  key={opcion}
                  onClick={() => handleModalOpen(opcion)}
                  className="boton-principal"
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
};

Modalidad.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectModalidad: PropTypes.func, // Nuevo callback para modalidad seleccionada
};

export default Modalidad;