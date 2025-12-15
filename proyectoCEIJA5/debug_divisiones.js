const db = require('./db');

async function checkDivisiones() {
    try {
        console.log('Checking divisiones table...');
        const [rows] = await db.query('SELECT * FROM divisiones ORDER BY idAnioPlan, division');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDivisiones();
