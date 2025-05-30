const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 获取下一个可用的角色 ID
router.get("/getNextId", async (req, res) => {
  try {
    const result = await db.async.getNextRoleId();
    const nextId = result.rows[0].AUTO_INCREMENT;
    res.json({ nextId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 添加角色
router.post("/add", async (req, res) => {
  const { roleName, roleDescription, permissions } = req.body;
  if (!roleName) return res.status(400).json({ error: "角色名称不能为空" });

  try {
    await db.async.addRole(roleName, roleDescription, permissions);
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
    const roles = await db.async.queryRoles(roleName);
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
    await db.async.updateRole(roleId, roleName, roleDescription, permissions);
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
    await db.async.deleteRole(roleId);
    res.json({ message: "角色删除成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;