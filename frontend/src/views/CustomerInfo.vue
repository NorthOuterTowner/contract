<template>
  <div class="customer-info-page">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo">基础数据管理</div>
      <ul class="menu">
        <li 
          v-for="item in processMenuItems" 
          :key="item.path"
          :class="{ active: $route.path === item.path }"
          @click="navigateTo(item.path)"
        >
          {{ item.title }}
        </li>
      </ul>
    </div>

    <!-- 右侧主内容区域 -->
    <main class="main-content">
      <div class="page-header">
        <h2 class="page-title">客户信息管理</h2>
        
        <div class="action-buttons">
          <button @click="openAddModal" class="action-btn green-btn">+ 添加客户</button>
          <button @click="deleteSelectedCustomers" class="action-btn green-btn">× 批量删除</button>
        
        </div>
      </div>
      
      <!-- 搜索栏 -->
      <div class="filter-bar">
        <input 
          type="text" 
          v-model="searchName" 
          placeholder="搜索客户名称" 
          @keyup.enter="fetchCustomers"
          class="form-input"
        >
        <button @click="fetchCustomers" class="primary-btn green-btn">🔍 搜索</button>
      </div>
      
      <!-- 客户表格 -->
      <div class="customer-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
              <th>序号</th>
              <th>客户名称</th>
              <th>联系电话</th>
              <th>地址</th>
              <th>邮箱</th>
              <th>银行名称</th>
              <th>银行卡号</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in customers" :key="customer.cus_id">
              <td><input type="checkbox" v-model="selectedCustomerIds" :value="customer.cus_id"></td>
              
              <td>{{ customer.cus_id }}</td>
              <td>{{ customer.cus_name }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.address }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.bankname }}</td>
              <td>{{ customer.bankcard }}</td>
              <td>{{ customer.others }}</td>
              <td>
                <button @click="openEditModal(customer.cus_id)" class="action-btn small-green-btn">编辑</button>
                <button @click="deleteCustomer(customer.cus_id)" class="action-btn small-red-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
      
      <!-- 添加/编辑客户模态框 -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingCustomer ? '编辑客户' : '添加客户' }}</h3>
            <button @click="closeModal">×</button>
          </div>

          <div class="modal-body scrollable-container">
            <div class="form-group">
              <label>客户名称</label>
              <input 
                type="text" 
                v-model="form.cus_name" 
                placeholder="请输入客户名称"
                required
              >
            </div>

            <div class="form-group">
              <label>联系电话</label>
              <input 
                type="tel" 
                v-model="form.phone" 
                placeholder="请输入联系电话"
                required
              >
            </div>
            
            <div class="form-group">
              <label>地址</label>
              <input 
                type="text" 
                v-model="form.address" 
                placeholder="请输入地址"
                required
              >
            </div>
            
            <div class="form-group">
              <label>邮箱</label>
              <input 
                type="email" 
                v-model="form.email" 
                placeholder="请输入邮箱"
              >
            </div>
            
            <div class="form-group">
              <label>银行名称</label>
              <input 
                type="text" 
                v-model="form.bankname" 
                placeholder="请输入银行名称"
              >
            </div>
            
            <div class="form-group">
              <label>银行账号</label>
              <input 
                type="text" 
                v-model="form.bankcard" 
                placeholder="请输入银行账号"
                required
              >
            </div>
            
            <div class="form-group">
              <label>备注</label>
              <textarea 
                v-model="form.others" 
                placeholder="请输入备注信息"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModal">取消</button>
            <button @click="saveCustomer" class="green-btn">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const go = (path) => router.push(path)

// 导航栏菜单数据
const processMenuItems = ref([
  { title: '合同信息管理', path: '/ContractInfo' },
  { title: '客户信息管理', path: '/CustomerInfo' },
  { title: '返回主页', path: '/HomePage'}
])

// 导航跳转方法
const navigateTo = (path) => {
  router.push(path)
}

// 状态管理（字段名与数据库完全一致）
const customers = ref([])
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const isModalOpen = ref(false)
const editingCustomer = ref(null)
const form = ref({
  cus_name: '',     // 客户名称（数据库字段：cus_name）
  phone: '',        // 联系电话（数据库字段：phone）
  address: '',      // 地址（数据库字段：address）
  email: '',        // 邮箱（数据库字段：email）
  bankname: '',     // 银行名称（数据库字段：bankname）
  bankcard: '',     // 银行卡号（数据库字段：bankcard）
  others: ''        // 备注（数据库字段：others）
})

// 批量操作状态
const selectedCustomerIds = ref([]) // 选中的客户ID（数据库字段：cus_id）
const selectAll = ref(false) // 全选状态

// 保存客户（新增/编辑）
const saveCustomer = async () => {
  try {
    // 打印请求方法和路径（调试用）
    const method = editingCustomer.value ? 'PUT' : 'POST';
    const url = `http://localhost:3000/customer/customers/${editingCustomer.value || ''}`;
    console.log(`[${method}] 请求 URL:`, url);
    
    // const request = editingCustomer.value 
    //   ? axios.put(`/customer/customers/${editingCustomer.value}`, form.value)
    //   : axios.post(`/customer/customers`, form.value);

    // await request;


    // 直接获取响应对象
    const response = await (editingCustomer.value 
      ? axios.put(url, form.value)
      : axios.post(url, form.value));
      

    console.log('服务器响应:', response.data); // 打印成功响应

    closeModal();
    fetchCustomers(); // 刷新列表
    alert('操作成功');
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('phone')) {
      alert('该电话号码已被注册，请更换号码！');
      return;
    }


     if (error.response) {
      console.error('错误响应:', error.response.data);
      console.error('状态码:', error.response.status);
      alert(`操作失败 (${error.response.status}): ${error.response.data.message}`);
    } else {
      console.error('网络错误:', error.message);
      alert(`网络错误: ${error.message}`);
    }

    console.error('[ERROR] 操作失败:', error.response?.data || error);
    alert('操作失败，请检查输入信息！');
  }
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    // 打印完整请求 URL（调试用）
    const url = `http://localhost:3000/customer/customers?name=${encodeURIComponent(searchName.value)}&page=${currentPage.value}&pageSize=${pageSize.value}`;
    console.log('[GET] 请求 URL:', url);
    
    const response = await axios.get('/customer/customers', {
      params: {
        name: searchName.value,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    customers.value = response.data.customers || [];

    
    totalPages.value = Math.ceil(response.data.total / pageSize.value);
    selectedCustomerIds.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error('[ERROR] 获取客户列表失败:', error.response?.data || error);
  }
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchCustomers();
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchCustomers();
  }
}

// 模态框控制
const openAddModal = () => {
  editingCustomer.value = null;
  form.value = {
    cus_name: '',
    phone: '',
    address: '',
    email: '',
    bankname: '',
    bankcard: '',
    others: ''
  };
  isModalOpen.value = true;
}

const openEditModal = (id) => {
  const customer = customers.value.find(c => c.cus_id === id);
  if (customer) {
    editingCustomer.value = id;
    form.value = {
      cus_name: customer.cus_name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
      bankname: customer.bankname,
      bankcard: customer.bankcard,
      others: customer.others
    };
    isModalOpen.value = true;
  }
}

const openEditModalBatch = () => {
  if (selectedCustomerIds.value.length === 0) {
    alert('请选择要修改的客户');
    return;
  }
  if (selectedCustomerIds.value.length > 1) {
    alert('暂不支持批量编辑，可选择单个客户修改');
    return;
  }
  openEditModal(selectedCustomerIds.value[0]);
}

const closeModal = () => {
  isModalOpen.value = false;
}

// 客户操作
const editCustomer = (id) => {
  openEditModal(id);
}

const deleteCustomer = async (id) => {
  if (confirm('确定要删除此客户吗？')) {
    try {
      // 打印删除请求 URL（调试用）
      const url = `http://localhost:3000/customer/customers/${id}`;
      console.log('[DELETE] 请求 URL:', url);
      
      await axios.delete(`/customer/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error('[ERROR] 删除客户失败:', error.response?.data || error);
    }
  }
}

// 批量删除
// const deleteSelectedCustomers = async () => {
//   if (selectedCustomerIds.value.length === 0) {
//     alert('请选择要删除的客户');
//     return;
//   }
//   if (confirm(`确定要删除选中的 ${selectedCustomerIds.value.length} 条客户信息吗？`)) {
//     try {
//       // 打印批量删除请求 URL（调试用）
//       console.log('[BATCH DELETE] 请求 URL:', 'http://localhost:3000/customer/customers/batch');
//       console.log('删除数据:', selectedCustomerIds.value);
      
//       await axios.delete('/customer/customers/batch', { data: selectedCustomerIds.value });
//       fetchCustomers();
//       selectedCustomerIds.value = [];
//       selectAll.value = false;
//     } catch (error) {
//       console.error('[ERROR] 批量删除失败:', error.response?.data || error);
//     }
//   }
// }

const deleteSelectedCustomers = async () => {
  if (selectedCustomerIds.value.length === 0) {
    alert('请选择要删除的客户');
    return;
  }
  
  // 确保所有 ID 都是数字类型
  const numericIds = selectedCustomerIds.value.map(id => Number(id));
  console.log('[批量删除] 数字数组:', numericIds);

  if (confirm(`确定要删除选中的 ${numericIds.length} 条客户信息吗？`)) {
    try {
      const response = await axios.delete('/customer/customers/batch', {
        data: numericIds // 传递纯数字数组
      });
      
      console.log('[批量删除] 响应:', response.data);
      fetchCustomers();
      selectedCustomerIds.value = [];
      selectAll.value = false;
      alert('批量删除成功');
    } catch (error) {
      console.error('[ERROR] 批量删除失败:', error);
      
      if (error.response) {
        alert(`删除失败: ${error.response.data.message}`);
      } else {
        alert('网络错误，请重试');
      }
    }
  }
};

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedCustomerIds.value = customers.value.map(c => c.cus_id);
  } else {
    selectedCustomerIds.value = [];
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchCustomers();
})
</script>

<style scoped>
/* ------------------------- 新增操作按钮样式（绿色主题） ------------------------- */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
  color: white;
}

.green-btn {
  background-color: #28a745; /* 绿色 */
}

.green-btn:hover {
  background-color: #218838;
}

.small-green-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #28a745;
  margin-right: 4px;
}

.small-red-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #dc3545; /* 红色 */
  color: white;
}

/* ------------------------- 搜索栏样式调整 ------------------------- */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.form-input {
  flex: 1;
}

/* ------------------------- 表格新增复选框样式 ------------------------- */
th:first-child, td:first-child {
  padding-left: 20px;
  width: 50px;
  text-align: center;
}


/* 左侧导航栏样式（与合同管理完全一致） */




.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu li.active {
  background-color: rgb(85, 117, 244);
  color: white;
}

.menu li i {
  font-size: 14px;
}



.left-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  border-right: 1px solid #e9ecef;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  color: white;
}

.sidebar-title {
  font-size: 1.25em;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid white;
}


/* 右侧内容区样式（复用合同管理的全局样式） */
.main-content {
  margin-left: 220px; /* 200px导航栏 + 20px内边距 */
  padding: 30px 40px;
}

.page-title {
  font-size: 20px;
  margin-bottom: 25px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.add-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 25px;
}

.filter-bar input, 
.filter-bar select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.filter-bar button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.customer-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th, td {
  padding: 12px;
  border: 1px solid #e9ecef;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: 500;
}

tr:nth-child(even) {
  background-color: #f9fafb;
}

tr:hover {
  background-color: #f0f2f5;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  color: #6c757d;
  border-color: #e9ecef;
  cursor: not-allowed;
}

/* 模态框样式（复用合同管理的全局样式） */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 600px; /* 增大宽度 */
  max-width: 90%;
  max-height: 80vh; /* 最大高度为视口的80% */
  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  padding: 16px 24px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0; /* 防止头部和底部被压缩 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1em;
}

/* 新增：可滚动的内容区域 */
.scrollable-container {
  flex-grow: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 超出高度时显示垂直滚动条 */
  padding: 20px 24px;
}


.modal-body {
  padding: 16px 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  border-top: 1px solid #ddd;
  justify-content: flex-end;
}

.modal-footer button {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer button:first-child {
  background-color: #f0f0f0;
  color: #333;
}

.modal-footer button:last-child {
  background-color: #007bff;
  color: white;
}

</style>