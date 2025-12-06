import { useState, useEffect } from 'react';

const PruebaUbicaciones = () => {
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [barrios, setBarrios] = useState([]);
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = 'http://localhost:5000/api/ubicaciones';

    // Cargar provincias al montar
    useEffect(() => {
        const cargarProvincias = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/provincias`);
                const data = await response.json();
                console.log('Provincias:', data);
                
                if (data.success) {
                    setProvincias(data.data);
                } else {
                    setError('Error cargando provincias');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        cargarProvincias();
    }, []);

    // Cargar localidades cuando cambia la provincia
    useEffect(() => {
        const cargarLocalidades = async () => {
            if (!provinciaSeleccionada) {
                setLocalidades([]);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/localidades/${provinciaSeleccionada}`);
                const data = await response.json();
                console.log('Localidades:', data);
                
                if (data.success) {
                    setLocalidades(data.data);
                } else {
                    setError('Error cargando localidades');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarLocalidades();
        setLocalidadSeleccionada(''); // Reset localidad
        setBarrios([]); // Reset barrios
    }, [provinciaSeleccionada]);

    // Cargar barrios cuando cambia la localidad
    useEffect(() => {
        const cargarBarrios = async () => {
            if (!localidadSeleccionada) {
                setBarrios([]);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/barrios/${localidadSeleccionada}`);
                const data = await response.json();
                console.log('Barrios:', data);
                
                if (data.success) {
                    setBarrios(data.data);
                } else {
                    setError('Error cargando barrios');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarBarrios();
    }, [localidadSeleccionada]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🧪 Prueba de Ubicaciones Dinámicas</h2>
            
            {error && (
                <div style={{ 
                    background: '#ffebee', 
                    color: '#c62828', 
                    padding: '10px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    ❌ {error}
                </div>
            )}

            {loading && <p>⏳ Cargando...</p>}

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                
                {/* Provincias */}
                <div>
                    <label><strong>Provincia:</strong></label>
                    <select 
                        value={provinciaSeleccionada}
                        onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="">Seleccione Provincia</option>
                        {provincias.map(provincia => (
                            <option key={provincia.id} value={provincia.id}>
                                {provincia.nombre}
                            </option>
                        ))}
                    </select>
                    <small>Total: {provincias.length} provincias</small>
                </div>

                {/* Localidades */}
                <div>
                    <label><strong>Localidad:</strong></label>
                    <select 
                        value={localidadSeleccionada}
                        onChange={(e) => setLocalidadSeleccionada(e.target.value)}
                        disabled={!provinciaSeleccionada}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="">Seleccione Localidad</option>
                        {localidades.map(localidad => (
                            <option key={localidad.id} value={localidad.id}>
                                {localidad.nombre}
                            </option>
                        ))}
                    </select>
                    <small>Total: {localidades.length} localidades</small>
                </div>

                {/* Barrios */}
                <div>
                    <label><strong>Barrio:</strong></label>
                    <select 
                        disabled={!localidadSeleccionada}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="">Seleccione Barrio</option>
                        {barrios.map(barrio => (
                            <option key={barrio.id} value={barrio.id}>
                                {barrio.nombre}
                            </option>
                        ))}
                    </select>
                    <small>Total: {barrios.length} barrios</small>
                </div>
            </div>

            {/* Información de estado */}
            <div style={{ 
                marginTop: '30px', 
                padding: '15px', 
                background: '#f5f5f5', 
                borderRadius: '4px' 
            }}>
                <h4>🔍 Estado actual:</h4>
                <p><strong>Provincia seleccionada:</strong> {provinciaSeleccionada || 'Ninguna'}</p>
                <p><strong>Localidad seleccionada:</strong> {localidadSeleccionada || 'Ninguna'}</p>
                <p><strong>Datos cargados:</strong> {provincias.length} provincias, {localidades.length} localidades, {barrios.length} barrios</p>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#e8f5e8', 
                borderRadius: '4px' 
            }}>
                <h4>✅ Instrucciones:</h4>
                <ol>
                    <li>Selecciona una provincia (ej: Córdoba)</li>
                    <li>Se cargarán las localidades de esa provincia</li>
                    <li>Selecciona una localidad (ej: La Calera)</li>
                    <li>Se cargarán los barrios de esa localidad</li>
                </ol>
            </div>
        </div>
    );
};

export default PruebaUbicaciones;