<template>
  <div class="contract-info-page">
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
        <h2 class="page-title">合同信息管理</h2>
        <div class="action-buttons">
          
          <button @click="editSelectedContracts" class="action-btn green-btn">修改合同</button>
          <button @click="deleteSelectedContracts" class="action-btn green-btn">删除合同</button>
        </div>
      </div>
      
      <!-- 增强版搜索栏 -->
      <div class="enhanced-search-bar">
        <div class="search-item">
          <label>关键词：</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索合同编号、名称或客户" 
            @keyup.enter="fetchContracts"
            class="form-input"
          >
        </div>
        <div class="search-item">
          <label>合同状态：</label>
          <select v-model="statusFilter" @change="fetchContracts" class="form-select">
            <option value="">全部状态</option>
            <option value="待起草">待起草</option>
            <option value="会签处理中">会签处理中</option>
            <option value="待定稿">待定稿</option>
            <option value="待审批">待审批</option>
            <option value="已签订">已签订</option>
            <option value="未通过">未通过</option>
            <option value="待签订">待签订</option>
          </select>
        </div>
        <div class="search-item">
          <label>负责人：</label>
          <select v-model="personFilter" @change="fetchContracts" class="form-select">
            <option value="">全部人员</option>
            <option v-for="person in availablePersons" :key="person.user_id" :value="person.user_id">
              {{ person.username }}
            </option>
          </select>
        </div>
        <div class="search-actions">
          <button @click="fetchContracts" class="primary-btn">🔍 搜索</button>
          <button @click="resetFilters" class="secondary-btn">🔄 重置</button>
        </div>
      </div>
      
      <!-- 合同信息表格 -->
      <div class="contract-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
              <th>合同编号</th>
              <th>合同名称</th>
              <th>创建日期</th>
              <th>合同状态</th>
              <th>负责人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contract, index) in contracts" :key="contract.ContractID">
              <td><input type="checkbox" v-model="selectedContractIds" :value="contract.ContractID"></td>
              <td>{{ contract.ContractID }}</td>
              <td>{{ contract.Title }}</td>
              <td>{{ contract.CreationDate }}</td>
              <td>
                <span class="status-tag" :class="getStatusTagClass(contract.Status)">
                  {{ contract.Status }}
                </span>
              </td>
              <td>{{ getContractPerson(contract.ContractID) }}</td>
              <td>
                <button @click="viewContract(contract.ContractID)" class="action-btn small-btn">查看</button>
                <button @click="editContract(contract.ContractID)" class="action-btn small-green-btn">编辑</button>
                <button @click="deleteContract(contract.ContractID)" class="action-btn small-red-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 导航栏菜单
const processMenuItems = ref([
  { title: '合同信息管理', path: '/ContractInfo' },
  { title: '客户信息管理', path: '/CustomerInfo' },
  { title: '返回主页', path: '/HomePage'}
]);

// 导航跳转
const navigateTo = (path) => {
  router.push(path);
};

// 状态定义
const searchQuery = ref('');
const statusFilter = ref('');
const personFilter = ref('');
const contracts = ref([]);
const selectedContractIds = ref([]);
const selectAll = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const availablePersons = ref([]);
const contractAssignments = ref([]);

// 获取合同负责人
const getContractPerson = (contractId) => {
  const assignment = contractAssignments.value.find(a => a.ContractID === contractId);
  if (!assignment) return '未分配';
  
  const person = availablePersons.value.find(p => p.user_id === assignment.AssigneeUserID);
  return person ? person.username : `用户ID: ${assignment.AssigneeUserID}`;
};

// 状态标签样式
const getStatusTagClass = (status) => {
  switch (status) {
    case '已签订': return 'status-success';
    case '待审批': return 'status-warning';
    case '会签处理中': return 'status-warning';
    case '待签订': return 'status-warning';
    case '待定稿': return 'status-info';
    case '待起草': return 'status-default';
    case '未通过': return 'status-error';
    default: return 'status-default';
  }
};

// 获取合同列表（调整为 /query/contracts 接口）
const fetchContracts = async () => {
  try {
    const params = {
      page: currentPage.value,
      keyword: searchQuery.value,
      status: statusFilter.value,
      // 负责人筛选需通过分配表关联，此处前端暂不传递person参数，改由后端处理
    };
    
    const response = await axios.get('/query/contracts', { params });
    contracts.value = response.data.list || [];
    totalPages.value = Math.ceil(response.data.total / 10); // 假设每页10条数据
    
    // 获取合同分配信息
    await fetchContractAssignments();
  } catch (error) {
    console.error('获取合同列表失败:', error);
  }
};

// 获取人员列表（调整为 /query/users 接口）
const fetchPersons = async () => {
  try {
    const response = await axios.get('/query/users');
    availablePersons.value = response.data.users || [];
  } catch (error) {
    console.error('获取人员列表失败:', error);
  }
};

// 获取合同分配信息（调整为 /query/contractassignments 接口）
const fetchContractAssignments = async () => {
  try {
    if (contracts.value.length === 0) return;
    
    const contractIds = contracts.value.map(contract => contract.ContractID);
    const response = await axios.get('/query/contractassignments', {
      params: { contractIds: contractIds.join(',') }
    });
    
    contractAssignments.value = response.data.assignments || [];
    console.log('合同分配信息:', contractAssignments.value);
  } catch (error) {
    console.error('获取合同分配信息失败:', error);
  }
};

// 初始化
onMounted(async () => {
  await fetchPersons();
  await fetchContracts();
});

// 操作方法
const createNewContract = () => {
  router.push('/DraftContract');
};

const editSelectedContracts = () => {
  if (selectedContractIds.value.length === 0) return;
  // 批量编辑逻辑
};

const deleteSelectedContracts = () => {
  if (selectedContractIds.value.length === 0) return;
  // 批量删除逻辑
};

// const viewContract = (id) => {
//   router.push(`/ContractDetails/${id}`);
// };

const viewContract = (id) => {
  router.push({  path: '/ContractDetails', query: { id } });
};

const editContract = (id) => {
  router.push(`/EditContract/${id}`);
};

const deleteContract = (id) => {
  if (confirm('确定要删除该合同吗？')) {
    // axios.delete(`/query/contracts/${id}`)
    //   .then(() => fetchContracts());
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  personFilter.value = '';
  currentPage.value = 1;
  fetchContracts();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchContracts();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchContracts();
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedContractIds.value = contracts.value.map(contract => contract.ContractID);
  } else {
    selectedContractIds.value = [];
  }
};

// 监听合同列表变化，更新全选状态
watch(contracts, () => {
  selectAll.value = selectedContractIds.value.length === contracts.value.length && contracts.value.length > 0;
});

// 监听选中项变化，更新全选状态
watch(selectedContractIds, () => {
  selectAll.value = selectedContractIds.value.length === contracts.value.length && contracts.value.length > 0;
});
</script>




<style scoped>
/* ------------------------- 左侧导航栏样式（保持不变） ------------------------- */
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

/* ------------------------- 右侧内容区样式 ------------------------- */
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

/* ------------------------- 增强版搜索栏样式 ------------------------- */
.enhanced-search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-weight: bold;
  white-space: nowrap;
}

.form-input, .form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.primary-btn, .secondary-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background-color: #495057;
}

/* ------------------------- 表格样式 ------------------------- */
.contract-table {
  margin-top: 20px;
}

.contract-table table {
  width: 100%;
  border-collapse: collapse;
}

.contract-table th, 
.contract-table td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: left;
}

.contract-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* ------------------------- 状态标签样式 ------------------------- */
.status-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.status-success {
  background-color: #e6ffea;
  color: #389e0d;
}

.status-warning {
  background-color: #fffbe6;
  color: #faad14;
}

.status-info {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-error {
  background-color: #fff2f0;
  color: #f5222d;
}

.status-default {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* ------------------------- 操作按钮样式 ------------------------- */
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
  background-color: #28a745;
}

.green-btn:hover {
  background-color: #218838;
}

.small-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #6c757d;
  color: white;
  margin-right: 4px;
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
  background-color: #dc3545;
  color: white;
}

/* ------------------------- 分页控件样式 ------------------------- */
.pagination {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
