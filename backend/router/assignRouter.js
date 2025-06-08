const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");

// 开始事务
const startTransaction = async () => {
    await db.async.run("BEGIN");
};

// 提交事务
const commitTransaction = async () => {
    await db.async.run("COMMIT");
};

// 回滚事务
const rollbackTransaction = async () => {
    await db.async.run("ROLLBACK");
};

// 获取所有状态为会签处理中或待审批或待签订的合同列表
router.get('/all', async (req, res) => {
    try {
        await startTransaction();
        // 修改 SQL 查询语句，使用 IN 关键字筛选状态，并添加共享锁
        const sql = "SELECT * FROM `contract` WHERE `Status` IN ('会签处理中', '待审批', '待签订') FOR SHARE";
        const { rows } = await db.async.all(sql, []);
        await commitTransaction();
        // console.log('查询到的合同列表:', rows); // 打印查询结果，方便调试
        res.json(rows);
    } catch (error) {
        await rollbackTransaction();
        console.error('获取合同列表时出错:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 获取指定合同的信息及分配信息
router.get('/contract/:contractId', async (req, res) => {
    const contractId = req.params.contractId;
    try {
        await startTransaction();
        // 获取合同信息，并添加共享锁
        const contractSql = "SELECT * FROM `contract` WHERE `ContractID` = ? FOR SHARE";
        const { rows: contractRows } = await db.async.all(contractSql, [contractId]);
        if (contractRows.length === 0) {
            await rollbackTransaction();
            return res.status(404).json({ error: 'Contract not found' });
        }
        const contract = contractRows[0];

        // 获取合同分配信息，并添加共享锁
        const assignmentSql = "SELECT RoleType, AssigneeUserID FROM contractassignment WHERE ContractID = ? FOR SHARE";
        const { rows: assignmentRows } = await db.async.all(assignmentSql, [contractId]);

        const assignmentInfo = {
            coSigners: [],
            approvers: [],
            signers: []
        };

        assignmentRows.forEach(row => {
            if (row.RoleType === '会签人') {
                assignmentInfo.coSigners.push(row.AssigneeUserID);
            } else if (row.RoleType === '审批人') {
                assignmentInfo.approvers.push(row.AssigneeUserID);
            } else if (row.RoleType === '签订人') {
                assignmentInfo.signers.push(row.AssigneeUserID);
            }
        });

        await commitTransaction();
        res.json({
            ...contract,
            assignmentInfo
        });
    } catch (error) {
        await rollbackTransaction();
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
        await startTransaction();
        // 先删除该合同的所有分配信息，并添加排他锁
        const deleteSql = "DELETE FROM contractassignment WHERE ContractID = ? FOR UPDATE";
        await db.async.run(deleteSql, [contractId]);

        for (const [roleType, ids] of Object.entries(assigneeIds)) {
            for (const assigneeUserId of ids) {
                const sql = `
                    INSERT INTO contractassignment (ContractID, RoleType, AssigneeUserID, OperatorUserID)
                    VALUES (?,?,?,?)
                `;
                await db.async.run(sql, [contractId, roleType, assigneeUserId, operatorUserId]);
            }
        }
        await commitTransaction();
        res.json({ message: '合同分配成功' });
    } catch (error) {
        await rollbackTransaction();
        console.error('合同分配时出错:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 新增：根据合同编号、合同名称和合同状态查询合同列表
router.get('/search', async (req, res) => {
    const { contractId, title, status } = req.query;
    let sql = "SELECT * FROM `contract` WHERE 1=1";
    const params = [];

    if (contractId) {
        sql += " AND `ContractID` = ?";
        params.push(contractId);
    }

    if (title) {
        sql += " AND `Title` LIKE ?";
        params.push(`%${title}%`);
    }

    if (status) {
        sql += " AND `Status` = ?";
        params.push(status);
    }

    // 添加共享锁
    sql += " FOR SHARE";

    try {
        await startTransaction();
        const { rows } = await db.async.all(sql, params);
        await commitTransaction();
        res.json(rows);
    } catch (error) {
        await rollbackTransaction();
        console.error('搜索合同列表时出错:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;