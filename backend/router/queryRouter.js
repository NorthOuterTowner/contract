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
                whereClauses.push(`EXISTS (SELECT 1 FROM contractsigning CS WHERE CS.ContractID = contract.ContractID AND CS.SignerID LIKE ?)`); 
                queryParams.push(keyword);
                break;
            case 'Approver': 
                // 修正：contractapproval 表的实际列是 Approver，不是 ApproverID
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

    // 4. 日期范围
    if (params.creationStartDate && params.creationEndDate) {
        whereClauses.push(`DATE(contract.CreationDate) BETWEEN ? AND ?`); 
        queryParams.push(params.creationStartDate, params.creationEndDate);
    }
    if (params.lastModifiedStartDate && params.lastModifiedEndDate) {
        whereClauses.push(`DATE(contract.LastModifiedDate) BETWEEN ? AND ?`); 
        queryParams.push(params.lastModifiedStartDate, params.lastModifiedEndDate);
    }
    
    // 其他高级查询条件 (金额、参与方等) 保持注释
    if (params.minAmount !== null && params.minAmount !== undefined && params.minAmount !== '') { whereClauses.push(`contract.Amount >= ?`); queryParams.push(params.minAmount); }
    if (params.maxAmount !== null && params.maxAmount !== undefined && params.maxAmount !== '') { whereClauses.push(`contract.Amount <= ?`); queryParams.push(params.maxAmount); }
    // if (params.partyA) { whereClauses.push(`contract.PartyA LIKE ?`); queryParams.push(`%${params.partyA}%`); }
    // if (params.partyB) { whereClauses.push(`contract.PartyB LIKE ?`); queryParams.push(`%${params.partyB}%`); }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    return { whereClause, queryParams };
}

// 1. 通用合同列表查询 API
router.get("/contracts", async (req, res) => {
    try {
        const { page = 1, pageSize = 10, ...queryParamsFromFrontend } = req.query;

        const { whereClause, queryParams } = buildWhereClause(queryParamsFromFrontend);

        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        const countSql = `SELECT COUNT(*) as total FROM contract ${whereClause}`; 
        const { rows: countRowsResult } = await db.async.all(countSql, queryParams);
        const total = countRowsResult[0].total;

        let dataSql = `
            SELECT 
                contract.ContractID, 
                contract.Title, 
                contract.Description,
                contract.Content, 
                contract.Status, 
                contract.CreationDate, 
                contract.LastModifiedDate
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
router.get("/contract/:contractID/full-detail", async (req, res) => {
    const { contractID } = req.params;
    try {
        // 1. 查询合同主表信息
        const contractSql = `
            SELECT 
                ContractID, Title, Description, Content, Status, 
                CreationDate, LastModifiedDate
            FROM contract WHERE ContractID = ?`; 
        const { rows: contractRowsResult } = await db.async.all(contractSql, [contractID]);

        if (contractRowsResult.length === 0) {
            return res.status(404).json({ error: "Contract not found" });
        }
        const mainContract = contractRowsResult[0];

        // 2. 查询相关联子表数据 (子表名都改为小写)
        const draftsSql = `SELECT DraftID, ContractID, DraftTitle, DraftContent, CreatedBy, CreationDate FROM contractdraft WHERE ContractID = ? ORDER BY CreationDate DESC`;
        const { rows: draftsResult } = await db.async.all(draftsSql, [contractID]); 

        const signingsSql = `SELECT SignID, ContractID, SignerID, SignDate, comment AS ModificationSuggestions FROM contractsigning WHERE ContractID = ? ORDER BY SignDate DESC`; 
        const { rows: signingsResult } = await db.async.all(signingsSql, [contractID]); 

        const finalizationsSql = `SELECT FinalizationID, ContractID, FinalVersionContent, ApprovedBy, ApprovalDate FROM contractfinalization WHERE ContractID = ? ORDER BY ApprovalDate DESC`; 
        const { rows: finalizationsResult } = await db.async.all(finalizationsSql, [contractID]); 

        // 修正：contractapproval 表的实际列是 Approver, ApprovalDecision, ApprovalDate, ApprovalComments
        const approvalsSql = `SELECT ApprovalID, ContractID, Approver, ApprovalDecision, ApprovalDate, ApprovalComments FROM contractapproval WHERE ContractID = ? ORDER BY ApprovalDate DESC`; // 修正：使用 Approver
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

        const totalAmount = 0; 
        const pendingContractsSql = `SELECT COUNT(*) as pendingCount FROM contract WHERE Status IN ('待审批', '会签处理中', '待签订') ${dateFilterClause ? 'AND ' : ''} ${dateFilterClause.replace('WHERE ', '')}`; 
        const { rows: pendingRowsResult } = await db.async.all(pendingContractsSql, dateFilterParams);
        const pendingContracts = pendingRowsResult[0].pendingCount;

        const expiringContracts = 0; 

        const typeDistribution = []; 

        // 合同状态分布
        const statusDistributionSql = `SELECT Status as status, COUNT(*) as count FROM contract ${dateFilterClause} GROUP BY Status`; 
        const { rows: statusDistributionResult } = await db.async.all(statusDistributionSql, dateFilterParams);

        // 月度签订数量趋势 (直接从 contract 表统计，已修正语法)
        const monthlySignTrendSql = `SELECT MONTH(LastModifiedDate) as month, COUNT(*) as count FROM contract WHERE Status = '已签订' AND YEAR(LastModifiedDate) = ? GROUP BY MONTH(LastModifiedDate) ORDER BY month`;

        
        const { rows: monthlyTrendDataResult } = await db.async.all(monthlySignTrendSql, [year || new Date().getFullYear()]); 

        const monthlySignCount = Array(12).fill(0);
        const monthlySignAmount = Array(12).fill(0); 
        monthlyTrendDataResult.forEach(row => {
            monthlySignCount[row.month - 1] = row.count;
        });

        res.json({
            totalContracts,
            totalAmount, 
            pendingContracts,
            expiringContracts, 
            typeDistribution, 
            statusDistribution: statusDistributionResult,
            monthlySignCount,
            monthlySignAmount 
        });

    } catch (error) {
        console.error("Error fetching contract statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. 作废合同 API (POST 请求，因为会修改数据)
router.post("/contract/:contractID/void", async (req, res) => {
    const { contractID } = req.params;
    try {
        const sql = `UPDATE contract SET Status = '未通过', LastModifiedDate = NOW() WHERE ContractID = ? AND Status NOT IN ('已签订', '未通过')`; 
        
        const { result } = await db.async.run(sql, [contractID]); 

        if (result.affectedRows > 0) {
            res.json({ message: `Contract ${contractID} voided successfully.` });
        } else {
            res.status(400).json({ error: "Contract cannot be voided or not found, or current status disallows voiding." });
        }
    } catch (error) {
        console.error(`Error voiding contract ${contractID}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;