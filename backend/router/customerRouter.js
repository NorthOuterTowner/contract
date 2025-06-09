const express = require("express");
const router = express.Router();
const { db } = require("../db/DBUtils");
/**
 * 添加客户接口
 */
router.post('/customers', async (req, res) => {
  try {
    // 接收与数据库字段一致的参数
    const { 
      cus_name, phone, address, email, bankname, bankcard, others 
    } = req.body

    // 验证必填字段（与数据库字段一致）
    if (!cus_name || !phone || !address || !bankcard) {
      return res.status(400).json({ message: '必填字段缺失（cus_name/phone/address/bankcard）' })
    }

    // 插入客户数据（SQL字段与接收参数一致）
    const insertQuery = `
      INSERT INTO customer (
        cus_name, phone, address, email, bankname, bankcard, others
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    const { err, result } = await db.async.run(insertQuery, [
      cus_name, phone, address, email, bankname, bankcard, others
    ])

    if (err) {
      // 处理唯一索引冲突（电话号码重复）
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '电话号码已存在' })
      }
      throw err
    }

    res.status(201).json({ 
      message: '客户添加成功', 
      customerId: result.insertId // 返回自增ID（与数据库字段cus_id对应）
    })
  } catch (error) {
    console.error('添加客户失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

/**
 * 获取客户列表接口（带分页）
 */
router.get('/customers', async (req, res) => {
    console.log('收到客户列表请求', req.url);
  try {
    const { name, page = 1, pageSize = 10 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    // 查询条件
    let whereClause = ''
    let queryParams = []

    if (name) {
      whereClause = 'WHERE cus_name LIKE ?'
      queryParams = [`%${name}%`]
    }

    // 查询客户列表（直接使用数据库字段，无需别名）
    const listQuery = `
      SELECT 
        cus_id, 
        cus_name, 
        phone, 
        address, 
        email, 
        bankname, 
        bankcard, 
        others 
      FROM customer 
      ${whereClause} 
      LIMIT ? OFFSET ?
    `
    queryParams.push(parseInt(pageSize), offset)

    const { err, rows } = await db.async.all(listQuery, queryParams)
    if (err) throw err

    // 查询总记录数
    const countQuery = `
      SELECT COUNT(*) as total FROM customer ${whereClause}
    `
    const { err: countErr, rows: countRows } = await db.async.all(
      countQuery, 
      name ? [`%${name}%`] : []
    )
    if (countErr) throw countErr

    res.json({
      customers: rows, // 直接返回数据库字段（cus_id, cus_name等）
      total: countRows[0].total
    })
  } catch (error) {
    console.error('获取客户列表失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

/**
 * 编辑客户接口
 */
router.put('/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id // URL参数（对应数据库cus_id）
    const { 
      cus_name, phone, address, email, bankname, bankcard, others 
    } = req.body // 与数据库字段一致的参数

    // 更新客户数据
    const updateQuery = `
      UPDATE customer 
      SET 
        cus_name = ?, 
        phone = ?, 
        address = ?, 
        email = ?, 
        bankname = ?, 
        bankcard = ?, 
        others = ?
      WHERE cus_id = ?
    `
    
    const { err, result } = await db.async.run(updateQuery, [
      cus_name, phone, address, email, bankname, bankcard, others, customerId
    ])

    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '电话号码已被其他客户使用' })
      }
      throw err
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '客户不存在' })
    }

    res.json({ message: '客户信息更新成功' })
  } catch (error) {
    console.error('编辑客户失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

/**
 * 删除客户接口
 */
router.delete('/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id // URL参数（对应数据库cus_id）

    const deleteQuery = 'DELETE FROM customer WHERE cus_id = ?'
    const { err, result } = await db.async.run(deleteQuery, [customerId])

    if (err) throw err

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '客户不存在' })
    }

    res.json({ message: '客户删除成功' })
  } catch (error) {
    console.error('删除客户失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

/**
 * 批量删除客户接口
 */
// router.delete('/customers/batch', async (req, res) => {
//   try {
//     const customerIds = req.body // 前端传递的cus_id数组

//     if (!Array.isArray(customerIds) || customerIds.length === 0) {
//       return res.status(400).json({ message: '请选择要删除的客户' })
//     }

//     // 构建 IN 条件
//     const placeholders = customerIds.map(() => '?').join(',')
//     const deleteQuery = `DELETE FROM customer WHERE cus_id IN (${placeholders})`

//     const { err } = await db.async.run(deleteQuery, customerIds)
//     if (err) throw err

//     res.json({ message: '批量删除成功' })
//   } catch (error) {
//     console.error('批量删除失败:', error)
//     res.status(500).json({ message: '服务器内部错误' })
//   }
// })
router.delete('/customers/batch', async (req, res) => {
  try {
    const customerIds = req.body;
    
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: '请选择要删除的客户' });
    }

    // 构建 IN 条件（例如："IN (?, ?)"）
    const placeholders = customerIds.map(() => '?').join(',');
    const deleteQuery = `DELETE FROM customer WHERE cus_id IN (${placeholders})`;

    // **关键修改：使用展开运算符传递参数数组**
    const [err, result] = await db.async.run(deleteQuery, [...customerIds]); // 展开数组为独立参数
    
    if (err) {
      console.error('SQL执行错误:', err);
      return res.status(500).json({ message: '数据库操作失败' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '未找到要删除的客户' });
    }

    res.json({ message: `批量删除成功，共删除 ${result.affectedRows} 条记录` });
  } catch (error) {
    console.error('批量删除失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router