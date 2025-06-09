const express = require("express");
const router = express.Router();
const {db} = require("../db/DBUtils");
const multer = require("multer");
const upload = multer();
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = 'files/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const updateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 处理中文文件名
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, decodedName);
  }
});

const updateUpload = multer({
  storage: updateStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许特定文件类型
    if (!file.originalname.match(/\.(pdf|docx?|txt)$/i)) {
      return cb(new Error('只支持PDF、Word和TXT文档'), false);
    }
    cb(null, true);
  }
});

// 新增路由 - 更新定稿文件
router.post('/save', updateUpload.single('file'), async (req, res) => {
  console.log('接收到的请求体:', JSON.stringify(req.body, null, 2));
  console.log('接收到的文件:', req.file ? {
    ...req.file,
    originalname: Buffer.from(req.file.originalname, 'latin1').toString('utf8')
  } : null);
  try {
    const { contractId } = req.body;
    
    if (!contractId) {
      return res.status(400).json({
        code: 400,
        msg: '合同ID不能为空'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '请上传文件'
      });
    }
    
    // 处理文件名编码
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const filePath = path.join(uploadDir, fileName);
    
    // 检查合同是否存在
    const checkSql = 'SELECT Content FROM `contract` WHERE ContractID = ?';
    const { err: checkErr, rows: checkRows } = await db.async.all(checkSql, [contractId]);
    
    if (checkErr) {
      throw new Error('数据库查询失败');
    }
    
    if (checkRows.length === 0) {
      // 删除刚上传的文件
      fs.unlinkSync(filePath);
      return res.status(404).json({
        code: 404,
        msg: '合同不存在'
      });
    }
    
    // 如果已有文件且文件名不同，删除旧文件
    const oldFileName = checkRows[0].Content;
    if (oldFileName && oldFileName !== fileName) {
      const oldFilePath = path.join(uploadDir, oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // 更新数据库

    await db.async.run('START TRANSACTION');

    const updateSql = `
      UPDATE \`contract\` 
      SET Content = ?, Status = '待审批', LastModifiedDate = CURRENT_TIMESTAMP 
      WHERE ContractID = ?
    `;
    
    const { err: updateErr } = await db.async.run(updateSql, [fileName, contractId]);
    
    
const insertFinalizationSql = `
        INSERT INTO \`contractfinalization\` 
        (ContractID, FinalVersionContent, ApprovedBy, ApprovalDate)
        VALUES (?, ?, 'lrz', CURRENT_TIMESTAMP)
      `;
      
      const { err: insertErr } = await db.async.run(insertFinalizationSql, [contractId, fileName]);


    if (updateErr) {
      // 删除刚上传的文件
      fs.unlinkSync(filePath);
      throw new Error('数据库更新失败');
    }
    
    if (insertErr) {
        throw new Error('contractfinalization表插入失败');
      }

      await db.async.run('COMMIT');

    return res.status(200).json({
      code: 200,
      msg: '文件更新成功',
      data: {
        fileName,
        fileUrl: `/files/${encodeURIComponent(fileName)}`
      }
    });
    
  } catch (error) {
    console.error('文件更新失败:', error);
    
    // 如果出错，删除已上传的文件
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    return res.status(500).json({
      code: 500,
      msg: '文件更新失败',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get("/length",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT COUNT(*) AS length FROM `contract` WHERE `Status`='待定稿' ",[]);
    if(!err){
        res.send({
            code:200,
            length:rows[0].length
        });
    }else{
        res.send({
            code: 500,
            msg: "数据库查询失败",
        });
    }
});

router.get("/list",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT * FROM `contract` WHERE `status`='待定稿'",[]);
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

router.get("/get", async (req, res) => {
    const contractId = req.query.id;

    if (!contractId) {
        res.send({
            code: 400,
            msg: "缺少合同ID"
        });
        return;
    }

    let { err, rows } = await db.async.all("SELECT * FROM `contract` WHERE `ContractID` = ?", [contractId]);

    if (err) {
        res.send({
            code: 500,
            msg: "数据库查询失败",
            error: err
        });
    } else if (rows.length === 0) {
        res.send({
            code: 404,
            msg: "未找到对应合同"
        });
    } else {
        res.send({
            code: 200,
            data: rows[0]
        });
    }
});


// 获取会签意见
// 获取会签意见
router.get('/cosign', async (req, res) => {
  try {
    const { contractId } = req.query;
    
    if (!contractId) {
      return res.status(400).json({ 
        code: 400, 
        msg: '合同ID不能为空' 
      });
    }

    // 使用 db.async.all 查询数据库
    const { err, rows } = await db.async.all(
      `SELECT SignerID, SignDate, comment 
       FROM contractsigning 
       WHERE ContractID = ?`,
      [contractId]
    );

    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ 
        code: 500, 
        msg: '数据库查询失败' 
      });
    }

    // 返回查询结果
    return res.json({
      code: 200,
      msg: '获取会签意见成功',
      data: rows
    });
    
  } catch (error) {
    console.error('获取会签意见失败:', error);
    return res.status(500).json({ 
      code: 500, 
      msg: '服务器内部错误' 
    });
  }
});

module.exports = router;