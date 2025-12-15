import VisorEstudiante from './VisorEstudiante';
import serviceModificarEstudiante from '../services/serviceModificarEstudiante'; // ✅ Importa el servicio unificado
import { useState } from 'react';
import PropTypes from 'prop-types';
import "../estilos/Modal.css";
import '../estilos/visorEstudiante.css';


// ✅ Componente principal
const VistaVisor = ({ estudiante, onClose, onVolver, isConsulta, isEliminacion, modalidadId, modalidadFiltrada }) => {
    const [alerta, setAlerta] = useState(null);

    const handleModificar = async (accion, datos) => {
        try {
            let res;
            if (accion === 'todo') {
                const formData = new FormData();
                // Solo los campos válidos para modificación
                const camposValidos = [
                    'nombre', 'apellido', 'dni', 'cuil', 'email', 'telefono', 'fechaNacimiento', 'tipoDocumento', 'paisEmision', 'sexo',
                    'provincia', 'localidad', 'barrio', 'calle', 'numero',
                    'modalidadId', 'planAnioId', 'modulosId', 'estadoInscripcionId', 'fechaInscripcion', 'idDivision'
                ];
                Object.entries(datos).forEach(([key, value]) => {
                    if (key === 'archivos' || key === 'detalleDocumentacion') return;
                    if (camposValidos.includes(key)) {
                        formData.append(key, value ?? '');
                    }
                });
                // Documentación: asegurar nombreArchivo correcto
                let detalle = Array.isArray(datos.detalleDocumentacion)
                    ? datos.detalleDocumentacion.map(doc => ({
                        ...doc,
                        nombreArchivo: doc.nombreArchivo || doc.descripcionDocumentacion?.replace(/\s+/g, '')
                    }))
                    : [];
                formData.append('detalleDocumentacion', JSON.stringify(detalle));
                if (datos.archivos) {
                    Object.entries(datos.archivos).forEach(([desc, archivo]) => {
                        if (archivo) {
                            // El nombre debe coincidir con nombreArchivo en detalleDocumentacion
                            const clave = desc.replace(/\s+/g, '');
                            formData.append(clave, archivo, archivo.name);
                        }
                    });
                }
                // Llamar al servicio unificado
                res = await serviceModificarEstudiante.modificarEstudiante(datos.dni, formData);
            }
            setAlerta({
                tipo: res?.success ? 'success' : 'error',
                mensaje: res?.message || 'Estudiante actualizado correctamente.',
            });
            return res; // ✅ Retornar respuesta
        } catch (err) {
            setAlerta({ tipo: 'error', mensaje: err.message || 'Error inesperado al guardar todo.' });
            return { success: false, message: err.message };
        }
    };


    return (
        <div>
            {alerta && <div className={`alerta alerta-${alerta.tipo}`}>{alerta.mensaje}</div>}
            <VisorEstudiante
                estudiante={estudiante}
                onClose={onClose}
                onVolver={onVolver}
                onModificar={handleModificar}
                isConsulta={isConsulta}
                isEliminacion={isEliminacion}
                modalidadId={modalidadId}
                modalidadFiltrada={modalidadFiltrada}
            />
        </div>
    );
};

VistaVisor.propTypes = {
    estudiante: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onVolver: PropTypes.func.isRequired,
    isConsulta: PropTypes.bool,
    isEliminacion: PropTypes.bool,
    modalidadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    modalidadFiltrada: PropTypes.string
};

export default VistaVisor;
