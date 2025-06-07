// backend/router/queryRouter.js
const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils"); 

// 辅助函数：构建 WHERE 子句和参数
function buildWhereClause(params) {
    let whereClauses = [];
    let queryParams = [];

    // 1. 主搜索字段 (Title, ContractID, Description, Content, Keyword, CreatedBy, Signer, Approver)
    if (params.keyword) { 
        const keyword = `%${params.keyword}%`;
        switch (params.searchField) {
            case 'Title':
                whereClauses.push(`contract.Title LIKE ?`); 
                queryParams.push(keyword);
                break;
            case 'ContractID':
                whereClauses.push(`contract.ContractID LIKE ?`); 
                queryParams.push(keyword);
                break;
            case 'Description':
                whereClauses.push(`contract.Description LIKE ?`); 
                queryParams.push(keyword);
                break;
            case 'Content':
                whereClauses.push(`contract.Content LIKE ?`); 
                queryParams.push(keyword);
                break;
            case 'Keyword': 
                whereClauses.push(`
                    (contract.Title LIKE ? OR 
                     contract.ContractID LIKE ? OR 
                     contract.Description LIKE ? OR 
                     contract.Content LIKE ?
                    )
                `); 
                queryParams.push(keyword, keyword, keyword, keyword);
                break;
            case 'CreatedBy': 
                whereClauses.push(`EXISTS (SELECT 1 FROM contractdraft CD WHERE CD.ContractID = contract.ContractID AND CD.CreatedBy LIKE ?)`); 
                queryParams.push(keyword);
                break;
            case 'Signer': 
                whereClauses.push(`EXISTS (SELECT 1 FROM contractsigning CS WHERE CS.ContractID = contract.ContractID AND CS.Signer LIKE ?)`); 
                queryParams.push(keyword);
                break;
            case 'Approver': 
                whereClauses.push(`EXISTS (SELECT 1 FROM contractapproval CA WHERE CA.ContractID = contract.ContractID AND CA.Approver LIKE ?)`); 
                queryParams.push(keyword);
                break;
            default: 
                whereClauses.push(`
                    (contract.Title LIKE ? OR 
                     contract.ContractID LIKE ?)
                `); 
                queryParams.push(keyword, keyword);
                break;
        }
    }

    // 2. 合同状态 (Status)
    if (params.status) {
        whereClauses.push(`contract.Status = ?`); 
        queryParams.push(params.status);
    }

    // 3. 合同类型 (Type) - 移除，因为 contract 表没有 ContractType 字段
    // if (params.type) {
    //     whereClauses.push(`contract.ContractType = ?`); 
    //     queryParams.push(params.type);
    // }

    // 4. 日期范围
    if (params.creationStartDate && params.creationEndDate) {
        whereClauses.push(`DATE(contract.CreationDate) BETWEEN ? AND ?`); 
        queryParams.push(params.creationStartDate, params.creationEndDate);
    }
    if (params.lastModifiedStartDate && params.lastModifiedEndDate) {
        whereClauses.push(`DATE(contract.LastModifiedDate) BETWEEN ? AND ?`); 
        queryParams.push(params.lastModifiedStartDate, params.lastModifiedEndDate);
    }
    // 签订日期 SignDate 移除，因为 contract 表没有 SignDate 字段
    // if (params.signStartDate && params.signEndDate) { 
    //     whereClauses.push(`EXISTS (SELECT 1 FROM contractexecution CE WHERE CE.ContractID = contract.ContractID AND CE.Status = '已签署' AND DATE(CE.ExecutionDate) BETWEEN ? AND ?)`); 
    //     queryParams.push(params.signStartDate, params.signEndDate);
    // }

    // 5. 金额范围 - 移除，因为 contract 表没有 Amount 字段
    // if (params.minAmount !== null && params.minAmount !== undefined && params.minAmount !== '') {
    //     whereClauses.push(`contract.Amount >= ?`); 
    //     queryParams.push(params.minAmount);
    // }
    // if (params.maxAmount !== null && params.maxAmount !== undefined && params.maxAmount !== '') {
    //     whereClauses.push(`contract.Amount <= ?`); 
    //     queryParams.push(params.maxAmount);
    // }

    // 6. 参与方 (PartyA, PartyB) - 移除，因为 contract 表没有 PartyA, PartyB 字段
    // if (params.partyA) {
    //     whereClauses.push(`contract.PartyA LIKE ?`); 
    //     queryParams.push(`%${params.partyA}%`);
    // }
    // if (params.partyB) {
    //     whereClauses.push(`contract.PartyB LIKE ?`); 
    //     queryParams.push(`%${params.partyB}%`);
    // }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    return { whereClause, queryParams };
}

// 1. 通用合同列表查询 API
// GET /query/contracts?searchField=Title&keyword=项目&status=已签署&page=1&pageSize=10
router.get("/contracts", async (req, res) => {
    try {
        const { page = 1, pageSize = 10, ...queryParamsFromFrontend } = req.query;

        const { whereClause, queryParams } = buildWhereClause(queryParamsFromFrontend);

        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        // 查询总数
        const countSql = `SELECT COUNT(*) as total FROM contract ${whereClause}`; 
        const { rows: countRowsResult } = await db.async.all(countSql, queryParams);
        const total = countRowsResult[0].total;

        // 查询分页数据
        let dataSql = `
            SELECT 
                contract.ContractID, 
                contract.Title, 
                contract.Description,
                contract.Content, 
                contract.Status, 
                contract.CreationDate, 
                contract.LastModifiedDate
                -- 移除不存在的字段：Amount, PartyA, PartyB, SignDate, ContractType, ExpiryDate
            FROM contract 
            ${whereClause}
            ORDER BY contract.CreationDate DESC 
            LIMIT ? OFFSET ?`;
        
        const { rows: dataRowsResult } = await db.async.all(dataSql, [...queryParams, parseInt(pageSize), offset]); 

        res.json({
            list: dataRowsResult,
            total: total
        });

    } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. 单个合同完整详情查询 API
// GET /query/contract/:contractID/full-detail
router.get("/contract/:contractID/full-detail", async (req, res) => {
    const { contractID } = req.params;
    try {
        // 1. 查询合同主表信息
        const contractSql = `
            SELECT 
                ContractID, Title, Description, Content, Status, 
                CreationDate, LastModifiedDate
                -- 移除不存在的字段
            FROM contract WHERE ContractID = ?`; 
        const { rows: contractRowsResult } = await db.async.all(contractSql, [contractID]);

        if (contractRowsResult.length === 0) {
            return res.status(404).json({ error: "Contract not found" });
        }
        const mainContract = contractRowsResult[0];

        // 2. 查询相关联子表数据 (子表名已改为小写)
        const draftsSql = `SELECT DraftID, ContractID, DraftTitle, DraftContent, CreatedBy, CreationDate FROM contractdraft WHERE ContractID = ? ORDER BY CreationDate DESC`;
        const { rows: draftsResult } = await db.async.all(draftsSql, [contractID]); 

        const signingsSql = `SELECT SignID, ContractID, Signer, SigningDate, ModificationSuggestions FROM contractsigning WHERE ContractID = ? ORDER BY SigningDate DESC`;
        const { rows: signingsResult } = await db.async.all(signingsSql, [contractID]); 

        const finalizationsSql = `SELECT FinalizationID, ContractID, FinalVersionContent, ApprovedBy, ApprovalDate FROM contractfinalization WHERE ContractID = ? ORDER BY ApprovalDate DESC`;
        const { rows: finalizationsResult } = await db.async.all(finalizationsSql, [contractID]); 

        const approvalsSql = `SELECT ApprovalID, ContractID, Approver, ApprovalDecision, ApprovalDate, ApprovalComments FROM contractapproval WHERE ContractID = ? ORDER BY ApprovalDate DESC`;
        const { rows: approvalsResult } = await db.async.all(approvalsSql, [contractID]); 

        const executionsSql = `SELECT ExecutionID, ContractID, ExecutionDate, PartiesInvolved, ExecutionDetails, Status FROM contractexecution WHERE ContractID = ? ORDER BY ExecutionDate DESC`;
        const { rows: executionsResult } = await db.async.all(executionsSql, [contractID]); 

        const attachments = []; 

        res.json({
            ...mainContract,
            drafts: draftsResult,
            signings: signingsResult,
            finalizations: finalizationsResult,
            approvals: approvalsResult,
            executions: executionsResult,
            attachments 
        });

    } catch (error) {
        console.error(`Error fetching full contract details for ${contractID}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. 合同统计数据 API
// GET /query/contract/statistics?year=2024&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/contract/statistics", async (req, res) => {
    const { year, startDate, endDate } = req.query; 
    let dateFilterClause = '';
    let dateFilterParams = [];

    if (year) {
        dateFilterClause = `WHERE YEAR(CreationDate) = ?`; 
        dateFilterParams.push(parseInt(year));
    } else if (startDate && endDate) {
        dateFilterClause = `WHERE DATE(CreationDate) BETWEEN ? AND ?`; 
        dateFilterParams.push(startDate, endDate);
    }

    try {
        // 总览数据
        const totalContractsSql = `SELECT COUNT(*) as total FROM contract ${dateFilterClause}`; 
        const { rows: totalRowsResult } = await db.async.all(totalContractsSql, dateFilterParams);
        const totalContracts = totalRowsResult[0].total;

        // 总金额 - 移除，因为 contract 表没有 Amount 字段
        // const totalAmountSql = `SELECT SUM(Amount) as totalAmount FROM contract ${dateFilterClause}`; 
        // const { rows: amountRowsResult } = await db.async.all(totalAmountSql, dateFilterParams);
        const totalAmount = 0; // 默认0或从其他表聚合

        const pendingContractsSql = `SELECT COUNT(*) as pendingCount FROM contract WHERE Status IN ('待审批', '会签处理中', '待签署') ${dateFilterClause ? 'AND ' : ''} ${dateFilterClause.replace('WHERE ', '')}`; 
        const { rows: pendingRowsResult } = await db.async.all(pendingContractsSql, dateFilterParams);
        const pendingContracts = pendingRowsResult[0].pendingCount;

        // 即将到期合同 - 移除，因为 contract 表没有 ExpiryDate 字段
        // const expiringContractsSql = `SELECT COUNT(*) as expiringCount FROM contract WHERE Status NOT IN ('已作废', '已签署', '已过期') AND DATE(ExpiryDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) ${dateFilterClause ? 'AND ' : ''} ${dateFilterClause.replace('WHERE ', '')}`; 
        // const { rows: expiringRowsResult } = await db.async.all(expiringContractsSql, dateFilterParams);
        const expiringContracts = 0; // 默认0

        // 合同类型分布 - 移除，因为 contract 表没有 ContractType 字段
        // const typeDistributionSql = `SELECT ContractType as type, COUNT(*) as count, SUM(Amount) as amount FROM contract ${dateFilterClause} GROUP BY ContractType`; 
        const typeDistribution = []; // 默认空数组

        // 合同状态分布
        const statusDistributionSql = `SELECT Status as status, COUNT(*) as count FROM contract ${dateFilterClause} GROUP BY Status`; 
        const { rows: statusDistributionResult } = await db.async.all(statusDistributionSql, dateFilterParams);

        // 月度签署数量和金额趋势 - 移除金额部分，因为 Amount 不在 Contract 表；若 ExecutionDate 仅在 ContractExecution，则仅统计数量
        const monthlySignTrendSql = `
            SELECT 
                MONTH(CE.ExecutionDate) as month, 
                COUNT(*) as count 
                -- SUM(c.Amount) as amount -- 移除金额统计
            FROM contractexecution ce
            JOIN contract c ON ce.ContractID = c.ContractID 
            WHERE ce.Status = '已签署' AND YEAR(ce.ExecutionDate) = ? 
            GROUP BY MONTH(ce.ExecutionDate) ORDER BY month`;
        
        const { rows: monthlyTrendDataResult } = await db.async.all(monthlySignTrendSql, [year || new Date().getFullYear()]); 

        const monthlySignCount = Array(12).fill(0);
        const monthlySignAmount = Array(12).fill(0); // 金额数据全为0或移除
        monthlyTrendDataResult.forEach(row => {
            monthlySignCount[row.month - 1] = row.count;
            // monthlySignAmount[row.month - 1] = row.amount; // 移除金额赋值
        });

        res.json({
            totalContracts,
            totalAmount, // 现为0
            pendingContracts,
            expiringContracts, // 现为0
            typeDistribution, // 现为空数组
            statusDistribution: statusDistributionResult,
            monthlySignCount,
            monthlySignAmount // 现为全0数组
        });

    } catch (error) {
        console.error("Error fetching contract statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. 作废合同 API (POST 请求，因为会修改数据)
// POST /query/contract/:contractID/void
router.post("/contract/:contractID/void", async (req, res) => {
    const { contractID } = req.params;
    try {
        const sql = `UPDATE contract SET Status = '已作废', LastModifiedDate = NOW() WHERE ContractID = ? AND Status NOT IN ('已作废', '已签署', '已过期')`; 
        const { result } = await db.async.run(sql, [contractID]); 

        if (result.affectedRows > 0) {
            res.json({ message: `Contract ${contractID} voided successfully.` });
        } else {
            res.status(400).json({ error: "Contract cannot be voided or not found." });
        }
    } catch (error) {
        console.error(`Error voiding contract ${contractID}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 其他操作接口（例如编辑、签署等，可以按此模式添加）
// POST /query/contract/:contractID/sign
// router.post("/contract/:contractID/sign", async (req, res) => {
//     const { contractID } = req.params;
//     // ... 签署逻辑
// });

module.exports = router;