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
  `Content` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Status` enum('待起草','会签处理中','待定稿','待审批','已签订','未通过','待签订') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待起草',
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
INSERT INTO `contract` VALUES ('AI001','Resnet结构图','图为renet的模块结构','ResNet.png','已签订','2025-06-02 10:51:47','2025-06-02 11:07:06'),('SAD001','软件系统分析与设计Logo','软件系统分析与设计的Logo图标。','SADLogo.png','待签订','2025-06-02 10:53:08','2025-06-02 10:59:19');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractapproval`
--

LOCK TABLES `contractapproval` WRITE;
/*!40000 ALTER TABLE `contractapproval` DISABLE KEYS */;
INSERT INTO `contractapproval` VALUES (15,'AI001','userA','审批通过','2025-06-02 03:04:13','通过'),(16,'AI001','userA','审批通过','2025-06-02 03:05:43','通过'),(17,'AI001','userA','审批通过','2025-06-02 03:06:10','好的');
/*!40000 ALTER TABLE `contractapproval` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractassignment`
--

DROP TABLE IF EXISTS `contractassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractassignment` (
  `AssignmentID` int(11) NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SignerID` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `AssignmentDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`AssignmentID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractassignment_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractassignment`
--

LOCK TABLES `contractassignment` WRITE;
/*!40000 ALTER TABLE `contractassignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractassignment` ENABLE KEYS */;
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
  `SignerID` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SignDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`SignID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractsigning_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractsigning`
--

LOCK TABLES `contractsigning` WRITE;
/*!40000 ALTER TABLE `contractsigning` DISABLE KEYS */;
INSERT INTO `contractsigning` VALUES (2,'AI001','userA','2025-06-02 03:07:06','完成'),(3,'AI001','userA','2025-06-02 03:09:00','同意');
/*!40000 ALTER TABLE `contractsigning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `functions`
--

DROP TABLE IF EXISTS `functions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `functions` (
  `FunctionID` int(11) NOT NULL AUTO_INCREMENT,
  `FunctionName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FunctionDescription` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ParentID` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FunctionID`),
  UNIQUE KEY `FunctionName` (`FunctionName`),
  KEY `ParentID` (`ParentID`),
  CONSTRAINT `functions_ibfk_1` FOREIGN KEY (`ParentID`) REFERENCES `functions` (`FunctionID`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `functions`
--

LOCK TABLES `functions` WRITE;
/*!40000 ALTER TABLE `functions` DISABLE KEYS */;
INSERT INTO `functions` VALUES (1,'合同管理','合同全生命周期管理',NULL,'2025-05-31 07:53:09'),(2,'流程管理','合同流程配置与执行',NULL,'2025-05-31 07:53:09'),(3,'用户管理','系统用户配置与维护',NULL,'2025-05-31 07:53:09'),(4,'角色管理','系统角色配置与维护',NULL,'2025-05-31 07:53:09'),(5,'功能操作','系统功能配置与维护',NULL,'2025-05-31 07:53:09'),(6,'权限管理','系统权限分配与管理',NULL,'2025-05-31 07:53:09'),(7,'客户管理','客户信息维护与管理',NULL,'2025-05-31 07:53:09'),(8,'起草合同','创建新合同文档',1,'2025-05-31 07:53:09'),(9,'定稿合同','完成合同定稿流程',1,'2025-05-31 07:53:09'),(10,'查询合同','查询和浏览合同文档',1,'2025-05-31 07:53:09'),(11,'删除合同','删除不需要的合同',1,'2025-05-31 07:53:09'),(12,'会签合同','执行合同会签流程',2,'2025-05-31 07:53:09'),(13,'审批合同','执行合同审批流程',2,'2025-05-31 07:53:09'),(14,'签订合同','执行合同签订流程',2,'2025-05-31 07:53:09'),(15,'分配会签','分配会签人员和顺序',2,'2025-05-31 07:53:09'),(16,'分配审批','分配审批人员和顺序',2,'2025-05-31 07:53:09'),(17,'分配签订','分配签订人员和顺序',2,'2025-05-31 07:53:09'),(18,'流程查询','查询和跟踪流程状态',2,'2025-05-31 07:53:09'),(19,'新增用户','创建新系统用户',3,'2025-05-31 07:53:09'),(20,'编辑用户','修改现有用户信息',3,'2025-05-31 07:53:09'),(21,'查询用户','查询和浏览用户信息',3,'2025-05-31 07:53:09'),(22,'删除用户','删除系统用户',3,'2025-05-31 07:53:09'),(23,'新增角色','创建新系统角色',4,'2025-05-31 07:53:10'),(24,'编辑角色','修改现有角色信息',4,'2025-05-31 07:53:10'),(25,'查询角色','查询和浏览角色信息',4,'2025-05-31 07:53:10'),(26,'删除角色','删除系统角色',4,'2025-05-31 07:53:10'),(27,'新增功能','创建新系统功能',5,'2025-05-31 07:53:10'),(28,'编辑功能','修改现有功能信息',5,'2025-05-31 07:53:10'),(29,'查询功能','查询和浏览功能信息',5,'2025-05-31 07:53:10'),(30,'删除功能','删除系统功能',5,'2025-05-31 07:53:10'),(31,'配置权限','分配角色和用户权限',6,'2025-05-31 07:53:10'),(32,'新增客户','创建新客户信息',7,'2025-05-31 07:53:10'),(33,'编辑客户','修改现有客户信息',7,'2025-05-31 07:53:10'),(34,'查询客户','查询和浏览客户信息',7,'2025-05-31 07:53:10'),(35,'删除客户','删除客户信息',7,'2025-05-31 07:53:10');
/*!40000 ALTER TABLE `functions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermissions`
--

DROP TABLE IF EXISTS `rolepermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolepermissions` (
  `RoleID` int(11) NOT NULL,
  `FunctionID` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`,`FunctionID`),
  KEY `FunctionID` (`FunctionID`),
  CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`),
  CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`FunctionID`) REFERENCES `functions` (`FunctionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermissions`
--

LOCK TABLES `rolepermissions` WRITE;
/*!40000 ALTER TABLE `rolepermissions` DISABLE KEYS */;
INSERT INTO `rolepermissions` VALUES (1,1,'2025-06-03 12:52:09'),(1,2,'2025-06-03 12:52:09'),(1,3,'2025-06-03 12:52:09'),(1,4,'2025-06-03 12:52:09'),(1,5,'2025-06-03 12:52:09'),(1,6,'2025-06-03 12:52:09'),(1,7,'2025-06-03 12:52:09'),(1,8,'2025-06-03 12:52:09'),(1,9,'2025-06-03 12:52:09'),(1,10,'2025-06-03 12:52:09'),(1,11,'2025-06-03 12:52:09'),(1,12,'2025-06-03 12:52:09'),(1,13,'2025-06-03 12:52:09'),(1,14,'2025-06-03 12:52:09'),(1,15,'2025-06-03 12:52:09'),(1,16,'2025-06-03 12:52:09'),(1,17,'2025-06-03 12:52:09'),(1,18,'2025-06-03 12:52:09'),(1,19,'2025-06-03 12:52:09'),(1,20,'2025-06-03 12:52:09'),(1,21,'2025-06-03 12:52:09'),(1,22,'2025-06-03 12:52:09'),(1,23,'2025-06-03 12:52:09'),(1,24,'2025-06-03 12:52:09'),(1,25,'2025-06-03 12:52:09'),(1,26,'2025-06-03 12:52:09'),(1,27,'2025-06-03 12:52:09'),(1,28,'2025-06-03 12:52:09'),(1,29,'2025-06-03 12:52:09'),(1,30,'2025-06-03 12:52:09'),(1,31,'2025-06-03 12:52:09'),(1,32,'2025-06-03 12:52:09'),(1,33,'2025-06-03 12:52:09'),(1,34,'2025-06-03 12:52:09'),(1,35,'2025-06-03 12:52:09');
/*!40000 ALTER TABLE `rolepermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `RoleID` int(11) NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RoleDescription` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('8a1XKxsduj7SqkHSnYC_S0-hS4-AKCxO',1748992899,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-06-03T23:20:52.833Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":1,\"username\":\"admin\",\"role\":2}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `role` int(11) NOT NULL COMMENT '角色ID，关联roles表的RoleID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_roles` (`role`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role`) REFERENCES `roles` (`RoleID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
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

-- Dump completed on 2025-06-04 16:51:59
