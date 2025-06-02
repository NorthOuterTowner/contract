const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 登录接口
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    // 2. 查询用户
       const { err, rows } = await db.async.all(
      "SELECT user_id, username, password_hash, role FROM users WHERE username = ?",
      [username]
    );
    
    if (err) {
      throw err; // 数据库查询错误
    }

    // 3. 检查用户是否存在
    if (rows.length === 0) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const user = rows[0];

    // 4. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 5. 创建 session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    // 6. 返回成功响应
    res.status(200).json({
      message: "登录成功",
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role
      }
    });

    console.log('后端返回给前端的数据:', {
    message: "登录成功",
    user: {
        id: user.user_id,
        username: user.username,
        role: user.role
    }
});


  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
});

// 登出接口
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("登出错误:", err);
      return res.status(500).json({ message: "登出失败" });
    }
    res.clearCookie("connect.sid"); // 清除客户端 cookie
    res.status(200).json({ message: "登出成功" });
  });
});

// 检查登录状态接口
router.get("/status", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isLoggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ isLoggedIn: false });
  }
});

module.exports = router;