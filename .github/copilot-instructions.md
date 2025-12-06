# Instrucciones Copilot para CEIJA5Educativa

## Visión General

Este repositorio implementa un sistema de gestión educativa full-stack con backend Node.js (`proyectoCEIJA5/`) y frontend React + Vite (`frontend/`). Administra registros de estudiantes, flujos de documentos, reportes y notificaciones por email.

## Arquitectura

- **Backend (`proyectoCEIJA5/`)**: Servidor Node.js/Express, scripts personalizados para datos, emails y gestión de archivos. Archivos clave:
  - `server.js`: Punto de entrada principal, configura rutas y middleware Express.
  - `db.js`: Lógica de conexión a base de datos (probablemente PostgreSQL o MySQL, ver `BASE DATOS/`).
  - `routes/`, `services/`, `middleware/`: Estructura Express estándar para endpoints API, lógica de negocio y procesamiento de requests.
  - `archivosDocumento/`, `archivosDocWeb/`, `archivosPendientes/`: Almacenamiento y procesamiento de archivos/documentos.
  - `start-backend.bat`: Script batch para iniciar el backend (solo Windows).
- **Frontend (`frontend/`)**: App React creada con Vite. Estructura modular, especialmente para UIs complejas (ver `src/components/registrosPendientes/`).
  - `index.html`, `src/`, `public/`: Estructura estándar Vite/React.
  - `src/components/registrosPendientes/`: Ejemplo de modularización profunda para mantenibilidad (ver README local para detalles y estructura).

## Flujos de Trabajo para Desarrolladores

- **Iniciar backend**: Ejecutar `start-backend.bat` desde `proyectoCEIJA5/` (solo Windows).
- **Iniciar frontend**: Desde `frontend/`, usar `npm install` y luego `npm run dev` (servidor Vite).
- **Base de datos**: Scripts SQL en `BASE DATOS/` para crear y poblar el esquema. Usar un RDBMS compatible (probablemente PostgreSQL o MySQL).
- **Testing/debug**: Scripts personalizados como `test-connection.js`, `debug-eliminacion.js` en backend para diagnóstico. No se detecta framework formal de testing.

## Patrones y Convenciones Específicas del Proyecto

- **Modularización frontend**: Componentes grandes (ej: `ModalRegistrosPendientes`) se dividen en subcomponentes enfocados para claridad y testeo. Ver `frontend/src/components/registrosPendientes/README.md` para desglose detallado.
- **Organización de archivos**: Backups y código legado se preservan con sufijo `_Backup`. Archivos de datos y documentos agrupados por tipo.
- **Email/reportes**: Lógica de email y reportes en el backend, documentada en `CONFIGURACION_EMAIL.md` y `SISTEMA_EMAIL_README.md`.
- **Sin TypeScript**: Todo el código es JavaScript, aunque se sugiere migración en la documentación.

## Puntos de Integración

- **Base de datos**: Todos los datos persistentes mediante scripts SQL en `BASE DATOS/`.
- **Email**: Envío de emails desde scripts backend; ver `CONFIGURACION_EMAIL.md` para configuración.
- **Subida de archivos**: Gestionada en backend en `archivosDocumento/` y carpetas relacionadas.

## Ejemplos

- Para agregar un nuevo tipo de documento, actualizar SQL en `BASE DATOS/`, lógica backend en `proyectoCEIJA5/services/` y UI frontend en `src/components/`.
- Para depurar la eliminación de registros pendientes, usar `debug-eliminacion.js` y consultar `ELIMINACION_AUTOMATICA_REGISTROS_PENDIENTES.md`.

## Referencias

- Ver `frontend/src/components/registrosPendientes/README.md` para patrones de UI modular.
- Ver archivos markdown en backend para configuración y troubleshooting de email/reportes.

---

Ante dudas o flujos poco claros, revisar los README/MD locales o pedir aclaración.
