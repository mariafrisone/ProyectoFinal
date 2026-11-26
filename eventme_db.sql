CREATE DATABASE  IF NOT EXISTS `eventme_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `eventme_db`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: eventme_db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_evento` datetime NOT NULL,
  `recinto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,'Festival Primavera Sound','Festival de música indie y alternativa.','Festival','2027-05-20 18:00:00','Parc del Fòrum','Barcelona',41.41900000,2.22400000,'https://images.unsplash.com/photo-1470225620780-dba8ba36b745','2026-10-17 15:16:05'),(2,'Mad Cool Festival','Conciertos en directo con artistas internacionales.','Festival','2027-07-08 17:00:00','Espacio Mad Cool','Madrid',40.48500000,-3.61500000,'https://images.unsplash.com/photo-1514525253161-7a46d19cd819','2026-10-17 15:16:05'),(3,'El Rey León - El Musical','El musical que conmueve al mundo en plena Gran Vía.','Teatro','2026-11-15 20:00:00','Teatro Lope de Vega','Madrid',40.42140000,-3.70890000,'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf','2026-10-17 15:16:05'),(4,'Concierto Coldplay - Music of the Spheres','Gira mundial en directo con espectáculo de luces y pulseras LED.','Concierto','2027-06-12 21:00:00','Estadio Cívitas Metropolitano','Madrid',40.43620000,-3.59960000,'https://images.unsplash.com/photo-1465847899084-d164df4dedc6','2026-10-17 15:39:24');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `evento_id` int NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_evento` (`usuario_id`,`evento_id`),
  KEY `fk_fav_evento` (`evento_id`),
  CONSTRAINT `fk_fav_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evento_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `enviado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_msg_evento` (`evento_id`),
  KEY `fk_msg_usuario` (`usuario_id`),
  CONSTRAINT `fk_msg_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evento_id` int NOT NULL,
  `vendedor_id` int NOT NULL,
  `comprador_id` int DEFAULT NULL,
  `precio_original` decimal(10,2) NOT NULL,
  `precio_reventa` decimal(10,2) NOT NULL,
  `asiento_zona` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('disponible','reservado','vendido') COLLATE utf8mb4_unicode_ci DEFAULT 'disponible',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo_qr` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validado` tinyint(1) DEFAULT '0',
  `fecha_validacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_qr` (`codigo_qr`),
  KEY `evento_id` (`evento_id`),
  KEY `vendedor_id` (`vendedor_id`),
  KEY `fk_tickets_comprador` (`comprador_id`),
  CONSTRAINT `fk_tickets_comprador` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,1,1,2,85.00,85.00,'Pista General - Acceso B','No podré asistir por motivos de trabajo. Entrada nominal transferible.','vendido','2026-10-17 17:35:12','EVT-1-CMP-2-C71DDD',1,'2026-11-24 19:50:35'),(2,1,4,NULL,295.00,260.00,'Abono General 3 días','No puedo asistir por trabajo. Transferencia inmediata.','disponible','2026-11-26 09:18:07','QR-PS-2026-001',0,NULL),(3,1,5,NULL,125.00,110.00,'Entrada Día Sábado','Entrada de día individual, acceso general.','disponible','2026-11-26 09:18:07','QR-PS-2026-002',0,NULL),(4,2,6,NULL,210.00,190.00,'Abono General','Vendo por cambio de planes. Precio por debajo del original.','disponible','2026-11-26 09:18:07','QR-MC-2026-003',0,NULL),(5,2,7,NULL,450.00,420.00,'Zona VIP','Acceso preferente y zona chill-out incluida.','disponible','2026-11-26 09:18:07','QR-MC-2026-004',0,NULL),(6,3,4,NULL,85.00,75.00,'Platea Fila 8 - Asiento 12','Visibilidad perfecta, centro de platea.','disponible','2026-11-26 09:18:07','QR-RL-2026-005',0,NULL),(7,3,6,1,60.00,55.00,'Anfiteatro 1 - Fila 2','Buena vista panorámica del escenario.','vendido','2026-11-26 09:18:07','EVT-3-CMP-1-E93B27',1,'2026-11-26 11:08:54'),(8,4,5,NULL,115.00,115.00,'Pista General','Entrada oficial a precio original.','disponible','2026-11-26 09:18:07','QR-CP-2026-007',0,NULL),(9,4,7,NULL,165.00,155.00,'Grada Baja Sector 104','Asiento numerado con excelente acústica.','disponible','2026-11-26 09:18:07','QR-CP-2026-008',0,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_perfil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notificaciones_activas` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Maria Marta',NULL,'maria@test.com','$2b$10$LQ3ApKp5ttMNfmEO5AefDevs/L89RLHSf9f9EU1Y9LNUM/tRqXkIS',NULL,1,'2026-10-14 18:12:01'),(2,'Carlos Comprador',NULL,'carlos@test.com','$2b$10$k1YYckccKbEvksbgmb8wxe5IQ1hmNhGEEKmkA7.HSG07a8lm8Hco6',NULL,1,'2026-10-26 17:43:02'),(3,'maria frisone',NULL,'seba@test.com','$2b$10$XSSVHkhln36Hszl8ELsuau03MBrSz5kzIFw.58maEBjduDK7UnlUW',NULL,1,'2026-11-16 18:39:23'),(4,'Laura','Gómez','laura.gomez@eventme.com','123456',NULL,1,'2026-11-26 09:18:07'),(5,'Diego','Martínez','diego.martinez@eventme.com','123456',NULL,1,'2026-11-26 09:18:07'),(6,'Sofía','Navarro','sofia.navarro@eventme.com','123456',NULL,1,'2026-11-26 09:18:07'),(7,'Javier','Ruiz','javier.ruiz@eventme.com','123456',NULL,1,'2026-11-26 09:18:07');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 11:19:31
