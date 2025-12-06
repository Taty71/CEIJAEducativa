// ===================================================================
// UTILIDADES DE RUTAS MULTIPLATAFORMA (Windows/Linux/MacOS)
// ===================================================================

/**
 * Normaliza rutas para ser compatibles entre sistemas operativos
 * @param {string} path - Ruta a normalizar
 * @returns {string} - Ruta normalizada
 */
export const normalizePath = (path) => {
  if (!path) return '';
  
  // Convertir separadores de Windows (\) a Unix (/)
  return path.replace(/\\/g, '/');
};

/**
 * Une rutas de manera segura para cualquier OS
 * @param {...string} parts - Partes de la ruta
 * @returns {string} - Ruta unida y normalizada
 */
export const joinPaths = (...parts) => {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/') // Eliminar barras duplicadas
    .replace(/\\/g, '/'); // Normalizar separadores
};

/**
 * Obtiene el separador de rutas apropiado para el sistema
 * @returns {string} - Separador de rutas ('/' para Unix, '\' para Windows)
 */
export const getPathSeparator = () => {
  // En el navegador siempre usamos '/' para URLs y rutas web
  return '/';
};

/**
 * Verifica si una ruta es absoluta de manera cross-platform
 * @param {string} path - Ruta a verificar
 * @returns {boolean} - True si es absoluta
 */
export const isAbsolutePath = (path) => {
  if (!path) return false;
  
  // Windows: C:\ o D:\ etc.
  // Unix: /home/user etc.
  // Web: http:// o https://
  return /^([a-zA-Z]:\\|\/|https?:\/\/)/.test(path);
};

/**
 * Resuelve rutas relativas de manera segura
 * @param {string} basePath - Ruta base
 * @param {string} relativePath - Ruta relativa
 * @returns {string} - Ruta resuelta
 */
export const resolvePath = (basePath, relativePath) => {
  if (isAbsolutePath(relativePath)) {
    return normalizePath(relativePath);
  }
  
  return normalizePath(joinPaths(basePath, relativePath));
};

/**
 * Obtiene el nombre de archivo de una ruta
 * @param {string} path - Ruta completa
 * @returns {string} - Nombre del archivo
 */
export const getFileName = (path) => {
  if (!path) return '';
  
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} path - Ruta del archivo
 * @returns {string} - Extensión (incluye el punto)
 */
export const getFileExtension = (path) => {
  const fileName = getFileName(path);
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.substring(dotIndex) : '';
};

/**
 * Obtiene el directorio padre de una ruta
 * @param {string} path - Ruta completa
 * @returns {string} - Directorio padre
 */
export const getParentDirectory = (path) => {
  if (!path) return '';
  
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  parts.pop(); // Remover el último elemento
  return parts.join('/') || '/';
};