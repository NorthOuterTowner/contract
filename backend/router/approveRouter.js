const express = require("express");
const router = express.Router();
const {db} = require("../db/DBUtils");

router.get("/",async(req,res)=>{
    res.send({
        code:200,
        msg:"connect"
    });
});

router.get("/list",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT * FROM `contract` WHERE `status`='待审批'",[]);
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

// routes/approve.js
router.get("/content", async (req, res) => {
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

router.post("/determine",(req,res)=>{
    const info = req.body;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if(info.approve == true){
        db.async.run("INSERT INTO `contractapproval` (ContractID,Approver,ApprovalDecision,ApprovalDate,ApprovalComments) VALUES (?,?,?,?,?)",
            [info.contractId,info.approver,'审批通过',currentDate,info.comment]);
        db.async.run("UPDATE `contract` set `Status`='待签署' WHERE `ContractID` = ?",[info.contractId]);
    }else{
        db.async.run("INSERT INTO `contractapproval` (ContractID,Approver,ApprovalDecision,ApprovalDate,ApprovalComments) VALUES (?,?,?,?,?)",
            [info.contractId,info.approver,'审批不通过',currentDate,info.comment]);
        db.async.run("UPDATE `contract` set `Status`='未通过' WHERE `ContractID` = ?",[info.contractId]);
    }
    res.send({
        code:200,
        msg:"approve success"
    });
});

router.get("/search",async(req,res)=>{
    const keyWord = req.query.keyWord;
    const searchTerm = `%${keyWord}%`
    let {err,rows} = await db.async.all("SELECT * FROM `contract` WHERE `Status`='待审批' AND (`Title` LIKE ? OR `Content` LIKE ?)",[searchTerm,searchTerm]);
    if (err) {
        res.send({
            code: 500,
            msg: "数据库查询失败",
            error: err
        });
    } else if (rows.length === 0) {
        res.send({
            code: 404,
            msg: "无对应合同"
        });
    } else {
        res.send({
            code: 200,
            rows,
            length:rows.length
        });
    }
});

router.get("/length",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT COUNT(*) AS length FROM `contract` WHERE `Status`='待审批' ",[]);
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

module.exports = router;