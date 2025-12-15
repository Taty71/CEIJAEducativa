-- Script para agregar la columna 'sexo' a la tabla 'estudiantes'
-- Ejecute este script en su base de datos MySQL / MariaDB

ALTER TABLE estudiantes 
ADD COLUMN sexo VARCHAR(20) DEFAULT NULL AFTER fechaNacimiento;

-- Verificación opcional (solo informativo, no es necesario ejecutar si confía en el anterior)
-- DESCRIBE estudiantes;
