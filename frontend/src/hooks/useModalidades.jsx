import { useState, useEffect } from 'react';
import serviceModalidad from '../services/serviceModalidad';

export default function useModalidades() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const res = await serviceModalidad.getAll();
        if (res.success) {
          setModalidades(res.modalidades);
        } else {
          setError('Error al obtener modalidades');
        }
      } catch (err) {
        setError(err.message || 'Error en la consulta');
      } finally {
        setLoading(false);
      }
    };

    fetchModalidades();
  }, []);

  return { modalidades, loading, error };
}
