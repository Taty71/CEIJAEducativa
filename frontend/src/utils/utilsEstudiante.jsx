// utilsEstudiante.js
// Función utilitaria para construir el objeto estudiante completo
export function construirEstudianteCompleto(origen, tipo = 'normal') {
    // Helper para formatear fecha a yyyy-MM-dd
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Si ya está en formato yyyy-MM-dd, retorna igual
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // Si es ISO, formatea
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const estudiante = {
        ...origen.estudiante || origen,
        calle: origen.domicilio?.calle ?? origen.calle ?? '',
        numero: origen.domicilio?.numero ?? origen.numero ?? '',
        // Prioriza barrio de domicilio, luego barrio plano, luego barrio de inscripcion si existiera
        barrio: origen.domicilio?.barrio ?? origen.barrio ?? (origen.inscripcion?.barrio ?? ''),
        localidad: origen.domicilio?.localidad ?? origen.localidad ?? '',
        provincia: origen.domicilio?.provincia ?? origen.provincia ?? origen.provincia ?? '',
        modalidad: origen.inscripcion?.modalidad || origen.modalidad || '',
        planAnio: origen.inscripcion?.plan || origen.planAnio || origen.plan || '',
        modulo: origen.inscripcion?.modulo || origen.modulo || '',
        estadoInscripcion: origen.inscripcion?.estado || origen.estadoInscripcion || origen.estado || '',
        fechaInscripcion: formatDate(origen.inscripcion?.fechaInscripcion || origen.fechaInscripcion || ''),
        // Asegura que la fecha de nacimiento se tome de cualquier fuente posible
        fechaNacimiento: formatDate(
            origen.fechaNacimiento ||
            (origen.estudiante && origen.estudiante.fechaNacimiento) ||
            ''
        ),
        idInscripcion: origen.inscripcion?.idInscripcion || origen.idInscripcion || null,
        documentacion: origen.documentacion || []
    };
    if (tipo === 'modificarLista') {
        estudiante.vieneDeLista = true;
    }
    if (tipo === 'consultaModificacion') {
        estudiante.esConsultaDesdeModificacion = true;
    }
    return estudiante;
}
