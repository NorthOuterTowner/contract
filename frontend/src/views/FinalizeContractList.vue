<template>
  <div class="flex">
  <Test />
  <Sidebar />
  <div class="contract-list">
    <h2>待定稿合同列表</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <table class="contract-table">
        <thead>
          <tr>
            <th>合同编号</th>
            <th>合同名称</th>
            <th>申请人</th>
            <th>申请日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td>{{ contract.contractNumber }}</td>
            <td>{{ contract.contractName }}</td>
            <td>{{ contract.applicant }}</td>
            <td>{{ formatDate(contract.applyDate) }}</td>
            <td>
              <button @click="viewContract(contract.id)">查看</button>
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
import Sidebar from '../components/sidebar.vue';
export default {
  components:{
    Sidebar
  },
  data() {
    return {
      contracts: [],
      loading: true
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
            id: 1,
            contractNumber: 'HT20230001',
            contractName: '年度服务器采购合同',
            applicant: '张三',
            applyDate: '2023-05-15'
          },
          {
            id: 2,
            contractNumber: 'HT20230002',
            contractName: '办公室租赁合同',
            applicant: '李四',
            applyDate: '2023-05-18'
          }
        ];
        this.loading = false;
      } catch (error) {
        console.error('获取合同列表失败:', error);
        this.loading = false;
      }
    },
    viewContract(contractId) {
      this.$router.push(`/FinalizeContract/${contractId}`);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
}
</script>

<style scoped>
.h2 {
    background-color: rgb(85, 117, 244);
}
.contract-list {
  margin-top: 20px;
  margin-left: 200px; /* 给 sidebar 腾出空间 */
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
</style>