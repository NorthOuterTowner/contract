const express = require('express');
const cors = require('cors');
const multer = require("multer")
const path =require("path");
const app = express();
const db = require("./db/DBUtils");
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/approve",require("./router/approveRouter"))

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
