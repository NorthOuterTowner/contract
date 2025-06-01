const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
const multer = require("multer");
const path = require("path");

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/contracts/'); // 文件保存路径
  },
  filename: function (req, file, cb) {
    // 只保存原始文件名
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
  }
});

// 保存合同草稿
router.post('/savedraft', upload.single('content'), async (req, res) => {
  const { contractID, title, description, creationDate } = req.body;
  const contentFileName = req.file ? req.file.originalname : null;

  // 验证必填字段
  if (!contractID || !title) {
    return res.status(400).json({
      code: 400,
      msg: '合同编号和标题不能为空'
    });
  }

  // 验证合同编号格式
  if (contractID.length > 10) {
    return res.status(400).json({
      code: 400,
      msg: '合同编号不能超过10个字符'
    });
  }

  try {
    // 检查合同编号是否已存在
    const checkSql = 'SELECT * FROM `contract` WHERE `ContractID` = ?';
    const { err: checkErr, rows: checkRows } = await db.async.all(checkSql, [contractID]);
    
    if (checkErr) {
      console.error('数据库查询失败:', checkErr);
      return res.status(500).json({
        code: 500,
        msg: '数据库查询失败'
      });
    }
    
    if (checkRows.length > 0) {
      return res.status(400).json({
        code: 400,
        msg: '合同编号已存在'
      });
    }
    
    // 插入新合同记录
    const insertSql = `
      INSERT INTO \`contract\` 
      (ContractID, Title, Description, Content, Status, CreationDate, LastModifiedDate) 
      VALUES (?, ?, ?, ?, '待起草', ?, CURRENT_TIMESTAMP)
    `;
    
    const { err: insertErr } = await db.async.run(insertSql, [
      contractID,
      title,
      description,
      contentFileName,
      creationDate || new Date().toISOString().slice(0, 19).replace('T', ' ')
    ]);
    
    if (insertErr) {
      console.error('数据库插入失败:', insertErr);
      return res.status(500).json({
        code: 500,
        msg: '数据库插入失败'
      });
    }
    
    res.status(200).json({
      code: 200,
      msg: '草稿保存成功',
      data: {
        contractID,
        title,
        creationDate: creationDate || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('保存草稿错误:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误'
    });
  }
});

// 获取待起草合同列表
router.get("/list", async (req, res) => {
  try {
    const { err, rows } = await db.async.all(
      "SELECT ContractID, Title, Description, Status, CreationDate, LastModifiedDate FROM `contract` WHERE `status`='待起草' ORDER BY CreationDate DESC", 
      []
    );
    
    if (err) {
      console.error('数据库查询失败:', err);
      return res.status(500).json({
        code: 500,
        msg: "数据库访问失败"
      });
    }
    
    res.status(200).json({
      code: 200,
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('获取合同列表错误:', error);
    res.status(500).json({
      code: 500,
      msg: "服务器内部错误"
    });
  }
});

module.exports = router;