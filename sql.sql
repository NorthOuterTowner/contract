create database contract;
use contract;

CREATE TABLE Contract (
    ContractID VARCHAR(10) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description VARCHAR(200),
    Content LONGTEXT, 
    Status ENUM('待起草', '会签处理中', '待定稿', '待审批', '待签署','已签署') NOT NULL DEFAULT '待起草',
    CreationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastModifiedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ContractID)
);

CREATE TABLE ContractDraft (
    DraftID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL, 
    DraftTitle VARCHAR(255) NOT NULL,
    DraftContent LONGTEXT,
    CreatedBy VARCHAR(100) NOT NULL,
    CreationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (DraftID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

CREATE TABLE ContractSigning (
    SignID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL, 
    Signer VARCHAR(100) NOT NULL, 
    SigningDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    ModificationSuggestions TEXT,
    PRIMARY KEY (SignID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

CREATE TABLE ContractFinalization (
    FinalizationID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL,
    FinalVersionContent LONGTEXT NOT NULL,
    ApprovedBy VARCHAR(100) NOT NULL,
    ApprovalDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FinalizationID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

CREATE TABLE ContractApproval (
    ApprovalID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL,
    Approver VARCHAR(100) NOT NULL,
    ApprovalDecision ENUM('审批通过', '审批不通过') NOT NULL DEFAULT '审批不通过',
    ApprovalDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ApprovalComments TEXT,
    PRIMARY KEY (ApprovalID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

CREATE TABLE ContractExecution (
    ExecutionID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL,
    ExecutionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PartiesInvolved TEXT NOT NULL,
    ExecutionDetails TEXT,
    Status ENUM('已签署', '未签署') NOT NULL DEFAULT '未签署',
    PRIMARY KEY (ExecutionID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

CREATE TABLE ContractAssignment (
    AssignmentID INT NOT NULL AUTO_INCREMENT,
    ContractID VARCHAR(10) NOT NULL,
    SignerID VARCHAR(100) NOT NULL,
    ApproverID VARCHAR(100) NOT NULL,
    ExecutorID VARCHAR(100) NOT NULL,
    AssignmentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (AssignmentID),
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

-- 角色表
CREATE TABLE Roles (
  RoleID INT PRIMARY KEY AUTO_INCREMENT,
  RoleName VARCHAR(50) NOT NULL UNIQUE,
  RoleDescription VARCHAR(255),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 功能表
CREATE TABLE Functions (
  FunctionID INT PRIMARY KEY AUTO_INCREMENT,
  FunctionName VARCHAR(50) NOT NULL UNIQUE,
  FunctionDescription VARCHAR(255),
  ParentID INT DEFAULT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ParentID) REFERENCES Functions(FunctionID)
);

-- 角色权限关联表
CREATE TABLE RolePermissions (
  RoleID INT,
  FunctionID INT,
  PRIMARY KEY (RoleID, FunctionID),
  FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
  FOREIGN KEY (FunctionID) REFERENCES Functions(FunctionID)
);