const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const { db } = require('./db/DBUtils');

app.use(cors());
app.use(express.json());

// 获取待分配合同列表
app.use("/approve",require("./router/approveRouter"));
app.use("/api",require("./router/apiRouter"));
app.use("/user", require("./router/userRouter"));

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
