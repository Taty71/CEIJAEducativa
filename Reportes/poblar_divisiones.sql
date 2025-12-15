-- Script para poblar/corregir la tabla divisiones y asignar idModalidad

-- 1. Primero aseguramos que la columna existe (si no corriste el anterior)
-- ALTER TABLE `divisiones` ADD COLUMN `idModalidad` int(11) NOT NULL DEFAULT 1 AFTER `idAnioPlan`;

-- 2. Actualizamos el idModalidad basándonos en el anio_plan
-- Unimos con anio_plan para saber a qué modalidad pertenece cada división
UPDATE divisiones d
JOIN anio_plan ap ON d.idAnioPlan = ap.id
SET d.idModalidad = ap.idModalidad;

-- 3. Insertar divisiones básicas si no existen (Ejemplo para Presencial - Modalidad 1)
-- 1er Año (ID 1) -> A, B, C
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (1, 'A', 1, 1);
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (2, 'B', 1, 1);
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (3, 'C', 1, 1);

-- 2do Año (ID 2) -> A, B
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (4, 'A', 2, 1);
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (5, 'B', 2, 1);

-- 3er Año (ID 3) -> A
INSERT IGNORE INTO divisiones (id, division, idAnioPlan, idModalidad) VALUES (6, 'A', 3, 1);

-- Verificar resultados
SELECT * FROM divisiones;
