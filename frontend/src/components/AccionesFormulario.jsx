import { useState } from 'react';
import PropTypes from 'prop-types';
import '../estilos/accionesForm.css';
import ConsultaOpciones from './ConsultaOpciones';

// Importar los iconos
import wandIcon from '../assets/logos/wand.png';
import dataSearchingIcon from '../assets/logos/data-searching.png';
import dataProcessingIcon from '../assets/logos/data-processing.png';
import deleteIcon from '../assets/logos/delete.png';
import printerIcon from '../assets/logos/printer.png';

const acciones = [
    { nombre: "Registrar", icono: wandIcon },
    { nombre: "Consultar", icono: dataSearchingIcon },
    { nombre: "Modificar", icono: dataProcessingIcon },
    { nombre: "Eliminar", icono: deleteIcon },
    { nombre: "Listar", icono: printerIcon }
];

const AccionesFormulario = ({ setAccion }) => {
    const [selectedButton, setSelectedButton] = useState('');
    const [showOpcionesModificar, setShowOpcionesModificar] = useState(false);
    const [showOpcionesEliminar, setShowOpcionesEliminar] = useState(false);

    const handleButtonClick = (accion) => {
        console.log('AccionesFormulario - handleButtonClick:', accion);
        if (accion === 'Modificar') {
            setShowOpcionesModificar(true);
        } else if (accion === 'Eliminar') {
            setShowOpcionesEliminar(true);
        } else {
            setAccion(accion);
            setSelectedButton(accion);
        }
    };

    const handleSeleccionModificar = (tipoModificacion) => {
        setShowOpcionesModificar(false);
        if (tipoModificacion === 'dni') {
            setAccion('ModificarPorDNI');
        } else {
            setAccion('ModificarLista');
        }
        setSelectedButton('Modificar');
    };

    const handleSeleccionEliminar = (tipoEliminacion) => {
        setShowOpcionesEliminar(false);
        if (tipoEliminacion === 'dni') {
            setAccion('EliminarPorDNI');
        } else {
            setAccion('EliminarLista');
        }
        setSelectedButton('Eliminar');
    };

    return (
        <>
            <div className="acciones-formulario-container">
                {acciones.map(({ nombre, icono }) => (
                    <button
                        key={nombre}
                        className={`buttonAcciones ${selectedButton === nombre && "selectedButton"}`}
                        onClick={() => handleButtonClick(nombre)}
                        aria-label={nombre}
                    >
                        <img src={icono} className="img" alt={nombre} />
                        {nombre}
                    </button>
                ))}
            </div>

            {showOpcionesModificar && (
                <ConsultaOpciones 
                    onSeleccion={handleSeleccionModificar}
                    onClose={() => setShowOpcionesModificar(false)}
                    tituloModal="Seleccionar Tipo de Modificación"
                    descripcionModal="Elija cómo desea modificar estudiantes"
                    esModificacion={true}
                    titulo=""
                />
            )}

            {showOpcionesEliminar && (
                <ConsultaOpciones 
                    onSeleccion={handleSeleccionEliminar}
                    onClose={() => setShowOpcionesEliminar(false)}
                    tituloModal="Seleccionar Tipo de Eliminación"
                    descripcionModal="Elija cómo desea eliminar estudiantes"
                    esModificacion={false}
                    titulo="Eliminar "
                />
            )}
        </>
    );
};

AccionesFormulario.propTypes = {
    setAccion: PropTypes.func.isRequired,
};

export default AccionesFormulario;