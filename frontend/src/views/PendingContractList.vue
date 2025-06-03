<template>
  <SystemManagementSidebar />
  <div class="flex">
    <Sidebar />
    <div class="contract-list">
      <h2>待分配合同</h2>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="输入合同名称搜索"
        />
        <button @click="searchContracts">搜索</button>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else>
        <table class="contract-table">
          <thead>
            <tr>
              <th>合同名称</th>
              <th>起草时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contract in paginatedContracts" :key="contract.ContractID">
              <td>{{ contract.Title }}</td>
              <td>{{ formatDate(contract.CreationDate) }}</td>
              <td>
                <button @click="allocateContract(contract.ContractID)">分配</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="paginatedContracts.length === 0" class="no-data">暂无待分配合同</div>
        <div v-if="totalPages > 1" class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';

export default {
  components: {
    SystemManagementSidebar
  },
  data() {  
    return {
      contracts: [],
      loading: true,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    paginatedContracts() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.contracts.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.contracts.length / this.itemsPerPage);
    }
  },
  created() {
    this.fetchPendingContracts();
  },
  methods: {
    async fetchPendingContracts() {
      try {
        // 这里应该是API调用，模拟数据
        this.contracts = [
          {
            ContractID: 'HT20230001',
            Title: '年度服务器采购合同',
            CreationDate: '2023-05-15'
          },
          {
            ContractID: 'HT20230002',
            Title: '办公室租赁合同',
            CreationDate: '2023-05-18'
          }
        ];
        this.loading = false;
      } catch (error) {
        console.error('获取待分配合同列表失败:', error);
        this.loading = false;
      }
    },
    searchContracts() {
      // 这里应该根据搜索查询过滤合同列表
      this.currentPage = 1;
      this.fetchPendingContracts();
    },
    allocateContract(contractId) {
      this.$router.push(`/allocate/${contractId}`);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
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

.search-container {
  margin-bottom: 20px;
}

.search-container input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.search-container button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.search-container button:hover {
  background-color: #45a049;
}

.contract-table {
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

.loading,
.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination button {
  margin: 0 10px;
}
</style>