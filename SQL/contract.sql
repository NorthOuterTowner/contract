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
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  PRIMARY KEY (`ContractID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract`
--

LOCK TABLES `contract` WRITE;
/*!40000 ALTER TABLE `contract` DISABLE KEYS */;
INSERT INTO `contract` VALUES ('AI001','Resnet结构图','图为renet的模块结构','ResNet.png','已签订','2025-06-02 10:51:47','2025-06-02 11:07:06',NULL,NULL),('SAD001','软件系统分析与设计Logo','软件系统分析与设计的Logo图标。','SADLogo.png','待签订','2025-06-02 10:53:08','2025-06-02 10:59:19',NULL,NULL);
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

CREATE TABLE `contractassignment` (
  `AssignmentID` INT(11) NOT NULL AUTO_INCREMENT COMMENT '分配记录唯一标识',
  `ContractID` VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号（关联contract表ContractID，对应需求中合同编号）',
  `RoleType` VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分配角色：会签人、审批人、签订人（对应需求中的三类流程角色）',
  `AssigneeUserID` INT(10) UNSIGNED NOT NULL COMMENT '被分配用户ID（关联users表user_id，需为合同操作员或管理员）',
  `OperatorUserID` INT(10) UNSIGNED NOT NULL COMMENT '操作人用户ID（关联users表user_id，需为管理员角色）',
  `AssignmentDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间（自动填充当前时间）',
  `AssignmentComment` VARCHAR(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分配备注（如特殊流程说明）',
  PRIMARY KEY (`AssignmentID`),
  -- 外键约束：关联合同表
  KEY `fk_contractassignment_contract` (`ContractID`),
  CONSTRAINT `fk_contractassignment_contract` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE,
  -- 外键约束：关联被分配用户（合同操作员/管理员）
  KEY `fk_contractassignment_assignee` (`AssigneeUserID`),
  CONSTRAINT `fk_contractassignment_assignee` FOREIGN KEY (`AssigneeUserID`) REFERENCES `users` (`user_id`),
  -- 外键约束：关联操作人（管理员）
  KEY `fk_contractassignment_operator` (`OperatorUserID`),
  CONSTRAINT `fk_contractassignment_operator` FOREIGN KEY (`OperatorUserID`) REFERENCES `users` (`user_id`),
  -- 检查角色类型合法性（基于需求中的三类角色）
  CHECK (`RoleType` IN ('会签人', '审批人', '签订人'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同分配记录表（记录会签、审批、签订人员分配信息）';

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
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `cus_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '客户编号',
  `cus_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '客户姓名',
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地址',
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '电话号码',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `bankname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '银行名称',
  `bankcard` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '银行卡',
  `others` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  PRIMARY KEY (`cus_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
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
INSERT INTO `functions` (`FunctionID`, `FunctionName`, `FunctionDescription`, `ParentID`, `CreatedAt`) VALUES 
(1,'合同管理','合同全生命周期管理',NULL,'2025-06-07 01:40:33'),
(2,'流程管理','合同流程配置与执行',NULL,'2025-06-07 01:40:33'),
(3,'用户管理','系统用户配置与维护',NULL,'2025-06-07 01:40:33'),
(4,'角色管理','系统角色配置与维护',NULL,'2025-06-07 01:40:33'),
(5,'功能操作','系统功能配置与维护',NULL,'2025-06-07 01:40:33'),
(6,'权限管理','系统权限分配与管理',NULL,'2025-06-07 01:40:33'),
(7,'客户管理','客户信息维护与管理',NULL,'2025-06-07 01:40:33'),
(8,'起草合同','创建新合同文档',1,'2025-06-07 01:40:33'),
(9,'定稿合同','完成合同定稿流程',1,'2025-06-07 01:40:33'),
(10,'查询合同','查询和浏览合同文档',1,'2025-06-07 01:40:33'),
(11,'删除合同','删除不需要的合同',1,'2025-06-07 01:40:33'),
(12,'会签合同','执行合同会签流程',2,'2025-06-07 01:40:33'),
(13,'审批合同','执行合同审批流程',2,'2025-06-07 01:40:33'),
(14,'签订合同','执行合同签订流程',2,'2025-06-07 01:40:33'),
(15,'分配会签','分配会签人员和顺序',2,'2025-06-07 01:40:33'),
(16,'分配审批','分配审批人员和顺序',2,'2025-06-07 01:40:33'),
(17,'分配签订','分配签订人员和顺序',2,'2025-06-07 01:40:33'),
(18,'流程查询','查询和跟踪流程状态',2,'2025-06-07 01:40:33'),
(19,'新增用户','创建新系统用户',3,'2025-06-07 01:40:33'),
(20,'编辑用户','修改现有用户信息',3,'2025-06-07 01:40:33'),
(21,'查询用户','查询和浏览用户信息',3,'2025-06-07 01:40:33'),
(22,'删除用户','删除系统用户',3,'2025-06-07 01:40:33'),
(23,'新增角色','创建新系统角色',4,'2025-06-07 01:40:33'),
(24,'编辑角色','修改现有角色信息',4,'2025-06-07 01:40:33'),
(25,'查询角色','查询和浏览角色信息',4,'2025-06-07 01:40:33'),
(26,'删除角色','删除系统角色',4,'2025-06-07 01:40:33'),
(27,'新增功能','创建新系统功能',5,'2025-06-07 01:40:33'),
(28,'编辑功能','修改现有功能信息',5,'2025-06-07 01:40:33'),
(29,'查询功能','查询和浏览功能信息',5,'2025-06-07 01:40:33'),
(30,'删除功能','删除系统功能',5,'2025-06-07 01:40:33'),
(31,'配置权限','分配角色和用户权限',6,'2025-06-07 01:40:33'),
(32,'新增客户','创建新客户信息',7,'2025-06-07 01:40:33'),
(33,'编辑客户','修改现有客户信息',7,'2025-06-07 01:40:33'),
(34,'查询客户','查询和浏览客户信息',7,'2025-06-07 01:40:33'),
(35,'删除客户','删除客户信息',7,'2025-06-07 01:40:33');
/*!40000 ALTER TABLE `functions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `functionroutes`
--
DROP TABLE IF EXISTS `functionroutes`;
CREATE TABLE `functionroutes` (
  `FunctionID` int(11) NOT NULL,
  `Route` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FunctionID`, `Route`),
  FOREIGN KEY (`FunctionID`) REFERENCES `functions` (`FunctionID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `functionroutes`
--

LOCK TABLES `functionroutes` WRITE;
INSERT INTO `functionroutes` (`FunctionID`, `Route`, `CreatedAt`) VALUES
(1, '', '2025-06-07 01:40:33'),
(2, '', '2025-06-07 01:40:33'),
(3, '', '2025-06-07 01:40:33'),
(4, '', '2025-06-07 01:40:33'),
(5, '', '2025-06-07 01:40:33'),
(6, '', '2025-06-07 01:40:33'),
(7, '', '2025-06-07 01:40:33'),
(8, '/DraftContract', '2025-06-07 01:40:33'),
(8, '/DraftContractList', '2025-06-07 01:40:33'),
(9, '/FinalizeContract', '2025-06-07 01:40:33'),
(9, '/FinalizeContractList', '2025-06-07 01:40:33'),
(9, '/FinalizeContract/[^/]{1,10}', '2025-06-07 01:40:33'),
(10, '/my-contract-module', '2025-06-07 01:40:33'),
(10, '/my-contract-module/query', '2025-06-07 01:40:33'),
(10, '/my-contract-module/query/detail/[^/]{1,10}', '2025-06-07 01:40:33'),
(10, '/my-contract-module/statistics', '2025-06-07 01:40:33'),
(11, '', '2025-06-07 01:40:33'),
(12, '/CoSignContract', '2025-06-07 01:40:33'),
(12, '/CoSignContract/[^/]{1,10}', '2025-06-07 01:40:33'),
(12, '/CoSignContractList', '2025-06-07 01:40:33'),
(13, '/approveList', '2025-06-07 01:40:33'),
(13, '/approval', '2025-06-07 01:40:33'),
(13, '/approve/content', '2025-06-07 01:40:33'),
(14, '/SignContractList', '2025-06-07 01:40:33'),
(14, '/sign/content', '2025-06-07 01:40:33'),
(15, '/PendingContractList', '2025-06-07 01:40:33'),
(15, '/allocate/[^/]{1,10}', '2025-06-07 01:40:33'),
(16, '/PendingContractList', '2025-06-07 01:40:33'),
(16, '/allocate/[^/]{1,10}', '2025-06-07 01:40:33'),
(17, '/PendingContractList', '2025-06-07 01:40:33'),
(17, '/allocate/[^/]{1,10}', '2025-06-07 01:40:33'),
(18, '', '2025-06-07 01:40:33'),
(19, '/user', '2025-06-07 01:40:33'),
(19, '/user/add', '2025-06-07 01:40:33'),
(20, '/user', '2025-06-07 01:40:33'),
(20, '/user/modify/\\d+', '2025-06-07 01:40:33'),
(21, '/user', '2025-06-07 01:40:33'),
(22, '/user', '2025-06-07 01:40:33'),
(23, '/role', '2025-06-07 01:40:33'),
(23, '/role/add', '2025-06-07 01:40:33'),
(24, '/role', '2025-06-07 01:40:33'),
(24, '/role/modify/\\d+', '2025-06-07 01:40:33'),
(25, '/role', '2025-06-07 01:40:33'),
(26, '/role', '2025-06-07 01:40:33'),
(27, '/function', '2025-06-07 01:40:33'),
(27, '/function/add', '2025-06-07 01:40:33'),
(28, '/function', '2025-06-07 01:40:33'),
(28, '/function/modify/\\d+', '2025-06-07 01:40:33'),
(29, '/function', '2025-06-07 01:40:33'),
(30, '/function', '2025-06-07 01:40:33'),
(31, '/permission', '2025-06-07 01:40:33'),
(31, '/permission/assign/\\d+', '2025-06-07 01:40:33'),
(32, '', '2025-06-07 01:40:33'),
(33, '', '2025-06-07 01:40:33'),
(34, '', '2025-06-07 01:40:33'),
(35, '', '2025-06-07 01:40:33');
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
INSERT INTO `rolepermissions` VALUES (1,2,'2025-06-07 01:40:33'),(1,3,'2025-06-07 01:40:33'),(1,4,'2025-06-07 01:40:33'),(1,5,'2025-06-07 01:40:33'),(1,6,'2025-06-07 01:40:33'),(1,7,'2025-06-07 01:40:33'),(1,15,'2025-06-07 01:40:33'),(1,16,'2025-06-07 01:40:33'),(1,17,'2025-06-07 01:40:33'),(1,18,'2025-06-07 01:40:33'),(1,19,'2025-06-07 01:40:33'),(1,20,'2025-06-07 01:40:33'),(1,21,'2025-06-07 01:40:33'),(1,22,'2025-06-07 01:40:33'),(1,23,'2025-06-07 01:40:33'),(1,24,'2025-06-07 01:40:33'),(1,25,'2025-06-07 01:40:33'),(1,26,'2025-06-07 01:40:33'),(1,27,'2025-06-07 01:40:33'),(1,28,'2025-06-07 01:40:33'),(1,29,'2025-06-07 01:40:33'),(1,30,'2025-06-07 01:40:33'),(1,31,'2025-06-07 01:40:33'),(1,32,'2025-06-07 01:40:33'),(1,33,'2025-06-07 01:40:33'),(1,34,'2025-06-07 01:40:33'),(1,35,'2025-06-07 01:40:33'),(2,1,'2025-06-07 01:40:33'),(2,2,'2025-06-07 01:40:33'),(2,8,'2025-06-07 01:40:33'),(2,9,'2025-06-07 01:40:33'),(2,10,'2025-06-07 01:40:33'),(2,11,'2025-06-07 01:40:33'),(2,12,'2025-06-07 01:40:33'),(2,13,'2025-06-07 01:40:33'),(2,14,'2025-06-07 01:40:33'),(2,18,'2025-06-07 01:40:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'管理员','负责系统管理、流程管理、查询统计和基础信息管理','2025-06-07 01:40:33'),(2,'合同操作员','负责合同管理，包括合同起草、会签、定稿、审批、签订等流程操作','2025-06-07 01:40:33'),(3,'用户','基础用户角色，需等待分配权限后使用系统','2025-06-07 01:40:33');
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
  `expires` int(10) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
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