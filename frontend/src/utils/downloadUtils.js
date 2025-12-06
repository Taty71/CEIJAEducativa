// ===================================================================
// UTILIDADES DE DESCARGA MULTIPLATAFORMA
// Compatibilidad con Windows, Linux, macOS y navegadores web
// ===================================================================

import { getFileName, getFileExtension } from './pathUtils.js';

/**
 * Detecta el sistema operativo desde el navegador
 * @returns {string} - 'windows' | 'linux' | 'macos' | 'unknown'
 */
export const detectOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  if (userAgent.includes('mac')) return 'macos';
  
  return 'unknown';
};

/**
 * Sanitiza nombres de archivo para ser compatibles cross-platform
 * @param {string} filename - Nombre de archivo original
 * @returns {string} - Nombre sanitizado
 */
export const sanitizeFileName = (filename) => {
  if (!filename) return 'documento';
  
  // Caracteres problemáticos en diferentes sistemas
  const invalidChars = /[<>:"/\\|?*]/g;
  
  // Reemplazar caracteres inválidos con guiones
  let sanitized = filename.replace(invalidChars, '-');
  
  // Eliminar espacios al inicio/final y reemplazar espacios múltiples
  sanitized = sanitized.trim().replace(/\s+/g, '_');
  
  // Evitar nombres reservados en Windows
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = getFileName(sanitized).split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    sanitized = `documento_${sanitized}`;
  }
  
  // Limitar longitud (255 chars es el máximo en la mayoría de sistemas)
  if (sanitized.length > 200) {
    const ext = getFileExtension(sanitized);
    const nameOnly = sanitized.substring(0, 200 - ext.length);
    sanitized = nameOnly + ext;
  }
  
  return sanitized;
};

/**
 * Descarga un archivo de manera compatible cross-platform
 * @param {Blob|string} content - Contenido del archivo o URL
 * @param {string} filename - Nombre del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 */
export const downloadFile = (content, filename, mimeType = 'application/octet-stream') => {
  const sanitizedFilename = sanitizeFileName(filename);
  
  try {
    let blob;
    
    // Si el contenido es una URL, crear un enlace directo
    if (typeof content === 'string' && (content.startsWith('http') || content.startsWith('data:'))) {
      const link = document.createElement('a');
      link.href = content;
      link.download = sanitizedFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Si el contenido es un Blob
    if (content instanceof Blob) {
      blob = content;
    } else {
      // Convertir string a Blob
      blob = new Blob([content], { type: mimeType });
    }
    
    // Verificar soporte para download
    if (typeof window !== 'undefined') {
      // Navegador moderno con soporte para download
      if ('download' in document.createElement('a')) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = sanitizedFilename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL después de un tiempo para liberar memoria
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
      } else {
        // Fallback para navegadores antiguos
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }
    }
    
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    
    // Fallback: mostrar el contenido en una nueva ventana
    if (typeof content === 'string') {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`<pre>${content}</pre>`);
        newWindow.document.title = sanitizedFilename;
      }
    }
    
    throw new Error(`Error al descargar: ${error.message}`);
  }
};

/**
 * Crea un timestamp para nombres de archivo
 * @param {Date} date - Fecha a usar (opcional)
 * @returns {string} - Timestamp en formato YYYY-MM-DD
 */
export const createTimestamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Genera un nombre de archivo único con timestamp
 * @param {string} baseName - Nombre base del archivo
 * @param {string} extension - Extensión del archivo (sin punto)
 * @param {boolean} includeTime - Incluir hora en el timestamp
 * @returns {string} - Nombre de archivo único
 */
export const generateUniqueFileName = (baseName, extension, includeTime = false) => {
  const sanitizedBase = sanitizeFileName(baseName);
  const timestamp = createTimestamp();
  
  let filename = `${sanitizedBase}_${timestamp}`;
  
  if (includeTime) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    filename += `_${hours}${minutes}`;
  }
  
  return `${filename}.${extension}`;
};

/**
 * Verifica si el navegador soporta descargas
 * @returns {boolean} - True si soporta descargas
 */
export const supportsDownload = () => {
  return typeof window !== 'undefined' && 
         'download' in document.createElement('a') &&
         typeof window.URL !== 'undefined' &&
         typeof window.URL.createObjectURL === 'function';
};