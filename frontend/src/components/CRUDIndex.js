/**
 * Índice de componentes CRUD refactorizados
 * 
 * Estructura de la refactorización:
 * 
 * 1. GestionCRUDContenidoRefactored.jsx - Componente principal simplificado
 * 2. crud/CRUDHandlers.js - Hook personalizado con toda la lógica de handlers
 * 3. crud/CRUDRouterSwitch.jsx - Componente que maneja el router/switch de vistas
 * 4. crud/CRUDModalidadProvider.jsx - Proveedor de contexto para modalidad
 * 5. crud/CRUDModalidadContext.js - Contexto de modalidad
 * 6. crud/useCRUDModalidad.js - Hook para usar el contexto de modalidad
 * 
 * Beneficios de esta refactorización:
 * - Separación de responsabilidades
 * - Código más mantenible y testeable
 * - Reutilización de lógica
 * - Componentes más pequeños y enfocados
 * - Mejor organización del código
 */

// Exportaciones principales
export { default as GestionCRUDContenidoRefactored } from './GestionCRUDContenidoRefactored';

// Exportaciones de componentes CRUD
export { default as CRUDRouterSwitch } from './crud/CRUDRouterSwitch';
export { CRUDModalidadProvider } from './crud/CRUDModalidadProvider';

// Exportaciones de hooks y contextos
export { useCRUDHandlers } from './crud/CRUDHandlers';
export { useCRUDModalidad } from './crud/useCRUDModalidad';
export { CRUDModalidadContext } from './crud/CRUDModalidadContext';

// Documentación de uso:
/*
Para usar el componente refactorizado, simplemente reemplaza:

// Antes:
import GestionCRUDContenido from './components/GestionCRUDContenido';

// Después:
import { GestionCRUDContenidoRefactored as GestionCRUDContenido } from './components/CRUDIndex';

Todos los props y la funcionalidad siguen siendo exactamente los mismos.
*/