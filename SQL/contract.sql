-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: hwtwo
-- ------------------------------------------------------
-- Server version	8.0.26

--
-- Table structure for table `contract`
--

DROP TABLE IF EXISTS `contract`;
CREATE TABLE `contract` (
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Content` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Status` enum('待起草','会签处理中','待定稿','待审批','已签订','未通过','待签订') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待起草',
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastModifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `startDate` date,
  `endDate` date,
  PRIMARY KEY (`ContractID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contract`
--

LOCK TABLES `contract` WRITE;
INSERT INTO `contract` VALUES 
('AI001','Resnet结构图','图为renet的模块结构','ResNet.png','已签订','2025-06-02 10:51:47','2025-06-02 11:07:06','2025-06-02','2025-06-03'),
('SAD001','软件系统分析与设计Logo','软件系统分析与设计的Logo图标。','SADLogo.png','待签订','2025-06-02 10:53:08','2025-06-02 10:59:19','2025-06-03','2025-08-01');
UNLOCK TABLES;

--
-- Table structure for table `contractapproval`
--

DROP TABLE IF EXISTS `contractapproval`;
CREATE TABLE `contractapproval` (
  `ApprovalID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Approver` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovalDecision` enum('审批通过','审批不通过') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '审批不通过',
  `ApprovalDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ApprovalComments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ApprovalID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractapproval_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contractapproval`
--

LOCK TABLES `contractapproval` WRITE;
INSERT INTO `contractapproval` VALUES 
(15,'AI001','userA','审批通过','2025-06-02 03:04:13','通过'),
(16,'AI001','userA','审批通过','2025-06-02 03:05:43','通过'),
(17,'AI001','userA','审批通过','2025-06-02 03:06:10','好的');
UNLOCK TABLES;

--
-- Table structure for table `contractassignment`
--

DROP TABLE IF EXISTS `contractassignment`;
CREATE TABLE `contractassignment` (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SignerID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `AssignmentDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`AssignmentID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractassignment_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contractassignment`
--

LOCK TABLES `contractassignment` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `contractdraft`
--

DROP TABLE IF EXISTS `contractdraft`;
CREATE TABLE `contractdraft` (
  `DraftID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DraftTitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DraftContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedBy` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DraftID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractdraft_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `contractexecution`
--

DROP TABLE IF EXISTS `contractexecution`;
CREATE TABLE `contractexecution` (
  `ExecutionID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ExecutionDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PartiesInvolved` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ExecutionDetails` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Status` enum('已签署','未签署') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '未签署',
  PRIMARY KEY (`ExecutionID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractexecution_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `contractfinalization`
--

DROP TABLE IF EXISTS `contractfinalization`;
CREATE TABLE `contractfinalization` (
  `FinalizationID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `FinalVersionContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovedBy` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ApprovalDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FinalizationID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractfinalization_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `contractsigning`
--

DROP TABLE IF EXISTS `contractsigning`;
CREATE TABLE `contractsigning` (
  `SignID` int NOT NULL AUTO_INCREMENT,
  `ContractID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SignerID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `SignDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comment` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`SignID`),
  KEY `ContractID` (`ContractID`),
  CONSTRAINT `contractsigning_ibfk_1` FOREIGN KEY (`ContractID`) REFERENCES `contract` (`ContractID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contractsigning`
--

LOCK TABLES `contractsigning` WRITE;
INSERT INTO `contractsigning` VALUES 
(2,'AI001','userA','2025-06-02 03:07:06','完成'),
(3,'AI001','userA','2025-06-02 03:09:00','同意');
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `cus_id` int NOT NULL AUTO_INCREMENT COMMENT '客户编号',
  `cus_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '客户姓名',
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地址',
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '电话号码',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `bankname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '银行名称',
  `bankcard` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '银行卡',
  `others` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注',
  PRIMARY KEY (`cus_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户信息表';

--
-- Table structure for table `functions`
--

DROP TABLE IF EXISTS `functions`;

CREATE TABLE `functions` (
  `FunctionID` int NOT NULL AUTO_INCREMENT,
  `FunctionName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `FunctionDescription` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ParentID` int DEFAULT NULL,
  `FunctionRoute` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FunctionID`),
  UNIQUE KEY `FunctionName` (`FunctionName`),
  KEY `ParentID` (`ParentID`),
  CONSTRAINT `functions_ibfk_1` FOREIGN KEY (`ParentID`) REFERENCES `functions` (`FunctionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `functions`
--

LOCK TABLES `functions` WRITE;
INSERT INTO `functions` (`FunctionID`, `FunctionName`, `FunctionDescription`, `ParentID`, `FunctionRoute`) VALUES 
(1, '合同管理', '合同全生命周期管理', NULL, '/HomePage'),
(2, '流程管理', '合同流程配置与执行', NULL, ''),
(3, '用户管理', '系统用户配置与维护', NULL, '/user'),
(4, '角色管理', '系统角色配置与维护', NULL, '/role'),
(5, '功能操作', '系统功能配置与维护', NULL, '/function'),
(6, '权限管理', '系统权限分配与管理', NULL, '/permission'),
(7, '客户管理', '客户信息维护与管理', NULL, '/customerInfo'),
(8, '起草合同', '创建新合同文档', 1, '/DraftContract'),
(9, '定稿合同', '完成合同定稿流程', 1, '/FinalizeContract'),
(10, '查询合同', '查询和浏览合同文档', 1, '/query'),
(11, '删除合同', '删除不需要的合同', 1, ''),
(12, '会签合同', '执行合同会签流程', 2, '/CoSignContract'),
(13, '审批合同', '执行合同审批流程', 2, '/approval'),
(14, '签订合同', '执行合同签订流程', 2, '/SignContractList'),
(15, '分配会签', '分配会签人员和顺序', 2, '/PendingContractList'),
(16, '分配审批', '分配审批人员和顺序', 2, ''),
(17, '分配签订', '分配签订人员和顺序', 2, ''),
(18, '流程查询', '查询和跟踪流程状态', 2, ''),
(19, '新增用户', '创建新系统用户', 3, '/user/add'),
(20, '编辑用户', '修改现有用户信息', 3, '/user/modify/:userId'),
(21, '查询用户', '查询和浏览用户信息', 3, '/user'),
(22, '删除用户', '删除系统用户', 3, '/user'),
(23, '新增角色', '创建新系统角色', 4, '/role/add'),
(24, '编辑角色', '修改现有角色信息', 4, '/role/modify/:roleId'),
(25, '查询角色', '查询和浏览角色信息', 4, '/role'),
(26, '删除角色', '删除系统角色', 4, '/role'),
(27, '新增功能', '创建新系统功能', 5, '/function/add'),
(28, '编辑功能', '修改现有功能信息', 5, ''),
(29, '查询功能', '查询和浏览功能信息', 5, '/function/query'),
(30, '删除功能', '删除系统功能', 5, '/function/delete'),
(31, '配置权限', '分配角色和用户权限', 6, '/permission/assign/:userId'),
(32, '新增客户', '创建新客户信息', 7, ''),
(33, '编辑客户', '修改现有客户信息', 7, ''),
(34, '查询客户', '查询和浏览客户信息', 7, ''),
(35, '删除客户', '删除客户信息', 7, '');
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `RoleDescription` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`) VALUES
(1, '管理员', '负责系统管理、流程管理、查询统计和基础信息管理'),
(2, '合同操作员', '负责合同管理，包括合同起草、会签、定稿、审批、签订等流程操作'),
(3, '用户', '基础用户角色，需等待分配权限后使用系统');
UNLOCK TABLES;

--
-- Table structure for table `rolepermissions`
--

DROP TABLE IF EXISTS `rolepermissions`;
CREATE TABLE `rolepermissions` (
  `RoleID` int NOT NULL,
  `FunctionID` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`,`FunctionID`),
  KEY `FunctionID` (`FunctionID`),
  CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`),
  CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`FunctionID`) REFERENCES `functions` (`FunctionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rolepermissions`
--

LOCK TABLES `rolepermissions` WRITE;
INSERT INTO `rolepermissions` (`RoleID`, `FunctionID`) VALUES
-- 管理员权限
(1, 3), (1, 4), (1, 5), (1, 6),
(1, 19), (1, 20), (1, 21), (1, 22), 
(1, 23), (1, 24), (1, 25), (1, 26), 
(1, 27), (1, 28), (1, 29), (1, 30),
(1, 31),
-- 流程管理模块
(1, 2), (1, 15), (1, 16), (1, 17), (1, 18),
-- 客户管理模块
(1, 7), (1, 32), (1, 33), (1, 34), (1, 35),
-- 合同操作员权限
(2, 1), (2, 8), (2, 9), (2, 10), (2, 11),
(2, 2), (2, 12), (2, 13), (2, 14),
(2, 18);
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `role` int NOT NULL COMMENT '角色ID，关联roles表的RoleID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_roles` (`role`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role`) REFERENCES `roles` (`RoleID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
UNLOCK TABLES;
