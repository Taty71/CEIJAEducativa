// Mapeo de nombre de plan a ID
export const mapPlanAnioToId = (planAnio) => {
    switch (planAnio) {
        case 'Plan A': return 1;
        case 'Plan B': return 2;
        case 'Plan C': return 3;
        case '1er Año': return 4;
        case '2do Año': return 5;
        case '3er Año': return 6;
        default: return null;
    }
};

// Mapeo de nombre de estado de inscripción a ID
export const mapEstadoInscripcionToId = (estado) => {
    switch ((estado || '').toLowerCase()) {
        case 'pendiente': return 1;
        case 'Completa': return 2;
        case 'anulado': return 3;                   
        default: return null;
    }
};

// Mapeo de nombre de modalidad a ID
export const mapModalidadToId = (mod) => {
    switch ((mod || '').toLowerCase()) {
        case 'presencial': return 1;
        case 'semipresencial': return 2;
        default: return null;
    }
};

// Mapeo de nombre de módulo a ID
export const mapModuloToId = (modulo, planAnio) => {
    if (planAnio === 'Plan A') {
        switch (modulo) {
            case 'Módulo 1': return 1;
            case 'Módulo 2': return 2;
            case 'Módulo 3': return 3;
            default: return null;
        }
    }
    if (planAnio === 'Plan B') {
        switch (modulo) {
            case 'Módulo 4': return 4;
            case 'Módulo 5': return 5;
            default: return null;
        }
    }
    if (planAnio === 'Plan C') {
        switch (modulo) {
            case 'Módulo 6': return 6;
            case 'Módulo 7': return 7;
            case 'Módulo 8': return 8;
            case 'Módulo 9': return 9;
            default: return null;
        }
    }
    return null;
};
