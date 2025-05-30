const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 查询功能
router.get("/query", async (req, res) => {
  const { functionName } = req.query;

  try {
    let sql = "SELECT * FROM Functions";
    const params = [];

    if (functionName) {
      sql += " WHERE FunctionName LIKE ?";
      params.push(`%${functionName}%`);
    }

    const functions = await db.async.all(sql, params);

    res.json(functions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

// 删除功能
router.delete("/delete", async (req, res) => {
  const { functionId } = req.query;
  if (!functionId) return res.status(400).json({ error: "功能ID不能为空" });

  try {
    // 先删除关联权限
    await db.async.run(
      "DELETE FROM RolePermissions WHERE FunctionID = ?",
      [functionId]
    );

    // 删除功能
    await db.async.run(
      "DELETE FROM Functions WHERE FunctionID = ?",
      [functionId]
    );

    res.json({ message: "功能删除成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;