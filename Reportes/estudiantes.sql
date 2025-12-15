-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-12-2025 a las 02:24:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ceija5_redone`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `tipoDocumento` enum('DNI','PASAPORTE','CEDULA','OTRO') NOT NULL DEFAULT 'DNI',
  `paisEmision` varchar(100) DEFAULT NULL,
  `dni` varchar(20) NOT NULL,
  `cuil` varchar(14) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL COMMENT 'Dirección de correo electrónico para notificaciones académicas',
  `telefono` varchar(20) DEFAULT NULL,
  `fechaNacimiento` date NOT NULL,
  `sexo` varchar(20) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `idDomicilio` int(11) NOT NULL,
  `idUsuarios` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Campo para eliminación lógica: 1=activo, 0=inactivo',
  `motivo_baja` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `nombre`, `apellido`, `tipoDocumento`, `paisEmision`, `dni`, `cuil`, `email`, `telefono`, `fechaNacimiento`, `sexo`, `foto`, `idDomicilio`, `idUsuarios`, `activo`, `motivo_baja`) VALUES
(118, 'Martin', 'Carras', 'DNI', 'Argentina', '44125623', '20-44125623-8', 'cbmaia@gmail.com', '03518912512', '2001-02-03', NULL, '/archivosDocumento/Martin_Carras_44125623_foto.png', 135, NULL, 0, NULL),
(120, 'Juan Pablo', 'Perez', 'DNI', 'Argentina', '43032642', '20-43032642-3', 'crisbmaia50@gmail.com', '03518912512', '2000-03-02', NULL, '/archivosDocumento/Juan_Pablo_Perez_43032642_foto.png', 137, NULL, 1, NULL),
(122, 'Mariela Fabiana', 'Mansilla', 'DNI', 'Argentina', '40123123', '20-40123123-5', 'crisbmaia50@gmail.com', '03514545623', '1996-02-03', NULL, '/archivosDocumento/Mariela_Mansilla_40123123_foto.png', 139, NULL, 1, NULL),
(123, 'Maria', 'Valles', 'DNI', 'Argentina', '44125521', '20-44125521-8', 'cristinbmaia@gmail.com', '03543650855', '2001-03-02', NULL, '/archivosDocumento/Maria_Valles_44125521_foto.png', 140, NULL, 0, 'No completó Inscripción'),
(124, 'Sofia', 'Carras', 'DNI', 'Argentina', '39152152', '20-39152152-3', 'crisbmaia50@gmail.com', '03518912512', '1996-06-03', NULL, '/archivosDocumento/Sofia_Carras_39152152_foto.png', 141, NULL, 1, NULL),
(125, 'Marcos', 'Vivas', 'DNI', 'Argentina', '39526123', '20-39526123-2', 'crisbmaia50@gmail.com', '03514512320', '1996-06-02', NULL, '/archivosDocumento/Marcos_Vivas_39526123_foto.png', 142, NULL, 1, NULL),
(126, 'Martin', 'Espindola', 'DNI', 'Argentina', '32125541', '20-32125541-9', 'cristinbmaia50@gmail.com', '03518945623', '1989-06-03', NULL, '/archivosDocumento/Martin_Espindola_32125541_foto.png', 143, NULL, 1, NULL),
(128, 'Esteban', 'Capdevilla', 'DNI', 'Argentina', '41203210', '20-41203210-2', 'crisbmaia50@gmail.com', '03514578956', '1998-06-02', NULL, '/archivosDocumento/Esteban_Capdevilla_41203210_foto.png', 145, NULL, 1, NULL),
(129, 'Elias', 'Rodriguez', 'DNI', 'Argentina', '43023356', '20-43023356-5', 'crisbmaia50@gmail.com', '03517845612', '1996-06-03', NULL, '/archivosDocumento/Elias_Rodriguez_43023356_foto.png', 146, NULL, 1, NULL),
(130, 'Matias', 'Nazareno', 'DNI', 'Argentina', '32279832', '20-32279832-7', 'crisbmaia50@gmail.com', '03517845123', '1989-09-06', NULL, '/archivosDocumento/Analía_Borelli_36230230_foto.jpg', 147, NULL, 1, NULL),
(131, 'Marcos', 'Campigotto', 'DNI', 'Argentina', '43125587', '20-43125587-2', 'crisbmaia50@gmail.com', '03543645123', '2000-08-06', NULL, '/archivosDocumento/Marcos_Campigotto_43125587_foto.jpg', 148, NULL, 1, NULL),
(132, 'Martina', 'Loms', 'DNI', 'Argentina', '43201145', '20-43201145-4', 'crisbmaia50@gmail.com', '035112563987', '2001-12-03', NULL, '/archivosDocumento/Martina_Loms_43201145_foto.png', 150, NULL, 1, NULL),
(133, 'Analía', 'Borelli', 'DNI', 'Argentina', '36230230', '20-36230230-8', 'crisbmaia50@gmail.com', '03518945612', '1993-08-06', NULL, '/archivosDocumento/Analía_Borelli_36230230_foto.png', 151, NULL, 1, NULL),
(134, 'Karina', 'Lopez', 'DNI', 'Argentina', '45269236', '20-45269236-9', 'crisbmaia50@gmail.com', '03518945856', '2003-02-15', NULL, '/archivosDocumento/Karina_Lopez_45269236_foto.png', 152, NULL, 1, NULL),
(138, 'Walter', 'Asef', 'DNI', 'Argentina', '36256478', '20-36256478-1', 'crisbmaia50@gmail.com', '65478123', '1993-03-26', NULL, '/archivosDocumento/Walter_Asef_36256478_foto.png', 158, NULL, 1, NULL),
(139, 'Gonzalo', 'Bonsac', 'DNI', 'Argentina', '33326321', '20-33326321-2', 'crisbmaia50@gmail.com', '03515647859', '1990-12-06', NULL, '/archivosDocumento/Gonzalo_Bonsac_33326321_foto.png', 159, NULL, 0, NULL),
(140, 'Lorena', 'Bisconti', 'DNI', 'Argentina', '41205205', '20-41205205-7', 'crisbmaia50@gmail.com', '03514512312', '2002-04-15', NULL, '/archivosDocumento/Lorena_Bisconti_41205205_foto.png', 160, NULL, 0, NULL),
(141, 'Fernando ', 'Ceballos', 'DNI', 'Argentina', '40125145', '20-40125145-7', 'crisbmaia50@gmail.com', '0351245125', '2003-12-02', NULL, '/archivosDocumento/Fernando_Ceballos_40125145_foto.png', 161, NULL, 1, NULL),
(145, 'Esteban', 'Eroles', 'DNI', 'Argentina', '45123632', '20-45123632-7', 'crisbmaia50@gmail.com', '03518947141', '2004-12-25', NULL, '/archivosDocumento/Esteban_Eroles_45123632_foto.png', 165, NULL, 1, NULL),
(146, 'Walter ', 'Maia', 'DNI', 'Argentina', '33256214', '20-33256214-3', 'crisbmaia50@gmail.com', '03515689445', '1989-05-26', NULL, '/archivosDocumento/Walter_Maia_33256214_foto.png', 166, NULL, 1, NULL),
(147, 'Francisco', 'Gauna', 'DNI', 'Argentina', '39526541', '20-39526541-6', 'crisbmaia50@gmail.com', '03517845632', '1997-12-26', NULL, NULL, 167, NULL, 1, NULL),
(148, 'Joseli', 'Paez', 'DNI', 'Argentina', '35214256', '20-35214256-6', 'crisbmaia50@gmail.com', '03516958645', '1992-05-26', NULL, '/archivosDocumento/Joseli_Paez_35214256_foto.png', 168, NULL, 1, NULL),
(149, 'Ana', 'Urzi', 'DNI', 'Argentina', '46125541', '20-46125541-9', 'crisbmaia50@gmail.com', '053514512365', '2004-12-06', NULL, '/archivosPendientes/Vanesa_Machado_46125541_foto.png', 169, NULL, 1, NULL),
(150, 'Maria', 'Nieves', 'DNI', 'Argentina', '38156654', '20-38156654-5', 'crisbmaia50@gmail.com', '03518956231', '1994-01-24', NULL, NULL, 170, NULL, 1, NULL),
(154, 'Gabriela', 'Lopez', 'DNI', 'Argentina', '45147745', '20-45147745-6', 'crisbmaia50@gmail.com', '0351784569125', '2002-12-05', NULL, NULL, 174, NULL, 1, NULL),
(157, 'Patricia ', 'Machado', 'DNI', 'Argentina', '45125874', '20-45125874-6', 'crisbmaia50@gmail.com', '03517845214', '2002-05-15', NULL, '/archivosDocumento/Patricia_Machado_45125874_foto.png', 177, NULL, 1, NULL),
(158, 'Estela', 'Marchesi', 'DNI', 'Argentina', '45125452', '20-45125452-1', 'crisbmaia50@gmail.com', '035178456236', '2003-02-25', NULL, '/archivosDocumento/Estela_Marchesi_45125452_foto.png', 178, NULL, 1, NULL),
(159, 'Estela ', 'Darten', 'DNI', 'Argentina', '45125563', '20-45125563-1', 'crisbmaia50@gmail.com', '0351236542', '2002-02-26', NULL, '/archivosDocumento/Estela_Darten_45125563_foto.png', 179, NULL, 1, NULL),
(160, 'Estela ', 'Albornoz', 'DNI', 'Argentina', '36125154', '20-36125154-8', 'crisbmaia50@gmail.com', '0351894561', '1992-12-05', NULL, '/archivosDocumento/Estela_Albornoz_36125154_foto.png', 180, NULL, 1, NULL),
(161, 'Stefanía', 'Iriarte', 'DNI', 'Argentina', '45874126', '20-45874126-4', 'crisbamaia50@gmail.com', '03517845625', '2003-06-10', NULL, NULL, 181, NULL, 1, NULL),
(162, 'Soledad', 'Marc', 'DNI', 'Argentina', '36256895', '20-36256895-2', 'crisbmaia50@gmail.com', '035156236125', '1993-03-02', NULL, NULL, 182, NULL, 0, NULL),
(163, 'Soledad', 'Diaz', 'DNI', 'Argentina', '39563241', '20-39563241-9', 'crisbmaia50@gmail.com', '0351263254', '1996-05-26', NULL, NULL, 183, NULL, 1, NULL),
(165, 'Matina', 'Ale', 'DNI', 'Argentina', '45125896', '20-45125896-7', 'crisbmaia50@gmail.com', '035189456236', '2003-12-28', NULL, '/archivosDocumento/Matina_Ale_45125896_foto.png', 185, NULL, 0, NULL),
(166, 'Sofia', 'Albornoz', 'DNI', 'Argentina', '45128569', '20-45128569-7', 'crisbmaia50@gmail.com', '0351896452', '2003-03-06', NULL, NULL, 186, NULL, 0, NULL),
(167, 'Carlos', 'Pinar', 'DNI', 'Argentina', '42205342', '20-42205342-6', 'crisbmaia@gmail.com', '0351-5612358', '1999-06-25', NULL, '/archivosDocumento/Carlos_Pinar_42205342_foto.png', 187, NULL, 1, NULL),
(168, 'David', 'Cárdena', 'DNI', 'Argentina', '44501105', '20-44501105-4', 'crisbmaia50@gmail.com', '03517845841', '2001-12-02', NULL, NULL, 188, NULL, 1, NULL),
(169, 'Silvana', 'Correa', 'DNI', 'Argentina', '40152145', '27-40152145-9', 'crisbmaia50@gmail.com', '035435615414', '1997-11-16', NULL, '/archivosDocumento/Silvana_Correa_40152145_foto.png', 189, NULL, 1, NULL),
(173, 'María Pia', 'Vazquez', 'DNI', 'Argentina', '46123325', '27-46123325-8', 'crisbmaia50@gmail.com', '03518945658', '2003-04-26', NULL, '/archivosDocumento/María_Pia_Vazquez_46123325_foto.png', 193, NULL, 1, NULL),
(174, 'Carlos', 'Mercado', 'DNI', 'Argentina', '39458569', '20-39458569-7', 'crisbmaia50@gmail.com', '035156789415', '1995-08-16', NULL, NULL, 194, NULL, 1, NULL),
(175, 'Julio', 'Canva', 'DNI', 'Argentina', '45125889', '20-45125889-4', 'crisbmaia50@gmail.com', '03518945874', '2004-05-16', NULL, '/archivosDocumento/Julio_Canva_45125889_foto.png', 195, NULL, 1, NULL),
(176, 'Isabela', 'Nuñez', 'DNI', 'Argentina', '32232232', '27-32232232-7', 'crisbmaia50@gmail.com', '11-5678-1234', '1993-06-25', NULL, NULL, 196, NULL, 1, NULL),
(177, 'Patricia', 'Miccio', 'DNI', 'Argentina', '48125874', '20-48125874-0', 'crisbmaia50@gmail.com', '03517845623', '2008-06-15', NULL, NULL, 197, NULL, 1, NULL),
(178, 'Dolores', 'Nieto', 'DNI', 'Argentina', '46125896', '27-46125896-9', 'crisbmaia50@gmail.com', '0351-7895561', '2004-12-23', NULL, '/archivosDocumento/Dolores_Nieto_46125896_foto.png', 198, NULL, 1, NULL),
(179, 'Martin', 'Barzola', 'DNI', 'Argentina', '46236985', '20-46236985-9', 'crisbmaia50@gmail.com', '03516325812', '2006-10-12', NULL, '/archivosDocumento/Martin_Barzola_46236985_foto.png', 199, NULL, 1, NULL),
(180, 'Andrea Fabiana ', 'Corres', 'DNI', 'Argentina', '30232232', '27-30232232-0', 'crisbmaia50@gmail.com', '0351-456323', '1986-10-02', NULL, '/archivosDocumento/Fabiana_Corres_30232232_foto.png', 200, NULL, 1, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_estudiantes_domicilios` (`idDomicilio`),
  ADD KEY `fk_estudiantes_usuarios` (`idUsuarios`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `fk_estudiantes_domicilios` FOREIGN KEY (`idDomicilio`) REFERENCES `domicilios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_estudiantes_usuarios` FOREIGN KEY (`idUsuarios`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
