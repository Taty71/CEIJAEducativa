# 🚨 AlertaMens - Sistema Unificado de Alertas

Sistema completo de alertas que combina `AlertaMens` y `AlertSystem` en un solo componente, con múltiples modos de funcionamiento y un hook personalizado para facilitar su uso.

## 📋 Características

- ✅ **Retrocompatible** con la versión anterior de AlertaMens
- ✅ **Alertas flotantes** en esquina superior derecha con auto-cierre
- ✅ **Modales de confirmación** con botones de acción
- ✅ **Alertas de carga** con animación y barra de progreso
- ✅ **Hook personalizado** (`useAlerts`) para manejo fácil
- ✅ **Múltiples tipos**: info, success, error, warning, loading
- ✅ **Responsive** y compatible con móviles
- ✅ **Animaciones suaves** de entrada y salida

## 🚀 Uso Rápido

### 1. Con Hook useAlerts (Recomendado)

```jsx
import { useAlerts } from "../hooks/useAlerts";
import AlertaMens from "../components/AlertaMens";

const MiComponente = () => {
  const {
    alerts,
    modal,
    showSuccess,
    showError,
    showConfirmModal,
    removeAlert,
    closeModal,
  } = useAlerts();

  const handleGuardar = () => {
    showSuccess("¡Datos guardados correctamente!");
  };

  const handleEliminar = () => {
    showConfirmModal(
      "¿Está seguro de eliminar este elemento?",
      () => {
        // Lógica de eliminación
        showSuccess("Elemento eliminado");
      },
      () => {
        showInfo("Eliminación cancelada");
      }
    );
  };

  return (
    <>
      <button onClick={handleGuardar}>Guardar</button>
      <button onClick={handleEliminar}>Eliminar</button>

      {/* Renderizar sistema de alertas */}
      <AlertaMens
        mode="floating"
        alerts={alerts}
        modal={modal}
        onCloseAlert={removeAlert}
        onCloseModal={closeModal}
      />
    </>
  );
};
```

### 2. Modo Simple (Legacy - Retrocompatible)

```jsx
import AlertaMens from "../components/AlertaMens";

// Uso tradicional, funcional para código existente
<AlertaMens
  text="¡Operación exitosa!"
  variant="success"
  duration={3000}
  onClose={() => console.log("Alerta cerrada")}
/>;
```

### 3. Modo Manual (Sin Hook)

```jsx
const [alerts, setAlerts] = useState([]);
const [modal, setModal] = useState(null);

const addAlert = (type, message) => {
  setAlerts((prev) => [...prev, { type, message }]);
};

const removeAlert = (index) => {
  setAlerts((prev) => prev.filter((_, i) => i !== index));
};

// Renderizar
<AlertaMens
  mode="floating"
  alerts={alerts}
  modal={modal}
  onCloseAlert={removeAlert}
  onCloseModal={() => setModal(null)}
/>;
```

## 🎯 API del Hook useAlerts

### Funciones para Alertas Flotantes

```jsx
const {
  showSuccess, // (message, duration?) => void
  showError, // (message, duration?) => void
  showWarning, // (message, duration?) => void
  showInfo, // (message, duration?) => void
  showLoading, // (message) => void (sin auto-cierre)
  hideLoading, // () => void
  removeAlert, // (index) => void
  clearAlerts, // () => void
} = useAlerts();
```

### Funciones para Modales

```jsx
const {
  showConfirmModal, // (message, onConfirm, onCancel) => Promise<boolean>
  closeModal, // () => void
  confirmAction, // (message) => Promise<boolean>
} = useAlerts();
```

### Funciones Utilitarias

```jsx
const {
  handleApiResponse, // (response, successMessage?) => boolean
  handleValidationErrors, // (errors) => void
} = useAlerts();

// Ejemplo de uso con API
const resultado = await fetch("/api/datos");
const response = await resultado.json();

if (handleApiResponse(response, "Datos actualizados correctamente")) {
  // Éxito - se mostró alerta de éxito automáticamente
} else {
  // Error - se mostró alerta de error automáticamente
}
```

## 🎨 Props del Componente AlertaMens

### Modo Simple (Legacy)

```jsx
AlertaMens.propTypes = {
  text: PropTypes.string, // Mensaje a mostrar
  variant: PropTypes.oneOf(["info", "success", "error", "warning"]), // Tipo de alerta
  duration: PropTypes.number, // Duración en ms (default: 4000)
  onClose: PropTypes.func, // Callback al cerrar
};
```

### Modo Floating/Modal

```jsx
AlertaMens.propTypes = {
  mode: PropTypes.oneOf(["simple", "floating", "modal"]), // Modo de funcionamiento
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      // Array de alertas flotantes
      type: PropTypes.oneOf(["success", "error", "warning", "info", "loading"])
        .isRequired,
      message: PropTypes.string.isRequired,
    })
  ),
  modal: PropTypes.shape({
    // Modal de confirmación
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
  }),
  onCloseAlert: PropTypes.func, // Función para cerrar alerta flotante
  onCloseModal: PropTypes.func, // Función para cerrar modal
};
```

## 🎯 Ejemplos de Uso Avanzado

### Operación Asíncrona con Loading

```jsx
const handleOperacionAsincrona = async () => {
  // Mostrar loading
  showLoading("Guardando datos...");

  try {
    const response = await fetch("/api/guardar", {
      method: "POST",
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    // Ocultar loading
    hideLoading();

    // Mostrar resultado
    if (resultado.success) {
      showSuccess("¡Datos guardados correctamente!");
    } else {
      showError(resultado.message || "Error al guardar");
    }
  } catch (error) {
    hideLoading();
    showError("Error de conexión");
  }
};
```

### Confirmación con Promesa

```jsx
const handleEliminar = async () => {
  const confirmacion = await confirmAction(
    "¿Eliminar elemento permanentemente?"
  );

  if (confirmacion) {
    // Usuario confirmó
    await eliminarElemento();
    showSuccess("Elemento eliminado");
  } else {
    // Usuario canceló
    showInfo("Eliminación cancelada");
  }
};
```

### Manejo de Errores de Validación

```jsx
const handleSubmit = async (formData) => {
  try {
    const response = await fetch("/api/validar", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    const resultado = await response.json();

    if (resultado.errors) {
      // Mostrar errores de validación automáticamente
      handleValidationErrors(resultado.errors);
    } else {
      showSuccess("Formulario enviado correctamente");
    }
  } catch (error) {
    showError("Error del servidor");
  }
};
```

## 🎨 Estilos y Personalización

El sistema incluye estilos CSS completos en `alertaMens.css` que cubren:

- **Alertas simples** (.alerta-mens, .alerta-info, .alerta-success, etc.)
- **Alertas flotantes** (.alert-container, .alert-overlay)
- **Modales** (.modal-overlay, .modal-container)
- **Animaciones** (slideInFromRight, modalSlideIn, loading)
- **Responsive design** (breakpoints para móvil)

### Personalizar Colores

```css
/* Personalizar colores de tipos de alerta */
.alert-container.success {
  border-left-color: #28a745; /* Verde personalizado */
}

.alert-container.error {
  border-left-color: #dc3545; /* Rojo personalizado */
}
```

## 📱 Responsive

El sistema es completamente responsive:

- **Desktop**: Alertas flotantes en esquina superior derecha
- **Móvil**: Alertas ocupan todo el ancho disponible
- **Modal**: Se adapta al tamaño de pantalla automáticamente

## 🔧 Migración desde AlertSystem

Si ya usabas `AlertSystem`, la migración es sencilla:

```jsx
// Antes (AlertSystem)
import AlertSystem from "./AlertSystem";

<AlertSystem
  alerts={alerts}
  modal={modal}
  onCloseAlert={removeAlert}
  onCloseModal={closeModal}
/>;

// Después (AlertaMens unificado)
import AlertaMens from "./AlertaMens";

<AlertaMens
  mode="floating"
  alerts={alerts}
  modal={modal}
  onCloseAlert={removeAlert}
  onCloseModal={closeModal}
/>;
```

## 🚀 Ventajas del Sistema Unificado

1. **Un solo componente** para todas las necesidades de alertas
2. **Hook personalizado** simplifica el manejo de estado
3. **Retrocompatible** con código existente
4. **Mejor DX** (Developer Experience) con funciones intuitivas
5. **Menor bundle size** al consolidar componentes
6. **Mantenimiento simplificado** en un solo lugar

---

## 📝 Notas de Implementación

- El hook `useAlerts` maneja automáticamente el estado de las alertas
- Las alertas de loading no se cierran automáticamente (usar `hideLoading()`)
- Los modales bloquean la interacción con el resto de la página
- Las animaciones mejoran la UX sin impactar rendimiento
- Compatible con sistemas de estado global (Redux, Zustand, etc.)

¡Disfruta del sistema unificado de alertas! 🎉
