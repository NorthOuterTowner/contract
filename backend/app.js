const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const app = express();
const PORT = 3000;
const { db } = require('./db/DBUtils');
const MySQLStoreAdapter = require('./db/MySQLStoreAdapter');

console.log('MySQLStoreAdapter:', typeof MySQLStoreAdapter); // 调试输出

// 配置 CORS 中间件
app.use(cors({
  origin: 'http://localhost:5173', // 前端应用地址
  credentials: true // 允许携带 cookie
}));

//app.use(cors());
app.use(express.json());

// 创建适配器实例
const adapter = new MySQLStoreAdapter();
console.log('Adapter instance created:', adapter); // 调试输出

// 配置 Session 存储
const sessionStore = new MySQLStore({
  createDatabaseTable: true,
}, adapter.connection); // 使用适配器提供的连接

// 配置 Session 中间件
app.use(session({
  secret: 'your-session-secret', // 用于签名 session ID
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // 使用 MySQL 存储 session
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24小时
    secure: false, // 开发环境设为 false，生产环境设为 true（仅 HTTPS）
    httpOnly: true // 防止 XSS 攻击
  }
}));

// // 权限验证中间件
// const checkPermission = async (req, res, next) => {
//   try {
//     if (!req.session.userId) {
//       return res.status(401).json({ error: "未登录" });
//     }

//     const userId = req.session.userId;
//     const getUserRoleSql = 'SELECT role FROM Users WHERE user_id = ?';
//     const userRoleResult = await db.async.all(getUserRoleSql, [userId]);
//     const roleId = userRoleResult.rows[0]?.role;

//     if (!roleId) {
//       return res.status(403).json({ error: "无权限" });
//     }

//     // 获取当前请求的功能路径，这里简单假设通过 req.path 来判断
//     const path = req.path.split('/')[1];
//     const functionMap = {
//       'user': ['新增用户', '编辑用户', '查询用户', '删除用户'],
//       'role': ['新增角色', '编辑角色', '查询角色', '删除角色'],
//       'function': ['新增功能', '编辑功能', '查询功能', '删除功能'],
//       'permission': ['配置权限'],
//       'contract': ['起草合同', '定稿合同', '查询合同', '删除合同'],
//       'process': ['会签合同', '审批合同', '签订合同', '分配会签', '分配审批', '分配签订', '流程查询']
//     };
//     const requiredFunctions = functionMap[path] || [];

//     const getRolePermissionsSql = `
//       SELECT f.FunctionName 
//       FROM Functions f
//       JOIN RolePermissions rp ON f.FunctionID = rp.FunctionID
//       WHERE rp.RoleID = ?
//     `;
//     const rolePermissionsResult = await db.async.all(getRolePermissionsSql, [roleId]);
//     const rolePermissions = rolePermissionsResult.rows.map(item => item.FunctionName);

//     const hasPermission = requiredFunctions.some(func => rolePermissions.includes(func));
//     if (!hasPermission) {
//       return res.status(403).json({ error: "无权限访问该功能" });
//     }

//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "系统异常，请稍后重试" });
//   }
// };

// 引入并使用新创建的查询路由
app.use("/login", require("./router/loginRouter"));
app.use("/register", require("./router/registerRouter"));

app.use("/register",require("./router/registerRouter"));
app.use("/query", require("./router/queryRouter"));
app.use("/approve",require("./router/approveRouter"));
app.use("/user", require("./router/userRouter"));
app.use("/role", require("./router/roleRouter"));
app.use("/function", require("./router/functionRouter"));
app.use("/assign",require("./router/assignRouter"));
app.use("/cosign",require("./router/cosignRouter"));
app.use("/sign",require("./router/signRouter"));
app.use("/download",require("./router/fileDownload"));
app.use("/draft",require("./router/draftRouter"));
app.use("/finalize",require("./router/finalizeRouter"));

// // 对需要权限验证的路由使用中间件
// app.use("/query", checkPermission, require("./router/queryRouter"));
// app.use("/approve", checkPermission, require("./router/approveRouter"));
// app.use("/user", checkPermission, require("./router/userRouter"));
// app.use("/role", checkPermission, require("./router/roleRouter"));
// app.use("/function", checkPermission, require("./router/functionRouter"));
// app.use("/assign", checkPermission, require("./router/assignRouter"));
// app.use("/cosign", checkPermission, require("./router/cosignRouter"));
// app.use("/sign", checkPermission, require("./router/signRouter"));
// app.use("/download", checkPermission, require("./router/fileDownload"));
// app.use("/draft", checkPermission, require("./router/draftRouter"));
// app.use("/finalize", checkPermission, require("./router/finalizeRouter"));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

