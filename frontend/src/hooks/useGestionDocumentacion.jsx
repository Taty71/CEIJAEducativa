import { useState, useEffect } from 'react';
import { DocumentacionNameToId } from '../utils/DocumentacionMap';
import { useAlerts } from './useAlerts';

const maxFileSize = 600 * 1024; // 600 KB

export default function useGestionDocumentacion() {
    const [files, setFiles] = useState({});
    const [previews, setPreviews] = useState({});
    const { showError } = useAlerts();

    // Cargar archivos existentes desde sessionStorage al montar el componente
    useEffect(() => {
        const datosRegistroPendiente = sessionStorage.getItem('datosRegistroPendiente') ? 
            JSON.parse(sessionStorage.getItem('datosRegistroPendiente')) : null;
        const datosRegistroWeb = sessionStorage.getItem('datosRegistroWeb') ? 
            JSON.parse(sessionStorage.getItem('datosRegistroWeb')) : null;
        
        // Manejar archivos de registro pendiente
        if (datosRegistroPendiente && datosRegistroPendiente.archivosExistentes) {
            const archivosExistentes = datosRegistroPendiente.archivosExistentes;
            
            console.log('📁 Archivos existentes encontrados:', archivosExistentes);
            
            // Convertir archivos existentes a formato de previews
            const previewsExistentes = {};
            
            Object.entries(archivosExistentes).forEach(([tipoDocumento, rutaArchivo]) => {
                if (rutaArchivo) {
                    // Limpiar la ruta del archivo para construir la URL correcta
                    const rutaLimpia = rutaArchivo.replace(/\\/g, '/');
                    const nombreArchivo = rutaLimpia.split('/').pop();
                    
                    // Construir URL completa del archivo (servidor en puerto 5000)
                    const urlArchivo = `http://localhost:5000${rutaArchivo}`;
                    
                    // Determinar el tipo de archivo basado en la extensión
                    const extension = nombreArchivo.split('.').pop().toLowerCase();
                    const tipoArchivo = extension === 'pdf' ? 'application/pdf' : 
                                      ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? `image/${extension}` : 
                                      'application/octet-stream';
                    
                    previewsExistentes[tipoDocumento] = {
                        url: urlArchivo,
                        type: tipoArchivo,
                        file: null,
                        existente: true,  // Marcar como archivo existente
                        uploaded: true,   // Ya está subido al servidor
                        rutaOriginal: rutaArchivo,
                        nombreArchivo: nombreArchivo
                    };
                    
                    console.log(`📁 Archivo existente procesado: ${tipoDocumento} -> ${urlArchivo}`);
                }
            });
            
            console.log('📋 Previews existentes de registro pendiente procesados:', previewsExistentes);
            
            // Agregar los archivos existentes a los previews
            setPreviews(prevPreviews => ({
                ...prevPreviews,
                ...previewsExistentes
            }));
        }
        
        // Manejar archivos de registro web
        if (datosRegistroWeb && datosRegistroWeb.archivos) {
            const archivosWeb = datosRegistroWeb.archivos;
            
            console.log('🌐 Archivos de registro web encontrados:', archivosWeb);
            
            // Convertir archivos de registro web a formato de previews
            const previewsWeb = {};
            
            Object.entries(archivosWeb).forEach(([tipoDocumento, rutaArchivo]) => {
                if (rutaArchivo) {
                    // Los archivos web ya vienen con la ruta correcta desde archivosDocWeb
                    const rutaLimpia = rutaArchivo.replace(/\\/g, '/');
                    const nombreArchivo = rutaLimpia.split('/').pop();
                    
                    // Construir URL completa del archivo (servidor en puerto 5000)
                    const urlArchivo = `http://localhost:5000${rutaArchivo}`;
                    
                    // Determinar el tipo de archivo basado en la extensión
                    const extension = nombreArchivo.split('.').pop().toLowerCase();
                    const tipoArchivo = extension === 'pdf' ? 'application/pdf' : 
                                      ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? `image/${extension}` : 
                                      'application/octet-stream';
                    
                    previewsWeb[tipoDocumento] = {
                        url: urlArchivo,
                        type: tipoArchivo,
                        file: null,
                        existente: true,  // Marcar como archivo existente
                        uploaded: true,   // Ya está subido al servidor
                        rutaOriginal: rutaArchivo,
                        nombreArchivo: nombreArchivo
                    };
                    
                    console.log(`🌐 Archivo web existente procesado: ${tipoDocumento} -> ${urlArchivo}`);
                }
            });
            
            console.log('📋 Previews existentes de registro web procesados:', previewsWeb);
            
            // Agregar los archivos existentes a los previews
            setPreviews(prevPreviews => ({
                ...prevPreviews,
                ...previewsWeb
            }));
        }
    }, []);  // Solo ejecutar al montar    // Manejar cambios en los archivos
    const handleFileChange = (e, field, setFieldValue) => {
        const file = e.target.files[0];
        
        if (file) {
            if (file.size > maxFileSize) {
                showError('El archivo es demasiado grande. Máximo permitido: 600 KB.');
                return;
            }

            if (!(field in DocumentacionNameToId)) {
                console.warn(`El campo "${field}" no coincide con ninguna clave en DocumentacionNameToId.`);
            }

            // Verificar si hay un archivo existente
            const archivoExistente = previews[field]?.existente;
            if (archivoExistente) {
                console.log(`🔄 Reemplazando archivo existente para ${field}`);
            }

            const url = URL.createObjectURL(file);
            setPreviews((prev) => ({ 
                ...prev, 
                [field]: { 
                    url, 
                    type: file.type, 
                    file,
                    existente: false, // Marcar como nuevo archivo (no existente)
                    uploaded: false   // Aún no subido al servidor
                } 
            }));
            setFiles((prev) => ({ ...prev, [field]: file }));
            if (setFieldValue) {
                setFieldValue(field, file);
            }
        }
    };

    // Construir detalle de documentación
    const buildDetalleDocumentacion = () => {
        return Object.entries(previews)
            .filter(([name]) => {
                const exists = DocumentacionNameToId[name];
                if (!exists && import.meta.env.DEV) {
                    console.warn(`El nombre "${name}" no coincide con ninguna clave en DocumentacionNameToId.`);
                }
                return exists;
            })
            .map(([name, doc]) => {
                return {
                    idDocumentaciones: DocumentacionNameToId[name],
                    estadoDocumentacion: doc?.url ? 'Entregado' : 'Faltante',
                    nombreArchivo: name,
                    archivoDocumentacion: null,
                    fechaEntrega: doc?.url ? new Date().toISOString().slice(0, 10) : null,
                };
            });
    };

    // Resetear archivos y vistas previas
    const resetArchivos = () => {
        Object.values(previews).forEach((preview) => {
            if (preview?.url) {
                URL.revokeObjectURL(preview.url);
            }
        });
        setFiles({});
        setPreviews({});
    };


    return {
        files,
        setFiles,
        previews,
        setPreviews,
        handleFileChange,
        buildDetalleDocumentacion,
        resetArchivos,
    };
}