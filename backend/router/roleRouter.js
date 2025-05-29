const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 添加角色
router.post("/add", async (req, res) => {
  const { roleName, roleDescription, permissions } = req.body;
  if (!roleName) return res.status(400).json({ error: "角色名称不能为空" });

  try {
    // 插入角色
    const result = await db.async.run(
      "INSERT INTO Roles (RoleName, RoleDescription) VALUES (?, ?)",
      [roleName, roleDescription]
    );
    
    const roleId = result.result.insertId;
    
    // 插入权限关联
    if (permissions && permissions.length > 0) {
      const values = permissions.map(pid => [roleId, pid]);
      await db.async.run(
        "INSERT INTO RolePermissions (RoleID, FunctionID) VALUES ?",
        [values]
      );
    }
    
    res.json({ message: "角色添加成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 查询角色
router.get("/query", async (req, res) => {
  const { roleName } = req.query;
  
  try {
    let sql = "SELECT * FROM Roles";
    const params = [];
    
    if (roleName) {
      sql += " WHERE RoleName LIKE ?";
      params.push(`%${roleName}%`);
    }
    
    const roles = await db.async.all(sql, params);
    
    // 查询每个角色的权限
    for (const role of roles.rows) {
      const permissions = await db.async.all(
        "SELECT * FROM Functions WHERE FunctionID IN (SELECT FunctionID FROM RolePermissions WHERE RoleID = ?)",
        [role.RoleID]
      );
      role.permissions = permissions.rows;
    }
    
    res.json(roles.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 修改角色
router.put("/update", async (req, res) => {
  const { roleId, roleName, roleDescription, permissions } = req.body;
  if (!roleId) return res.status(400).json({ error: "角色ID不能为空" });

  try {
    // 更新角色信息
    let sql = "UPDATE Roles SET ";
    const params = [];
    
    if (roleName) {
      sql += "RoleName = ?";
      params.push(roleName);
      if (roleDescription) {
        sql += ", RoleDescription = ?";
        params.push(roleDescription);
      }
    } else if (roleDescription) {
      sql += "RoleDescription = ?";
      params.push(roleDescription);
    }
    
    sql += " WHERE RoleID = ?";
    params.push(roleId);
    
    await db.async.run(sql, params);
    
    // 先删除原有权限关联
    await db.async.run(
      "DELETE FROM RolePermissions WHERE RoleID = ?",
      [roleId]
    );
    
    // 插入新的权限关联
    if (permissions && permissions.length > 0) {
      const values = permissions.map(pid => [roleId, pid]);
      await db.async.run(
        "INSERT INTO RolePermissions (RoleID, FunctionID) VALUES ?",
        [values]
      );
    }
    
    res.json({ message: "角色更新成功" });
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
      "DELETE FROM RolePermissions WHERE RoleID = ?",
      [roleId]
    );
    
    // 删除角色
    await db.async.run(
      "DELETE FROM Roles WHERE RoleID = ?",
      [roleId]
    );
    
    res.json({ message: "角色删除成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;