const express = require("express");
const router = express.Router();
const {db} = require("../db/DBUtils");

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

module.exports = router;