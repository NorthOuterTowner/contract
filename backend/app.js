// backend/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const { db } = require('./db/DBUtils');

app.use(cors());
app.use(express.json());

// 引入并使用新创建的查询路由
//app.use("/test",require("./router/testRouter"));
//app.use("/login",require("./router/loginRouter"));
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});