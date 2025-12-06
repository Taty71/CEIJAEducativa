import PropTypes from 'prop-types';

const SeccionDescargas = ({ 
    descargando, 
    onGenerarReporteTXT, 
    onGenerarReporteCSV, 
    onGenerarReportePDF,
    children
}) => {
    return (
        <div className="botones-descarga descarga-unificada">
            <button 
                onClick={onGenerarReporteTXT}
                className="boton-pendiente"
                title="Generar reporte legible para administración escolar"
            >
                📋 Reporte TXT
            </button>
            <button 
                onClick={onGenerarReporteCSV}
                className="boton-pendiente"
                title="Generar archivo Excel profesional y legible (.xlsx)"
            >
                📊 Excel
            </button>
            <button 
                onClick={onGenerarReportePDF}
                className="boton-pendiente"
                disabled={descargando}
                title="Generar reporte PDF profesional para presentaciones"
            >
                {descargando ? '⏳ Generando...' : '📄 Reporte PDF'}
            </button>
            {children}
        </div>
    );
};

SeccionDescargas.propTypes = {
    descargando: PropTypes.bool.isRequired,
    onGenerarReporteTXT: PropTypes.func.isRequired,
    onGenerarReporteCSV: PropTypes.func.isRequired,
    onGenerarReportePDF: PropTypes.func.isRequired,
    children: PropTypes.node
};

export default SeccionDescargas;