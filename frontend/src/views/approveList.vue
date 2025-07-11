<template>
  <div class="flex">
  <Sidebar />
  <div class="contract-list">
    <h2>待审批合同列表</h2>
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
            <th>合同编号</th>
            <th>合同名称</th>
            <th>修改日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td>{{ contract.ContractID }}</td>
            <td>{{ contract.Title }}</td>
            <td>{{ formatDate(contract.LastModifiedDate) }}</td>
            <td>
              <button @click="viewContract(contract.ContractID)">查看并审批</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="contracts.length === 0" class="no-data">暂无待审批合同</div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/sidebar.vue';
import { useAuthStore } from '../common/auth'; // 导入 Pinia store

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      contracts: [],
      loading: true,
      searchQuery: ''
    };
  },
  created() {
    this.fetchPendingContracts();
  },
  methods: {
    async fetchPendingContracts() {
      try {
        const authStore = useAuthStore(); // 获取 auth store
        const currentUser = authStore.user; // 获取当前用户

        if (!currentUser) {
          console.error('用户未登录');
          this.loading = false;
          return;
        }

        // 直接使用当前用户信息（不需要重新登录）
        const res = await axios.get("/approve/list", {
          params: {
            user: currentUser.username // 使用当前用户的 username
          }
        });

        this.contracts = res.data.rows;
        this.loading = false;
      } catch (error) {
        console.error('获取合同列表失败:', error);
        this.loading = false;
      }
    },

    viewContract(contractId) {
      this.$router.push({
        path: `/approve/content`,
        query: { id: contractId }
      });
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    async searchContracts() {
      try {
        const res = await axios.get("/approve/search", {
          params: {
            keyWord: this.searchQuery
          }
        });

        console.log(res);
        if (res.data.code == 200) {
          if (res.data.msg == "无对应合同") {
            this.contracts = []; // 清空数组
          } else {
            this.contracts = res.data.rows;
          }
        }
        this.loading = false;
      } catch (error) {
        console.error('搜索合同失败:', error);
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.h2 {
    background-color: rgb(85, 117, 244);
}
.contract-list {
  margin-top: 20px;
  margin-left: 200px; /* Siderbar position */
  padding: 20px;
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
</style>