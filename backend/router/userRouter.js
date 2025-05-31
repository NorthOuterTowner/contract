const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

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
  const { userId, userName, password } = req.body;
  if (!userId || !userName || !password) {
    return res.status(400).json({ error: '用户 ID、用户名和密码为必填项' });
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
    const addSql = "INSERT INTO users (user_id, username, password_hash) VALUES (?,?,?)";
    await db.async.run(addSql, [userId, userName, password]);
    res.json({ message: '用户添加成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 查询用户
router.get('/query', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: '请输入查询条件' });
  }
  try {
    const sql = "SELECT * FROM users WHERE username = ? OR user_id = ?";
    const users = await db.async.all(sql, [query, query]);
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 修改用户信息
router.put('/update', async (req, res) => {
  const { userId, userName, password } = req.body;
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
        sql += ", password_hash = ?";
        params.push(password);
      }
    } else if (password) {
      sql += "password_hash = ?";
      params.push(password);
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