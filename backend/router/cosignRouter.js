const express = require("express");
const router = express.Router();
const {db} = require("../db/DBUtils");

router.get("/length",async(req,res)=>{
    let {err,rows} = await db.async.all("SELECT COUNT(*) AS length FROM `contract` WHERE `Status`='会签处理中' ",[]);
    console.log(rows.length);
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