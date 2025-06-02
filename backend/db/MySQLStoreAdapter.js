// backend/db/MySQLStoreAdapter.js
const { db } = require("./DBUtils");

class MySQLStoreAdapter {
  constructor() {
    this.connection = {
      query: (sql, values, callback) => {
        // 如果 values 未提供，调整参数
        if (typeof values === 'function') {
          callback = values;
          values = [];
        }
        
        db.async.all(sql, values)
          .then(({ rows }) => {
            // 模拟 MySQL 查询结果格式
            const result = {
              insertId: rows.insertId || 0,
              affectedRows: rows.length
            };
            callback(null, rows, null); // 回调格式：(error, results, fields)
          })
          .catch((err) => {
            console.error('Database query error:', err);
            callback(err, null, null);
          });
      },
      
      // 添加必要的连接方法
      connect: (callback) => {
        // 假设 db 已经连接
        callback(null);
      },
      
      end: (callback) => {
        // 实现连接关闭逻辑（如果需要）
        callback(null);
      }
    };
  }
}

module.exports = MySQLStoreAdapter;