import { useContext } from 'react';
import { UserContext } from './UserContextFile';

// Hook para usar el contexto
export const useUserContext = () => {
    return useContext(UserContext);
};