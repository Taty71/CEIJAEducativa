-- SQL para agregar la columna idModalidad a la tabla divisiones
-- y establecer una clave foránea.

-- 1. Agregar la columna idModalidad (por defecto 1 = PRESENCIAL)
ALTER TABLE `divisiones`
ADD COLUMN `idModalidad` int(11) NOT NULL DEFAULT 1 AFTER `idAnioPlan`;

-- 2. Agregar el índice para la clave foránea
ALTER TABLE `divisiones`
ADD KEY `fk_divisiones_modalidad` (`idModalidad`);

-- 3. Agregar la restricción de clave foránea
ALTER TABLE `divisiones`
ADD CONSTRAINT `fk_divisiones_modalidad` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`id`);
