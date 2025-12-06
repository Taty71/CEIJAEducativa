const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/Registros_Pendientes.json', 'utf8'));
console.log('📊 Análisis de registros disponibles:\n');

data.forEach((reg, i) => {
  console.log(`${i+1}. ${reg.datos.nombre} ${reg.datos.apellido} (DNI: ${reg.dni})`);
  console.log(`   - Modalidad: ${reg.datos.modalidad} (ID: ${reg.modalidadId || reg.datos.modalidadId})`);
  console.log(`   - Plan/Año: ${reg.datos.planAnio} (ID: ${reg.planAnioId || reg.datos.planAnio})`);
  console.log(`   - Estado: ${reg.estado}`);
  console.log('');
});

console.log(`\nTotal de registros: ${data.length}`);