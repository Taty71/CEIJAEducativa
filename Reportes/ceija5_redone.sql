-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 03:42:24
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
-- Estructura de tabla para la tabla `anio_plan`
--

CREATE TABLE `anio_plan` (
  `id` int(11) NOT NULL,
  `descripcionAnioPlan` varchar(10) NOT NULL,
  `idModalidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `anio_plan`
--

INSERT INTO `anio_plan` (`id`, `descripcionAnioPlan`, `idModalidad`) VALUES
(1, '1er Año', 1),
(2, '2do Año', 1),
(3, '3er Año', 1),
(4, 'Plan A', 2),
(5, 'Plan B', 2),
(6, 'Plan C', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_estudiantes`
--

CREATE TABLE `archivos_estudiantes` (
  `id` int(11) NOT NULL,
  `idEstudiante` int(11) NOT NULL,
  `tipoArchivo` varchar(100) DEFAULT NULL,
  `rutaArchivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `archivos_estudiantes`
--

INSERT INTO `archivos_estudiantes` (`id`, `idEstudiante`, `tipoArchivo`, `rutaArchivo`, `created_at`) VALUES
(1, 169, 'foto', '/archivosDocumento/Silvana_Correa_40152145_foto.png', '2025-11-01 21:56:04'),
(2, 169, 'archivo_dni', '/archivosDocumento/Silvana_Correa_40152145_archivo_dni.pdf', '2025-11-01 21:56:04'),
(3, 169, 'archivo_fichaMedica', '/archivosDocumento/Silvana_Correa_40152145_archivo_fichaMedica.pdf', '2025-11-01 21:56:04'),
(4, 149, 'foto', '/archivosPendientes/Vanesa_Machado_46125541_foto.png', '2025-11-01 22:14:16'),
(5, 149, 'archivo_dni', '/archivosPendientes/Vanesa_Machado_46125541_archivo_dni.pdf', '2025-11-01 22:14:16'),
(6, 149, 'archivo_fichaMedica', '/archivosPendientes/Vanesa_Machado_46125541_archivo_fichaMedica.pdf', '2025-11-01 22:14:16'),
(7, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_foto.png', '2025-11-06 19:30:22'),
(8, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_dni.pdf', '2025-11-06 19:30:22'),
(9, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_cuil.pdf', '2025-11-06 19:30:22'),
(10, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_fichaMedica.pdf', '2025-11-06 19:30:22'),
(11, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_partidaNacimiento.pdf', '2025-11-06 19:30:22'),
(12, 170, '0', '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_solicitudPase.pdf', '2025-11-06 19:30:22'),
(13, 174, 'archivo_certificadoNivelPrimario', '/archivosDocumento/Carlos_Mercado_39458569_archivo_certificadoNivelPrimario.pdf', '2025-11-20 05:06:46'),
(14, 176, 'archivo_cuil', '/archivosDocumento/Isabela_Nuñez_32232232_archivo_cuil.pdf', '2025-11-21 19:18:42'),
(15, 176, 'archivo_fichaMedica', '/archivosDocumento/Isabela_Nuñez_32232232_archivo_fichaMedica.pdf', '2025-11-21 19:18:42'),
(16, 176, 'archivo_partidaNacimiento', '/archivosDocumento/Isabela_Nuñez_32232232_archivo_partidaNacimiento.pdf', '2025-11-21 19:18:42'),
(17, 176, 'archivo_solicitudPase', '/archivosDocumento/Isabela_Nuñez_32232232_archivo_solicitudPase.pdf', '2025-11-21 19:18:42'),
(18, 177, 'archivo_cuil', '/archivosDocumento/Patricia_Miccio_48125874_archivo_cuil.pdf', '2025-12-03 16:14:03'),
(19, 177, 'archivo_fichaMedica', '/archivosDocumento/Patricia_Miccio_48125874_archivo_fichaMedica.pdf', '2025-12-03 16:14:03'),
(20, 177, 'archivo_partidaNacimiento', '/archivosDocumento/Patricia_Miccio_48125874_archivo_partidaNacimiento.pdf', '2025-12-03 16:14:03'),
(21, 177, 'archivo_analiticoParcial', '/archivosDocumento/Patricia_Miccio_48125874_archivo_analiticoParcial.pdf', '2025-12-03 16:14:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area_estudio`
--

CREATE TABLE `area_estudio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `area_estudio`
--

INSERT INTO `area_estudio` (`id`, `nombre`) VALUES
(1, 'Area Matemática'),
(2, 'Area Interpretación y Producción de'),
(3, 'Area Cs Naturales'),
(4, 'Area Cs Sociales'),
(5, 'ATP: Area Técnico Profesional');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `idEstudiante` int(11) NOT NULL,
  `idEstadoAsistencia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `barrios`
--

CREATE TABLE `barrios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `idLocalidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `barrios`
--

INSERT INTO `barrios` (`id`, `nombre`, `idLocalidad`) VALUES
(1, 'Maipú', 108),
(2, 'COVICO', 108),
(3, '25 de Mayo', 108),
(4, 'Los Filtros', 108),
(5, 'La Campana', 108),
(6, '9 de Julio', 108),
(7, 'La Isla', 108),
(8, 'Calera Central', 108),
(9, 'Villa Los Paraísos', 108),
(10, 'Stoecklin', 108),
(11, 'Industrial', 108),
(12, 'Dr. Cocca', 108),
(13, 'Altos de La Calera', 108),
(14, 'Los Prados', 108),
(15, 'Cuesta Colorada', 108),
(16, 'Cinco Lomas', 108),
(17, 'La Rufina', 108),
(18, 'La Pankana', 108),
(19, 'El Rodeo', 108),
(20, 'Alto Warcalde', 108),
(21, 'El Calicanto', 108),
(22, 'La Cuesta', 108),
(23, 'La Estanzuela', 108),
(24, 'Terrazas de La Estanzuela', 108),
(25, 'Centro', 108),
(26, 'Roca', 108),
(27, 'Dumesnil', 108);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificacion`
--

CREATE TABLE `calificacion` (
  `id` int(11) NOT NULL,
  `establecimientoDeOrigen` varchar(20) NOT NULL,
  `idEstudiante` int(11) NOT NULL,
  `idPersonalInstitucion` int(11) NOT NULL,
  `idMateria` int(11) NOT NULL,
  `idEstadoCalificacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_asistencias`
--

CREATE TABLE `detalle_asistencias` (
  `id` int(11) NOT NULL,
  `fecha_asistencia` date NOT NULL,
  `idDetalleAsistenciaEstado` int(11) NOT NULL,
  `idAsistencia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_asistencia_estado`
--

CREATE TABLE `detalle_asistencia_estado` (
  `id` int(11) NOT NULL,
  `detalle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_calificacion`
--

CREATE TABLE `detalle_calificacion` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `nota` int(2) NOT NULL,
  `idCalificacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_incorporacion`
--

CREATE TABLE `detalle_incorporacion` (
  `id` int(11) NOT NULL,
  `fechaEntrega` int(11) NOT NULL,
  `idDocumentaciones` int(11) NOT NULL,
  `idIncorporaciones` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_inscripcion`
--

CREATE TABLE `detalle_inscripcion` (
  `id` int(11) NOT NULL,
  `estadoDocumentacion` varchar(10) NOT NULL,
  `fechaEntrega` date DEFAULT NULL,
  `idDocumentaciones` int(11) NOT NULL,
  `idInscripcion` int(11) NOT NULL,
  `archivoDocumentacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_inscripcion`
--

INSERT INTO `detalle_inscripcion` (`id`, `estadoDocumentacion`, `fechaEntrega`, `idDocumentaciones`, `idInscripcion`, `archivoDocumentacion`) VALUES
(285, 'Entregado', '2025-09-26', 8, 78, '/archivosDocumento/Martin_Carras_44125623_foto.png'),
(286, 'Entregado', '2025-09-26', 1, 78, '/archivosDocumento/Martin_Carras_44125623_archivo_dni.pdf'),
(287, 'Entregado', '2025-09-26', 2, 78, '/archivosDocumento/Martin_Carras_44125623_archivo_cuil.pdf'),
(288, 'Entregado', '2025-09-26', 7, 78, '/archivosDocumento/Martin_Carras_44125623_archivo_solicitudPase.pdf'),
(295, 'Entregado', '2025-11-28', 8, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_foto.png'),
(296, 'Entregado', '2025-11-28', 1, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_dni.pdf'),
(297, 'Entregado', '2025-11-28', 2, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_cuil.pdf'),
(298, 'Entregado', '2025-11-28', 4, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_fichaMedica.pdf'),
(299, 'Entregado', '2025-11-28', 3, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_partidaNacimiento.pdf'),
(300, 'Entregado', '2025-11-28', 5, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_certificadoNivelPrimario.pdf'),
(304, 'Entregado', '2025-11-21', 8, 82, '/archivosDocumento/Mariela_Mansilla_40123123_foto.png'),
(305, 'Entregado', '2025-11-21', 1, 82, '/archivosDocumento/Mariela_Mansilla_40123123_archivo_dni.pdf'),
(306, 'Entregado', '2025-11-21', 2, 82, '/archivosDocumento/Mariela_Mansilla_40123123_archivo_cuil.pdf'),
(307, 'Entregado', '2025-11-21', 4, 82, '/archivosDocumento/Mariela_Mansilla_40123123_archivo_fichaMedica.pdf'),
(308, 'Entregado', '2025-11-21', 3, 82, '/archivosDocumento/Mariela_Mansilla_40123123_archivo_partidaNacimiento.pdf'),
(309, 'Entregado', '2025-09-29', 8, 83, '/archivosDocumento/Maria_Valles_44125521_foto.png'),
(310, 'Entregado', '2025-09-30', 8, 84, '/archivosDocumento/Sofia_Carras_39152152_foto.png'),
(311, 'Entregado', '2025-09-30', 1, 84, '/archivosDocumento/Sofia_Carras_39152152_archivo_dni.pdf'),
(312, 'Entregado', '2025-09-30', 2, 84, '/archivosDocumento/Sofia_Carras_39152152_archivo_cuil.pdf'),
(313, 'Entregado', '2025-09-30', 3, 84, '/archivosDocumento/Sofia_Carras_39152152_archivo_partidaNacimiento.pdf'),
(314, 'Entregado', '2025-09-30', 7, 84, '/archivosDocumento/Sofia_Carras_39152152_archivo_solicitudPase.pdf'),
(315, 'Entregado', '2025-12-04', 8, 85, '/archivosDocumento/Marcos_Vivas_39526123_foto.png'),
(316, 'Entregado', '2025-12-04', 1, 85, '/archivosDocumento/Marcos_Vivas_39526123_archivo_dni.pdf'),
(317, 'Entregado', '2025-12-04', 2, 85, '/archivosDocumento/Marcos_Vivas_39526123_archivo_cuil.pdf'),
(318, 'Entregado', '2025-11-21', 8, 86, '/archivosDocumento/Martin_Espindola_32125541_foto.png'),
(319, 'Entregado', '2025-11-21', 1, 86, '/archivosDocumento/Martin_Espindola_32125541_archivo_dni.pdf'),
(325, 'Entregado', '2025-10-03', 8, 88, '/archivosDocumento/Esteban_Capdevilla_41203210_foto.png'),
(326, 'Entregado', '2025-10-03', 1, 88, '/archivosDocumento/Esteban_Capdevilla_41203210_archivo_dni.pdf'),
(327, 'Entregado', '2025-10-03', 2, 88, '/archivosDocumento/Esteban_Capdevilla_41203210_archivo_cuil.pdf'),
(328, 'Entregado', '2025-10-03', 4, 88, '/archivosDocumento/Esteban_Capdevilla_41203210_archivo_fichaMedica.pdf'),
(329, 'Entregado', '2025-10-03', 8, 92, '/archivosDocumento/Martina_Loms_43201145_foto.png'),
(330, 'Entregado', '2025-10-03', 1, 92, '/archivosDocumento/Martina_Loms_43201145_archivo_dni.pdf'),
(331, 'Entregado', '2025-10-03', 2, 92, '/archivosDocumento/Martina_Loms_43201145_archivo_cuil.pdf'),
(332, 'Entregado', '2025-10-03', 4, 92, '/archivosDocumento/Martina_Loms_43201145_archivo_fichaMedica.pdf'),
(333, 'Entregado', '2025-12-09', 8, 93, '/archivosDocumento/Analía_Borelli_36230230_foto.png'),
(334, 'Entregado', '2025-12-09', 1, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_dni.pdf'),
(335, 'Entregado', '2025-12-09', 2, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_cuil.pdf'),
(336, 'Entregado', '2025-12-09', 4, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_partidaNacimiento.pdf'),
(337, 'Entregado', '2025-12-09', 3, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_fichaMedica.pdf'),
(338, 'Faltante', NULL, 7, 93, NULL),
(339, 'Entregado', '2025-10-03', 1, 94, '/archivosDocumento/Karina_Lopez_45269236_archivo_dni.pdf'),
(340, 'Entregado', '2025-10-03', 8, 94, '/archivosDocumento/Karina_Lopez_45269236_foto.png'),
(341, 'Entregado', '2025-10-03', 2, 94, '/archivosDocumento/Karina_Lopez_45269236_archivo_cuil.pdf'),
(342, 'Entregado', '2025-10-03', 4, 94, '/archivosDocumento/Karina_Lopez_45269236_archivo_fichaMedica.pdf'),
(361, 'Entregado', '2025-12-04', 8, 98, '/archivosDocumento/Walter_Asef_36256478_foto.png'),
(362, 'Entregado', '2025-12-04', 1, 98, '/archivosDocumento/Walter_Asef_36256478_archivo_dni.pdf'),
(363, 'Entregado', '2025-10-04', 8, 99, '/archivosDocumento/Gonzalo_Bonsac_33326321_foto.png'),
(364, 'Entregado', '2025-10-04', 1, 99, '/archivosDocumento/Gonzalo_Bonsac_33326321_archivo_dni.pdf'),
(365, 'Entregado', '2025-10-04', 2, 99, '/archivosDocumento/Gonzalo_Bonsac_33326321_archivo_cuil.pdf'),
(366, 'Entregado', '2025-10-04', 6, 99, '/archivosDocumento/Gonzalo_Bonsac_33326321_archivo_analiticoParcial.pdf'),
(367, 'Entregado', '2025-10-05', 8, 100, '/archivosDocumento/Lorena_Bisconti_41205205_foto.png'),
(368, 'Entregado', '2025-10-05', 1, 100, '/archivosDocumento/Lorena_Bisconti_41205205_archivo_dni.pdf'),
(369, 'Entregado', '2025-10-05', 2, 100, '/archivosDocumento/Lorena_Bisconti_41205205_archivo_cuil.pdf'),
(370, 'Entregado', '2025-10-05', 4, 100, '/archivosDocumento/Lorena_Bisconti_41205205_archivo_fichaMedica.pdf'),
(371, 'Entregado', '2025-10-06', 8, 101, '/archivosDocumento/Fernando_Ceballos_40125145_foto.png'),
(372, 'Entregado', '2025-10-06', 1, 101, '/archivosDocumento/Fernando_Ceballos_40125145_archivo_dni.pdf'),
(373, 'Entregado', '2025-10-06', 2, 101, '/archivosDocumento/Fernando_Ceballos_40125145_archivo_cuil.pdf'),
(374, 'Entregado', '2025-10-06', 3, 101, '/archivosDocumento/Fernando_Ceballos_40125145_archivo_fichaMedica.pdf'),
(375, 'Entregado', '2025-10-06', 5, 101, '/archivosDocumento/Fernando_Ceballos_40125145_archivo_solicitudPase.pdf'),
(376, 'Entregado', '2025-10-06', 8, 104, '/archivosDocumento/Esteban_Eroles_45123632_foto.png'),
(377, 'Entregado', '2025-10-06', 1, 104, '/archivosDocumento/Esteban_Eroles_45123632_archivo_dni.pdf'),
(378, 'Entregado', '2025-10-06', 2, 104, '/archivosDocumento/Esteban_Eroles_45123632_archivo_cuil.pdf'),
(379, 'Entregado', '2025-10-06', 3, 104, '/archivosDocumento/Esteban_Eroles_45123632_archivo_fichaMedica.pdf'),
(380, 'Entregado', '2025-10-06', 8, 105, '/archivosDocumento/Walter_Maia_33256214_foto.png'),
(381, 'Entregado', '2025-10-06', 1, 105, '/archivosDocumento/Walter_Maia_33256214_archivo_dni.pdf'),
(382, 'Entregado', '2025-10-06', 2, 105, '/archivosDocumento/Walter_Maia_33256214_archivo_cuil.pdf'),
(383, 'Entregado', '2025-10-06', 7, 105, '/archivosDocumento/Walter_Maia_33256214_archivo_certificadoNivelPrimario.pdf'),
(384, 'Entregado', '2025-10-07', 8, 106, NULL),
(385, 'Entregado', '2025-10-07', 1, 106, NULL),
(386, 'Entregado', '2025-10-07', 2, 106, NULL),
(387, 'Entregado', '2025-10-07', 3, 106, NULL),
(388, 'Entregado', '2025-10-07', 4, 106, '/archivosDocumento/Francisco_Gauna_39526541_archivo_partidaNacimiento.pdf'),
(389, 'Entregado', '2025-10-07', 5, 106, '/archivosDocumento/Francisco_Gauna_39526541_archivo_solicitudPase.pdf'),
(390, 'Entregado', '2025-10-07', 8, 108, NULL),
(391, 'Entregado', '2025-10-07', 1, 108, NULL),
(392, 'Entregado', '2025-10-07', 2, 108, NULL),
(393, 'Entregado', '2025-10-07', 3, 108, NULL),
(394, 'Entregado', '2025-10-07', 4, 108, '/archivosDocumento/Ana_Urzi_46125541_archivo_partidaNacimiento.pdf'),
(395, 'Entregado', '2025-10-07', 5, 108, '/archivosDocumento/Ana_Urzi_46125541_archivo_solicitudPase.pdf'),
(396, 'Entregado', '2025-10-07', 8, 109, NULL),
(397, 'Entregado', '2025-10-07', 1, 109, NULL),
(398, 'Entregado', '2025-10-07', 2, 109, NULL),
(399, 'Entregado', '2025-10-07', 3, 109, NULL),
(400, 'Entregado', '2025-10-07', 4, 109, NULL),
(401, 'Entregado', '2025-10-07', 5, 109, NULL),
(402, 'Entregado', '2025-10-08', 8, 113, NULL),
(403, 'Entregado', '2025-10-08', 1, 113, NULL),
(404, 'Entregado', '2025-10-08', 2, 113, NULL),
(405, 'Entregado', '2025-10-08', 3, 113, '/archivosDocumento/Gabriela_Lopez_45147745_archivo_fichaMedica.pdf'),
(406, 'Entregado', '2025-10-08', 4, 113, '/archivosDocumento/Gabriela_Lopez_45147745_archivo_partidaNacimiento.pdf'),
(407, 'Entregado', '2025-10-08', 6, 113, '/archivosDocumento/Gabriela_Lopez_45147745_archivo_analiticoParcial.pdf'),
(408, 'Entregado', '2025-10-08', 8, 116, NULL),
(409, 'Entregado', '2025-10-08', 1, 116, NULL),
(410, 'Entregado', '2025-10-08', 2, 116, NULL),
(411, 'Entregado', '2025-10-08', 3, 116, NULL),
(412, 'Entregado', '2025-10-08', 4, 116, NULL),
(413, 'Entregado', '2025-10-08', 5, 116, '/archivosDocumento/Patricia_Machado_45125874_archivo_solicitudPase.pdf'),
(414, 'Entregado', '2025-10-08', 8, 117, '/archivosDocumento/Estela_Marchesi_45125452_foto.png'),
(415, 'Entregado', '2025-10-08', 1, 117, '/archivosDocumento/Estela_Marchesi_45125452_archivo_dni.pdf'),
(416, 'Entregado', '2025-10-08', 2, 117, '/archivosDocumento/Estela_Marchesi_45125452_archivo_cuil.pdf'),
(417, 'Entregado', '2025-10-08', 3, 117, '/archivosDocumento/Estela_Marchesi_45125452_archivo_fichaMedica.pdf'),
(418, 'Entregado', '2025-10-08', 4, 117, '/archivosDocumento/Estela_Marchesi_45125452_archivo_partidaNacimiento.pdf'),
(419, 'Entregado', '2025-10-08', 5, 117, '/archivosDocumento/Estela_Marchesi_45125452_archivo_solicitudPase.pdf'),
(420, 'Entregado', '2025-10-08', 8, 118, '/archivosDocumento/Estela_Darten_45125563_foto.png'),
(421, 'Entregado', '2025-10-08', 1, 118, '/archivosDocumento/Estela_Darten_45125563_archivo_dni.pdf'),
(422, 'Entregado', '2025-10-08', 8, 119, '/archivosDocumento/Estela_Albornoz_36125154_foto.png'),
(423, 'Entregado', '2025-10-08', 1, 119, '/archivosDocumento/Estela_Albornoz_36125154_archivo_dni.pdf'),
(424, 'Entregado', '2025-10-08', 2, 119, '/archivosDocumento/Estela_Albornoz_36125154_archivo_cuil.pdf'),
(425, 'Entregado', '2025-10-08', 3, 119, '/archivosDocumento/Estela_Albornoz_36125154_archivo_fichaMedica.pdf'),
(426, 'Entregado', '2025-10-08', 8, 120, NULL),
(427, 'Entregado', '2025-10-08', 1, 120, NULL),
(428, 'Entregado', '2025-10-08', 2, 120, NULL),
(429, 'Entregado', '2025-10-08', 4, 120, NULL),
(430, 'Entregado', '2025-10-08', 3, 120, '/archivosDocumento/Stefanía_Iriarte_45874126_archivo_fichaMedica.pdf'),
(431, 'Entregado', '2025-10-08', 5, 120, '/archivosDocumento/Stefanía_Iriarte_45874126_archivo_solicitudPase.pdf'),
(432, 'Entregado', '2025-10-10', 8, 121, NULL),
(433, 'Entregado', '2025-10-10', 1, 121, NULL),
(434, 'Entregado', '2025-10-10', 2, 121, NULL),
(435, 'Entregado', '2025-10-10', 3, 121, '/archivosDocumento/Soledad_Marc_36256895_archivo_fichaMedica.pdf'),
(436, 'Entregado', '2025-10-10', 4, 121, '/archivosDocumento/Soledad_Marc_36256895_archivo_partidaNacimiento.pdf'),
(437, 'Entregado', '2025-10-10', 6, 121, '/archivosDocumento/Soledad_Marc_36256895_archivo_analiticoParcial.pdf'),
(438, 'Entregado', '2025-10-10', 8, 122, NULL),
(439, 'Entregado', '2025-10-10', 1, 122, NULL),
(440, 'Entregado', '2025-10-10', 2, 122, NULL),
(441, 'Entregado', '2025-10-10', 4, 122, NULL),
(442, 'Entregado', '2025-10-10', 3, 122, '/archivosDocumento/Soledad_Diaz_39563241_archivo_fichaMedica.pdf'),
(443, 'Entregado', '2025-10-10', 5, 122, '/archivosDocumento/Soledad_Diaz_39563241_archivo_solicitudPase.pdf'),
(444, 'Entregado', '2025-10-10', 8, 123, '/archivosDocumento/Matina_Ale_45125896_foto.png'),
(445, 'Entregado', '2025-10-10', 1, 123, '/archivosDocumento/Matina_Ale_45125896_archivo_dni.pdf'),
(446, 'Entregado', '2025-10-10', 2, 123, '/archivosDocumento/Matina_Ale_45125896_archivo_cuil.pdf'),
(447, 'Entregado', '2025-10-10', 4, 123, '/archivosDocumento/Matina_Ale_sin_dni_archivo_fichaMedica.pdf'),
(448, 'Entregado', '2025-10-10', 3, 123, '/archivosDocumento/Matina_Ale_sin_dni_archivo_partidaNacimiento.pdf'),
(449, 'Entregado', '2025-10-10', 5, 123, '/archivosDocumento/Matina_Ale_sin_dni_archivo_solicitudPase.pdf'),
(450, 'Entregado', '2025-10-10', 8, 124, NULL),
(451, 'Entregado', '2025-10-10', 1, 124, NULL),
(452, 'Entregado', '2025-10-10', 2, 124, NULL),
(453, 'Entregado', '2025-10-10', 3, 124, NULL),
(454, 'Entregado', '2025-10-10', 4, 124, '/archivosDocumento/Sofia_Albornoz_45128569_archivo_partidaNacimiento.pdf'),
(455, 'Entregado', '2025-10-10', 6, 124, '/archivosDocumento/Sofia_Albornoz_45128569_archivo_analiticoParcial.pdf'),
(456, 'Entregado', '2025-10-31', 8, 125, '/archivosDocumento/Carlos_Pinar_42205342_foto.png'),
(457, 'Entregado', '2025-10-31', 1, 125, '/archivosDocumento/Carlos_Pinar_42205342_archivo_dni.pdf'),
(458, 'Entregado', '2025-10-31', 2, 125, '/archivosDocumento/Carlos_Pinar_42205342_archivo_cuil.pdf'),
(459, 'Entregado', '2025-10-31', 3, 125, '/archivosDocumento/Carlos_Pinar_42205342_archivo_fichaMedica.pdf'),
(460, 'Entregado', '2025-10-31', 4, 125, '/archivosDocumento/Carlos_Pinar_42205342_archivo_partidaNacimiento.pdf'),
(461, 'Entregado', '2025-10-31', 6, 125, '/archivosDocumento/Carlos_Pinar_42205342_archivo_analiticoParcial.pdf'),
(462, 'Entregado', '2025-11-01', 8, 126, NULL),
(463, 'Entregado', '2025-11-01', 1, 126, NULL),
(464, 'Entregado', '2025-11-01', 2, 126, NULL),
(465, 'Entregado', '2025-11-01', 3, 126, NULL),
(466, 'Entregado', '2025-11-01', 4, 126, '/archivosDocumento/David_Cárdena_44501105_archivo_partidaNacimiento.pdf'),
(467, 'Entregado', '2025-11-01', 6, 126, '/archivosDocumento/David_Cárdena_44501105_archivo_analiticoParcial.pdf'),
(468, 'Entregado', '2025-11-01', 8, 127, '/archivosDocumento/Silvana_Correa_40152145_foto.png'),
(469, 'Entregado', '2025-11-01', 1, 127, '/archivosDocumento/Silvana_Correa_40152145_archivo_dni.pdf'),
(470, 'Entregado', '2025-11-01', 3, 127, '/archivosDocumento/Silvana_Correa_40152145_archivo_fichaMedica.pdf'),
(471, 'Entregado', '2025-11-06', 8, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_foto.png'),
(472, 'Entregado', '2025-11-06', 1, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_dni.pdf'),
(473, 'Entregado', '2025-11-06', 2, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_cuil.pdf'),
(474, 'Entregado', '2025-11-06', 3, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_fichaMedica.pdf'),
(475, 'Entregado', '2025-11-06', 4, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_partidaNacimiento.pdf'),
(476, 'Entregado', '2025-11-06', 5, 129, '/archivosDocumento/María_Pia_Vazquez_46123325_archivo_solicitudPase.pdf'),
(477, 'Entregado', '2025-11-20', 8, 130, NULL),
(478, 'Entregado', '2025-11-20', 4, 130, NULL),
(479, 'Entregado', '2025-11-20', 1, 130, NULL),
(480, 'Entregado', '2025-11-20', 2, 130, NULL),
(481, 'Entregado', '2025-11-20', 3, 130, NULL),
(482, 'Entregado', '2025-11-20', 7, 130, '/archivosDocumento/Carlos_Mercado_39458569_archivo_certificadoNivelPrimario.pdf'),
(483, 'Entregado', '2025-11-21', 5, 82, '/archivosDocumento/Mariela_Fabiana_Mansilla_40123123_archivo_solicitudPase.pdf'),
(484, 'Entregado', '2025-11-21', 1, 89, '/archivosDocumento/Elias_Rodriguez_43023356_archivo_dni.pdf'),
(485, 'Entregado', '2025-11-21', 2, 89, '/archivosDocumento/Elias_Rodriguez_43023356_archivo_cuil.pdf'),
(486, 'Entregado', '2025-11-21', 7, 82, '/archivosDocumento/Mariela_Fabiana_Mansilla_40123123_archivo_certificadoNivelPrimario.pdf'),
(487, 'Entregado', '2025-11-21', 6, 82, '/archivosDocumento/Mariela_Fabiana_Mansilla_40123123_archivo_analiticoParcial.pdf'),
(488, 'Entregado', '2025-11-21', 3, 89, '/archivosDocumento/Elias_Rodriguez_43023356_archivo_fichaMedica.pdf'),
(489, 'Entregado', '2025-11-21', 4, 89, '/archivosDocumento/Elias_Rodriguez_43023356_archivo_partidaNacimiento.pdf'),
(490, 'Entregado', '2025-11-21', 7, 89, '/archivosDocumento/Elias_Rodriguez_43023356_archivo_certificadoNivelPrimario.pdf'),
(491, 'Entregado', '2025-11-21', 2, 131, '/archivosDocumento/Julio_Canva_45125889_archivo_cuil.pdf'),
(492, 'Entregado', '2025-11-21', 1, 131, '/archivosDocumento/Julio_Canva_45125889_archivo_dni.pdf'),
(493, 'Entregado', '2025-11-21', 3, 131, '/archivosDocumento/Julio_Canva_45125889_archivo_fichaMedica.pdf'),
(494, 'Entregado', '2025-11-21', 4, 131, '/archivosDocumento/Julio_Canva_45125889_archivo_partidaNacimiento.pdf'),
(495, 'Entregado', '2025-11-21', 5, 131, '/archivosDocumento/Julio_Canva_45125889_archivo_solicitudPase.pdf'),
(496, 'Entregado', '2025-11-21', 8, 131, '/archivosDocumento/Julio_Canva_45125889_foto.png'),
(497, 'Entregado', '2025-11-21', 2, 86, '/archivosDocumento/Martin_Espindola_32125541_archivo_cuil.pdf'),
(498, 'Entregado', '2025-11-21', 3, 86, '/archivosDocumento/Martin_Espindola_32125541_archivo_fichaMedica.pdf'),
(499, 'Entregado', '2025-11-21', 4, 86, '/archivosDocumento/Martin_Espindola_32125541_archivo_partidaNacimiento.pdf'),
(500, 'Entregado', '2025-11-21', 7, 86, '/archivosDocumento/Martin_Espindola_32125541_archivo_certificadoNivelPrimario.pdf'),
(501, 'Entregado', '2025-12-10', 8, 132, '/archivosDocumento/Isabela_Nuñez_32232232_foto.png'),
(502, 'Faltante', NULL, 1, 132, NULL),
(503, 'Entregado', '2025-12-10', 2, 132, '/archivosDocumento/Isabela_Nuñez_32232232_archivo_cuil.pdf'),
(504, 'Entregado', '2025-12-10', 3, 132, '/archivosDocumento/Isabela_Nuñez_32232232_archivo_fichaMedica.pdf'),
(505, 'Entregado', '2025-12-10', 4, 132, '/archivosDocumento/Isabela_Nuñez_32232232_archivo_partidaNacimiento.pdf'),
(506, 'Entregado', '2025-12-10', 5, 132, '/archivosDocumento/Isabela_Nuñez_32232232_archivo_solicitudPase.pdf'),
(507, 'Entregado', '2025-11-28', 6, 80, '/archivosDocumento/Juan_Pablo_Perez_43032642_archivo_analiticoParcial.pdf'),
(508, 'Entregado', '2025-12-03', 8, 133, NULL),
(509, 'Entregado', '2025-12-03', 1, 133, NULL),
(510, 'Entregado', '2025-12-03', 5, 133, NULL),
(511, 'Entregado', '2025-12-03', 2, 133, '/archivosDocumento/Patricia_Miccio_48125874_archivo_cuil.pdf'),
(512, 'Entregado', '2025-12-03', 3, 133, '/archivosDocumento/Patricia_Miccio_48125874_archivo_fichaMedica.pdf'),
(513, 'Entregado', '2025-12-03', 4, 133, '/archivosDocumento/Patricia_Miccio_48125874_archivo_partidaNacimiento.pdf'),
(514, 'Entregado', '2025-12-03', 6, 133, '/archivosDocumento/Patricia_Miccio_48125874_archivo_analiticoParcial.pdf'),
(515, 'Entregado', '2025-12-04', 3, 85, '/archivosDocumento/Marcos_Vivas_39526123_archivo_fichaMedica.pdf'),
(516, 'Entregado', '2025-12-04', 4, 85, '/archivosDocumento/Marcos_Vivas_39526123_archivo_partidaNacimiento.pdf'),
(517, 'Entregado', '2025-12-04', 5, 85, '/archivosDocumento/Marcos_Vivas_39526123_archivo_solicitudPase.pdf'),
(518, 'Entregado', '2025-12-04', 2, 98, '/archivosDocumento/Walter_Asef_36256478_archivo_cuil.pdf'),
(519, 'Entregado', '2025-12-04', 3, 98, '/archivosDocumento/Walter_Asef_36256478_archivo_fichaMedica.pdf'),
(520, 'Entregado', '2025-12-04', 4, 98, '/archivosDocumento/Walter_Asef_36256478_archivo_partidaNacimiento.pdf'),
(521, 'Entregado', '2025-12-04', 7, 98, '/archivosDocumento/Walter_Asef_36256478_archivo_certificadoNivelPrimario.pdf'),
(522, 'Entregado', '2025-12-09', 5, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_solicitudPase.pdf'),
(523, 'Entregado', '2025-12-09', 6, 93, '/archivosDocumento/Analía_Borelli_36230230_archivo_analiticoParcial.pdf'),
(524, 'Entregado', '2025-12-10', 6, 132, '/archivosDocumento/Isabela_Nuñez_32232232_archivo_analiticoParcial.pdf');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `divisiones`
--

CREATE TABLE `divisiones` (
  `id` int(11) NOT NULL,
  `division` varchar(50) NOT NULL,
  `idAnioPlan` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `divisiones`
--

INSERT INTO `divisiones` (`id`, `division`, `idAnioPlan`) VALUES
(1, 'A', 1),
(2, 'B', 1),
(3, 'A', 3),
(4, 'B', 1),
(5, 'B', 2),
(6, 'B', 3),
(7, 'C', 1),
(8, 'C', 2),
(9, 'C', 3),
(10, 'D', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentaciones`
--

CREATE TABLE `documentaciones` (
  `id` int(11) NOT NULL,
  `descripcionDocumentacion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documentaciones`
--

INSERT INTO `documentaciones` (`id`, `descripcionDocumentacion`) VALUES
(1, 'archivo_dni'),
(2, 'archivo_cuil'),
(3, 'archivo_fichaMedica'),
(4, 'archivo_partidaNacimiento'),
(5, 'archivo_solicitudPase'),
(6, 'archivo_analiticoParcial'),
(7, 'archivo_certificadoNivelPrimario'),
(8, 'foto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `domicilios`
--

CREATE TABLE `domicilios` (
  `id` int(11) NOT NULL,
  `calle` varchar(50) NOT NULL,
  `numero` int(11) NOT NULL,
  `idBarrio` int(11) NOT NULL,
  `idLocalidad` int(11) DEFAULT NULL,
  `idProvincia` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `domicilios`
--

INSERT INTO `domicilios` (`id`, `calle`, `numero`, `idBarrio`, `idLocalidad`, `idProvincia`) VALUES
(135, 'Estanislao del Campo', 563, 8, 108, 5),
(136, 'Manuel Pizarro', 484, 8, 108, 5),
(137, 'Uriburu', 785, 10, 108, 5),
(138, 'Julio Roca', 870, 25, 108, 5),
(139, 'Julio A Roca', 1023, 25, 108, 5),
(140, 'Julio Roca', 870, 25, 108, 5),
(141, 'Sucre', 563, 26, 108, 5),
(142, 'Roca', 563, 25, 108, 5),
(143, 'Uriburu', 236, 10, 108, 5),
(144, 'Leopoldo Herrera', 330, 21, 108, 5),
(145, '9 de Julio ', 546, 25, 108, 5),
(146, 'Rivadavia', 123, 16, 108, 5),
(147, 'Rivadavia', 2025, 6, 108, 5),
(148, 'Las Anémonas', 456, 22, 108, 5),
(150, 'Jujuy', 568, 5, 108, 5),
(151, 'Jose Marti', 631, 11, 108, 5),
(152, 'Catamarca', 85, 27, 108, 5),
(153, 'San Martin ', 856, 25, 108, 5),
(154, 'José Hernández', 896, 11, 108, 5),
(155, 'José Hernández', 896, 11, 108, 5),
(158, 'Sucre', 435, 11, 108, 5),
(159, '9 de Julio ', 632, 25, 108, 5),
(160, 'Sucre', 1022, 11, 108, 5),
(161, 'Francisco Miranda', 562, 11, 108, 5),
(165, 'Savio', 895, 20, 108, 5),
(166, 'Dorrego', 563, 19, 108, 5),
(167, 'Rivadavia', 22, 25, 108, 5),
(168, 'San Martin', 369, 25, 108, 5),
(169, 'Las Violetas', 635, 22, 108, 5),
(170, 'Garcia Lorca', 864, 11, 108, 5),
(174, 'San Martin ', 48, 25, 108, 5),
(177, 'Francisco Miranda', 631, 11, 108, 5),
(178, 'Roca ', 563, 25, 108, 5),
(179, 'San Martin', 256, 25, 108, 5),
(180, 'Roca', 2369, 25, 108, 5),
(181, 'Roca', 458, 25, 108, 5),
(182, 'Jujuy', 236, 27, 108, 5),
(183, 'Gabriela Mistral', 369, 10, 108, 5),
(184, 'Jose h', 365, 21, 108, 5),
(185, 'Sucre', 569, 11, 108, 5),
(186, 'Sucre', 235, 12, 108, 5),
(187, 'Julio Roca', 1025, 25, 108, 5),
(188, 'Balcarce', 125, 10, 108, 5),
(189, 'Garcia Lorca', 258, 11, 108, 5),
(190, 'Simon Bolivar', 365, 10, 108, 5),
(192, 'Simon Bolivar', 365, 10, 108, 5),
(193, 'Simon Bolivar', 365, 10, 108, 5),
(194, 'Mitre', 952, 1, 108, 5),
(195, 'Jujuy', 589, 27, 108, 5),
(196, 'San Martin', 283, 13, 108, 5),
(197, 'Las Margaritas', 897, 22, 108, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_asistencia`
--

CREATE TABLE `estado_asistencia` (
  `id` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_calificacion`
--

CREATE TABLE `estado_calificacion` (
  `id` int(11) NOT NULL,
  `estadoCalificacion` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_incorporaciones`
--

CREATE TABLE `estado_incorporaciones` (
  `id` int(11) NOT NULL,
  `estadoIncorporacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_inscripciones`
--

CREATE TABLE `estado_inscripciones` (
  `id` int(11) NOT NULL,
  `descripcionEstado` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_inscripciones`
--

INSERT INTO `estado_inscripciones` (`id`, `descripcionEstado`) VALUES
(1, 'pendiente'),
(2, 'completa'),
(3, 'anulada');

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
  `foto` varchar(500) DEFAULT NULL,
  `idDomicilio` int(11) NOT NULL,
  `idUsuarios` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Campo para eliminación lógica: 1=activo, 0=inactivo',
  `motivo_baja` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `nombre`, `apellido`, `tipoDocumento`, `paisEmision`, `dni`, `cuil`, `email`, `telefono`, `fechaNacimiento`, `foto`, `idDomicilio`, `idUsuarios`, `activo`, `motivo_baja`) VALUES
(118, 'Martin', 'Carras', 'DNI', 'Argentina', '44125623', '20-44125623-8', 'cbmaia@gmail.com', '03518912512', '2001-02-03', '/archivosDocumento/Martin_Carras_44125623_foto.png', 135, NULL, 0, NULL),
(120, 'Juan Pablo', 'Perez', 'DNI', 'Argentina', '43032642', '20-43032642-3', 'crisbmaia50@gmail.com', '03518912512', '2000-03-02', '/archivosDocumento/Juan_Pablo_Perez_43032642_foto.png', 137, NULL, 1, NULL),
(122, 'Mariela Fabiana', 'Mansilla', 'DNI', 'Argentina', '40123123', '20-40123123-5', 'crisbmaia50@gmail.com', '03514545623', '1996-02-03', '/archivosDocumento/Mariela_Mansilla_40123123_foto.png', 139, NULL, 1, NULL),
(123, 'Maria', 'Valles', 'DNI', 'Argentina', '44125521', '20-44125521-8', 'cristinbmaia@gmail.com', '03543650855', '2001-03-02', '/archivosDocumento/Maria_Valles_44125521_foto.png', 140, NULL, 0, 'No completó Inscripción'),
(124, 'Sofia', 'Carras', 'DNI', 'Argentina', '39152152', '20-39152152-3', 'crisbmaia50@gmail.com', '03518912512', '1996-06-03', '/archivosDocumento/Sofia_Carras_39152152_foto.png', 141, NULL, 1, NULL),
(125, 'Marcos', 'Vivas', 'DNI', 'Argentina', '39526123', '20-39526123-2', 'crisbmaia50@gmail.com', '03514512320', '1996-06-02', '/archivosDocumento/Marcos_Vivas_39526123_foto.png', 142, NULL, 1, NULL),
(126, 'Martin', 'Espindola', 'DNI', 'Argentina', '32125541', '20-32125541-9', 'cristinbmaia50@gmail.com', '03518945623', '1989-06-03', '/archivosDocumento/Martin_Espindola_32125541_foto.png', 143, NULL, 1, NULL),
(128, 'Esteban', 'Capdevilla', 'DNI', 'Argentina', '41203210', '20-41203210-2', 'crisbmaia50@gmail.com', '03514578956', '1998-06-02', '/archivosDocumento/Esteban_Capdevilla_41203210_foto.png', 145, NULL, 1, NULL),
(129, 'Elias', 'Rodriguez', 'DNI', 'Argentina', '43023356', '24-43023356-6', 'crisbmaia50@gmail.com', '03517845612', '1996-06-03', '/archivosDocumento/Elias_Rodriguez_43023356_foto.png', 146, NULL, 1, NULL),
(130, 'Matias', 'Nazareno', 'DNI', 'Argentina', '32279832', '20-32279832-7', 'crisbmaia50@gmail.com', '03517845123', '1989-09-06', '/archivosDocumento/Analía_Borelli_36230230_foto.jpg', 147, NULL, 1, NULL),
(131, 'Marcos', 'Campigotto', 'DNI', 'Argentina', '43125587', '20-43125587-2', 'crisbmaia50@gmail.com', '03543645123', '2000-08-06', '/archivosDocumento/Marcos_Campigotto_43125587_foto.jpg', 148, NULL, 1, NULL),
(132, 'Martina', 'Loms', 'DNI', 'Argentina', '43201145', '20-43201145-4', 'crisbmaia50@gmail.com', '035112563987', '2001-12-03', '/archivosDocumento/Martina_Loms_43201145_foto.png', 150, NULL, 1, NULL),
(133, 'Analía', 'Borelli', 'DNI', 'Argentina', '36230230', '20-36230230-8', 'crisbmaia50@gmail.com', '03518945612', '1993-08-06', NULL, 151, NULL, 1, NULL),
(134, 'Karina', 'Lopez', 'DNI', 'Argentina', '45269236', '20-45269236-9', 'crisbmaia50@gmail.com', '03518945856', '2003-02-15', '/archivosDocumento/Karina_Lopez_45269236_foto.png', 152, NULL, 1, NULL),
(138, 'Walter', 'Asef', 'DNI', 'Argentina', '36256478', '20-36256478-1', 'crisbmaia50@gmail.com', '65478123', '1993-03-26', '/archivosDocumento/Walter_Asef_36256478_foto.png', 158, NULL, 1, NULL),
(139, 'Gonzalo', 'Bonsac', 'DNI', 'Argentina', '33326321', '20-33326321-2', 'crisbmaia50@gmail.com', '03515647859', '1990-12-06', '/archivosDocumento/Gonzalo_Bonsac_33326321_foto.png', 159, NULL, 0, NULL),
(140, 'Lorena', 'Bisconti', 'DNI', 'Argentina', '41205205', '20-41205205-7', 'crisbmaia50@gmail.com', '03514512312', '2002-04-15', '/archivosDocumento/Lorena_Bisconti_41205205_foto.png', 160, NULL, 0, NULL),
(141, 'Fernando ', 'Ceballos', 'DNI', 'Argentina', '40125145', '20-40125145-7', 'crisbmaia50@gmail.com', '0351245125', '2003-12-02', '/archivosDocumento/Fernando_Ceballos_40125145_foto.png', 161, NULL, 1, NULL),
(145, 'Esteban', 'Eroles', 'DNI', 'Argentina', '45123632', '20-45123632-7', 'crisbmaia50@gmail.com', '03518947141', '2004-12-25', '/archivosDocumento/Esteban_Eroles_45123632_foto.png', 165, NULL, 1, NULL),
(146, 'Walter ', 'Maia', 'DNI', 'Argentina', '33256214', '20-33256214-3', 'crisbmaia50@gmail.com', '03515689445', '1989-05-26', '/archivosDocumento/Walter_Maia_33256214_foto.png', 166, NULL, 1, NULL),
(147, 'Francisco', 'Gauna', 'DNI', 'Argentina', '39526541', '20-39526541-6', 'crisbmaia50@gmail.com', '03517845632', '1997-12-26', NULL, 167, NULL, 1, NULL),
(148, 'Joseli', 'Paez', 'DNI', 'Argentina', '35214256', '20-35214256-6', 'crisbmaia50@gmail.com', '03516958645', '1992-05-26', '/archivosDocumento/Joseli_Paez_35214256_foto.png', 168, NULL, 1, NULL),
(149, 'Ana', 'Urzi', 'DNI', 'Argentina', '46125541', '20-46125541-9', 'crisbmaia50@gmail.com', '053514512365', '2004-12-06', '/archivosPendientes/Vanesa_Machado_46125541_foto.png', 169, NULL, 1, NULL),
(150, 'Maria', 'Nieves', 'DNI', 'Argentina', '38156654', '20-38156654-5', 'crisbmaia50@gmail.com', '03518956231', '1994-01-24', NULL, 170, NULL, 1, NULL),
(154, 'Gabriela', 'Lopez', 'DNI', 'Argentina', '45147745', '20-45147745-6', 'crisbmaia50@gmail.com', '0351784569125', '2002-12-05', NULL, 174, NULL, 1, NULL),
(157, 'Patricia ', 'Machado', 'DNI', 'Argentina', '45125874', '20-45125874-6', 'crisbmaia50@gmail.com', '03517845214', '2002-05-15', '/archivosDocumento/Patricia_Machado_45125874_foto.png', 177, NULL, 1, NULL),
(158, 'Estela', 'Marchesi', 'DNI', 'Argentina', '45125452', '20-45125452-1', 'crisbmaia50@gmail.com', '035178456236', '2003-02-25', '/archivosDocumento/Estela_Marchesi_45125452_foto.png', 178, NULL, 1, NULL),
(159, 'Estela ', 'Darten', 'DNI', 'Argentina', '45125563', '20-45125563-1', 'crisbmaia50@gmail.com', '0351236542', '2002-02-26', '/archivosDocumento/Estela_Darten_45125563_foto.png', 179, NULL, 1, NULL),
(160, 'Estela ', 'Albornoz', 'DNI', 'Argentina', '36125154', '20-36125154-8', 'crisbmaia50@gmail.com', '0351894561', '1992-12-05', '/archivosDocumento/Estela_Albornoz_36125154_foto.png', 180, NULL, 1, NULL),
(161, 'Stefanía', 'Iriarte', 'DNI', 'Argentina', '45874126', '20-45874126-4', 'crisbamaia50@gmail.com', '03517845625', '2003-06-10', NULL, 181, NULL, 1, NULL),
(162, 'Soledad', 'Marc', 'DNI', 'Argentina', '36256895', '20-36256895-2', 'crisbmaia50@gmail.com', '035156236125', '1993-03-02', NULL, 182, NULL, 0, NULL),
(163, 'Soledad', 'Diaz', 'DNI', 'Argentina', '39563241', '20-39563241-9', 'crisbmaia50@gmail.com', '0351263254', '1996-05-26', NULL, 183, NULL, 1, NULL),
(165, 'Matina', 'Ale', 'DNI', 'Argentina', '45125896', '20-45125896-7', 'crisbmaia50@gmail.com', '035189456236', '2003-12-28', '/archivosDocumento/Matina_Ale_45125896_foto.png', 185, NULL, 0, NULL),
(166, 'Sofia', 'Albornoz', 'DNI', 'Argentina', '45128569', '20-45128569-7', 'crisbmaia50@gmail.com', '0351896452', '2003-03-06', NULL, 186, NULL, 0, NULL),
(167, 'Carlos', 'Pinar', 'DNI', 'Argentina', '42205342', '20-42205342-6', 'crisbmaia@gmail.com', '0351-5612358', '1999-06-25', '/archivosDocumento/Carlos_Pinar_42205342_foto.png', 187, NULL, 1, NULL),
(168, 'David', 'Cárdena', 'DNI', 'Argentina', '44501105', '20-44501105-4', 'crisbmaia50@gmail.com', '03517845841', '2001-12-02', NULL, 188, NULL, 1, NULL),
(169, 'Silvana', 'Correa', 'DNI', 'Argentina', '40152145', '27-40152145-9', 'crisbmaia50@gmail.com', '035435615414', '1997-11-16', '/archivosDocumento/Silvana_Correa_40152145_foto.png', 189, NULL, 1, NULL),
(173, 'María Pia', 'Vazquez', 'DNI', 'Argentina', '46123325', '27-46123325-8', 'crisbmaia50@gmail.com', '03518945658', '2003-04-26', '/archivosDocumento/María_Pia_Vazquez_46123325_foto.png', 193, NULL, 1, NULL),
(174, 'Carlos', 'Mercado', 'DNI', 'Argentina', '39458569', '20-39458569-7', 'crisbmaia50@gmail.com', '035156789415', '1995-08-16', NULL, 194, NULL, 1, NULL),
(175, 'Julio', 'Canva', 'DNI', 'Argentina', '45125889', '20-45125889-4', 'crisbmaia50@gmail.com', '03518945874', '2004-05-16', '/archivosDocumento/Julio_Canva_45125889_foto.png', 195, NULL, 1, NULL),
(176, 'Isabela', 'Nuñez', 'DNI', 'Argentina', '32232232', '27-32232232-7', 'crisbmaia50@gmail.com', '11-5678-1234', '1993-06-25', NULL, 196, NULL, 1, NULL),
(177, 'Patricia', 'Miccio', 'DNI', 'Argentina', '48125874', '20-48125874-0', 'crisbmaia50@gmail.com', '03517845623', '2008-06-15', NULL, 197, NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incorporaciones`
--

CREATE TABLE `incorporaciones` (
  `id` int(11) NOT NULL,
  `fechaIncorporacion` date NOT NULL,
  `situaciónRevista` varchar(50) NOT NULL,
  `idPersonal` int(11) NOT NULL,
  `idEstadoIncorporacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id` int(11) NOT NULL,
  `fechaInscripcion` date NOT NULL,
  `idEstudiante` int(11) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `idAnioPlan` int(11) NOT NULL,
  `idModulos` int(11) NOT NULL,
  `idEstadoInscripcion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`id`, `fechaInscripcion`, `idEstudiante`, `idModalidad`, `idAnioPlan`, `idModulos`, `idEstadoInscripcion`) VALUES
(78, '2025-09-26', 118, 2, 5, 4, 1),
(80, '2025-09-27', 120, 2, 4, 1, 2),
(82, '2025-09-28', 122, 2, 4, 1, 2),
(83, '2025-09-28', 123, 2, 4, 1, 3),
(84, '2025-09-30', 124, 1, 2, 0, 1),
(85, '2025-10-01', 125, 2, 4, 1, 2),
(86, '2025-10-01', 126, 2, 4, 1, 2),
(88, '2025-10-02', 128, 2, 5, 4, 2),
(89, '2025-10-02', 129, 2, 4, 1, 2),
(90, '2025-10-03', 130, 1, 1, 0, 3),
(91, '2025-10-03', 131, 1, 2, 0, 1),
(92, '2025-10-03', 132, 1, 2, 0, 1),
(93, '2025-10-03', 133, 1, 1, 0, 2),
(94, '2025-10-03', 134, 2, 5, 4, 1),
(98, '2025-10-04', 138, 2, 4, 1, 2),
(99, '2025-10-04', 139, 1, 2, 0, 1),
(100, '2025-10-04', 140, 2, 5, 4, 1),
(101, '2025-10-06', 141, 2, 5, 5, 2),
(104, '2025-10-06', 145, 2, 6, 6, 1),
(105, '2025-10-06', 146, 2, 4, 1, 1),
(106, '2025-10-06', 147, 2, 5, 4, 2),
(107, '2025-10-06', 148, 2, 4, 1, 1),
(108, '2025-10-07', 149, 2, 5, 4, 2),
(109, '2025-10-07', 150, 1, 2, 0, 1),
(113, '2025-10-07', 154, 2, 5, 4, 1),
(116, '2025-10-08', 157, 1, 2, 0, 1),
(117, '2025-10-08', 158, 2, 5, 4, 1),
(118, '2025-10-08', 159, 2, 5, 4, 1),
(119, '2025-10-08', 160, 2, 5, 4, 1),
(120, '2025-10-08', 161, 1, 2, 0, 1),
(121, '2025-10-09', 162, 2, 6, 6, 1),
(122, '2025-10-09', 163, 2, 6, 6, 1),
(123, '2025-10-10', 165, 2, 4, 1, 2),
(124, '2025-10-10', 166, 2, 5, 4, 1),
(125, '2025-10-31', 167, 2, 5, 4, 2),
(126, '2025-10-31', 168, 2, 5, 4, 2),
(127, '2025-11-01', 169, 2, 5, 0, 1),
(129, '2025-11-06', 173, 2, 6, 6, 1),
(130, '2025-11-20', 174, 2, 4, 1, 2),
(131, '2025-11-21', 175, 2, 5, 4, 1),
(132, '2025-11-21', 176, 1, 2, 0, 2),
(133, '2025-12-03', 177, 2, 5, 5, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidades`
--

CREATE TABLE `localidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `idProvincia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `localidades`
--

INSERT INTO `localidades` (`id`, `nombre`, `idProvincia`) VALUES
(1, 'Achiras', 5),
(2, 'Adelia María', 5),
(3, 'Agua de Oro', 5),
(4, 'Aldea Santa María', 5),
(5, 'Alejandro Roca', 5),
(6, 'Alejo Ledesma', 5),
(7, 'Alicia', 5),
(8, 'Almafuerte', 5),
(9, 'Alpa Corral', 5),
(10, 'Alta Gracia', 5),
(11, 'Bañado de Soto', 5),
(12, 'Bell Ville', 5),
(13, 'Bengolea', 5),
(14, 'Benjamín Gould', 5),
(15, 'Berrotarán', 5),
(16, 'Bialet Massé', 5),
(17, 'Bouwer', 5),
(18, 'Brinkmann', 5),
(19, 'Buchardo', 5),
(20, 'Bulnes', 5),
(21, 'Cabalango', 5),
(22, 'Calamuchita', 5),
(23, 'Calchín', 5),
(24, 'Calchín Oeste', 5),
(25, 'Calmayo', 5),
(26, 'Camilo Aldao', 5),
(27, 'Caminiaga', 5),
(28, 'Canals', 5),
(29, 'Candelaria Sud', 5),
(30, 'Capilla del Carmen', 5),
(31, 'Capilla del Monte', 5),
(32, 'Capilla de los Remedios', 5),
(33, 'Capilla de Sitón', 5),
(34, 'Capitán O’Higgins', 5),
(35, 'Carrilobo', 5),
(36, 'Casa Grande', 5),
(37, 'Cavanagh', 5),
(38, 'Chancaní', 5),
(39, 'Chazón', 5),
(40, 'Chilcas', 5),
(41, 'Chuña', 5),
(42, 'Chuña Huasi', 5),
(43, 'Colazo', 5),
(44, 'Colonia Almada', 5),
(45, 'Colonia Anita', 5),
(46, 'Colonia Caroya', 5),
(47, 'Colonia Elia', 5),
(48, 'Colonia El Trébol', 5),
(49, 'Colonia Iturraspe', 5),
(50, 'Colonia Las Pichanas', 5),
(51, 'Colonia Los Molles', 5),
(52, 'Colonia Prosperidad', 5),
(53, 'Colonia Tirolesa', 5),
(54, 'Colonia Vicente Agüero', 5),
(55, 'Colonia Viamonte', 5),
(56, 'Colonia Yacanto', 5),
(57, 'Colonia Zárate', 5),
(58, 'Corral de Bustos', 5),
(59, 'Coronel Baigorria', 5),
(60, 'Coronel Moldes', 5),
(61, 'Coronel Pringles', 5),
(62, 'Corralito', 5),
(63, 'Cruz del Eje', 5),
(64, 'Cruz de Caña', 5),
(65, 'Cruz de los Milagros', 5),
(66, 'Dean Funes', 5),
(67, 'Dique Chico', 5),
(68, 'Dique Los Molinos', 5),
(69, 'Dique San Roque', 5),
(70, 'Duarte', 5),
(71, 'El Arañado', 5),
(72, 'El Brete', 5),
(73, 'El Chacho', 5),
(74, 'El Crispín', 5),
(75, 'El Durazno', 5),
(76, 'El Fortín', 5),
(77, 'El Higuerón', 5),
(78, 'El Manzano', 5),
(79, 'El Quebracho', 5),
(80, 'El Rodeo', 5),
(81, 'El Tío', 5),
(82, 'Embalse', 5),
(83, 'Estación General Paz', 5),
(84, 'Estación Juárez Celman', 5),
(85, 'Estación Los Cerrillos', 5),
(86, 'Estación Rivera Indarte', 5),
(87, 'Estancia Vieja', 5),
(88, 'Etruria', 5),
(89, 'Ferreyra', 5),
(90, 'General Baldissera', 5),
(91, 'General Cabrera', 5),
(92, 'General Deheza', 5),
(93, 'General Fotheringham', 5),
(94, 'General Levalle', 5),
(95, 'General Paz', 5),
(96, 'General Roca', 5),
(97, 'General San Martín', 5),
(98, 'General Villagrán', 5),
(99, 'Guadalcázar', 5),
(100, 'Guatimozín', 5),
(101, 'Hernando', 5),
(102, 'Huanchilla', 5),
(103, 'Huerta Grande', 5),
(104, 'Huinca Renancó', 5),
(105, 'Humberto Primo', 5),
(106, 'Idiazábal', 5),
(107, 'Inriville', 5),
(108, 'La Calera', 5),
(109, 'La Carlota', 5),
(110, 'La Cautiva', 5),
(111, 'La Cruz', 5),
(112, 'La Falda', 5),
(113, 'La Francia', 5),
(114, 'La Granja', 5),
(115, 'La Higuera', 5),
(116, 'La Laguna', 5),
(117, 'La Para', 5),
(118, 'La Palestina', 5),
(119, 'La Paisanita', 5),
(120, 'La Playosa', 5),
(121, 'La Puerta', 5),
(122, 'La Quinta', 5),
(123, 'La Rinconada', 5),
(124, 'La Serranita', 5),
(125, 'La Tordilla', 5),
(126, 'Laguna Larga', 5),
(127, 'Laguna Naineck', 5),
(128, 'Las Acequias', 5),
(129, 'Las Albahacas', 5),
(130, 'Las Arrias', 5),
(131, 'Las Bajadas', 5),
(132, 'Las Caleras', 5),
(133, 'Las Chacras', 5),
(134, 'Las Gramillas', 5),
(135, 'Las Higueras', 5),
(136, 'Las Junturas', 5),
(137, 'Las Peñas', 5),
(138, 'Las Perdices', 5),
(139, 'Las Saladas', 5),
(140, 'Las Tapias', 5),
(141, 'Las Varas', 5),
(142, 'Leones', 5),
(143, 'Lindero', 5),
(144, 'Los Cocos', 5),
(145, 'Los Cisnes', 5),
(146, 'Los Chañares', 5),
(147, 'Los Cerrillos', 5),
(148, 'Los Condores', 5),
(149, 'Los Mistoles', 5),
(150, 'Los Molinos', 5),
(151, 'Los Pozos', 5),
(152, 'Los Reartes', 5),
(153, 'Los Surgentes', 5),
(154, 'Los Talares', 5),
(155, 'Luque', 5),
(156, 'Malabrigo', 5),
(157, 'Marcos Juárez', 5),
(158, 'Matorrales', 5),
(159, 'Mattaldi', 5),
(160, 'Monte Buey', 5),
(161, 'Monte Cristo', 5),
(162, 'Monte Maíz', 5),
(163, 'Monte Redondo', 5),
(164, 'Morteros', 5),
(165, 'Morrison', 5),
(166, 'Mula Muerta', 5),
(167, 'Oliva', 5),
(168, 'Oncativo', 5),
(169, 'Ordóñez', 5),
(170, 'Pacheco de Melo', 5),
(171, 'Pampayasta Sud', 5),
(172, 'Pasco', 5),
(173, 'Pilar', 5),
(174, 'Plaza Luxardo', 5),
(175, 'Pozo del Molle', 5),
(176, 'Pueblo Italiano', 5),
(177, 'Pueblo Nuevo', 5),
(178, 'Pueblo Río Ceballos', 5),
(179, 'Pueblo San Francisco', 5),
(180, 'Quilino', 5),
(181, 'Río Bamba', 5),
(182, 'Río Ceballos', 5),
(183, 'Río Cuarto', 5),
(184, 'Río Primero', 5),
(185, 'Río Segundo', 5),
(186, 'Río Tercero', 5),
(187, 'Sacanta', 5),
(188, 'Saira', 5),
(189, 'Salsacate', 5),
(190, 'San Agustín', 5),
(191, 'San Antonio de Litín', 5),
(192, 'San Basilio', 5),
(193, 'San Carlos Minas', 5),
(194, 'San Clemente', 5),
(195, 'San Esteban', 5),
(196, 'San Francisco', 5),
(197, 'San Gerónimo', 5),
(198, 'San Ignacio', 5),
(199, 'San Javier', 5),
(200, 'San Jerónimo', 5),
(201, 'San José de la Dormida', 5),
(202, 'San Lorenzo', 5),
(203, 'San Marcos Sierras', 5),
(204, 'San Marcos Sud', 5),
(205, 'San Miguel', 5),
(206, 'San Nicolás', 5),
(207, 'San Pedro', 5),
(208, 'San Roque', 5),
(209, 'San Vicente', 5),
(210, 'Santa Ana', 5),
(211, 'Santa Catalina', 5),
(212, 'Santa Eufemia', 5),
(213, 'Santa Rosa de Calamuchita', 5),
(214, 'Santa Rosa de Río Primero', 5),
(215, 'Santa Silvia', 5),
(216, 'Santiago Temple', 5),
(217, 'Sarmiento', 5),
(218, 'Serrezuela', 5),
(219, 'Sierras Chicas', 5),
(220, 'Silvio Pellico', 5),
(221, 'Sinsacate', 5),
(222, 'Tancacha', 5),
(223, 'Tanti', 5),
(224, 'Ticino', 5),
(225, 'Tío Pujio', 5),
(226, 'Tosquita', 5),
(227, 'Totoral', 5),
(228, 'Unquillo', 5),
(229, 'Valle Hermoso', 5),
(230, 'Vélez Sarsfield', 5),
(231, 'Viamonte', 5),
(232, 'Vicuña Mackenna', 5),
(233, 'Vicuña Mackenna Norte', 5),
(234, 'Vicuña Mackenna Sur', 5),
(235, 'Villa Allende', 5),
(236, 'Villa Ascasubi', 5),
(237, 'Villa Carlos Paz', 5),
(238, 'Villa Ciudad de América', 5),
(239, 'Villa del Dique', 5),
(240, 'Villa del Prado', 5),
(241, 'Villa del Rosario', 5),
(242, 'Villa Dolores', 5),
(243, 'Villa El Chacay', 5),
(244, 'Villa General Belgrano', 5),
(245, 'Villa General Roca', 5),
(246, 'Villa Huidobro', 5),
(247, 'Villa La Bolsa', 5),
(248, 'Villa La Serranita', 5),
(249, 'Villa Los Aromos', 5),
(250, 'Villa Los Patos', 5),
(251, 'Villa María', 5),
(252, 'Villa Nueva', 5),
(253, 'Villa Quillinzo', 5),
(254, 'Villa Río Icho Cruz', 5),
(255, 'Villa Rumipal', 5),
(256, 'Villa Santa Cruz del Lago', 5),
(257, 'Villa Santa Rosa', 5),
(258, 'Villa Sarmiento', 5),
(259, 'Villa Tulumba', 5),
(260, 'Villa Valeria', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `id` int(11) NOT NULL,
  `materia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materias`
--

INSERT INTO `materias` (`id`, `materia`) VALUES
(1, 'Matemática'),
(2, 'Biología'),
(3, 'Física'),
(4, 'Química'),
(5, 'Lengua y Literatura'),
(6, 'Lengua Extranjera-Inglés'),
(7, 'Geografía'),
(8, 'Historia'),
(9, 'Ciudadanía y Participación'),
(10, 'Formación para el Trabajo'),
(11, 'Derecho del Trabajo y Seguridad Social'),
(12, 'Formación Profesional y Problemáticas Económicas A'),
(13, 'Orientación en Economía y Administración');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia_plan`
--

CREATE TABLE `materia_plan` (
  `id` int(11) NOT NULL,
  `idMat` int(11) NOT NULL,
  `idAEs` int(11) NOT NULL,
  `idAnioP` int(11) NOT NULL,
  `idModal` int(11) NOT NULL,
  `idModul` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materia_plan`
--

INSERT INTO `materia_plan` (`id`, `idMat`, `idAEs`, `idAnioP`, `idModal`, `idModul`) VALUES
(1, 1, 1, 4, 2, 1),
(2, 1, 1, 4, 2, 2),
(3, 1, 1, 4, 2, 3),
(4, 5, 2, 4, 2, 1),
(5, 5, 2, 4, 2, 2),
(6, 5, 2, 4, 2, 3),
(7, 6, 2, 4, 2, 1),
(8, 6, 2, 4, 2, 2),
(9, 6, 2, 4, 2, 3),
(10, 3, 3, 4, 2, 1),
(11, 4, 3, 4, 2, 1),
(12, 4, 3, 4, 2, 2),
(13, 3, 3, 4, 2, 3),
(14, 2, 3, 4, 2, 3),
(15, 8, 4, 4, 2, 1),
(16, 8, 4, 4, 2, 2),
(17, 8, 4, 4, 2, 3),
(18, 9, 5, 6, 2, 8),
(19, 10, 5, 6, 2, 8),
(20, 11, 5, 6, 2, 8),
(21, 12, 5, 6, 2, 8),
(22, 1, 1, 5, 2, 4),
(23, 1, 1, 5, 2, 5),
(24, 1, 1, 6, 2, 6),
(25, 1, 1, 6, 2, 7),
(26, 5, 2, 5, 2, 4),
(27, 5, 2, 5, 2, 5),
(28, 5, 2, 6, 2, 6),
(29, 5, 2, 6, 2, 7),
(30, 6, 2, 5, 2, 4),
(31, 6, 2, 5, 2, 5),
(32, 6, 2, 6, 2, 6),
(33, 6, 2, 6, 2, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modalidades`
--

CREATE TABLE `modalidades` (
  `id` int(11) NOT NULL,
  `modalidad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modalidades`
--

INSERT INTO `modalidades` (`id`, `modalidad`) VALUES
(1, 'PRESENCIAL'),
(2, 'SEMIPRESENCIAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modulos`
--

CREATE TABLE `modulos` (
  `id` int(11) NOT NULL,
  `modulo` varchar(10) NOT NULL,
  `idMod` int(11) NOT NULL,
  `idAPlan` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modulos`
--

INSERT INTO `modulos` (`id`, `modulo`, `idMod`, `idAPlan`) VALUES
(1, 'Modulo 1', 2, 4),
(2, 'Modulo 2', 2, 4),
(3, 'Modulo 3', 2, 4),
(4, 'Modulo 4', 2, 5),
(5, 'Modulo 5', 2, 5),
(6, 'Modulo 6', 2, 6),
(7, 'Modulo 7', 2, 6),
(8, 'Modulo 8', 2, 6),
(9, 'Modulo 9', 2, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_institucion`
--

CREATE TABLE `personal_institucion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` int(8) NOT NULL,
  `email` varchar(50) NOT NULL,
  `idDomicilio` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `idCargo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincias`
--

CREATE TABLE `provincias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `provincias`
--

INSERT INTO `provincias` (`id`, `nombre`) VALUES
(1, 'Buenos Aires'),
(2, 'Catamarca'),
(3, 'Chaco'),
(4, 'Chubut'),
(5, 'Córdoba'),
(6, 'Corrientes'),
(7, 'Entre Ríos'),
(8, 'Formosa'),
(9, 'Jujuy'),
(10, 'La Pampa'),
(11, 'La Rioja'),
(12, 'Mendoza'),
(13, 'Misiones'),
(14, 'Neuquén'),
(15, 'Río Negro'),
(16, 'Salta'),
(17, 'San Juan'),
(18, 'San Luis'),
(19, 'Santa Cruz'),
(20, 'Santa Fe'),
(21, 'Santiago del Estero'),
(22, 'Tierra del Fuego, Antártida e Islas del Atlántico Sur'),
(23, 'Tucumán'),
(24, 'Ciudad Autónoma de Buenos Aires'),
(25, '5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_cargos`
--

CREATE TABLE `tipo_cargos` (
  `id` int(11) NOT NULL,
  `cargo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` enum('administrador','profesor','estudiante','secretario','coordinador') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `rol`) VALUES
(19, 'Cristina', 'Maia', 'ceija52025@gmail.com', '$2b$10$RSm.M9t8CBrV1i2Uha1wN.PsnoM/8TVSHFDkryKpMd3pFMeXt/EGW', 'administrador'),
(20, 'Paula', 'Gonzalez', 'paula2025@gmail.com', '$2b$10$yKtBe.uAeIcN9x.r6vPdSuUYJhq7zlHhQJB8qd9VTH2Ppn3U0N9/e', 'coordinador'),
(21, 'Sofia', 'Reyes', 'sofiaR@gmail.com', '$2b$10$TOrKmdJ90TaOku/BxeFyJ.REps.tOTUAeBtezFNlmzCNc1HQDPAOe', 'secretario');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `anio_plan`
--
ALTER TABLE `anio_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_modalidad` (`idModalidad`);

--
-- Indices de la tabla `archivos_estudiantes`
--
ALTER TABLE `archivos_estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idEstudiante` (`idEstudiante`);

--
-- Indices de la tabla `area_estudio`
--
ALTER TABLE `area_estudio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_asistencias_estudiante` (`idEstudiante`),
  ADD KEY `fk_asistencias_estadoasistencia` (`idEstadoAsistencia`);

--
-- Indices de la tabla `barrios`
--
ALTER TABLE `barrios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_barrios_localidades` (`idLocalidad`);

--
-- Indices de la tabla `calificacion`
--
ALTER TABLE `calificacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_calificacion_estudiantes` (`idEstudiante`),
  ADD KEY `fk_calificacion_personalinstitucion` (`idPersonalInstitucion`),
  ADD KEY `fk_calificacion_materias` (`idMateria`),
  ADD KEY `fk_calificacion_estadocalificacion` (`idEstadoCalificacion`);

--
-- Indices de la tabla `detalle_asistencias`
--
ALTER TABLE `detalle_asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalleasistencias_detalleasistenciaestado` (`idDetalleAsistenciaEstado`),
  ADD KEY `fk_detalleasistencias_asistencias` (`idAsistencia`);

--
-- Indices de la tabla `detalle_asistencia_estado`
--
ALTER TABLE `detalle_asistencia_estado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_calificacion`
--
ALTER TABLE `detalle_calificacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detallecalificacion_calificacion` (`idCalificacion`);

--
-- Indices de la tabla `detalle_incorporacion`
--
ALTER TABLE `detalle_incorporacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalleincorporacion_documentaciones` (`idDocumentaciones`),
  ADD KEY `fk_detalleincorporacion_incorporaciones` (`idIncorporaciones`);

--
-- Indices de la tabla `detalle_inscripcion`
--
ALTER TABLE `detalle_inscripcion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalleinscripcion_documentaciones` (`idDocumentaciones`),
  ADD KEY `fk_detalleinscripcion_inscripciones` (`idInscripcion`);

--
-- Indices de la tabla `divisiones`
--
ALTER TABLE `divisiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_anio_plan` (`idAnioPlan`);

--
-- Indices de la tabla `documentaciones`
--
ALTER TABLE `documentaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `domicilios`
--
ALTER TABLE `domicilios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_domicilios_barrios` (`idBarrio`),
  ADD KEY `fk_domicilios_localidades` (`idLocalidad`),
  ADD KEY `fk_domicilios_provincias` (`idProvincia`);

--
-- Indices de la tabla `estado_asistencia`
--
ALTER TABLE `estado_asistencia`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado_calificacion`
--
ALTER TABLE `estado_calificacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado_incorporaciones`
--
ALTER TABLE `estado_incorporaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado_inscripciones`
--
ALTER TABLE `estado_inscripciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_estudiantes_domicilios` (`idDomicilio`),
  ADD KEY `fk_estudiantes_usuarios` (`idUsuarios`);

--
-- Indices de la tabla `incorporaciones`
--
ALTER TABLE `incorporaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_incorporaciones_personalinstitucion` (`idPersonal`),
  ADD KEY `fk_incorporaciones_estadoincorporaciones` (`idEstadoIncorporacion`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inscripciones_estudiantes` (`idEstudiante`),
  ADD KEY `fk_inscripciones_modalidades` (`idModalidad`),
  ADD KEY `fk_inscripciones_tipocargos` (`idAnioPlan`),
  ADD KEY `fk_inscripciones_estadoinscripciones` (`idEstadoInscripcion`);

--
-- Indices de la tabla `localidades`
--
ALTER TABLE `localidades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_localidades_provincias` (`idProvincia`);

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `materia_plan`
--
ALTER TABLE `materia_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idMat` (`idMat`),
  ADD KEY `idAEs` (`idAEs`),
  ADD KEY `idAnioP` (`idAnioP`),
  ADD KEY `idModal` (`idModal`),
  ADD KEY `idModul` (`idModul`);

--
-- Indices de la tabla `modalidades`
--
ALTER TABLE `modalidades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modulos`
--
ALTER TABLE `modulos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aplan_modulos` (`idAPlan`),
  ADD KEY `fk_idMod` (`idMod`);

--
-- Indices de la tabla `personal_institucion`
--
ALTER TABLE `personal_institucion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personalinstitucion_domicilios` (`idDomicilio`),
  ADD KEY `fk_personalinstitucion_usuarios` (`idUser`),
  ADD KEY `fk_personalinstitucion_areaestudio` (`idCargo`);

--
-- Indices de la tabla `provincias`
--
ALTER TABLE `provincias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_cargos`
--
ALTER TABLE `tipo_cargos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `anio_plan`
--
ALTER TABLE `anio_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `archivos_estudiantes`
--
ALTER TABLE `archivos_estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `area_estudio`
--
ALTER TABLE `area_estudio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `barrios`
--
ALTER TABLE `barrios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `calificacion`
--
ALTER TABLE `calificacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_asistencias`
--
ALTER TABLE `detalle_asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_asistencia_estado`
--
ALTER TABLE `detalle_asistencia_estado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_calificacion`
--
ALTER TABLE `detalle_calificacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_incorporacion`
--
ALTER TABLE `detalle_incorporacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_inscripcion`
--
ALTER TABLE `detalle_inscripcion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=525;

--
-- AUTO_INCREMENT de la tabla `divisiones`
--
ALTER TABLE `divisiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `documentaciones`
--
ALTER TABLE `documentaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `domicilios`
--
ALTER TABLE `domicilios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=198;

--
-- AUTO_INCREMENT de la tabla `estado_asistencia`
--
ALTER TABLE `estado_asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_calificacion`
--
ALTER TABLE `estado_calificacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_incorporaciones`
--
ALTER TABLE `estado_incorporaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_inscripciones`
--
ALTER TABLE `estado_inscripciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=178;

--
-- AUTO_INCREMENT de la tabla `incorporaciones`
--
ALTER TABLE `incorporaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT de la tabla `localidades`
--
ALTER TABLE `localidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=264;

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `materia_plan`
--
ALTER TABLE `materia_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `modalidades`
--
ALTER TABLE `modalidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `modulos`
--
ALTER TABLE `modulos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `personal_institucion`
--
ALTER TABLE `personal_institucion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `provincias`
--
ALTER TABLE `provincias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `tipo_cargos`
--
ALTER TABLE `tipo_cargos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `anio_plan`
--
ALTER TABLE `anio_plan`
  ADD CONSTRAINT `fk_modalidad` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`id`);

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `fk_asistencias_estadoasistencia` FOREIGN KEY (`idEstadoAsistencia`) REFERENCES `estado_asistencia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asistencias_estudiante` FOREIGN KEY (`idEstudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `barrios`
--
ALTER TABLE `barrios`
  ADD CONSTRAINT `fk_barrios_localidades` FOREIGN KEY (`idLocalidad`) REFERENCES `localidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `calificacion`
--
ALTER TABLE `calificacion`
  ADD CONSTRAINT `fk_calificacion_estadocalificacion` FOREIGN KEY (`idEstadoCalificacion`) REFERENCES `estado_calificacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_calificacion_estudiantes` FOREIGN KEY (`idEstudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_calificacion_materias` FOREIGN KEY (`idMateria`) REFERENCES `materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_calificacion_personalinstitucion` FOREIGN KEY (`idPersonalInstitucion`) REFERENCES `personal_institucion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_asistencias`
--
ALTER TABLE `detalle_asistencias`
  ADD CONSTRAINT `fk_detalleasistencias_asistencias` FOREIGN KEY (`idAsistencia`) REFERENCES `asistencias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalleasistencias_detalleasistenciaestado` FOREIGN KEY (`idDetalleAsistenciaEstado`) REFERENCES `detalle_asistencia_estado` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_calificacion`
--
ALTER TABLE `detalle_calificacion`
  ADD CONSTRAINT `fk_detallecalificacion_calificacion` FOREIGN KEY (`idCalificacion`) REFERENCES `calificacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_incorporacion`
--
ALTER TABLE `detalle_incorporacion`
  ADD CONSTRAINT `fk_detalleincorporacion_documentaciones` FOREIGN KEY (`idDocumentaciones`) REFERENCES `documentaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalleincorporacion_incorporaciones` FOREIGN KEY (`idIncorporaciones`) REFERENCES `incorporaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_inscripcion`
--
ALTER TABLE `detalle_inscripcion`
  ADD CONSTRAINT `fk_detalleinscripcion_documentaciones` FOREIGN KEY (`idDocumentaciones`) REFERENCES `documentaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalleinscripcion_inscripciones` FOREIGN KEY (`idInscripcion`) REFERENCES `inscripciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `divisiones`
--
ALTER TABLE `divisiones`
  ADD CONSTRAINT `fk_anio_plan` FOREIGN KEY (`idAnioPlan`) REFERENCES `anio_plan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `domicilios`
--
ALTER TABLE `domicilios`
  ADD CONSTRAINT `fk_domicilios_barrios` FOREIGN KEY (`idBarrio`) REFERENCES `barrios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_domicilios_localidades` FOREIGN KEY (`idLocalidad`) REFERENCES `localidades` (`id`),
  ADD CONSTRAINT `fk_domicilios_provincias` FOREIGN KEY (`idProvincia`) REFERENCES `provincias` (`id`);

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `fk_estudiantes_domicilios` FOREIGN KEY (`idDomicilio`) REFERENCES `domicilios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_estudiantes_usuarios` FOREIGN KEY (`idUsuarios`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `incorporaciones`
--
ALTER TABLE `incorporaciones`
  ADD CONSTRAINT `fk_incorporaciones_estadoincorporaciones` FOREIGN KEY (`idEstadoIncorporacion`) REFERENCES `estado_incorporaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_incorporaciones_personalinstitucion` FOREIGN KEY (`idPersonal`) REFERENCES `personal_institucion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `fk_inscripciones_estadoinscripciones` FOREIGN KEY (`idEstadoInscripcion`) REFERENCES `estado_inscripciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inscripciones_estudiantes` FOREIGN KEY (`idEstudiante`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inscripciones_modalidades` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inscripciones_tipocargos` FOREIGN KEY (`idAnioPlan`) REFERENCES `anio_plan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `localidades`
--
ALTER TABLE `localidades`
  ADD CONSTRAINT `fk_localidades_provincias` FOREIGN KEY (`idProvincia`) REFERENCES `provincias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `materia_plan`
--
ALTER TABLE `materia_plan`
  ADD CONSTRAINT `materia_plan_ibfk_1` FOREIGN KEY (`idMat`) REFERENCES `materias` (`id`),
  ADD CONSTRAINT `materia_plan_ibfk_2` FOREIGN KEY (`idAEs`) REFERENCES `area_estudio` (`id`),
  ADD CONSTRAINT `materia_plan_ibfk_3` FOREIGN KEY (`idAnioP`) REFERENCES `anio_plan` (`id`),
  ADD CONSTRAINT `materia_plan_ibfk_4` FOREIGN KEY (`idModal`) REFERENCES `modalidades` (`id`),
  ADD CONSTRAINT `materia_plan_ibfk_5` FOREIGN KEY (`idModul`) REFERENCES `modulos` (`id`);

--
-- Filtros para la tabla `modulos`
--
ALTER TABLE `modulos`
  ADD CONSTRAINT `fk_aplan_modulos` FOREIGN KEY (`idAPlan`) REFERENCES `anio_plan` (`id`),
  ADD CONSTRAINT `fk_idMod` FOREIGN KEY (`idMod`) REFERENCES `modalidades` (`id`);

--
-- Filtros para la tabla `personal_institucion`
--
ALTER TABLE `personal_institucion`
  ADD CONSTRAINT `fk_personalinstitucion_areaestudio` FOREIGN KEY (`idCargo`) REFERENCES `tipo_cargos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personalinstitucion_domicilios` FOREIGN KEY (`idDomicilio`) REFERENCES `domicilios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personalinstitucion_usuarios` FOREIGN KEY (`idUser`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
