import { useState } from 'react';
import EjemploFormularioWeb from '../examples/EjemploFormularioWeb';
import { useAdmin, toggleAdminMode } from '../hooks/useAdmin';

const PaginaPruebaDomicilio = () => {
    const { esAdmin, loading } = useAdmin();
    const [mostrarEjemplo, setMostrarEjemplo] = useState(true);

    const handleToggleAdmin = () => {
        const newState = toggleAdminMode();
        alert(`Cambiado a modo: ${newState ? 'Administrador' : 'Usuario Normal'}`);
        // Recargar componentes
        window.location.reload();
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Cargando permisos de usuario...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '5px', 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div>
                    <h1>Prueba de Componentes de Domicilio</h1>
                    <p><strong>Modo actual:</strong> {esAdmin ? '👨‍💼 Administrador' : '👤 Usuario Normal'}</p>
                    <p><em>
                        {esAdmin 
                            ? 'Como admin, puedes agregar nuevas provincias, localidades y barrios' 
                            : 'Como usuario normal, solo puedes seleccionar opciones existentes'
                        }
                    </em></p>
                </div>
                <div>
                    <button 
                        onClick={handleToggleAdmin}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: esAdmin ? '#dc3545' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Cambiar a {esAdmin ? 'Usuario Normal' : 'Admin'}
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>
                    <input 
                        type="checkbox"
                        checked={mostrarEjemplo}
                        onChange={(e) => setMostrarEjemplo(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    Mostrar ejemplo de formulario web
                </label>
            </div>

            {mostrarEjemplo && (
                <div>
                    <EjemploFormularioWeb />
                </div>
            )}

            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                background: '#e9ecef', 
                borderRadius: '5px' 
            }}>
                <h3>Instrucciones de Uso:</h3>
                <ul>
                    <li><strong>Usuario Normal:</strong> Solo puede seleccionar de las opciones disponibles en los selects</li>
                    <li><strong>Administrador:</strong> Ve botones &quot;+&quot; junto a cada select para agregar nuevas opciones</li>
                    <li><strong>Funcionamiento:</strong> 
                        <ul>
                            <li>Selecciona una provincia → se cargan las localidades de esa provincia</li>
                            <li>Selecciona una localidad → se cargan los barrios de esa localidad</li>
                            <li>Como admin, puedes agregar provincias, localidades o barrios que no existan</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#fff3cd', 
                borderRadius: '5px',
                fontSize: '0.9em'
            }}>
                <strong>💡 Nota para desarrolladores:</strong> Este componente funciona tanto con Formik como sin él. 
                Para integrarlo en tu aplicación, simplemente importa <code>DomicilioWeb</code> o <code>Domicilio</code> 
                según tus necesidades.
            </div>
        </div>
    );
};

export default PaginaPruebaDomicilio;