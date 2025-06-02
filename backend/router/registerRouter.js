const express = require("express");
const bcrypt = require("bcryptjs");//密码加密存储需要
const router = express.Router();
const {db} = require("../db/DBUtils");


const allowed_role=['0','1','2'];

//涉及密码等隐私采用post放入请求体中在url中不可见
router.post('/',async(req,res) => {
    try{
        const {username,password,confirmPassword,role}=req.body;

         if (!username) {
            return res.status(400).json({message: '用户名不能为空'});
        }
        
        // 清理用户名，防止SQL注入
        const cleanUsername = username.trim();

        //1.基础验证
        if(password !== confirmPassword){
            return res.status(400).json({message:'两次密码输入不一致'});
        }
        if(password.length < 6){
            return res.status(400).json({message:'密码长度不能少于6位'});
        }
        if(!username){
            return res.status(400).json({message:'用户名不能为空'});
        }

        //2.检查用户名是否已经存在
        //const [existing] = await db.async.all(
         //   'SELECT * FROM users WHERE username= ?',
           // [username]
        //);


         // 2. 检查用户名是否已经存在
        const { err, rows } = await db.async.all(
            'SELECT * FROM users WHERE username = ?',
            [cleanUsername] // 使用清理后的用户名
        );
        
        if (err) {
            throw err;
        }
        if(rows.length>0){
       // if(existing.length>0){
            return res.status(400).json({message:'用户名已被注册'});
        }

        //3.加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

         const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

         //插入新用户
       const { err: insertErr, result } = await db.async.run(
            'INSERT INTO users(username, password_hash, role, create_time) VALUES(?, ?, ?, ?)',
            [cleanUsername, hashedPassword, parseInt(role), createdAt]
        );
        
         if (insertErr) {
            throw insertErr;
        }

        res.status(201).json({
            message:'注册成功',
            user:{id:result.insertId,cleanUsername,role}
        });

    }catch(error){
        console.error('注册错误',error);

        //处理用户名唯一冲突
        if(error.code==='ER_DUP_ENTRY'){
            return res.status(400).json({message:'用户名已被注册'});
        }
        res.status(500).json({message:'服务器错误，请稍后再试'});
    }
});

// registerRouter.js
router.get('/test', (req, res) => {
  res.send('注册路由测试成功！');
});

module.exports = router;