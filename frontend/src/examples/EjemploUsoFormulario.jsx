import { Formik, Form } from 'formik';
import { Domicilio } from '../components/Domicilio';
import { useAdmin, toggleAdminMode } from '../hooks/useAdmin';
import '../estilos/SelectUbicacion.css';
import '../estilos/ModalAgregarBarrio.css';

/**
 * COMPONENTE DE TESTING Y DEMOSTRACIÓN
 * ====================================
 * 
 * Este componente es para DESARROLLO y TESTING únicamente.
 * 
 * Propósitos:
 * 1. 🧪 Testing: Permite probar el componente Domicilio fácilmente
 * 2. 📚 Demostración: Muestra cómo usar el componente con Formik
 * 3. 🔧 Debugging: Incluye controles para alternar permisos
 * 4. 📖 Documentación: Sirve como ejemplo de implementación
 * 
 * Para usar en producción:
 * - Eliminar el botón de testing
 * - Usar permisos reales del usuario logueado
 * - Integrar en el formulario real de la aplicación
 */
const EjemploUsoFormulario = () => {
  const { esAdmin, loading } = useAdmin();
  
  // Verificar si puede agregar ubicaciones (solo admin, coordinador, secretario)
  const puedeAgregarUbicaciones = esAdmin?.esAdmin === true;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>⏳ Cargando permisos de usuario...</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Verificando rol de usuario para mostrar opciones apropiadas
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#495057' }}>
          🧪 Ejemplo de Formulario con Ubicaciones (Testing)
        </h2>
        <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
          Componente para testing y demostración del sistema de ubicaciones con permisos.
        </p>
      </div>
      
      {/* Panel de Control de Testing - ELIMINAR EN PRODUCCIÓN */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>
          🔧 Controles de Testing
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <button 
            onClick={toggleAdminMode}
            style={{
              padding: '8px 16px',
              backgroundColor: puedeAgregarUbicaciones ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {puedeAgregarUbicaciones ? '🔒 Cambiar a Usuario Normal' : '🔓 Cambiar a Admin'}
          </button>
          
          <div style={{
            padding: '5px 10px',
            backgroundColor: puedeAgregarUbicaciones ? '#d4edda' : '#f8d7da',
            color: puedeAgregarUbicaciones ? '#155724' : '#721c24',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {puedeAgregarUbicaciones ? '✅ Admin Mode' : '❌ User Mode'}
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#856404' }}>
          <strong>Usuario actual:</strong> {esAdmin?.rol || 'No definido'} | 
          <strong> Puede agregar ubicaciones:</strong> {puedeAgregarUbicaciones ? 'Sí' : 'No'}
          {puedeAgregarUbicaciones && (
            <span style={{ marginLeft: '10px' }}>
              ➕ Verás botones para agregar provincia, localidad y barrio
            </span>
          )}
        </div>
      </div>
      
      {/* Formulario Real */}
      <Formik
        initialValues={{
          calle: '',
          numero: '',
          barrio: '',
          localidad: '',
          provincia: ''
        }}
        onSubmit={(values, { setSubmitting }) => {
          console.log('📋 Valores del formulario enviados:', values);
          
          // Simular envío
          setTimeout(() => {
            alert(`Formulario enviado correctamente!\n\nDatos:\n${JSON.stringify(values, null, 2)}`);
            setSubmitting(false);
          }, 1000);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <Domicilio esAdmin={puedeAgregarUbicaciones} />
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {isSubmitting ? '📤 Enviando...' : '📋 Enviar Formulario'}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      
      {/* Información de desarrollo */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e9ecef',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#495057'
      }}>
        <strong>📝 Nota para desarrolladores:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Este componente es solo para testing y desarrollo</li>
          <li>En producción, usar permisos reales del sistema de autenticación</li>
          <li>Los estilos están en <code>ModalAgregarBarrio.css</code></li>
          <li>El hook <code>useAdmin</code> maneja los permisos automáticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default EjemploUsoFormulario;