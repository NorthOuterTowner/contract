const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 查询角色
router.get("/query", async (req, res) => {
  const { roleName } = req.query;
  
  try {
    let sql = "SELECT * FROM Roles";
    const params = [];
    
    if (roleName) {
      sql += " WHERE roleName LIKE ?";
      params.push(`%${roleName}%`);
    }
    
    const roles = await db.async.all(sql, params);
    res.json(roles.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 删除角色
router.delete("/delete", async (req, res) => {
  const { roleId } = req.query;
  if (!roleId) return res.status(400).json({ error: "角色ID不能为空" });

  try {
    // 先删除关联权限
    await db.async.run(
      "DELETE FROM RolePermissions WHERE roleID = ?",
      [roleId]
    );
    
    // 删除角色
    await db.async.run(
      "DELETE FROM Roles WHERE roleID = ?",
      [roleId]
    );
    
    res.json({ message: "角色删除成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 获取所有角色（用于权限配置）
router.get("/all", async (req, res) => {
  try {
    const roles = await db.async.all("SELECT * FROM Roles", []);
    res.json(roles.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;