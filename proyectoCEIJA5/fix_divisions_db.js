const db = require('./db');

async function fixDivisiones() {
    try {
        console.log('Fixing divisiones table...');

        // 1. Insert Missing 'A' for Year 2
        await db.query(`
            INSERT INTO divisiones (division, idAnioPlan) 
            SELECT 'A', 2 
            FROM DUAL 
            WHERE NOT EXISTS (SELECT 1 FROM divisiones WHERE division='A' AND idAnioPlan=2)
        `);
        console.log('Ensured A exists for Year 2');

        // 2. Insert Missing 'B' for Year 2
        await db.query(`
            INSERT INTO divisiones (division, idAnioPlan) 
            SELECT 'B', 2 
            FROM DUAL 
            WHERE NOT EXISTS (SELECT 1 FROM divisiones WHERE division='B' AND idAnioPlan=2)
        `);
        console.log('Ensured B exists for Year 2');


        // 2. Insert Missing 'A' for Year 1 (Just in case)
        await db.query(`
            INSERT INTO divisiones (division, idAnioPlan) 
            SELECT 'A', 1 
            FROM DUAL 
            WHERE NOT EXISTS (SELECT 1 FROM divisiones WHERE division='A' AND idAnioPlan=1)
        `);

        // Check Year 3 A
        await db.query(`
            INSERT INTO divisiones (division, idAnioPlan) 
            SELECT 'A', 3 
            FROM DUAL 
            WHERE NOT EXISTS (SELECT 1 FROM divisiones WHERE division='A' AND idAnioPlan=3)
        `);

        console.log('Fixes applied. Now querying current state:');
        const [rows] = await db.query('SELECT * FROM divisiones ORDER BY idAnioPlan, division');
        console.log(JSON.stringify(rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDivisiones();
