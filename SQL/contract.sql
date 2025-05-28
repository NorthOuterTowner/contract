-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: contract
-- ------------------------------------------------------
-- Server version	5.7.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contract`
--

DROP TABLE IF EXISTS `contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract` (
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Content` longtext COLLATE utf8mb4_unicode_ci,
  `Status` enum('待起草','会签处理中','待定稿','待审批','待签署','已签署','未通过') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待起草',
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastModifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ContractID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract`
--

LOCK TABLES `contract` WRITE;
/*!40000 ALTER TABLE `contract` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractapproval`
--

DROP TABLE IF EXISTS `contractapproval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractapproval` (
  `ApprovalID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Approver` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovalDecision` enum('审批通过','审批不通过') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '审批不通过',
  `ApprovalDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ApprovalComments` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ApprovalID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractapproval_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractapproval`
--

LOCK TABLES `contractapproval` WRITE;
/*!40000 ALTER TABLE `contractapproval` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractapproval` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractdraft`
--

DROP TABLE IF EXISTS `contractdraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractdraft` (
  `DraftID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DraftTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DraftContent` longtext COLLATE utf8mb4_unicode_ci,
  `CreatedBy` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DraftID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractdraft_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractdraft`
--

LOCK TABLES `contractdraft` WRITE;
/*!40000 ALTER TABLE `contractdraft` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractdraft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractexecution`
--

DROP TABLE IF EXISTS `contractexecution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractexecution` (
  `ExecutionID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ExecutionDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PartiesInvolved` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ExecutionDetails` text COLLATE utf8mb4_unicode_ci,
  `Status` enum('已签署','未签署') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '未签署',
  PRIMARY KEY (`ExecutionID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractexecution_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractexecution`
--

LOCK TABLES `contractexecution` WRITE;
/*!40000 ALTER TABLE `contractexecution` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractexecution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractfinalization`
--

DROP TABLE IF EXISTS `contractfinalization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractfinalization` (
  `FinalizationID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FinalVersionContent` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovedBy` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovalDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FinalizationID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractfinalization_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractfinalization`
--

LOCK TABLES `contractfinalization` WRITE;
/*!40000 ALTER TABLE `contractfinalization` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractfinalization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractsigning`
--

DROP TABLE IF EXISTS `contractsigning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractsigning` (
  `SignID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Signer` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SigningDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ModificationSuggestions` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`SignID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractsigning_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractsigning`
--

LOCK TABLES `contractsigning` WRITE;
/*!40000 ALTER TABLE `contractsigning` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractsigning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户账号',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `user_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '客户名称',
  `identify` tinyint(4) NOT NULL COMMENT '身份(0管理员，1起草员，2客户)',
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '电话',
  `address` text COLLATE utf8mb4_unicode_ci COMMENT '地址',
  `bank_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '银行名称',
  `bank_id` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '银行卡号',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '用户状态:0-禁用  1-正常',
  `other` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
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

-- Dump completed on 2025-05-27 14:05:36
