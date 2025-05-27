const express = require("express");
const router = express.Router();
const db = require("../db/DBUtils");

router.get("/",async(req,res)=>{
    res.send({
        code:200,
        msg:"connect"
    });
});

module.exports = router;