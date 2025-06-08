const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
const bcrypt = require("bcryptjs");

// 获取下一个可用的用户 ID
router.get('/getNextId', async (req, res) => {
  try {
    const sql = "SELECT IFNULL(MAX(user_id), 0) + 1 as nextId FROM users";
    const result = await db.async.all(sql, []);
    res.json({ nextId: result.rows[0].nextId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 新增用户
router.post('/add', async (req, res) => {
  const { userId, userName, password, roleId } = req.body;
  if (!userId || !userName || !password || !roleId) {
    return res.status(400).json({ error: '用户 ID、用户名、密码和角色 ID 为必填项' });
  }
  try {
    // 检查 ID 和用户名是否重复
    const checkSql = "SELECT * FROM users WHERE username = ? OR user_id = ?";
    const existingUser = await db.async.all(checkSql, [userId, userId]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '用户 ID 已存在' });
    }
    const existingUserName = await db.async.all(checkSql, [userName, userName]);
    if (existingUserName.rows.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const addSql = "INSERT INTO users (user_id, username, password_hash, role) VALUES (?,?,?,?)";
    await db.async.run(addSql, [userId, userName, hashedPassword, roleId]);
    res.json({ message: '用户添加成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/query', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: '请输入查询条件' });
  }
  try {
    const sql = "SELECT u.user_id, u.username as user_name, r.RoleName as role_name, u.create_time FROM users u LEFT JOIN roles r ON u.role = r.RoleID WHERE u.username LIKE ? OR u.user_id LIKE ?";
    const users = await db.async.all(sql, [query, query]);
    res.json(users.rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/queryByUsernameOrRole', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: '请输入查询条件' });
  }
  try {
    const sql = "SELECT u.user_id, u.username as user_name, r.RoleName as role_name FROM users u LEFT JOIN roles r ON u.role = r.RoleID WHERE u.username LIKE ? OR r.RoleName LIKE ?";
    const users = await db.async.all(sql, [query, query]);
    res.json(users.rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取所有用户
router.get('/all', async (req, res) => {
  try {
    const sql = "SELECT u.user_id, u.username as user_name, r.RoleName as role_name FROM users u LEFT JOIN roles r ON u.role = r.RoleID";
    const users = await db.async.all(sql, []);
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取 role 为 2 的用户列表
router.get("/role2-users", async (req, res) => {
  try {
    const sql = "SELECT user_id as id, username as name FROM users WHERE role = 2";
    const { rows } = await db.async.all(sql, []);
    res.json(rows);
  } catch (error) {
    console.error("获取用户列表时出错:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 修改用户信息
router.put('/update', async (req, res) => {
  const { userId, userName, password, roleId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: '请提供用户 ID' });
  }
  try {
    let sql = "UPDATE users SET ";
    const params = [];
    if (userName) {
      sql += "username = ?";
      params.push(userName);
      if (password) {
        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        sql += ", password_hash = ?";
        params.push(hashedPassword);
      }
      if (roleId) {
        sql += ", role = ?";
        params.push(roleId);
      }
    } else if (password) {
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      sql += "password_hash = ?";
      params.push(hashedPassword);
      if (roleId) {
        sql += ", role = ?";
        params.push(roleId);
      }
    } else if (roleId) {
      sql += "role = ?";
      params.push(roleId);
    }
    sql += " WHERE user_id = ?";
    params.push(userId);
    await db.async.run(sql, params);
    res.json({ message: '用户信息修改成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/updateRole', async (req, res) => {
  const { userId, roleId } = req.body;
  
  if (!userId || !roleId) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  try {
    // 检查角色是否存在
    const checkRoleSql = "SELECT * FROM roles WHERE RoleID = ?";
    const roleResult = await db.async.all(checkRoleSql, [roleId]);
    
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: '指定的角色不存在' });
    }
    
    // 更新用户角色
    const updateSql = "UPDATE users SET role = ? WHERE user_id = ?";
    await db.async.run(updateSql, [roleId, userId]);
    
    res.json({ message: '角色更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 删除用户
router.delete('/delete', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: '请提供用户 ID' });
  }
  try {
    const sql = "DELETE FROM users WHERE user_id = ?";
    await db.async.run(sql, [userId]);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;