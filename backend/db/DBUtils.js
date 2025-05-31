const mysql = require("mysql2"); // 使用 mysql2 库
const path = require("path");
require('dotenv').config(); // 加载 .env 文件

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: "localhost", // MySQL 服务器地址
  user: "root",      // 数据库用户名
  password: "root", // 数据库密码
  database: "contract",  // 数据库名称
  waitForConnections: true, // 是否等待连接
  connectionLimit: 200,      // 连接池最大连接数
  queueLimit: 0,            // 排队等待的连接数（0 表示不限制）
});

require('events').EventEmitter.defaultMaxListeners = 150;

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("数据库账号或密码错误！");
    } else {
      console.error("数据库连接失败：", err.message);
    }
    process.exit(1);
  } else {
    console.log("数据库连接成功！");
    connection.setMaxListeners(150); 
    connection.release();
  }
});

// 封装异步方法
const db = {
  async: {
    // 查询多条数据
    all: (sql, params) => {
      return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ err: null, rows });
          }
        });
      });
    },

    // 执行 SQL 语句（如 INSERT, UPDATE, DELETE）
    run: (sql, params) => {
      return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ err: null, result });
          }
        });
      });
    },

    // 查询待分配合同列表
    getPendingContracts: () => {
      const sql = "SELECT * FROM Contract WHERE Status = '待起草'";
      return db.async.all(sql, []);
    },
    // 查询合同基本信息
    getContractInfo: (contractId) => {
      const sql = "SELECT * FROM Contract WHERE ContractID = ?";
      return db.async.all(sql, [contractId]);
    },
    // 查询用户列表信息
    getUserList: () => {
      const sql = "SELECT user_id, username FROM Users"; // 假设存在 Users 表
      return db.async.all(sql, []);
    }, 

    // 保存合同分配信息
    saveContractAssignment: (contractId, signerId, approverId, executorId) => {
      const sql = "INSERT INTO ContractAssignment (ContractID, SignerID, ApproverID, ExecutorID) VALUES (?,?,?,?)";
      return db.async.run(sql, [contractId, signerId, approverId, executorId]);
    },

    // 添加用户
    addUser: (userId, userName, password) => {
      const sql = "INSERT INTO users (user_id, username, password_hash) VALUES (?,?,?)";
      return db.async.run(sql, [userId, userName, password]);
    },

    // 查询用户
    getUser: (query) => {
      const sql = "SELECT * FROM users WHERE username = ? OR user_id = ?";
      return db.async.all(sql, [query, query]);
    },

    // 修改用户信息
    updateUser: (userId, userName, password) => {
      let sql = "UPDATE users SET ";
      const params = [];
      if (userName) {
        sql += "username = ?";
        params.push(userName);
        if (password) {
          sql += ", password_hash = ?";
          params.push(password);
        }
      } else if (password) {
        sql += "password_hash = ?";
        params.push(password);
      }
      sql += " WHERE user_id = ?";
      params.push(userId);
      return db.async.run(sql, params);
    },

    // 删除用户
    deleteUser: (userId) => {
      const sql = "DELETE FROM users WHERE user_id = ?";
      return db.async.run(sql, [userId]);
    },

    // 获取下一个可用的用户 ID
    getNextUserId: () => {
      const sql = "SELECT IFNULL(MAX(user_id), 0) + 1 as nextId FROM users";
      return db.async.all(sql, []);
    },
    

    // 获取下一个可用的功能 ID
    getNextFunctionId: () => {
      const sql = "SELECT IFNULL(MAX(FunctionID), 0) + 1 as nextId FROM Functions";
      return db.async.all(sql, []);
    },

    // 添加功能
    addFunction: (functionId, functionName, functionDescription, parentId) => {
      const sql =
        "INSERT INTO Functions (FunctionID, FunctionName, FunctionDescription, ParentID) VALUES (?,?,?,?)";
      return db.async.run(sql, [
        functionId,
        functionName,
        functionDescription,
        parentId,
      ]);
    },

  },
};

// 导出模块
module.exports = { db };