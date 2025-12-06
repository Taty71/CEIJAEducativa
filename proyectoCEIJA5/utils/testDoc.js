const obtenerDocumentacionFaltante = require('./obtenerDocumentacionFaltante');

const tiposDocumentacion = [
  { id: 1, descripcionDocumentacion: 'DNI' },
  { id: 2, descripcionDocumentacion: 'CUIL' },
  { id: 3, descripcionDocumentacion: 'Partida de Nacimiento' }
];

const detalleInscripcion = [
  { idDocumentaciones: 1, archivoDocumentacion: 'dni.pdf' },
  { idDocumentaciones: 3, archivoDocumentacion: 'partida.pdf' }
];

const resultado = obtenerDocumentacionFaltante({ tiposDocumentacion, detalleInscripcion });
console.log(resultado);