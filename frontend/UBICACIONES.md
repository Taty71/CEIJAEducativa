# Componentes de Ubicación

Este documento explica cómo usar los componentes de ubicación (Provincia, Localidad, Barrio) con selects dinámicos.

## Estructura de archivos

- `src/components/SelectUbicacion.jsx` - Componente select reutilizable
- `src/components/Domicilio.jsx` - Formulario de domicilio (compatible con/sin Formik)
- `src/components/DomicilioWeb.jsx` - Componente específico para formularios web
- `src/components/DomicilioEditor.jsx` - Editor de domicilio actualizado
- `src/hooks/useAdmin.js` - Hook para manejo de permisos de admin
- `src/estilos/SelectUbicacion.css` - Estilos para los selects
- `src/estilos/formularioWeb.css` - Estilos para formularios web
- `src/examples/EjemploFormularioWeb.jsx` - Ejemplo completo sin Formik
- `src/pages/PaginaPruebaDomicilio.jsx` - Página de pruebas

## Uso Básico

### 1. En un formulario con Formik

```jsx
import { Formik, Form } from "formik";
import { Domicilio } from "../components/Domicilio";
import { useAdmin } from "../hooks/useAdmin";

const MiFormulario = () => {
  const { esAdmin } = useAdmin();

  return (
    <Formik
      initialValues={{
        calle: "",
        numero: "",
        barrio: "",
        localidad: "",
        provincia: "",
      }}
      onSubmit={(values) => {
        // Los valores contendrán los IDs de barrio, localidad y provincia
        console.log(values);
      }}
    >
      <Form>
        <Domicilio esAdmin={esAdmin} />
        <button type="submit">Enviar</button>
      </Form>
    </Formik>
  );
};
```

### 2. Para formularios web (sin Formik)

```jsx
import DomicilioWeb from "../components/DomicilioWeb";

const MiFormularioWeb = () => {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    domicilio: {},
  });

  const handleDomicilioChange = (datosDomicilio) => {
    setDatosFormulario((prev) => ({
      ...prev,
      domicilio: datosDomicilio,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DomicilioWeb
        onDomicilioChange={handleDomicilioChange}
        valoresIniciales={datosFormulario.domicilio}
      />
      <button type="submit">Enviar</button>
    </form>
  );
};
```

### 3. Uso directo del SelectUbicacion

```jsx
import SelectUbicacion from '../components/SelectUbicacion';

const [provincia, setProvincia] = useState('');
const [localidad, setLocalidad] = useState('');
const [barrio, setBarrio] = useState('');

// Para provincias
<SelectUbicacion
  tipo="provincia"
  name="provincia"
  value={provincia}
  onChange={(e) => setProvincia(e.target.value)}
  esAdmin={true} // Solo admins pueden agregar
/>

// Para localidades (depende de provincia)
<SelectUbicacion
  tipo="localidad"
  name="localidad"
  value={localidad}
  onChange={(e) => setLocalidad(e.target.value)}
  dependeDe="provincia"
  valorDependencia={provincia}
  esAdmin={true}
/>

// Para barrios (depende de localidad)
<SelectUbicacion
  tipo="barrio"
  name="barrio"
  value={barrio}
  onChange={(e) => setBarrio(e.target.value)}
  dependeDe="localidad"
  valorDependencia={localidad}
  esAdmin={true}
/>
```

## Funcionalidades

### Para Usuarios Normales

- Pueden seleccionar únicamente de las opciones existentes en la base de datos
- Los selects se cargan dinámicamente (localidades según provincia, barrios según localidad)

### Para Administradores

- Todas las funcionalidades de usuarios normales
- Botón "+" junto a cada select para agregar nuevas opciones
- Pueden crear nuevas provincias, localidades y barrios en tiempo real
- Las nuevas opciones se agregan automáticamente a la lista y se seleccionan

## Configuración de Administrador

### Método 1: Hook useAdmin (Recomendado)

```jsx
import { useAdmin } from "../hooks/useAdmin";

const MiComponente = () => {
  const { esAdmin, loading } = useAdmin();

  if (loading) return <div>Cargando...</div>;

  return <Domicilio esAdmin={esAdmin} />;
};
```

### Método 2: Prop directa

```jsx
<Domicilio esAdmin={true} />
<DomicilioEditor esAdmin={true} {...otrosProps} />
```

## API Backend

Los componentes consumen las siguientes rutas:

- `GET /api/ubicaciones/provincias` - Obtener todas las provincias
- `GET /api/ubicaciones/localidades/:idProvincia` - Obtener localidades por provincia
- `GET /api/ubicaciones/barrios/:idLocalidad` - Obtener barrios por localidad
- `POST /api/ubicaciones/provincias` - Crear nueva provincia (solo admin)
- `POST /api/ubicaciones/localidades` - Crear nueva localidad (solo admin)
- `POST /api/ubicaciones/barrios` - Crear nuevo barrio (solo admin)

## Valores del Formulario

Los componentes trabajan con **IDs numéricos**:

- `provincia`: ID de la provincia seleccionada
- `localidad`: ID de la localidad seleccionada
- `barrio`: ID del barrio seleccionado

Las utilidades del backend (`buscarOInsertarProvincia`, etc.) se actualizaron para manejar tanto IDs como nombres para compatibilidad con datos existentes.

## Testing

Para probar el modo admin durante el desarrollo:

```javascript
// En la consola del navegador
localStorage.setItem("esAdmin", "true"); // Activar modo admin
localStorage.setItem("esAdmin", "false"); // Desactivar modo admin
window.location.reload(); // Recargar página
```

O usar el botón de prueba en el componente de ejemplo.

## SOLUCIÓN para Formularios Web

### Problema Resuelto: Formularios sin Formik

Si experimentas problemas cargando el formulario como usuario web, ahora tienes dos opciones:

#### Opción 1: Usar DomicilioWeb (Recomendado)

```jsx
import DomicilioWeb from "../components/DomicilioWeb";

// Componente específico para formularios web sin Formik
<DomicilioWeb
  onDomicilioChange={(datos) => console.log(datos)}
  valoresIniciales={{
    calle: "",
    numero: "",
    provincia: "",
    localidad: "",
    barrio: "",
  }}
/>;
```

#### Opción 2: Usar Domicilio con usarFormik=false

```jsx
import { Domicilio } from "../components/Domicilio";

// Componente flexible que detecta automáticamente si está en contexto Formik
<Domicilio
  esAdmin={false}
  usarFormik={false}
  valores={{ calle: "", numero: "", provincia: "", localidad: "", barrio: "" }}
  onCambio={(datos) => console.log(datos)}
/>;
```

### Página de Pruebas

Para probar todas las funcionalidades, revisa:

- `src/pages/PaginaPruebaDomicilio.jsx` - Página completa de pruebas
- `src/examples/EjemploFormularioWeb.jsx` - Ejemplo funcional sin Formik

### Características Adicionales

✅ **Detección automática de contexto**: El componente detecta si está dentro de Formik
✅ **Compatibilidad total**: Funciona con y sin Formik
✅ **Estado local**: Maneja su propio estado cuando no usa Formik
✅ **Callbacks**: Notifica cambios al componente padre
✅ **Estilos responsivos**: Funciona en móviles y desktop
✅ **Toggle admin en vivo**: Cambia permisos sin recargar página
