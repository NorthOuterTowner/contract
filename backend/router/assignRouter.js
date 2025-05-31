const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 获取待分配合同列表
router.get('/pending-contracts', async (req, res) => {
  try {
    const sql = "SELECT * FROM Contract WHERE Status = '待起草'";
    const { rows } = await db.async.all(sql, []);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取合同基本信息和用户列表信息
router.get('/contract-assignment/:contractId', async (req, res) => {
  const { contractId } = req.params;
  try {
    const contractInfoSql = "SELECT * FROM Contract WHERE ContractID = ?";
    const userListSql = "SELECT user_id, username FROM Users";
    const [contractInfo, userList] = await Promise.all([
      db.async.all(contractInfoSql, [contractId]),
      db.async.all(userListSql, [])
    ]);
    res.json({ contractInfo: contractInfo.rows[0], userList: userList.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 保存合同分配信息
router.post('/contract-assignment', async (req, res) => {
  const { contractId, signerId, approverId, executorId } = req.body;
  if (!contractId || !signerId || !approverId || !executorId) {
    return res.status(400).json({ error: '会签、审批、签订人员需全部指定' });
  }
  try {
    const sql = "INSERT INTO ContractAssignment (ContractID, SignerID, ApproverID, ExecutorID) VALUES (?,?,?,?)";
    await db.async.run(sql, [contractId, signerId, approverId, executorId]);
    res.json({ message: '合同分配成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;