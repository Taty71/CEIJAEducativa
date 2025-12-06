# Registros Pendientes - Estructura Refactorizada

## Resumen

El módulo `registrosPendientes.js` ha sido refactorizado en componentes más pequeños y manejables para mejorar la mantenibilidad, legibilidad y testabilidad del código.

## Estructura de Archivos

```
services/registrosPendientes/
├── index.js                 # Módulo principal con exports consolidados
├── config.js                # Configuración de multer y constantes
├── fileManager.js           # Gestión de archivos y migración
├── documentValidator.js     # Validación de documentos universal
├── databaseManager.js       # Operaciones de base de datos
└── controllers.js           # Controladores de endpoints HTTP
```

## Componentes

### 1. **config.js** - Configuración y Constantes

- **Responsabilidad**: Configuración de multer para subida de archivos y rutas de directorios
- **Exports**: `REGISTROS_PENDIENTES_PATH`, `ARCHIVOS_PENDIENTES_PATH`, `ARCHIVOS_DOCUMENTO_PATH`, `upload`
- **Funcionalidades**:
  - Configuración de almacenamiento de multer en `archivosPendientes/`
  - Generación automática de nombres de archivo: `{nombre}_{apellido}_{dni}_{campo}.{ext}`
  - Logging de archivos guardados

### 2. **fileManager.js** - Gestión de Archivos

- **Responsabilidad**: Operaciones de archivos y migración entre carpetas
- **Exports**: `ensureFileExists`, `leerRegistrosPendientes`, `guardarRegistrosPendientes`, `migrarArchivo`, `detectarArchivosDisponibles`, `migrarArchivosRegistro`
- **Funcionalidades**:
  - Lectura/escritura del archivo JSON de registros
  - Detección automática de archivos en `archivosPendientes/`
  - Migración atómica de archivos de `archivosPendientes/` a `archivosDocumento/`
  - Manejo de errores y cleanup

### 3. **documentValidator.js** - Validación de Documentos

- **Responsabilidad**: Lógica de validación universal de documentación
- **Exports**: `validarDocumentacion`, `generarMensajePendiente`
- **Funcionalidades**:
  - Validación de documentos básicos (5 documentos obligatorios)
  - Lógica universal para diferentes modalidades (Presencial/Semipresencial) y planes (1-6)
  - Casos fallback para combinaciones no especificadas
  - Generación de mensajes informativos para registros pendientes

### 4. **databaseManager.js** - Gestión de Base de Datos

- **Responsabilidad**: Operaciones de base de datos e inserción completa
- **Exports**: `insertarEstudianteCompleto`, `verificarEstudianteExistente`, `procesarUbicaciones`
- **Funcionalidades**:
  - Inserción transaccional en 3 tablas: `estudiantes`, `domicilios`, `archivos_estudiantes`
  - Procesamiento de ubicaciones geográficas
  - Verificación de duplicados
  - Creación de inscripciones y detalles

### 5. **controllers.js** - Controladores HTTP

- **Responsabilidad**: Lógica de negocio para endpoints HTTP
- **Exports**: `obtenerTodosLosRegistros`, `obtenerRegistroPorDni`, `crearRegistroPendiente`, `actualizarRegistroPendiente`, `eliminarRegistroPendiente`, `obtenerEstadisticas`, `procesarRegistroPendiente`
- **Funcionalidades**:
  - CRUD completo para registros pendientes
  - Procesamiento integral de registros con validación y migración
  - Generación de estadísticas
  - Manejo de errores HTTP apropiado

### 6. **routes/registrosPendientes.js** - Router Principal

- **Responsabilidad**: Definición de rutas HTTP únicamente
- **Funcionalidades**:
  - Definición limpia de endpoints
  - Importación de controladores modularizados
  - Configuración de middleware (multer)

## Flujo de Procesamiento

### Registro Nuevo (POST /)

1. **Validación** de datos básicos
2. **Verificación** de duplicados
3. **Almacenamiento** de archivos en `archivosPendientes/`
4. **Creación** del registro con estado `PENDIENTE`

### Procesamiento (POST /procesar)

1. **Búsqueda** del registro por DNI
2. **Verificación** de estudiante existente en BD
3. **Detección** de archivos disponibles
4. **Validación** universal de documentación
5. **Migración** de archivos a `archivosDocumento/`
6. **Inserción** completa en base de datos
7. **Actualización** del estado a `PROCESADO`

## Validación Universal de Documentos

### Documentos Básicos (5 obligatorios)

- `foto` - Fotografía
- `archivo_dni` - DNI
- `archivo_cuil` - CUIL
- `archivo_partidaNacimiento` - Partida de Nacimiento
- `archivo_fichaMedica` - Ficha Médica CUS

### Documentos Adicionales por Modalidad

#### Presencial (modalidadId = 1)

- **Plan 1**: Certificado de Nivel Primario OR Solicitud de Pase
- **Plan 2/3**: Analítico Parcial OR Solicitud de Pase
- **Otros planes**: Solo documentos básicos (fallback)

#### Semipresencial (modalidadId = 2)

- **Plan 4**: Certificado de Nivel Primario
- **Plan 5/6**: Analítico Parcial
- **Otros planes**: Solo documentos básicos (fallback)

#### Modalidades Desconocidas

- **Fallback**: Solo documentos básicos

## Estados de Registro

- **PENDIENTE**: Documentación incompleta o registro inicial
- **PROCESADO**: Documentación completa, migrado a BD y archivos finales

## Ventajas de la Refactorización

### ✅ **Mantenibilidad**

- Cada módulo tiene una responsabilidad específica
- Fácil localización y modificación de funcionalidades
- Código más legible y documentado

### ✅ **Testabilidad**

- Funciones puras exportadas individualmente
- Separación de lógica de negocio y HTTP
- Mocking más sencillo para pruebas unitarias

### ✅ **Reutilización**

- Servicios pueden ser importados desde otros módulos
- Validadores y gestores de archivos reutilizables
- Lógica de BD separada del contexto HTTP

### ✅ **Escalabilidad**

- Estructura modular permite expansión sencilla
- Nuevas validaciones o tipos de archivo fáciles de agregar
- Separación clara entre capas de la aplicación

### ✅ **Debugging**

- Logging estructurado con emojis identificativos
- Errores contextualizados por módulo
- Trazabilidad clara del flujo de datos

## Migración desde Versión Anterior

El archivo original de 1162 líneas se ha dividido en:

- **config.js**: 31 líneas
- **fileManager.js**: 128 líneas
- **documentValidator.js**: 121 líneas
- **databaseManager.js**: 123 líneas
- **controllers.js**: 308 líneas
- **routes/registrosPendientes.js**: 45 líneas

**Total**: ~756 líneas distribuidas + mejor organización

## Uso

```javascript
// Importar servicios específicos
const {
  validarDocumentacion,
} = require("../services/registrosPendientes/documentValidator");
const {
  migrarArchivo,
} = require("../services/registrosPendientes/fileManager");

// O importar todo desde el índice
const registrosPendientesService = require("../services/registrosPendientes");
```

---

**Fecha de creación**: 1 de noviembre de 2025  
**Autor**: GitHub Copilot  
**Versión**: 1.0.0
