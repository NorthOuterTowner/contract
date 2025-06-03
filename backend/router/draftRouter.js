const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 确保上传目录存在
const uploadDir = 'files/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 处理中文文件名编码问题
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, decodedName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制文件大小为50MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许PDF和Word文件
    if (!file.originalname.match(/\.(pdf|docx?|txt)$/i)) {
      return cb(new Error('只支持PDF和Word和TXT文档'), false);
    }
    cb(null, true);
  }
});

// 保存合同草稿
router.post('/savedraft', upload.single('content'), async (req, res) => {
  console.log('接收到的请求体:', JSON.stringify(req.body, null, 2));
  console.log('接收到的文件:', req.file ? {
    ...req.file,
    originalname: Buffer.from(req.file.originalname, 'latin1').toString('utf8')
  } : null);

  try {
    const { contractID, title, description, creationDate } = req.body;
    
    // 处理文件名编码
    const contentFileName = req.file 
      ? Buffer.from(req.file.originalname, 'latin1').toString('utf8')
      : null;

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

    // 处理日期格式
    let formattedDate;
    try {
      formattedDate = (creationDate && creationDate !== 'undefined' && !isNaN(new Date(creationDate)))
        ? new Date(creationDate).toISOString().slice(0, 19).replace('T', ' ')
        : new Date().toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) {
      console.warn('日期格式处理失败，使用当前日期', e);
      formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // 检查合同编号是否已存在
    const checkSql = 'SELECT 1 FROM `contract` WHERE `ContractID` = ? LIMIT 1';
    const { err: checkErr, rows: checkRows } = await db.async.all(checkSql, [contractID]);
    
    if (checkErr) {
      console.error('数据库查询失败:', checkErr);
      throw new Error('数据库查询失败');
    }
    
    if (checkRows.length > 0) {
      return res.status(400).json({
        code: 400,
        msg: '合同编号已存在'
      });
    }

    await db.async.run('START TRANSACTION');

    // 插入新合同记录
    const insertSql = `
      INSERT INTO \`contract\` 
      (ContractID, Title, Description, Content, Status, CreationDate, LastModifiedDate) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const { err: insertErr } = await db.async.run(insertSql, [
      contractID,
      title,
      description || null,  // 允许description为空
      contentFileName,
      '会签处理中',
      formattedDate
    ]);
    
    if (insertErr) {
      console.error('数据库插入失败:', insertErr);
      throw new Error('数据库插入失败');
    }
    
    await db.async.run('COMMIT');


   await db.async.run('START TRANSACTION');

    // 插入新合同记录
    const insertDraftSql = `
        INSERT INTO \`contractdraft\` 
        (ContractID, DraftTitle, DraftContent, CreatedBy, CreationDate) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const { err: insertDraftErr } = await db.async.run(insertDraftSql, [
        contractID,
        title,
        description || null,
        'lrz',

        
      ]);
      
      if (insertDraftErr) {
        throw new Error(`草稿表插入失败: ${insertDraftErr.message}`);
      }
    
     await db.async.run('COMMIT');


    // 返回成功响应
    return res.status(200).json({
      code: 200,
      msg: '草稿保存成功',
      data: {
        contractID,
        title,
        description,
        creationDate: formattedDate,
        fileName: contentFileName,
        fileUrl: contentFileName ? `/uploads/contracts/${encodeURIComponent(contentFileName)}` : null
      }
    });

  } catch (error) {
    console.error('保存草稿错误:', error.stack);
    
    // 如果出错，删除已上传的文件
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('删除上传文件失败:', unlinkError);
      }
    }
    
    return res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取待起草合同列表
router.get("/list",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT * FROM `contract` WHERE `ContractID` IN (SELECT `ContractID` FROM `contractdraft`);",[]);
    if(err == null && rows.length >= 0){
        res.send({
            code:200,
            rows
        })
    }else{
        res.send({
            code:500,
            msg:"数据库访问失败"
        })
    }
});

module.exports = router;