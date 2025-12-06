const db = require('../db');

const dni = process.argv[2] || '46123325';

async function run() {
  try {
    console.log(`🔎 Buscando estudiante con DNI=${dni}...`);
    const [estRows] = await db.query('SELECT * FROM estudiantes WHERE dni = ?', [dni]);
    if (!estRows || estRows.length === 0) {
      console.log('❌ Estudiante NO encontrado en `estudiantes`.');
      process.exit(0);
    }

    const estudiante = estRows[0];
    console.log('✅ Estudiante encontrado:');
    console.log(estudiante);

    const idEst = estudiante.id;

    console.log(`\n📚 Buscando inscripciones para idEstudiante=${idEst}...`);
    const [insRows] = await db.query('SELECT * FROM inscripciones WHERE idEstudiante = ? ORDER BY id DESC', [idEst]);
    if (!insRows || insRows.length === 0) {
      console.log('⚠️ No se encontraron inscripciones para este estudiante.');
    } else {
      console.log(`🔢 ${insRows.length} inscripciones encontradas:`);
      console.table(insRows);

      for (const ins of insRows) {
        const idIns = ins.id;
        console.log(`\n📄 detalle_inscripcion para idInscripcion=${idIns}:`);
        const [detRows] = await db.query('SELECT * FROM detalle_inscripcion WHERE idInscripcion = ?', [idIns]);
        console.table(detRows);
      }
    }

    console.log(`\n📁 Buscando archivos registrados en archivos_estudiantes para idEstudiante=${idEst}...`);
    const [archRows] = await db.query('SELECT * FROM archivos_estudiantes WHERE idEstudiante = ?', [idEst]);
    if (!archRows || archRows.length === 0) {
      console.log('⚠️ No se encontraron registros en archivos_estudiantes para este estudiante.');
    } else {
      console.log(`🔢 ${archRows.length} archivos encontrados:`);
      console.table(archRows);
    }

    process.exit(0);
  } catch (err) {
    console.error('ERROR durante la comprobación:', err.stack || err.message || err);
    process.exit(2);
  }
}

run();
