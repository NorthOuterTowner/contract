const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils"); 

// 辅助函数：构建 WHERE 子句和参数
function buildAssignmentWhereClause(params) {
    let whereClauses = [];
    let queryParams = [];

    // 合同ID筛选
    if (params.contractIds) {
        const contractIdArray = params.contractIds.split(',');
        whereClauses.push(`contractassignment.ContractID IN (${contractIdArray.map(() => '?').join(',')})`);
        contractIdArray.forEach(id => queryParams.push(id));
    }

    // 角色类型筛选
    if (params.roleType) {
        whereClauses.push(`contractassignment.RoleType = ?`);
        queryParams.push(params.roleType);
    }

    // 用户ID筛选
    if (params.userId) {
        whereClauses.push(`contractassignment.AssigneeUserID = ?`);
        queryParams.push(params.userId);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    return { whereClause, queryParams };
}

// 1. 获取合同分配信息 API
// GET /api/contractassignments?contractIds=AI001,SAD001&roleType=会签人
router.get("/contractassignments", async (req, res) => {
    try {
        const { contractIds, roleType, userId } = req.query;

        const { whereClause, queryParams } = buildAssignmentWhereClause(req.query);

        // 查询合同分配信息
        const sql = `
            SELECT 
                contractassignment.AssignmentID,
                contractassignment.ContractID,
                contractassignment.RoleType,
                contractassignment.AssigneeUserID,
                users.username,
                contractassignment.OperatorUserID,
                contractassignment.AssignmentDate,
                contractassignment.AssignmentComment
            FROM contractassignment
            JOIN users ON contractassignment.AssigneeUserID = users.user_id
            ${whereClause}
            ORDER BY contractassignment.AssignmentDate DESC
        `;
        
        const { rows } = await db.async.all(sql, queryParams); 

        res.json({
            assignments: rows
        });

    } catch (error) {
        console.error("Error fetching contract assignments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. 分配合同负责人 API
// POST /api/contractassignments
router.post("/contractassignments", async (req, res) => {
    const { contractId, roleType, assigneeUserId, operatorUserId, assignmentComment } = req.body;
    
    // 验证参数
    if (!contractId || !roleType || !assigneeUserId || !operatorUserId) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    
    try {
        // 检查角色类型是否合法
        const validRoles = ['会签人', '审批人', '签订人'];
        if (!validRoles.includes(roleType)) {
            return res.status(400).json({ error: "Invalid role type" });
        }
        
        // 检查合同是否存在
        const contractCheckSql = `SELECT ContractID FROM contract WHERE ContractID = ?`;
        const { rows } = await db.async.all(contractCheckSql, [contractId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Contract not found" });
        }
        
        // 检查用户是否存在
        const userCheckSql = `SELECT user_id FROM users WHERE user_id = ?`;
        const { rows: userRows } = await db.async.all(userCheckSql, [assigneeUserId]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: "Assignee user not found" });
        }
        
        // 插入分配记录
        const sql = `
            INSERT INTO contractassignment (
                ContractID, RoleType, AssigneeUserID, OperatorUserID, AssignmentComment
            ) VALUES (?, ?, ?, ?, ?)
        `;
        
        const { result } = await db.async.run(sql, [
            contractId, roleType, assigneeUserId, operatorUserId, assignmentComment
        ]); 

        if (result.insertId) {
            // 更新合同状态（根据角色类型）
            let statusUpdate = '';
            switch(roleType) {
                case '会签人':
                    statusUpdate = `UPDATE contract SET Status = '会签处理中' WHERE ContractID = ?`;
                    break;
                case '审批人':
                    statusUpdate = `UPDATE contract SET Status = '待审批' WHERE ContractID = ?`;
                    break;
                case '签订人':
                    statusUpdate = `UPDATE contract SET Status = '待签订' WHERE ContractID = ?`;
                    break;
            }
            
            if (statusUpdate) {
                await db.async.run(statusUpdate, [contractId]);
            }
            
            res.status(201).json({ 
                message: `Contract ${contractId} assigned to ${roleType} successfully`,
                assignmentId: result.insertId
            });
        } else {
            res.status(500).json({ error: "Failed to assign contract" });
        }
    } catch (error) {
        console.error(`Error assigning contract ${contractId}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. 获取用户分配的合同 API
// GET /api/contracts/assigned?userId=1&status=待审批
router.get("/contracts/assigned", async (req, res) => {
    const { userId, status } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
        let whereClauses = [];
        let queryParams = [userId];
        
        if (status) {
            whereClauses.push(`contract.Status = ?`);
            queryParams.push(status);
        }
        
        const whereClause = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';
        
        const sql = `
            SELECT 
                contract.ContractID, 
                contract.Title, 
                contract.Description,
                contract.Status, 
                contract.CreationDate, 
                contractassignment.RoleType
            FROM contractassignment
            JOIN contract ON contractassignment.ContractID = contract.ContractID
            WHERE contractassignment.AssigneeUserID = ? ${whereClause}
            ORDER BY contract.CreationDate DESC
        `;
        
        const { rows } = await db.async.all(sql, queryParams); 

        res.json({
            assignedContracts: rows
        });

    } catch (error) {
        console.error("Error fetching assigned contracts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. 新增合同 API
router.post("/create", async (req, res) => {
    const { title, content, status, createdDate, modifiedDate } = req.body;
    try {
        const { err, result } = await db.async.run(
            "INSERT INTO `contract` (`Title`, `Content`, `Status`, `CreatedDate`, `LastModifiedDate`) VALUES (?,?,?,?,?)",
            [title, content, status, createdDate, modifiedDate]
        );
        if (err) {
            res.send({
                code: 500,
                msg: "数据库插入失败",
                error: err
            });
        } else {
            res.send({
                code: 200,
                msg: "合同创建成功",
                contractId: result.insertId
            });
        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "创建合同失败",
            error: error.message
        });
    }
});

// 5. 修改合同截止时间 API (仅允许修改截止时间)
router.put("/update/:contractId", async (req, res) => {
    const contractId = req.params.contractId;
    const { deadline } = req.body; // 只接受 deadline 参数
    
    // 验证参数
    if (!deadline) {
        return res.status(400).json({ 
            code: 400,
            msg: "截止时间不能为空"
        });
    }
    
    try {
        // 检查合同是否存在
        const checkSql = "SELECT ContractID FROM contract WHERE ContractID = ?";
        const { rows } = await db.async.all(checkSql, [contractId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                msg: "未找到对应合同"
            });
        }
        
        // 只更新截止时间，其他字段保持不变
        const updateSql = "UPDATE contract SET endDate = ?, LastModifiedDate = CURRENT_TIMESTAMP WHERE ContractID = ?";
        const { err, changes } = await db.async.run(updateSql, [deadline, contractId]);
        
        if (err) {
            res.send({
                code: 500,
                msg: "数据库更新失败",
                error: err
            });
        } else if (changes === 0) {
            res.send({
                code: 404,
                msg: "未找到对应合同，更新失败"
            });
        } else {
            res.send({
                code: 200,
                msg: "合同截止时间更新成功"
            });
        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "更新合同截止时间失败",
            error: error.message
        });
    }
});

// 6. 删除合同 API (直接删除，无需额外操作)
router.delete("/delete/:contractId", async (req, res) => {
    const contractId = req.params.contractId;
    
    try {
        // 检查合同是否存在
        const checkSql = "SELECT ContractID FROM contract WHERE ContractID = ?";
        const { rows } = await db.async.all(checkSql, [contractId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                msg: "未找到对应合同"
            });
        }
        
        // 直接删除合同记录
        const deleteSql = "DELETE FROM contract WHERE ContractID = ?";
        const { err, changes } = await db.async.run(deleteSql, [contractId]);
        
        if (err) {
            res.send({
                code: 500,
                msg: "数据库删除失败",
                error: err
            });
        } else if (changes === 0) {
            res.send({
                code: 404,
                msg: "未找到对应合同，删除失败"
            });
        } else {
            // 可选：同时删除关联的分配记录
            await db.async.run("DELETE FROM contractassignment WHERE ContractID = ?", [contractId]);
            
            res.send({
                code: 200,
                msg: "合同删除成功"
            });
        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "删除合同失败",
            error: error.message
        });
    }
});

// 7. 查询合同列表 API
router.get("/query/contracts", async (req, res) => {
    try {
        const { page = 1, keyword = '', status = '', person = '' } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        const params = [];
        
        // 构建查询条件
        if (keyword) {
            whereClause += ` AND (Title LIKE ? OR ContractID LIKE ? OR CustomerName LIKE ?)`;
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }
        
        if (status) {
            whereClause += ` AND Status = ?`;
            params.push(status);
        }
        
        // 如果有负责人筛选，需要关联合同分配表
        if (person) {
            whereClause += ` AND EXISTS (
                SELECT 1 FROM contractassignment 
                WHERE contractassignment.ContractID = contract.ContractID 
                AND contractassignment.AssigneeUserID = ?
            )`;
            params.push(person);
        }
        
        // 计算总数
        const countSql = `
            SELECT COUNT(*) as total 
            FROM contract 
            WHERE 1=1 ${whereClause}
        `;
        
        const { rows: countRows } = await db.async.all(countSql, params);
        const total = countRows[0].total;
        
        // 查询合同列表
        const listSql = `
            SELECT * 
            FROM contract 
            WHERE 1=1 ${whereClause}
            ORDER BY CreationDate DESC
            LIMIT ? OFFSET ?
        `;
        
        const queryParams = [...params, limit, offset];
        const { rows } = await db.async.all(listSql, queryParams);
        
        res.json({
            code: 200,
            msg: "查询成功",
            total,
            list: rows
        });
    } catch (error) {
        console.error("Error querying contracts:", error);
        res.status(500).json({
            code: 500,
            msg: "查询合同失败",
            error: error.message
        });
    }
});

module.exports = router;
