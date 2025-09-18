-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: pratyogita
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `contests`
--

DROP TABLE IF EXISTS `contests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contests` (
  `contest_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `created_by` int NOT NULL,
  `visibility` enum('public','private') DEFAULT 'private',
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`contest_id`),
  KEY `fk_contest_creator` (`created_by`),
  CONSTRAINT `fk_contest_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contests`
--

LOCK TABLES `contests` WRITE;
/*!40000 ALTER TABLE `contests` DISABLE KEYS */;
INSERT INTO `contests` VALUES (8,'first contest ','this is the first contest from the ui',1,'public','2025-09-19 21:00:00','2025-09-20 00:00:00');
/*!40000 ALTER TABLE `contests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mcqs`
--

DROP TABLE IF EXISTS `mcqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mcqs` (
  `mcq_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`mcq_id`),
  KEY `fk_mcq_question` (`question_id`),
  CONSTRAINT `fk_mcq_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=801 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mcqs`
--

LOCK TABLES `mcqs` WRITE;
/*!40000 ALTER TABLE `mcqs` DISABLE KEYS */;
INSERT INTO `mcqs` VALUES (401,151,'Option 1',0),(402,151,'Option 2',1),(403,151,'Option 3',0),(404,151,'Option 4',0),(405,152,'Option 1',0),(406,152,'Option 2',0),(407,152,'Option 3',1),(408,152,'Option 4',0),(409,153,'Option 1',0),(410,153,'Option 2',0),(411,153,'Option 3',0),(412,153,'Option 4',1),(413,154,'Option 1',1),(414,154,'Option 2',0),(415,154,'Option 3',0),(416,154,'Option 4',0),(417,155,'Option 1',0),(418,155,'Option 2',1),(419,155,'Option 3',0),(420,155,'Option 4',0),(421,156,'Option 1',0),(422,156,'Option 2',0),(423,156,'Option 3',1),(424,156,'Option 4',0),(425,157,'Option 1',0),(426,157,'Option 2',0),(427,157,'Option 3',0),(428,157,'Option 4',1),(429,158,'Option 1',1),(430,158,'Option 2',0),(431,158,'Option 3',0),(432,158,'Option 4',0),(433,159,'Option 1',0),(434,159,'Option 2',1),(435,159,'Option 3',0),(436,159,'Option 4',0),(437,160,'Option 1',0),(438,160,'Option 2',0),(439,160,'Option 3',1),(440,160,'Option 4',0),(441,161,'Option 1',0),(442,161,'Option 2',0),(443,161,'Option 3',0),(444,161,'Option 4',1),(445,162,'Option 1',1),(446,162,'Option 2',0),(447,162,'Option 3',0),(448,162,'Option 4',0),(449,163,'Option 1',0),(450,163,'Option 2',1),(451,163,'Option 3',0),(452,163,'Option 4',0),(453,164,'Option 1',0),(454,164,'Option 2',0),(455,164,'Option 3',1),(456,164,'Option 4',0),(457,165,'Option 1',0),(458,165,'Option 2',0),(459,165,'Option 3',0),(460,165,'Option 4',1),(461,166,'Option 1',1),(462,166,'Option 2',0),(463,166,'Option 3',0),(464,166,'Option 4',0),(465,167,'Option 1',0),(466,167,'Option 2',1),(467,167,'Option 3',0),(468,167,'Option 4',0),(469,168,'Option 1',0),(470,168,'Option 2',0),(471,168,'Option 3',1),(472,168,'Option 4',0),(473,169,'Option 1',0),(474,169,'Option 2',0),(475,169,'Option 3',0),(476,169,'Option 4',1),(477,170,'Option 1',1),(478,170,'Option 2',0),(479,170,'Option 3',0),(480,170,'Option 4',0),(481,171,'Option 1',0),(482,171,'Option 2',1),(483,171,'Option 3',0),(484,171,'Option 4',0),(485,172,'Option 1',0),(486,172,'Option 2',0),(487,172,'Option 3',1),(488,172,'Option 4',0),(489,173,'Option 1',0),(490,173,'Option 2',0),(491,173,'Option 3',0),(492,173,'Option 4',1),(493,174,'Option 1',1),(494,174,'Option 2',0),(495,174,'Option 3',0),(496,174,'Option 4',0),(497,175,'Option 1',0),(498,175,'Option 2',1),(499,175,'Option 3',0),(500,175,'Option 4',0),(501,176,'Option 1',0),(502,176,'Option 2',0),(503,176,'Option 3',1),(504,176,'Option 4',0),(505,177,'Option 1',0),(506,177,'Option 2',0),(507,177,'Option 3',0),(508,177,'Option 4',1),(509,178,'Option 1',1),(510,178,'Option 2',0),(511,178,'Option 3',0),(512,178,'Option 4',0),(513,179,'Option 1',0),(514,179,'Option 2',1),(515,179,'Option 3',0),(516,179,'Option 4',0),(517,180,'Option 1',0),(518,180,'Option 2',0),(519,180,'Option 3',1),(520,180,'Option 4',0),(521,181,'Option 1',0),(522,181,'Option 2',0),(523,181,'Option 3',0),(524,181,'Option 4',1),(525,182,'Option 1',1),(526,182,'Option 2',0),(527,182,'Option 3',0),(528,182,'Option 4',0),(529,183,'Option 1',0),(530,183,'Option 2',1),(531,183,'Option 3',0),(532,183,'Option 4',0),(533,184,'Option 1',0),(534,184,'Option 2',0),(535,184,'Option 3',1),(536,184,'Option 4',0),(537,185,'Option 1',0),(538,185,'Option 2',0),(539,185,'Option 3',0),(540,185,'Option 4',1),(541,186,'Option 1',1),(542,186,'Option 2',0),(543,186,'Option 3',0),(544,186,'Option 4',0),(545,187,'Option 1',0),(546,187,'Option 2',1),(547,187,'Option 3',0),(548,187,'Option 4',0),(549,188,'Option 1',0),(550,188,'Option 2',0),(551,188,'Option 3',1),(552,188,'Option 4',0),(553,189,'Option 1',0),(554,189,'Option 2',0),(555,189,'Option 3',0),(556,189,'Option 4',1),(557,190,'Option 1',1),(558,190,'Option 2',0),(559,190,'Option 3',0),(560,190,'Option 4',0),(561,191,'Option 1',0),(562,191,'Option 2',1),(563,191,'Option 3',0),(564,191,'Option 4',0),(565,192,'Option 1',0),(566,192,'Option 2',0),(567,192,'Option 3',1),(568,192,'Option 4',0),(569,193,'Option 1',0),(570,193,'Option 2',0),(571,193,'Option 3',0),(572,193,'Option 4',1),(573,194,'Option 1',1),(574,194,'Option 2',0),(575,194,'Option 3',0),(576,194,'Option 4',0),(577,195,'Option 1',0),(578,195,'Option 2',1),(579,195,'Option 3',0),(580,195,'Option 4',0),(581,196,'Option 1',0),(582,196,'Option 2',0),(583,196,'Option 3',1),(584,196,'Option 4',0),(585,197,'Option 1',0),(586,197,'Option 2',0),(587,197,'Option 3',0),(588,197,'Option 4',1),(589,198,'Option 1',1),(590,198,'Option 2',0),(591,198,'Option 3',0),(592,198,'Option 4',0),(593,199,'Option 1',0),(594,199,'Option 2',1),(595,199,'Option 3',0),(596,199,'Option 4',0),(597,200,'Option 1',0),(598,200,'Option 2',0),(599,200,'Option 3',1),(600,200,'Option 4',0),(601,201,'Option 1',0),(602,201,'Option 2',0),(603,201,'Option 3',0),(604,201,'Option 4',1),(605,202,'Option 1',1),(606,202,'Option 2',0),(607,202,'Option 3',0),(608,202,'Option 4',0),(609,203,'Option 1',0),(610,203,'Option 2',1),(611,203,'Option 3',0),(612,203,'Option 4',0),(613,204,'Option 1',0),(614,204,'Option 2',0),(615,204,'Option 3',1),(616,204,'Option 4',0),(617,205,'Option 1',0),(618,205,'Option 2',0),(619,205,'Option 3',0),(620,205,'Option 4',1),(621,206,'Option 1',1),(622,206,'Option 2',0),(623,206,'Option 3',0),(624,206,'Option 4',0),(625,207,'Option 1',0),(626,207,'Option 2',1),(627,207,'Option 3',0),(628,207,'Option 4',0),(629,208,'Option 1',0),(630,208,'Option 2',0),(631,208,'Option 3',1),(632,208,'Option 4',0),(633,209,'Option 1',0),(634,209,'Option 2',0),(635,209,'Option 3',0),(636,209,'Option 4',1),(637,210,'Option 1',1),(638,210,'Option 2',0),(639,210,'Option 3',0),(640,210,'Option 4',0),(641,211,'Option 1',0),(642,211,'Option 2',1),(643,211,'Option 3',0),(644,211,'Option 4',0),(645,212,'Option 1',0),(646,212,'Option 2',0),(647,212,'Option 3',1),(648,212,'Option 4',0),(649,213,'Option 1',0),(650,213,'Option 2',0),(651,213,'Option 3',0),(652,213,'Option 4',1),(653,214,'Option 1',1),(654,214,'Option 2',0),(655,214,'Option 3',0),(656,214,'Option 4',0),(657,215,'Option 1',0),(658,215,'Option 2',1),(659,215,'Option 3',0),(660,215,'Option 4',0),(661,216,'Option 1',0),(662,216,'Option 2',0),(663,216,'Option 3',1),(664,216,'Option 4',0),(665,217,'Option 1',0),(666,217,'Option 2',0),(667,217,'Option 3',0),(668,217,'Option 4',1),(669,218,'Option 1',1),(670,218,'Option 2',0),(671,218,'Option 3',0),(672,218,'Option 4',0),(673,219,'Option 1',0),(674,219,'Option 2',1),(675,219,'Option 3',0),(676,219,'Option 4',0),(677,220,'Option 1',0),(678,220,'Option 2',0),(679,220,'Option 3',1),(680,220,'Option 4',0),(681,221,'Option 1',0),(682,221,'Option 2',0),(683,221,'Option 3',0),(684,221,'Option 4',1),(685,222,'Option 1',1),(686,222,'Option 2',0),(687,222,'Option 3',0),(688,222,'Option 4',0),(689,223,'Option 1',0),(690,223,'Option 2',1),(691,223,'Option 3',0),(692,223,'Option 4',0),(693,224,'Option 1',0),(694,224,'Option 2',0),(695,224,'Option 3',1),(696,224,'Option 4',0),(697,225,'Option 1',0),(698,225,'Option 2',0),(699,225,'Option 3',0),(700,225,'Option 4',1),(701,226,'Option 1',1),(702,226,'Option 2',0),(703,226,'Option 3',0),(704,226,'Option 4',0),(705,227,'Option 1',0),(706,227,'Option 2',1),(707,227,'Option 3',0),(708,227,'Option 4',0),(709,228,'Option 1',0),(710,228,'Option 2',0),(711,228,'Option 3',1),(712,228,'Option 4',0),(713,229,'Option 1',0),(714,229,'Option 2',0),(715,229,'Option 3',0),(716,229,'Option 4',1),(717,230,'Option 1',1),(718,230,'Option 2',0),(719,230,'Option 3',0),(720,230,'Option 4',0),(721,231,'Option 1',0),(722,231,'Option 2',1),(723,231,'Option 3',0),(724,231,'Option 4',0),(725,232,'Option 1',0),(726,232,'Option 2',0),(727,232,'Option 3',1),(728,232,'Option 4',0),(729,233,'Option 1',0),(730,233,'Option 2',0),(731,233,'Option 3',0),(732,233,'Option 4',1),(733,234,'Option 1',1),(734,234,'Option 2',0),(735,234,'Option 3',0),(736,234,'Option 4',0),(737,235,'Option 1',0),(738,235,'Option 2',1),(739,235,'Option 3',0),(740,235,'Option 4',0),(741,236,'Option 1',0),(742,236,'Option 2',0),(743,236,'Option 3',1),(744,236,'Option 4',0),(745,237,'Option 1',0),(746,237,'Option 2',0),(747,237,'Option 3',0),(748,237,'Option 4',1),(749,238,'Option 1',1),(750,238,'Option 2',0),(751,238,'Option 3',0),(752,238,'Option 4',0),(753,239,'Option 1',0),(754,239,'Option 2',1),(755,239,'Option 3',0),(756,239,'Option 4',0),(757,240,'Option 1',0),(758,240,'Option 2',0),(759,240,'Option 3',1),(760,240,'Option 4',0),(761,241,'Option 1',0),(762,241,'Option 2',0),(763,241,'Option 3',0),(764,241,'Option 4',1),(765,242,'Option 1',1),(766,242,'Option 2',0),(767,242,'Option 3',0),(768,242,'Option 4',0),(769,243,'Option 1',0),(770,243,'Option 2',1),(771,243,'Option 3',0),(772,243,'Option 4',0),(773,244,'Option 1',0),(774,244,'Option 2',0),(775,244,'Option 3',1),(776,244,'Option 4',0),(777,245,'Option 1',0),(778,245,'Option 2',0),(779,245,'Option 3',0),(780,245,'Option 4',1),(781,246,'Option 1',1),(782,246,'Option 2',0),(783,246,'Option 3',0),(784,246,'Option 4',0),(785,247,'Option 1',0),(786,247,'Option 2',1),(787,247,'Option 3',0),(788,247,'Option 4',0),(789,248,'Option 1',0),(790,248,'Option 2',0),(791,248,'Option 3',1),(792,248,'Option 4',0),(793,249,'Option 1',0),(794,249,'Option 2',0),(795,249,'Option 3',0),(796,249,'Option 4',1),(797,250,'Option 1',1),(798,250,'Option 2',0),(799,250,'Option 3',0),(800,250,'Option 4',0);
/*!40000 ALTER TABLE `mcqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participants` (
  `contest_id` int NOT NULL,
  `user_id` int NOT NULL,
  `enroll_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contest_id`,`user_id`),
  KEY `fk_participant_user` (`user_id`),
  CONSTRAINT `fk_participant_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`contest_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participants`
--

LOCK TABLES `participants` WRITE;
/*!40000 ALTER TABLE `participants` DISABLE KEYS */;
INSERT INTO `participants` VALUES (8,1,'2025-09-18 02:50:04'),(8,8,'2025-09-18 02:55:16');
/*!40000 ALTER TABLE `participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `contest_id` int NOT NULL,
  `type` enum('coding','mcq') DEFAULT NULL,
  `description` text NOT NULL,
  `marks` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`question_id`),
  KEY `fk_question_contest` (`contest_id`),
  CONSTRAINT `fk_question_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`contest_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `questions_chk_1` CHECK ((`marks` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (151,8,'mcq','Sample Question 1?',1,'2025-09-18 02:24:05'),(152,8,'mcq','Sample Question 2?',1,'2025-09-18 02:24:05'),(153,8,'mcq','Sample Question 3?',1,'2025-09-18 02:24:05'),(154,8,'mcq','Sample Question 4?',1,'2025-09-18 02:24:05'),(155,8,'mcq','Sample Question 5?',1,'2025-09-18 02:24:05'),(156,8,'mcq','Sample Question 6?',1,'2025-09-18 02:24:05'),(157,8,'mcq','Sample Question 7?',1,'2025-09-18 02:24:05'),(158,8,'mcq','Sample Question 8?',1,'2025-09-18 02:24:05'),(159,8,'mcq','Sample Question 9?',1,'2025-09-18 02:24:05'),(160,8,'mcq','Sample Question 10?',1,'2025-09-18 02:24:05'),(161,8,'mcq','Sample Question 11?',1,'2025-09-18 02:24:05'),(162,8,'mcq','Sample Question 12?',1,'2025-09-18 02:24:05'),(163,8,'mcq','Sample Question 13?',1,'2025-09-18 02:24:05'),(164,8,'mcq','Sample Question 14?',1,'2025-09-18 02:24:05'),(165,8,'mcq','Sample Question 15?',1,'2025-09-18 02:24:05'),(166,8,'mcq','Sample Question 16?',1,'2025-09-18 02:24:05'),(167,8,'mcq','Sample Question 17?',1,'2025-09-18 02:24:05'),(168,8,'mcq','Sample Question 18?',1,'2025-09-18 02:24:05'),(169,8,'mcq','Sample Question 19?',1,'2025-09-18 02:24:05'),(170,8,'mcq','Sample Question 20?',1,'2025-09-18 02:24:05'),(171,8,'mcq','Sample Question 21?',1,'2025-09-18 02:24:05'),(172,8,'mcq','Sample Question 22?',1,'2025-09-18 02:24:05'),(173,8,'mcq','Sample Question 23?',1,'2025-09-18 02:24:05'),(174,8,'mcq','Sample Question 24?',1,'2025-09-18 02:24:05'),(175,8,'mcq','Sample Question 25?',1,'2025-09-18 02:24:05'),(176,8,'mcq','Sample Question 26?',1,'2025-09-18 02:24:05'),(177,8,'mcq','Sample Question 27?',1,'2025-09-18 02:24:05'),(178,8,'mcq','Sample Question 28?',1,'2025-09-18 02:24:05'),(179,8,'mcq','Sample Question 29?',1,'2025-09-18 02:24:05'),(180,8,'mcq','Sample Question 30?',1,'2025-09-18 02:24:05'),(181,8,'mcq','Sample Question 31?',1,'2025-09-18 02:24:05'),(182,8,'mcq','Sample Question 32?',1,'2025-09-18 02:24:05'),(183,8,'mcq','Sample Question 33?',1,'2025-09-18 02:24:05'),(184,8,'mcq','Sample Question 34?',1,'2025-09-18 02:24:05'),(185,8,'mcq','Sample Question 35?',1,'2025-09-18 02:24:05'),(186,8,'mcq','Sample Question 36?',1,'2025-09-18 02:24:05'),(187,8,'mcq','Sample Question 37?',1,'2025-09-18 02:24:05'),(188,8,'mcq','Sample Question 38?',1,'2025-09-18 02:24:05'),(189,8,'mcq','Sample Question 39?',1,'2025-09-18 02:24:05'),(190,8,'mcq','Sample Question 40?',1,'2025-09-18 02:24:05'),(191,8,'mcq','Sample Question 41?',1,'2025-09-18 02:24:05'),(192,8,'mcq','Sample Question 42?',1,'2025-09-18 02:24:05'),(193,8,'mcq','Sample Question 43?',1,'2025-09-18 02:24:05'),(194,8,'mcq','Sample Question 44?',1,'2025-09-18 02:24:05'),(195,8,'mcq','Sample Question 45?',1,'2025-09-18 02:24:05'),(196,8,'mcq','Sample Question 46?',1,'2025-09-18 02:24:05'),(197,8,'mcq','Sample Question 47?',1,'2025-09-18 02:24:05'),(198,8,'mcq','Sample Question 48?',1,'2025-09-18 02:24:05'),(199,8,'mcq','Sample Question 49?',1,'2025-09-18 02:24:05'),(200,8,'mcq','Sample Question 50?',1,'2025-09-18 02:24:05'),(201,8,'mcq','Sample Question 51?',1,'2025-09-18 02:24:05'),(202,8,'mcq','Sample Question 52?',1,'2025-09-18 02:24:05'),(203,8,'mcq','Sample Question 53?',1,'2025-09-18 02:24:05'),(204,8,'mcq','Sample Question 54?',1,'2025-09-18 02:24:05'),(205,8,'mcq','Sample Question 55?',1,'2025-09-18 02:24:05'),(206,8,'mcq','Sample Question 56?',1,'2025-09-18 02:24:05'),(207,8,'mcq','Sample Question 57?',1,'2025-09-18 02:24:05'),(208,8,'mcq','Sample Question 58?',1,'2025-09-18 02:24:05'),(209,8,'mcq','Sample Question 59?',1,'2025-09-18 02:24:05'),(210,8,'mcq','Sample Question 60?',1,'2025-09-18 02:24:05'),(211,8,'mcq','Sample Question 61?',1,'2025-09-18 02:24:05'),(212,8,'mcq','Sample Question 62?',1,'2025-09-18 02:24:05'),(213,8,'mcq','Sample Question 63?',1,'2025-09-18 02:24:05'),(214,8,'mcq','Sample Question 64?',1,'2025-09-18 02:24:05'),(215,8,'mcq','Sample Question 65?',1,'2025-09-18 02:24:05'),(216,8,'mcq','Sample Question 66?',1,'2025-09-18 02:24:05'),(217,8,'mcq','Sample Question 67?',1,'2025-09-18 02:24:05'),(218,8,'mcq','Sample Question 68?',1,'2025-09-18 02:24:05'),(219,8,'mcq','Sample Question 69?',1,'2025-09-18 02:24:05'),(220,8,'mcq','Sample Question 70?',1,'2025-09-18 02:24:05'),(221,8,'mcq','Sample Question 71?',1,'2025-09-18 02:24:05'),(222,8,'mcq','Sample Question 72?',1,'2025-09-18 02:24:05'),(223,8,'mcq','Sample Question 73?',1,'2025-09-18 02:24:05'),(224,8,'mcq','Sample Question 74?',1,'2025-09-18 02:24:05'),(225,8,'mcq','Sample Question 75?',1,'2025-09-18 02:24:05'),(226,8,'mcq','Sample Question 76?',1,'2025-09-18 02:24:05'),(227,8,'mcq','Sample Question 77?',1,'2025-09-18 02:24:05'),(228,8,'mcq','Sample Question 78?',1,'2025-09-18 02:24:05'),(229,8,'mcq','Sample Question 79?',1,'2025-09-18 02:24:05'),(230,8,'mcq','Sample Question 80?',1,'2025-09-18 02:24:05'),(231,8,'mcq','Sample Question 81?',1,'2025-09-18 02:24:05'),(232,8,'mcq','Sample Question 82?',1,'2025-09-18 02:24:05'),(233,8,'mcq','Sample Question 83?',1,'2025-09-18 02:24:05'),(234,8,'mcq','Sample Question 84?',1,'2025-09-18 02:24:05'),(235,8,'mcq','Sample Question 85?',1,'2025-09-18 02:24:05'),(236,8,'mcq','Sample Question 86?',1,'2025-09-18 02:24:05'),(237,8,'mcq','Sample Question 87?',1,'2025-09-18 02:24:05'),(238,8,'mcq','Sample Question 88?',1,'2025-09-18 02:24:05'),(239,8,'mcq','Sample Question 89?',1,'2025-09-18 02:24:05'),(240,8,'mcq','Sample Question 90?',1,'2025-09-18 02:24:05'),(241,8,'mcq','Sample Question 91?',1,'2025-09-18 02:24:05'),(242,8,'mcq','Sample Question 92?',1,'2025-09-18 02:24:05'),(243,8,'mcq','Sample Question 93?',1,'2025-09-18 02:24:05'),(244,8,'mcq','Sample Question 94?',1,'2025-09-18 02:24:05'),(245,8,'mcq','Sample Question 95?',1,'2025-09-18 02:24:05'),(246,8,'mcq','Sample Question 96?',1,'2025-09-18 02:24:05'),(247,8,'mcq','Sample Question 97?',1,'2025-09-18 02:24:05'),(248,8,'mcq','Sample Question 98?',1,'2025-09-18 02:24:05'),(249,8,'mcq','Sample Question 99?',1,'2025-09-18 02:24:05'),(250,8,'mcq','Sample Question 100?',1,'2025-09-18 02:24:05');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `user_id` int NOT NULL,
  `contest_id` int NOT NULL,
  `total_score` int DEFAULT NULL,
  `ranking` int DEFAULT NULL,
  PRIMARY KEY (`user_id`,`contest_id`),
  KEY `fk_result_contest` (`contest_id`),
  CONSTRAINT `fk_result_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`contest_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_result_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
INSERT INTO `results` VALUES (1,8,3,1),(8,8,1,2);
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(2,'creator'),(3,'participant');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `submitted_by` int NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `score` int DEFAULT '-1',
  `mcq_id` int NOT NULL,
  `contest_id` int NOT NULL,
  PRIMARY KEY (`submission_id`),
  KEY `fk_submission_question` (`question_id`),
  KEY `fk_submission_user` (`submitted_by`),
  KEY `fk_mcq` (`mcq_id`),
  KEY `fk_contest` (`contest_id`),
  CONSTRAINT `fk_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`contest_id`),
  CONSTRAINT `fk_mcq` FOREIGN KEY (`mcq_id`) REFERENCES `mcqs` (`mcq_id`),
  CONSTRAINT `fk_submission_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submission_user` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,151,1,'2025-09-18 02:51:15',0,401,8),(2,152,1,'2025-09-18 02:51:15',1,407,8),(3,153,1,'2025-09-18 02:51:15',0,411,8),(4,154,1,'2025-09-18 02:51:15',0,415,8),(5,173,1,'2025-09-18 02:51:15',1,492,8),(6,174,1,'2025-09-18 02:51:15',0,494,8),(7,203,1,'2025-09-18 02:51:15',0,612,8),(8,222,1,'2025-09-18 02:51:15',0,688,8),(9,233,1,'2025-09-18 02:51:15',0,731,8),(10,250,1,'2025-09-18 02:51:15',1,797,8),(11,151,8,'2025-09-18 02:56:04',0,401,8),(12,156,8,'2025-09-18 02:56:04',0,421,8),(13,161,8,'2025-09-18 02:56:04',0,442,8),(14,166,8,'2025-09-18 02:56:04',0,463,8),(15,186,8,'2025-09-18 02:56:04',0,542,8),(16,192,8,'2025-09-18 02:56:04',1,567,8),(17,201,8,'2025-09-18 02:56:04',0,602,8),(18,212,8,'2025-09-18 02:56:04',0,646,8),(19,218,8,'2025-09-18 02:56:04',0,670,8),(20,222,8,'2025-09-18 02:56:04',0,687,8),(21,228,8,'2025-09-18 02:56:04',0,712,8),(22,250,8,'2025-09-18 02:56:04',0,800,8);
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role_id` int NOT NULL DEFAULT '3',
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `GOOGLE_ID` varchar(255) DEFAULT NULL,
  `METHOD` enum('local','google') DEFAULT 'local',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `GOOGLE_ID` (`GOOGLE_ID`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test admin',1,'test@admin.com','$2b$10$Yzy/nZE4tGoh.YA2BrNi2.LMpIFr09MGiE3xOn7EznsdUJ6L9Gy4m','2025-09-03 05:14:00',NULL,'local'),(7,'dikshant',3,'test1@gmail.com','$2b$10$Yzy/nZE4tGoh.YA2BrNi2.LMpIFr09MGiE3xOn7EznsdUJ6L9Gy4m','2025-09-03 05:58:11',NULL,'local'),(8,'DIKSHANT SHARMA',3,'dikshantsharma2005@gmail.com',NULL,'2025-09-09 16:17:49','114997576900555222972','google');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18 10:41:34
