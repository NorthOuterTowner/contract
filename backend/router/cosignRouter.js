const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
const multer = require("multer");
const upload = multer();

// 获取会签处理中的合同数量
router.get("/length",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT COUNT(*) AS length FROM `contract` WHERE `Status`='会签处理中' ",[]);
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

// 获取会签处理中的合同列表
router.get("/list", async (req, res) => {
  const { username } = req.query; // 获取请求参数中的用户名

  // 构造 SQL 查询语句，加入用户名作为过滤条件
  let query = `
    SELECT  c.*
    FROM \`contract\` AS c
    JOIN \`contractassignment\` AS ca ON c.\`ContractID\` = ca.\`ContractID\`
    JOIN \`users\` AS u ON ca.\`AssigneeUserID\` = u.\`user_id\`
    WHERE c.\`Status\` = '会签处理中' AND ca.\`RoleType\`='会签人' AND u.\`username\` = ? 
  `;

  // 执行查询
  let { err, rows } = await db.async.all(query, [username]);

  if (err == null && rows.length >= 0) {
    res.send({
      code: 200,
      rows
    });
  } else {
    res.send({
      code: 500,
      msg: "数据库访问失败"
    });
  }
});

// 获取单个合同详情
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

// 提交会签意见
router.post("/submit", upload.none(), async (req, res) => {
    console.log("收到会签提交请求:", JSON.stringify(req.body, null, 2));

    try {
        const { contractId, description } = req.body;

        // 参数验证
        if (!contractId || !description) {
            return res.status(400).json({
                code: 400,
                msg: "缺少合同ID或会签意见内容"
            });
        }

        // 验证会签意见长度
        if (description.length > 500) {
            return res.status(400).json({
                code: 400,
                msg: "会签意见不能超过500个字符"
            });
        }

        await db.async.run("START TRANSACTION");

        // 1. 验证合同存在且状态正确
        const { err: checkErr, rows: checkRows } = await db.async.all(
            "SELECT `Status` FROM `contract` WHERE `ContractID` = ?  ",
            [contractId]
        );

        if (checkErr) {
            console.error("合同状态查询失败:", checkErr);
            throw new Error("数据库查询失败");
        }

        if (checkRows.length === 0) {
            await db.async.run("ROLLBACK");
            return res.status(404).json({
                code: 404,
                msg: "未找到对应合同"
            });
        }

        if (checkRows[0].Status !== "会签处理中") {
            await db.async.run("ROLLBACK");
            return res.status(400).json({
                code: 400,
                msg: "合同当前状态不允许提交会签意见"
            });
        }

        // 2. 更新合同状态
        const { err: updateErr, changes } = await db.async.run(
            "UPDATE `contract` SET `LastModifiedDate` = CURRENT_TIMESTAMP WHERE `ContractID` = ?",
            [contractId]
        );

        if (updateErr) {
            console.error("合同状态更新失败:", updateErr);
            throw new Error("数据库更新失败");
        }

        if (changes === 0) {
            await db.async.run("ROLLBACK");
            return res.status(404).json({
                code: 404,
                msg: "合同状态更新失败"
            });
        }

        // 3. 创建会签记录
        const { err: insertErr } = await db.async.run(
            "INSERT INTO `contractsigning` (`ContractID`, `SignerID`, `SignDate`, `Comment`) VALUES (?, 'lrz', CURRENT_TIMESTAMP, ?)",
            [contractId, description]
        );

        if (insertErr) {
            console.error("会签记录创建失败:", insertErr);
            throw new Error("数据库插入失败");
        }

        await db.async.run("COMMIT");

        res.json({
            code: 200,
            msg: "会签意见提交成功",
            data: {
                contractId,
                status: "待定稿"
            }
        });
    } catch (error) {
        await db.async.run("ROLLBACK");
        console.error("提交会签意见失败:", error.stack);
        res.status(500).json({
            code: 500,
            msg: "提交会签意见失败",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

module.exports = router;