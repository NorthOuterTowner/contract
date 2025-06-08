const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 开始事务
const startTransaction = async () => {
    await db.async.run("BEGIN");
};

// 提交事务
const commitTransaction = async () => {
    await db.async.run("COMMIT");
};

// 回滚事务
const rollbackTransaction = async () => {
    await db.async.run("ROLLBACK");
};

// 获取下一个可用的功能 ID
router.get("/getNextId", async (req, res) => {
    try {
        await startTransaction();
        const sql = "SELECT IFNULL(MAX(FunctionID), 0) + 1 as nextId FROM Functions FOR SHARE";
        const result = await db.async.all(sql, []);
        await commitTransaction();
        res.json({ nextId: result.rows[0].nextId });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 添加功能
router.post("/add", async (req, res) => {
    const { functionId, functionName, functionDescription, parentId, functionRoutes } = req.body;
    if (!functionName) {
        return res.status(400).json({ error: "功能名称不能为空" });
    }

    try {
        await startTransaction();
        // 插入功能信息到 functions 表
        const insertFunctionSql =
            "INSERT INTO Functions (FunctionID, FunctionName, FunctionDescription, ParentID) VALUES (?,?,?,?)";
        await db.async.run(insertFunctionSql, [
            functionId,
            functionName,
            functionDescription,
            parentId
        ]);

        // 插入功能路由信息到 functionroutes 表
        if (functionRoutes && functionRoutes.length > 0) {
            const insertRouteSql = "INSERT INTO functionroutes (FunctionID, Route) VALUES (?,?)";
            for (const route of functionRoutes) {
                await db.async.run(insertRouteSql, [functionId, route]);
            }
        }

        await commitTransaction();
        res.json({ message: "功能添加成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 查询功能
router.get("/query", async (req, res) => {
    const { functionName, functionId } = req.query;

    try {
        await startTransaction();
        let sql = "SELECT * FROM Functions";
        const params = [];

        if (functionId) {
            sql += " WHERE FunctionID = ?";
            params.push(functionId);
        } else if (functionName) {
            sql += " WHERE FunctionName LIKE ?";
            params.push(`%${functionName}%`);
        }
         sql += " FOR SHARE ";
        const functions = await db.async.all(sql, params);
        await commitTransaction();
        res.json(functions.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 修改功能
router.put("/update", async (req, res) => {
    const { functionId, functionName, functionDescription, parentId, functionRoutes } = req.body;
    if (!functionId) return res.status(400).json({ error: "功能ID不能为空" });

    try {
        await startTransaction();
        // 构建更新功能信息的 SQL 语句
        const updateFunctionParams = [];
        let updateFunctionSql = "UPDATE Functions SET ";
        const fieldsToUpdate = [];

        if (functionName) {
            fieldsToUpdate.push("FunctionName = ?");
            updateFunctionParams.push(functionName);
        }
        if (functionDescription) {
            fieldsToUpdate.push("FunctionDescription = ?");
            updateFunctionParams.push(functionDescription);
        }
        if (parentId !== undefined) {
            fieldsToUpdate.push("ParentID = ?");
            updateFunctionParams.push(parentId);
        }

        if (fieldsToUpdate.length === 0) {
            // 如果没有需要更新的字段，直接提交事务并返回
            await commitTransaction();
            return res.json({ message: "无更新内容，功能信息未改变" });
        }

        updateFunctionSql += fieldsToUpdate.join(", ");
        updateFunctionSql += " WHERE FunctionID = ? FOR UPDATE";
        updateFunctionParams.push(functionId);

        // 更新功能信息
        await db.async.run(updateFunctionSql, updateFunctionParams);

        // 先删除原有的功能路由
        await db.async.run("DELETE FROM functionroutes WHERE FunctionID = ? FOR UPDATE", [functionId]);

        // 插入新的功能路由信息
        if (functionRoutes && functionRoutes.length > 0) {
            const insertRouteSql = "INSERT INTO functionroutes (FunctionID, Route) VALUES (?,?)";
            for (const route of functionRoutes) {
                await db.async.run(insertRouteSql, [functionId, route]);
            }
        }

        await commitTransaction();
        res.json({ message: "功能更新成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 删除功能
router.delete("/delete", async (req, res) => {
    const { functionId } = req.query;
    if (!functionId) return res.status(400).json({ error: "功能ID不能为空" });

    try {
        await startTransaction();
        // 先删除关联权限
        await db.async.run(
            "DELETE FROM RolePermissions WHERE FunctionID = ? FOR UPDATE",
            [functionId]
        );

        // 删除功能路由
        await db.async.run(
            "DELETE FROM functionroutes WHERE FunctionID = ? FOR UPDATE",
            [functionId]
        );

        // 删除功能
        await db.async.run(
            "DELETE FROM Functions WHERE FunctionID = ? FOR UPDATE",
            [functionId]
        );

        await commitTransaction();
        res.json({ message: "功能删除成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 获取所有功能（用于权限配置）
router.get("/all", async (req, res) => {
    try {
        await startTransaction();
        const functions = await db.async.all("SELECT * FROM Functions FOR SHARE", []);
        await commitTransaction();
        res.json(functions.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 添加功能路由
router.post("/addRoute", async (req, res) => {
    const { functionId, route } = req.body;
    if (!functionId || !route) {
        return res.status(400).json({ error: "功能ID和路由不能为空" });
    }

    try {
        await startTransaction();
        const sql = "INSERT INTO functionroutes (FunctionID, Route) VALUES (?,?)";
        await db.async.run(sql, [functionId, route]);
        await commitTransaction();
        res.json({ message: "功能路由添加成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 查询功能路由
router.get("/queryRoutes/:functionId", async (req, res) => {
    const { functionId } = req.params;

    try {
        await startTransaction();
        const sql = "SELECT * FROM functionroutes WHERE FunctionID = ? FOR SHARE";
        const routes = await db.async.all(sql, [functionId]);
        await commitTransaction();
        res.json(routes.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 删除功能路由
router.delete("/deleteRoute", async (req, res) => {
    const { functionId, route } = req.query;
    if (!functionId || !route) {
        return res.status(400).json({ error: "功能ID和路由不能为空" });
    }

    try {
        await startTransaction();
        const sql = "DELETE FROM functionroutes WHERE FunctionID = ? AND Route = ? FOR UPDATE";
        await db.async.run(sql, [functionId, route]);
        await commitTransaction();
        res.json({ message: "功能路由删除成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

module.exports = router;