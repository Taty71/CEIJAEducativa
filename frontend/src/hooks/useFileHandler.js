import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejo de archivos
 */
export const useFileHandler = () => {
    const [uploadProgress, setUploadProgress] = useState({});
    const [fileErrors, setFileErrors] = useState({});

    // Tipos de archivo permitidos
    const allowedTypes = useMemo(() => ({
        foto: ['image/jpeg', 'image/jpg', 'image/png'],
        documento: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    }), []);

    // Tamaños máximos (en bytes)
    const maxSizes = useMemo(() => ({
        foto: 5 * 1024 * 1024, // 5MB
        documento: 10 * 1024 * 1024 // 10MB
    }), []);

    // Validar archivo
    const validateFile = useCallback((file, type) => {
        const errors = [];

        if (!file) {
            return { isValid: true, errors: [] };
        }

        // Validar tipo
        if (allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
            errors.push(`Tipo de archivo no permitido. Use: ${allowedTypes[type].join(', ')}`);
        }

        // Validar tamaño
        if (maxSizes[type] && file.size > maxSizes[type]) {
            const maxSizeMB = maxSizes[type] / (1024 * 1024);
            errors.push(`Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
        }

        // Validar nombre del archivo
        if (file.name.length > 255) {
            errors.push('Nombre del archivo demasiado largo');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [allowedTypes, maxSizes]);

    // Manejar selección de archivo
    const handleFileSelect = useCallback((file, fieldName, setFieldValue, type = 'documento') => {
        const validation = validateFile(file, type);
        
        if (!validation.isValid) {
            setFileErrors(prev => ({
                ...prev,
                [fieldName]: validation.errors
            }));
            return false;
        }

        // Limpiar errores previos
        setFileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });

        // Actualizar el campo en Formik
        setFieldValue(fieldName, file);
        
        return true;
    }, [validateFile]);

    // Generar preview de imagen
    const generatePreview = useCallback((file) => {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }, []);

    // Limpiar archivo
    const clearFile = useCallback((fieldName, setFieldValue) => {
        setFieldValue(fieldName, null);
        
        // Limpiar errores
        setFileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });

        // Limpiar progreso
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fieldName];
            return newProgress;
        });
    }, []);

    // Obtener información del archivo
    const getFileInfo = useCallback((file) => {
        if (!file) return null;

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            sizeFormatted: formatFileSize(file.size),
            extension: file.name.split('.').pop()?.toLowerCase() || 'sin extensión'
        };
    }, []);

    // Formatear tamaño de archivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Simular progreso de subida
    const simulateUploadProgress = useCallback((fieldName, duration = 2000) => {
        setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

        const interval = 50; // ms
        const steps = duration / interval;
        let current = 0;

        const timer = setInterval(() => {
            current += 100 / steps;
            
            if (current >= 100) {
                setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
                clearInterval(timer);
                
                // Limpiar progreso después de 1 segundo
                setTimeout(() => {
                    setUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[fieldName];
                        return newProgress;
                    });
                }, 1000);
            } else {
                setUploadProgress(prev => ({ ...prev, [fieldName]: Math.min(current, 99) }));
            }
        }, interval);

        return timer;
    }, []);

    return {
        uploadProgress,
        fileErrors,
        allowedTypes,
        maxSizes,
        validateFile,
        handleFileSelect,
        generatePreview,
        clearFile,
        getFileInfo,
        formatFileSize,
        simulateUploadProgress
    };
};