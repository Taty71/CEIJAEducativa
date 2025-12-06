import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Crear el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
    // Cargar usuario desde localStorage al iniciar
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : {
            nombre: '',
            rol: '',
            email: '',
        };
    });

    // Actualizar localStorage cuando el usuario cambie
    useEffect(() => {
        if (user && user.nombre) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Exportar el contexto para usarlo en otros archivos
export { UserContext };