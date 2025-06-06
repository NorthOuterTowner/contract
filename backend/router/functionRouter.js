const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 获取下一个可用的功能 ID
router.get("/getNextId", async (req, res) => {
  try {
    const sql = "SELECT IFNULL(MAX(FunctionID), 0) + 1 as nextId FROM Functions";
    const result = await db.async.all(sql, []);
    res.json({ nextId: result.rows[0].nextId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 添加功能
router.post("/add", async (req, res) => {
  const { functionId, functionName, functionDescription, parentId, functionRoute } = req.body;
  if (!functionName) {
    return res.status(400).json({ error: "功能名称不能为空" });
  }

  try {
    const sql =
      "INSERT INTO Functions (FunctionID, FunctionName, FunctionDescription, ParentID, FunctionRoute) VALUES (?,?,?,?,?)";
    await db.async.run(sql, [
      functionId,
      functionName,
      functionDescription,
      parentId,
      functionRoute
    ]);
    res.json({ message: "功能添加成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

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

// 修改功能
router.put("/update", async (req, res) => {
  const { functionId, functionName, functionCode, functionDescription, parentId, functionRoute } = req.body;
  if (!functionId) return res.status(400).json({ error: "功能ID不能为空" });

  try {
    let sql = "UPDATE Functions SET ";
    const params = [];
    
    if (functionName) {
      sql += "FunctionName = ?";
      params.push(functionName);
      if (functionCode) {
        sql += ", FunctionCode = ?";
        params.push(functionCode);
      }
      if (functionDescription) {
        sql += ", FunctionDescription = ?";
        params.push(functionDescription);
      }
      if (parentId !== undefined) {
        sql += ", ParentID = ?";
        params.push(parentId);
      }
      if (functionRoute) {
        sql += ", FunctionRoute = ?";
        params.push(functionRoute);
      }
    } else if (functionCode) {
      sql += "FunctionCode = ?";
      params.push(functionCode);
      if (functionDescription) {
        sql += ", FunctionDescription = ?";
        params.push(functionDescription);
      }
      if (parentId !== undefined) {
        sql += ", ParentID = ?";
        params.push(parentId);
      }
      if (functionRoute) {
        sql += ", FunctionRoute = ?";
        params.push(functionRoute);
      }
    } else if (functionDescription) {
      sql += "FunctionDescription = ?";
      params.push(functionDescription);
      if (parentId !== undefined) {
        sql += ", ParentID = ?";
        params.push(parentId);
      }
      if (functionRoute) {
        sql += ", FunctionRoute = ?";
        params.push(functionRoute);
      }
    } else if (parentId !== undefined) {
      sql += "ParentID = ?";
      params.push(parentId);
      if (functionRoute) {
        sql += ", FunctionRoute = ?";
        params.push(functionRoute);
      }
    } else if (functionRoute) {
      sql += "FunctionRoute = ?";
      params.push(functionRoute);
    }
    
    sql += " WHERE FunctionID = ?";
    params.push(functionId);
    
    await db.async.run(sql, params);
    res.json({ message: "功能更新成功" });
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

// 获取所有功能（用于权限配置）
router.get("/all", async (req, res) => {
  try {
    const functions = await db.async.all("SELECT * FROM Functions", []);
    res.json(functions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "系统异常，请稍后重试" });
  }
});

module.exports = router;