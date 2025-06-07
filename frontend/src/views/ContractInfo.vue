<template>
  <div class="contract-info-page">
    <!-- 左侧导航栏 -->
     <div class="sidebar">
    <div class="logo">基础数据管理</div>
    <ul class="menu">
      <!-- 合同处理相关菜单 -->
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

    <!-- 右侧主内容区域（调整后） -->
    <main class="main-content">
      <div class="page-header">
        <h2 class="page-title">合同信息管理</h2>
      
         <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <button @click="createNewContract" class="action-btn green-btn">+ 起草新合同</button>
          <button @click="editSelectedContracts" class="action-btn green-btn">修改合同</button>
          <button @click="deleteSelectedContracts" class="action-btn green-btn">删除合同</button>
        </div>
      </div>
      <!-- 搜索栏（样式统一） -->
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索合同编号、名称或客户" 
          @keyup.enter="fetchContracts"
          class="form-input"
        >
        <button @click="fetchContracts" class="primary-btn">🔍 搜索</button>
        <button @click="resetFilters" class="secondary-btn">🔄 重置</button>
      </div>
      
      <!-- 合同信息表格（样式复用） -->
      <div class="contract-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
              <th>合同编号</th>
              <th>合同名称</th>
              <th>签订日期</th>
              <th>合同状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contract, index) in contracts" :key="contract.id">
              <td><input type="checkbox" v-model="selectedContractIds" :value="contract.id"></td>
              <td>{{ contract.code }}</td>
              <td>{{ contract.name }}</td>
              <td>{{ contract.signDate }}</td>
              <td>
                <button @click="viewContract(contract.id)" class="action-btn small-btn">查看</button>
                <button @click="editContract(contract.id)" class="action-btn small-green-btn">编辑</button>
                <button @click="deleteContract(contract.id)" class="action-btn small-red-btn">删除</button>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';


const route = useRoute();
const router = useRouter();
const go = (path) => router.push(path); // 路由跳转函数

// 导航栏菜单数据
const processMenuItems = ref([
  { title: '合同信息管理', path: '/ContractInfo' },
  { title: '客户信息管理', path: '/CustomerInfo' },
  { title: '返回主页', path: '/HomePage'}
]);

// 导航跳转方法
const navigateTo = (path) => {
  router.push(path);
};

// 定义状态
const searchQuery = ref('');
const contracts = ref([]);
const selectedContractIds = ref([]);
const selectAll = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);

// 定义方法
const createNewContract = () => {
  router.push('/DraftContract');
}



</script>

<style scoped>
/* ------------------------- 左侧导航栏样式（统一后） ------------------------- */
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

.small-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #6c757d; /* 灰色 */
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
  background-color: #dc3545; /* 红色 */
  color: white;
}



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


/* ------------------------- 表格新增复选框样式 ------------------------- */
th:first-child, td:first-child {
  padding-left: 20px;
  width: 50px;
  text-align: center;
}







/* ------------------------- 右侧内容区样式（统一后） ------------------------- */
.main-content {
  margin-left: 220px; /* 200px导航栏 + 20px内边距 */
  padding: 30px 40px; /* 增大顶部内边距 */
}

.page-title {
  font-size: 20px; /* 统一标题大小 */
  margin-bottom: 25px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff; /* 天蓝色底边框 */
}

/* ------------------------- 搜索栏样式（复用添加用户界面） ------------------------- */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px; /* 输入框与按钮间距 */
  margin-bottom: 30px; /* 增大底部间距 */
}

.form-input {
  padding: 8px 16px; /* 输入框内边距 */
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.primary-btn, .secondary-btn {
  padding: 10px 20px; /* 按钮内边距 */
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-btn {
  background-color: #007bff; /* 主按钮蓝色 */
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d; /* 辅助按钮灰色 */
  color: white;
}

.secondary-btn:hover {
  background-color: #495057;
}

/* ------------------------- 表格和分页样式（保持原有逻辑） ------------------------- */
.contract-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.contract-table th, 
.contract-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>