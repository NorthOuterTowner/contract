<template>
  <div class="flex">
    <Sidebar />
    <div class="contract-list">
      <div class="header">
        <h2>合同起草列表</h2>
        <button class="new-contract-button" @click="goToDraftContract">起草新合同</button>
      </div>
      
      <!-- 新增的搜索栏 -->
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="输入合同名称、编号搜索..." 
          @keyup.enter="searchContracts"
        />
        <button @click="searchContracts" class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else>
        <table class="contract-table">
          <thead>
            <tr>
              <th>合同编号</th>
              <th>合同名称</th>
              <th>申请日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
      <tr v-for="contract in filteredContracts" :key="contract.id">
      <td>{{ contract.ContractID }}</td>
      <td>{{ contract.Title }}</td>
      <td>{{ formatDate(contract.LastModifiedDate) }}</td>
      <td>
        <button @click="viewContract(contract.ContractID)">查看</button>
      </td>
    </tr>
  </tbody>
        </table>
        <div v-if="filteredContracts.length === 0" class="no-data">
          {{ searchQuery ? '没有找到匹配的合同' : '暂无待审批合同' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/sidebar.vue';
export default {
  components: {
    Sidebar
  },
  data() {
    return {
      contracts: [],
      loading: true,
      searchQuery: '' // 新增搜索查询字段
    };
  },
  computed: {
    // 新增计算属性用于过滤合同
    filteredContracts() {
      if (!this.searchQuery) return this.contracts;
      const query = this.searchQuery.toLowerCase();
      return this.contracts.filter(contract => 
        contract.ContractID.toLowerCase().includes(query) || 
        contract.Title.toLowerCase().includes(query)
      );
    }
  },
  created() {
    this.fetchPendingContracts();
  },
  methods: {
    async fetchPendingContracts() {
      try {
        const res = await axios.get("/draft/list"); 
        this.contracts = res.data.rows;
        this.contracts.approver = res.data.rowsApprover;
        this.loading = false;
      } catch (error) {
        console.error('获取合同列表失败:', error);
        this.loading = false;
      }
    },
    viewContract(contractId) {
      this.$router.push(`/DraftContract/${contractId}`);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    goToDraftContract() {
      this.$router.push('/DraftContract');
    },
    // 新增搜索方法
    searchContracts() {
      // 搜索逻辑已经在计算属性中实现
      // 这里只是为了响应搜索按钮点击
    }
  }
};
</script>

<style scoped>
.contract-list {
  margin-top: 20px;
  margin-left: 200px; /* 给 sidebar 腾出空间 */
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* 新增的搜索栏样式 */
.search-bar {
  display: flex;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  outline: none;
}

.search-bar input:focus {
  border-color: #4CAF50;
}

.search-button {
  padding: 0 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: #45a049;
}

.search-icon {
  font-size: 16px;
}

.new-contract-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.new-contract-button:hover {
  background-color: #45a049;
}

.contract-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.contract-table th, .contract-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.contract-table th {
  background-color: #f2f2f2;
}

.contract-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.contract-table tr:hover {
  background-color: #f1f1f1;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.loading, .no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>