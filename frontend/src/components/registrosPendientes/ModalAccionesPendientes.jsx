import React from 'react';
import './ModalAccionesPendientes.css';
import ModalFooter from './ModalFooter';

const ModalAccionesPendientes = ({ onClose, ...actionProps }) => {
    return (
        <div className="modal-acciones-overlay">
            <div className="modal-acciones-container scale-in-center">
                <div className="modal-acciones-header">
                    <h3 className="modal-acciones-title">Notificaciones y reportes</h3>
                    <button className="modal-acciones-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-acciones-content">
                    {/* Reutilizamos el diseño del footer que ya tiene la estética azul solicitada */}
                    <div className="acciones-wrapper">
                        <ModalFooter {...actionProps} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalAccionesPendientes;
