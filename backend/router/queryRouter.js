// backend/router/queryRouter.js
const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 根据合同名称模糊查询合同信息
router.get("/contract/name", async (req, res) => {
  const { name } = req.query;
  try {
    let sql;
    if (name) {
      sql = `SELECT * FROM contract WHERE Title LIKE ?`;
      const { rows } = await db.async.query(sql, [`%${name}%`]);
      res.json(rows);
    } else {
      sql = `SELECT * FROM contract`;
      const { rows } = await db.async.query(sql);
      res.json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 根据合同状态查询合同信息
router.get("/contract/status", async (req, res) => {
  const { status } = req.query;
  try {
    if (status) {
      const sql = `SELECT * FROM contract WHERE Status = ?`;
      const { rows } = await db.async.query(sql, [status]);
      res.json(rows);
    } else {
      res.status(400).json({ error: "Status parameter is required" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;