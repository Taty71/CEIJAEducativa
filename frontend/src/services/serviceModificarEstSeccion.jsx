import axiosInstance from '../config/axios';


const modificarPersonales = (dni, data) =>
  axiosInstance.put(`/modificar-estudiante-seccion/personales/${dni}`, data);

const modificarDomicilio = (idDomicilio, data) =>
  axiosInstance.put(`/modificar-estudiante-seccion/domicilio/${idDomicilio}`, data);

const modificarAcademica = (idInscripcion, data) =>
  axiosInstance.put(`/modificar-estudiante-seccion/academica/${idInscripcion}`, data);

const modificarDocumentacion = (idInscripcion, formData) =>
  axiosInstance.put(`/modificar-documentacion-estudiante/documentacion/${idInscripcion}`, formData);

export default {
  modificarPersonales,
  modificarDomicilio,
  modificarAcademica,
  modificarDocumentacion
};