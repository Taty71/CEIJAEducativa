// /src/utils/DocumentacionMap.jsx
// ✅ MAPEO CORREGIDO SEGÚN BASE DE DATOS documentaciones
export const DocumentacionNameToId = {
  archivo_dni: 1,                      // ID 1: 'DNI'
  archivo_cuil: 2,                     // ID 2: 'CUIL' 
  archivo_fichaMedica: 3,              // ID 3: 'Ficha Médica'
  archivo_partidaNacimiento: 4,        // ID 4: 'Partida Nacimiento'
  archivo_solicitudPase: 5,            // ID 5: 'Solicitud Pase'
  archivo_analiticoParcial: 6,         // ID 6: 'Analítico Parcial/Pase'
  archivo_certificadoNivelPrimario: 7, // ID 7: 'Certificado Nivel Primario' ✅
  foto: 8,                            // ID 8: 'Foto'
};
export const DocumentacionDescripcionToName = {
  dni: 'archivo_dni',
  DNI: 'archivo_dni',
  cuil: 'archivo_cuil',
  CUIL: 'archivo_cuil',
  partidaNacimiento: 'archivo_partidaNacimiento',
  'Partida Nacimiento': 'archivo_partidaNacimiento',
  fichaMedica: 'archivo_fichaMedica',
  'Ficha Médica': 'archivo_fichaMedica',
  solicitudPase: 'archivo_solicitudPase',
  'Solicitud Pase': 'archivo_solicitudPase',
  analiticoParcial: 'archivo_analiticoParcial',
  'Analítico Parcial': 'archivo_analiticoParcial',
  certificadoNivelPrimario: 'archivo_certificadoNivelPrimario',
  'Certificado Nivel Primario': 'archivo_certificadoNivelPrimario',
  foto: 'foto',
  Foto: 'foto',
  FOTO: 'foto',
};
