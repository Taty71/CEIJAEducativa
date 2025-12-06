import { useState } from 'react';
import PropTypes from 'prop-types';
import { Domicilio } from './Domicilio';
import { useAdmin } from '../hooks/useAdmin';

const DomicilioWeb = ({ 
    onDomicilioChange,
    valoresIniciales = {},
    className = ""
}) => {
    const { esAdmin } = useAdmin();
    
    // Solo permitir botón de agregar barrio para admin, coordinador o secretario
    const puedeAgregarUbicaciones = esAdmin?.rol && ['administrador', 'coordinador', 'secretario'].includes(esAdmin.rol.toLowerCase());
    
    console.log('🏠 [DomicilioWeb] Usuario:', esAdmin);
    console.log('🔒 [DomicilioWeb] Puede agregar ubicaciones:', puedeAgregarUbicaciones);
    
    const [datosDomicilio, setDatosDomicilio] = useState({
        calle: '',
        numero: '',
        barrio: '',
        localidad: '',
        provincia: '',
        ...valoresIniciales
    });

    const handleCambio = (nuevosValores) => {
        setDatosDomicilio(nuevosValores);
        if (onDomicilioChange) {
            onDomicilioChange(nuevosValores);
        }
    };

    return (
        <div className={`domicilio-web-container ${className}`}>
            <Domicilio
                esAdmin={puedeAgregarUbicaciones}
                usarFormik={false}
                valores={datosDomicilio}
                onCambio={handleCambio}
            />
        </div>
    );
};

DomicilioWeb.propTypes = {
    onDomicilioChange: PropTypes.func,
    valoresIniciales: PropTypes.object,
    className: PropTypes.string
};

export default DomicilioWeb;