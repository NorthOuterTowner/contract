const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 获取下一个可用的角色 ID
router.get("/getNextId", async (req, res) => {
  try {
    const sql = "SELECT IFNULL(MAX(RoleID), 0) + 1 as nextId FROM Roles";
    const result = await db.async.all(sql, []);
    // 从结果中取出第一条记录
    const nextId = result.rows.length > 0 ? result.rows[0].nextId : 1; 
    res.json({ nextId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 添加角色
router.post("/add", async (req, res) => {
  const { roleId, roleName, roleDescription } = req.body;
  if (!roleName) return res.status(400).json({ error: "角色名称不能为空" });

  try {
    await db.async.run(
      "INSERT INTO Roles (RoleID, RoleName, RoleDescription) VALUES (?,?,?)",
      [roleId, roleName, roleDescription]
    );
    res.json({ message: "角色添加成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 查询角色
router.get("/query", async (req, res) => {
  const { roleName, roleID } = req.query;
  
  try {
    let sql = "SELECT * FROM Roles";
    const params = [];
    
    if (roleName) {
      sql += " WHERE roleName LIKE ?";
      params.push(`%${roleName}%`);
    } else if (roleID) {
      sql += " WHERE roleID = ?";
      params.push(roleID);
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
  const { roleID } = req.query;
  if (!roleID) return res.status(400).json({ error: "角色ID不能为空" });

  try {
    // 先删除关联权限
    await db.async.run(
      "DELETE FROM RolePermissions WHERE roleID = ?",
      [roleID]
    );
    
    // 删除角色
    await db.async.run(
      "DELETE FROM Roles WHERE roleID = ?",
      [roleID]
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

// 检查角色名是否存在
router.get("/checkName", async (req, res) => {
  const { roleName, roleID } = req.query;
  try {
    let sql = "SELECT COUNT(*) as count FROM Roles WHERE roleName = ?";
    const params = [roleName];
    if (roleID) {
      sql += " AND roleID != ?";
      params.push(roleID);
    }
    const result = await db.async.all(sql, params);
    const exists = result.count > 0;
    res.json({ exists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 更新角色信息
router.put("/update", async (req, res) => {
  const { roleID, roleName, roleDescription } = req.body;
  if (!roleID || !roleName) {
    return res.status(400).json({ error: "角色ID和角色名称不能为空" });
  }
  try {
    await db.async.all(
      "UPDATE Roles SET roleName = ?, roleDescription = ? WHERE roleID = ?",
      [roleName, roleDescription, roleID]
    );
    res.json({ message: "角色信息更新成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;