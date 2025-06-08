const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 检查用户是否有访问指定页面的权限
router.get("/checkPermission", async (req, res) => {
    const { userId, route } = req.query;
    try {
        // 查询用户角色
        const userRoleSql = "SELECT role FROM users WHERE user_id = ?";
        const userRoleResult = await db.async.all(userRoleSql, [userId]);
        console.log('userRoleResult:', userRoleResult); // 添加调试信息
        if (userRoleResult.rows.length === 0) {
            console.error('未找到用户角色信息');
            return res.status(404).json({ error: "未找到用户角色信息" });
        }
        const roleId = userRoleResult.rows[0].role; // 假设字段名为 role

        // 查询该角色拥有的功能路由
        const rolePermissionsSql = `
            SELECT fr.Route 
            FROM RolePermissions rp
            JOIN functionroutes fr ON rp.FunctionID = fr.FunctionID
            WHERE rp.RoleID = ?
        `;
        const rolePermissionsResult = await db.async.all(rolePermissionsSql, [roleId]);
        console.log('rolePermissionsResult:', rolePermissionsResult); // 添加调试信息
        const allowedRoutes = rolePermissionsResult.rows.map(row => row.Route);

        if (route === '*') {
            return res.json({ allowedRoutes });
        }

        // 检查请求的路由是否在允许的路由列表中，支持正则匹配
        const hasPermission = allowedRoutes.some(allowedRoute => {
            // 将路由转换为正则表达式
            const regexRoute = allowedRoute.replace(/:userId/g, '\\d+').replace(/:contractId/g, '\\d+').replace(/:roleId/g, '\\d+').replace(/:functionId/g, '\\d+');
            const routeRegex = new RegExp(`^${regexRoute}$`);
            return routeRegex.test(route);
        });

        console.log('allowedRoutes:', allowedRoutes); // 添加调试信息
        console.log('hasPermission:', hasPermission); // 添加调试信息
        res.json({ hasPermission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "系统异常，请稍后重试" });
    }
});

module.exports = router;