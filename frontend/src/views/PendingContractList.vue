<template>
  <SystemManagementSidebar />
  <div class="permission-management">
    <h2>分配合同</h2>
    <hr />
    <h3>待分配合同列表</h3>
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="输入合同编号、合同名称或状态查询" />
      <button @click="searchContracts">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-if="currentPageContracts.length > 0" class="user-table">
      <thead>
        <tr>
          <th>合同编号</th>
          <th>合同名称</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contract in currentPageContracts" :key="contract.ContractID">
          <td>{{ contract.ContractID }}</td>
          <td>{{ contract.Title }}</td>
          <td>{{ contract.Status }}</td>
          <td>
            <button @click="allocateContract(contract.ContractID)" class="action-btn">分配</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && searchQuery" class="no-data">未找到匹配的合同</div>
    <!-- 分页组件 -->
    <div v-if="contracts.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';

const router = useRouter();
const message = inject('message');

const searchQuery = ref('');
const contracts = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(0);

// 计算当前页的合同数据
const currentPageContracts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return contracts.value.slice(startIndex, endIndex);
});

const searchContracts = async () => {
  if (!searchQuery.value.trim()) {
    // 如果查询为空，获取全部合同
    return getAllContracts();
  }
  
  loading.value = true;
  try {
    let url = '/contract/query?';
    // 可以根据需求添加更多的查询条件判断
    url += `query=${searchQuery.value}`;
    const response = await axios.get(url);
    contracts.value = response.data;
    
    if (response.data.length === 0) {
      message.info('未找到匹配的合同');
    } else {
      message.success('查询成功！');
    }
  } catch (error) {
    message.error('查询失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
  totalPages.value = Math.ceil(contracts.value.length / itemsPerPage.value);
  currentPage.value = 1; // 查询后重置到第一页
};

const allocateContract = (contractId) => {
  router.push(`/allocate/${contractId}`);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 在组件挂载时获取所有合同
const getAllContracts = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/assign/all');
    contracts.value = response.data;
    message.success('获取合同列表成功！');
  } catch (error) {
    message.error('获取合同列表失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
  totalPages.value = Math.ceil(contracts.value.length / itemsPerPage.value);
};

getAllContracts();
</script>

<style scoped>
.permission-management {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
    font-size: 24px;
    margin-bottom: 20px;
}

h3 {
    font-size: 20px;
    margin-bottom: 10px;
}

.search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.search-bar input {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1;
}

.search-bar button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}

.search-bar button:hover {
    background-color: #45a049;
}

.loading {
    margin: 16px 0;
    color: #999;
    text-align: center;
}

.user-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.user-table th,
.user-table td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
}

.user-table th {
    background-color: #f2f2f2;
    font-weight: 500;
}

.user-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.user-table tr:hover {
    background-color: #f1f1f1;
}

.action-btn {
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
    font-size: 14px;
    transition: background-color 0.3s;
}

.action-btn {
    background-color: #007bff;
}

.action-btn:hover {
    opacity: 0.9;
}

.no-data {
    text-align: center;
    padding: 20px;
    color: #666;
}

.pagination {
    margin-top: 20px;
    text-align: center;
    color: #333;
}

.pagination button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin: 0 5px;
}

.pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>