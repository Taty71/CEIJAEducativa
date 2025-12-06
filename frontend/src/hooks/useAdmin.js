import { useState, useEffect } from 'react';

// Hook personalizado para manejar el estado de administrador
export const useAdmin = () => {
  const [esAdmin, setEsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        // Método 1: Verificar desde localStorage (para testing)
        const adminData = localStorage.getItem('userData');
        let userData = null;
        
        if (adminData) {
          try {
            userData = JSON.parse(adminData);
          } catch (parseError) {
            console.error('Error parsing userData:', parseError);
          }
        }
        
        // Si no hay datos en localStorage, verificar sessionStorage
        if (!userData) {
          const sessionData = sessionStorage.getItem('userData');
          if (sessionData) {
            try {
              userData = JSON.parse(sessionData);
            } catch (parseError) {
              console.error('Error parsing session userData:', parseError);
            }
          }
        }
        
        // Verificar roles administrativos
        if (userData && userData.rol) {
          const rolesAdmin = ['administrador', 'coordinador', 'secretario'];
          const esRoleAdmin = rolesAdmin.includes(userData.rol.toLowerCase());
          
          setEsAdmin({
            esAdmin: esRoleAdmin,
            rol: userData.rol,
            nombre: userData.nombre || '',
            email: userData.email || '',
            usuario: userData
          });
          
          console.log('🔐 [useAdmin] Usuario verificado:', {
            rol: userData.rol,
            esAdmin: esRoleAdmin
          });
        } else {
          // Fallback: verificar flags simples
          const adminFlag = localStorage.getItem('esAdmin') === 'true';
          const sessionAdmin = sessionStorage.getItem('userRole') === 'admin';
          
          setEsAdmin({
            esAdmin: adminFlag || sessionAdmin,
            rol: sessionAdmin ? 'admin' : 'usuario',
            nombre: '',
            email: '',
            usuario: null
          });
        }
        
      } catch (error) {
        console.error('Error verificando permisos de admin:', error);
        setEsAdmin({
          esAdmin: false,
          rol: 'usuario',
          nombre: '',
          email: '',
          usuario: null
        });
      } finally {
        setLoading(false);
      }
    };

    verificarAdmin();
  }, []);

  const toggleAdmin = () => {
    const newAdminState = !esAdmin?.esAdmin;
    const newUserData = {
      esAdmin: newAdminState,
      rol: newAdminState ? 'administrador' : 'usuario',
      nombre: esAdmin?.nombre || '',
      email: esAdmin?.email || '',
      usuario: esAdmin?.usuario
    };
    
    setEsAdmin(newUserData);
    localStorage.setItem('esAdmin', newAdminState.toString());
    localStorage.setItem('userData', JSON.stringify({
      rol: newUserData.rol,
      nombre: newUserData.nombre,
      email: newUserData.email
    }));
    sessionStorage.setItem('userRole', newAdminState ? 'administrador' : 'usuario');
  };

  return { 
    esAdmin, 
    setEsAdmin, 
    loading, 
    toggleAdmin 
  };
};

// Función helper para testing - eliminar en producción
export const toggleAdminMode = () => {
  const current = localStorage.getItem('esAdmin') === 'true';
  const newState = !current;
  const newRol = newState ? 'administrador' : 'usuario';
  
  localStorage.setItem('esAdmin', newState.toString());
  localStorage.setItem('userData', JSON.stringify({
    rol: newRol,
    nombre: 'Usuario Test',
    email: 'test@admin.com'
  }));
  sessionStorage.setItem('userRole', newRol);
  
  // Dispara evento personalizado para que los componentes se actualicen
  window.dispatchEvent(new CustomEvent('adminToggle', { 
    detail: { 
      esAdmin: newState,
      rol: newRol
    }
  }));
  
  console.log(`🔄 [toggleAdminMode] Cambiado a: ${newRol}`);
  return newState;
};

// Hook para escuchar cambios de admin en tiempo real
export const useAdminListener = () => {
  const [adminData, setAdminData] = useState(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const rolesAdmin = ['administrador', 'coordinador', 'secretario'];
      return {
        esAdmin: rolesAdmin.includes(userData.rol?.toLowerCase()),
        rol: userData.rol || 'usuario'
      };
    } catch {
      return {
        esAdmin: localStorage.getItem('esAdmin') === 'true',
        rol: 'usuario'
      };
    }
  });

  useEffect(() => {
    const handleAdminToggle = (event) => {
      setAdminData({
        esAdmin: event.detail.esAdmin,
        rol: event.detail.rol
      });
    };

    window.addEventListener('adminToggle', handleAdminToggle);
    
    return () => {
      window.removeEventListener('adminToggle', handleAdminToggle);
    };
  }, []);

  return adminData;
};

// Función helper para configurar usuario de prueba como admin
export const configurarUsuarioAdminPrueba = (rol = 'administrador') => {
  const userData = {
    rol: rol,
    nombre: 'Admin Test',
    email: 'admin@ceija5.com',
    esAdmin: true
  };
  
  localStorage.setItem('esAdmin', 'true');
  localStorage.setItem('userData', JSON.stringify(userData));
  sessionStorage.setItem('userRole', rol);
  
  console.log('🔧 [configurarUsuarioAdminPrueba] Usuario admin configurado:', userData);
  
  // Recargar página para aplicar cambios
  window.location.reload();
};