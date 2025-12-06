// Archivo temporal para probar la lógica de conteo de documentos

export const testConteoDocumentos = (archivosWeb) => {
    console.log('=== TEST CONTEO DOCUMENTOS ===');
    console.log('Archivos web:', archivosWeb);
    
    // Simular la lógica actual
    const filesWeb = {};
    const previewsWeb = {};
    
    Object.keys(archivosWeb).forEach(key => {
        if (archivosWeb[key]) {
            filesWeb[key] = true;
            previewsWeb[key] = {
                url: archivosWeb[key],
                name: archivosWeb[key].split('/').pop()
            };
        }
    });
    
    console.log('Files web construidos:', filesWeb);
    console.log('Previews web construidos:', previewsWeb);
    
    return { filesWeb, previewsWeb };
};

// Test con datos de Narella
const archivosNarella = {
    "foto": "/archivosDocWeb/Narella_Caliva_45785412_foto.png",
    "archivo_dni": "/archivosDocWeb/Narella_Caliva_45785412_archivo_dni.pdf",
    "archivo_cuil": "/archivosDocWeb/Narella_Caliva_45785412_archivo_cuil.pdf",
    "archivo_fichaMedica": "/archivosDocWeb/Narella_Caliva_45785412_archivo_fichaMedica.pdf",
    "archivo_solicitudPase": "/archivosDocWeb/Narella_Caliva_45785412_archivo_solicitudPase.pdf"
};

testConteoDocumentos(archivosNarella);