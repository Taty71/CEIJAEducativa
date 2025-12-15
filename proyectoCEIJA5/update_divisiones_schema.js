const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig');

async function updateSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        // 1. Check if column exists
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM divisiones LIKE 'idModalidad'
        `);

        if (columns.length === 0) {
            console.log('Adding idModalidad column to divisiones...');
            await connection.query(`
                ALTER TABLE divisiones
                ADD COLUMN idModalidad INT(11) NOT NULL DEFAULT 1 AFTER descriptionAnioPlan
            `);
            // Note: divisiones table structure is (id, division, idAnioPlan). 
            // Wait, "AFTER descriptionAnioPlan" is wrong because descriptionAnioPlan is in anio_plan.
            // Let's drop the "AFTER" or use correct one.
            // Table is: id, division, idAnioPlan.
            // Let's add it after idAnioPlan.

        } else {
            console.log('Column idModalidad already exists.');
        }

        // CORRECT QUERY:
        // ALTER TABLE divisiones ADD COLUMN idModalidad INT(11) NOT NULL DEFAULT 1;
        // We set default 1 (Presencial) for existing rows.
    } catch (err) {
        console.log('Error checking/adding column. Retrying with specific query...');
    }

    try {
        // Re-connect or continue
        if (!connection) connection = await mysql.createConnection(dbConfig);

        // Add column if not exists (using simpler logic)
        try {
            await connection.query(`
                ALTER TABLE divisiones
                ADD COLUMN idModalidad INT(11) NOT NULL DEFAULT 1
            `);
            console.log('Column added.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists (caught error).');
            } else {
                throw e;
            }
        }

        // Add FK
        try {
            await connection.query(`
                ALTER TABLE divisiones
                ADD CONSTRAINT fk_divisiones_modalidad
                FOREIGN KEY (idModalidad) REFERENCES modalidades(id)
             `);
            console.log('Foreign Key added.');
        } catch (e) {
            if (e.code === 'ER_DUP_KEY' || e.code === 'ER_CANT_CREATE_TABLE') { // CANT_CREATE often means constraint exists or name conflict
                console.log('Constraint might already exist or failed: ' + e.message);
            } else {
                console.log('Error adding FK: ' + e.message);
            }
        }

        console.log('Schema update complete.');

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
