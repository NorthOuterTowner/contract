const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 获取所有状态为会签处理中或待审批或待签订的合同列表
router.get('/all', async (req, res) => {
  try {
    // 修改 SQL 查询语句，使用 IN 关键字筛选状态
    const sql = "SELECT * FROM `contract` WHERE `Status` IN ('会签处理中', '待审批', '待签订')";
    const { rows } = await db.async.all(sql, []);
    // console.log('查询到的合同列表:', rows); // 打印查询结果，方便调试
    res.json(rows);
  } catch (error) {
    console.error('获取合同列表时出错:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取指定合同的信息
router.get('/contract/:contractId', async (req, res) => {
  const contractId = req.params.contractId;
  try {
    const sql = "SELECT * FROM `contract` WHERE `ContractID` = ?";
    const { rows } = await db.async.all(sql, [contractId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Contract not found' });
    }
  } catch (error) {
    console.error('获取合同信息时出错:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 处理合同分配请求
router.post('/contract-assignment', async (req, res) => {
  const { contractId, signerId, approverId, executorId, operatorUserId } = req.body;
  const assigneeIds = {
    会签人: executorId.split(',').map(Number),
    审批人: [approverId],
    签订人: [signerId]
  };

  try {
    for (const [roleType, ids] of Object.entries(assigneeIds)) {
      for (const assigneeUserId of ids) {
        const sql = `
          INSERT INTO contractassignment (ContractID, RoleType, AssigneeUserID, OperatorUserID)
          VALUES (?,?,?,?)
        `;
        await db.async.run(sql, [contractId, roleType, assigneeUserId, operatorUserId]);
      }
    }
    res.json({ message: '合同分配成功' });
  } catch (error) {
    console.error('合同分配时出错:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;