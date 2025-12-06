import { useEffect, useState } from 'react';
import axios from 'axios';

export const usePlanesPorModalidad = (idModalidad) => {
  const [planes, setPlanes] = useState([]);

  useEffect(() => {
    if (!idModalidad) return;
    const fetchPlanes = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/planes/${idModalidad}`);
        setPlanes(data);
      } catch (error) {
        console.error('Error al obtener planes:', error);
      }
    };
    fetchPlanes();
  }, [idModalidad]);

  return planes;
};
