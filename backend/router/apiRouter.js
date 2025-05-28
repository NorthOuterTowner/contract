const express = require("express");
const router = express.Router();
const {db} = require("../db/DBUtils");

router.get('/pending-contracts', async (req, res) => {
  try {
    const { rows } = await db.async.getPendingContracts();
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
    const [contractInfo, userList] = await Promise.all([
      db.async.getContractInfo(contractId),
      db.async.getUserList()
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
    await db.async.saveContractAssignment(contractId, signerId, approverId, executorId);
    res.json({ message: '合同分配成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;