const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
const path = require('path'); // 添加这行导入path模块
const fs = require('fs');     // 需要文件系统操作

router.get('/', (req, res) => {
  try {
    const filename = req.query.filename;
    const filePath = path.join(__dirname, '../files', filename);
    
    // 使用res.download方法发送文件
    res.download(filePath, filename, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(404).send('文件未找到');
        }
      }
    });
  } catch (error) {
    console.error('下载错误:', error);
    res.status(500).send('服务器错误');
  }
});

// 带安全检查的文件下载路由
router.get('/secure-download', (req, res) => {
  try {
    const filename = req.query.filename;
    
    // 安全检查：防止目录遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).send('无效的文件名');
    }
    
    const filePath = path.join(__dirname, '../files', filename);
    
    // 检查文件是否存在
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('文件未找到');
    }
    
    // 设置适当的Content-Type
    const mime = require('mime-types');
    const contentType = mime.lookup(filename) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // 强制下载而不是在浏览器中打开
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 创建文件流
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('文件流错误:', err);
      if (!res.headersSent) {
        res.status(500).send('文件传输错误');
      }
    });
    
  } catch (error) {
    console.error('下载错误:', error);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;