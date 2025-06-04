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

// 引入并使用新创建的查询路由

app.use("/login",require("./router/loginRouter"));


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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});