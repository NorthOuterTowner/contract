const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 新增用户
router.post('/add', async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ error: '用户名和密码为必填项' });
  }
  try {
    const existingUser = await db.async.getUser(userName);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    await db.async.addUser(userName, password);
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
    const users = await db.async.getUser(query);
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
    await db.async.updateUser(userId, userName, password);
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
    await db.async.deleteUser(userId);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;