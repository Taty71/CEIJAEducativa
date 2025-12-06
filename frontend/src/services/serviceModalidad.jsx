// src/services/serviceModalidad.js
import axios from 'axios';

const getAll = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/modalidades');
    return res.data;
  } catch {
    return { success: false, message: 'Error al obtener modalidades' };
  }
};

export default { getAll };
// src/services/serviceModalidad.jsx    