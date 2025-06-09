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

// 获取下一个可用的角色 ID
router.get("/getNextId", async (req, res) => {
    try {
        await startTransaction();
        // 使用共享锁，防止其他事务在当前事务期间修改 Roles 表
        const sql = "SELECT IFNULL(MAX(RoleID), 0) + 1 as nextId FROM Roles  ";
        const result = await db.async.all(sql, []);
        const nextId = result.rows.length > 0 ? result.rows[0].nextId : 1;
        await commitTransaction();
        res.json({ nextId });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 添加角色
router.post("/add", async (req, res) => {
    const { roleName, roleDescription, selectedFunctions } = req.body;
    if (!roleName) {
        return res.status(400).json({ error: "角色名称不能为空" });
    }

    try {
        await startTransaction();
        // 使用共享锁检查角色名是否已存在
        const checkSql = "SELECT COUNT(*) as count FROM Roles WHERE roleName = ?  ";
        const checkResult = await db.async.all(checkSql, [roleName]);
        if (checkResult.rows[0].count > 0) {
            await rollbackTransaction();
            return res.status(400).json({ error: "该角色名称已存在，请更换" });
        }

        // 插入角色信息，让数据库自动生成 RoleID
        const roleSql = "INSERT INTO Roles (RoleName, RoleDescription) VALUES (?,?)";
        const roleResult = await db.async.run(roleSql, [roleName, roleDescription]);

        // 获取插入的角色ID
        const insertedRoleId = roleResult.result.insertId;

        // 插入角色权限信息
        if (selectedFunctions && selectedFunctions.length > 0) {
            const permissionSql = "INSERT INTO RolePermissions (RoleID, FunctionID) VALUES (?,?)";
            for (const functionId of selectedFunctions) {
                await db.async.run(permissionSql, [insertedRoleId, functionId]);
            }
        }

        await commitTransaction();
        res.json({ message: "角色添加成功", roleId: insertedRoleId });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 查询角色
router.get("/query", async (req, res) => {
    const { roleName, roleID } = req.query;

    try {
        await startTransaction();
        let sql = "SELECT * FROM Roles";
        const params = [];

        if (roleName) {
            sql += " WHERE roleName LIKE ?";
            params.push(`%${roleName}%`);
        } else if (roleID) {
            sql += " WHERE roleID = ?";
            params.push(roleID);
        }

        // 使用共享锁，防止其他事务在当前事务期间修改查询结果
        sql += "  ";
        const roles = await db.async.all(sql, params);
        await commitTransaction();
        res.json(roles.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 删除角色
router.delete("/delete", async (req, res) => {
    const { roleId } = req.query;
    if (!roleId) return res.status(400).json({ error: "角色ID不能为空" });

    try {
        await startTransaction();
        // 使用排他锁，防止其他事务在当前事务期间访问该角色的权限信息
        await db.async.run(
            "SELECT * FROM RolePermissions WHERE roleID = ?  ",
            [roleId]
        );
        // 先删除关联权限
        await db.async.run(
            "DELETE FROM RolePermissions WHERE roleID = ?",
            [roleId]
        );

        // 使用排他锁，防止其他事务在当前事务期间访问该角色信息
        await db.async.run(
            "SELECT * FROM Roles WHERE roleID = ?  ",
            [roleId]
        );
        // 删除角色
        await db.async.run(
            "DELETE FROM Roles WHERE roleID = ?",
            [roleId]
        );

        await commitTransaction();
        res.json({ message: "角色删除成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 获取所有角色（用于权限配置）
router.get("/all", async (req, res) => {
    try {
        await startTransaction();
        // 使用共享锁，防止其他事务在当前事务期间修改 Roles 表
        const sql = "SELECT * FROM Roles  ";
        const roles = await db.async.all(sql, []);
        await commitTransaction();
        res.json(roles.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 获取前三个角色(用于注册)
router.get("/top3", async (req, res) => {
    try {
        await startTransaction();
        // 使用共享锁，防止其他事务在当前事务期间修改 Roles 表
        const sql = "SELECT RoleID, RoleName FROM Roles LIMIT 3";
        const result = await db.async.all(sql, []);
        await commitTransaction();
        res.json(result.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 检查角色名是否存在
router.get("/checkName", async (req, res) => {
    const { roleName, roleID } = req.query;
    try {
        await startTransaction();
        let sql = "SELECT COUNT(*) as count FROM Roles WHERE roleName = ?";
        const params = [roleName];
        if (roleID) {
            sql += " AND roleID != ?";
            params.push(roleID);
        }
        // 使用共享锁，防止其他事务在当前事务期间修改 Roles 表
        sql += "  ";
        const result = await db.async.all(sql, params);
        const exists = result.rows[0].count > 0;
        await commitTransaction();
        res.json({ exists });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 获取角色已授权的功能
router.get("/permissions", async (req, res) => {
    const { roleId } = req.query;
    try {
        await startTransaction();
        // 使用共享锁，防止其他事务在当前事务期间修改 RolePermissions 表
        const sql = "SELECT * FROM RolePermissions WHERE RoleID = ?  ";
        const result = await db.async.all(sql, [roleId]);
        await commitTransaction();
        res.json(result.rows);
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

// 更新角色信息（包含权限）
router.put("/update", async (req, res) => {
    const { roleID, roleName, roleDescription, selectedFunctions } = req.body;
    if (!roleID || !roleName) {
        return res.status(400).json({ error: "角色ID和角色名称不能为空" });
    }
    try {
        await startTransaction();
        // 使用排他锁，防止其他事务在当前事务期间访问该角色信息
        await db.async.run(
            "SELECT * FROM Roles WHERE roleID = ?  ",
            [roleID]
        );
        // 更新角色基本信息
        await db.async.all(
            "UPDATE Roles SET roleName = ?, roleDescription = ? WHERE roleID = ?",
            [roleName, roleDescription, roleID]
        );

        // 使用排他锁，防止其他事务在当前事务期间访问该角色的权限信息
        await db.async.run(
            "SELECT * FROM RolePermissions WHERE roleID = ?  ",
            [roleID]
        );
        // 先删除原有的角色权限
        await db.async.run(
            "DELETE FROM RolePermissions WHERE roleID = ?",
            [roleID]
        );

        // 插入新的角色权限信息
        if (selectedFunctions && selectedFunctions.length > 0) {
            const permissionSql = "INSERT INTO RolePermissions (RoleID, FunctionID) VALUES (?,?)";
            for (const functionId of selectedFunctions) {
                await db.async.run(permissionSql, [roleID, functionId]);
            }
        }

        await commitTransaction();
        res.json({ message: "角色信息更新成功" });
    } catch (error) {
        await rollbackTransaction();
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

module.exports = router;