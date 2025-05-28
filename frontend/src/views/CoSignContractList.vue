<template>
  <div class="flex">
    <Test />
    <Sidebar />
    <div class="contract-list">
      <h2>合同会签列表</h2>
      <div class="tab-buttons">
        <button 
          @click="activeTab = 'pending'" 
          :class="{ active: activeTab === 'pending' }"
        >
          待会签
        </button>
        <button 
          @click="activeTab = 'completed'" 
          :class="{ active: activeTab === 'completed' }"
        >
          已结束
        </button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="输入合同名称、编号或申请人搜索..." 
          @keyup.enter="searchContracts"
        />
        <button @click="searchContracts" class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else>
        <!-- 待会签合同列表 -->
        <table v-if="activeTab === 'pending'" class="contract-table">
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
            <tr v-for="contract in filteredPendingContracts" :key="contract.id">
              <td>{{ contract.contractNumber }}</td>
              <td>{{ contract.contractName }}</td>
              <td>{{ contract.applicant }}</td>
              <td>{{ formatDate(contract.applyDate) }}</td>
              <td>
                <button @click="viewContract(contract.id)">单次会签</button>&nbsp;
                <button @click="endContract(contract.id)">结束会签</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 已结束合同列表 -->
        <table v-if="activeTab === 'completed'" class="contract-table">
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
            <tr v-for="contract in filteredCompletedContracts" :key="contract.id">
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
        
        <div v-if="activeTab === 'pending' && filteredPendingContracts.length === 0" class="no-data">
          {{ searchQuery ? '没有找到匹配的合同' : '暂无待会签合同' }}
        </div>
        <div v-if="activeTab === 'completed' && filteredCompletedContracts.length === 0" class="no-data">
          {{ searchQuery ? '没有找到匹配的合同' : '暂无已结束合同' }}
        </div>
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
      pendingContracts: [
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
      ],
      completedContracts: [
        {
          id: 3,
          contractNumber: 'HT20230003',
          contractName: '软件开发合同',
          applicant: '王五',
          applyDate: '2023-04-10'
        },
        {
          id: 4,
          contractNumber: 'HT20230004',
          contractName: '咨询服务合同',
          applicant: '赵六',
          applyDate: '2023-04-25'
        }
      ],
      loading: false,
      activeTab: 'pending', // 默认显示待会签列表
      searchQuery: ''
    }
  },
  computed: {
    filteredPendingContracts() {
      if (!this.searchQuery) return this.pendingContracts;
      const query = this.searchQuery.toLowerCase();
      return this.pendingContracts.filter(contract => 
        contract.contractNumber.toLowerCase().includes(query) || 
        contract.contractName.toLowerCase().includes(query) ||
        contract.applicant.toLowerCase().includes(query)
      );
    },
    filteredCompletedContracts() {
      if (!this.searchQuery) return this.completedContracts;
      const query = this.searchQuery.toLowerCase();
      return this.completedContracts.filter(contract => 
        contract.contractNumber.toLowerCase().includes(query) || 
        contract.contractName.toLowerCase().includes(query) ||
        contract.applicant.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    viewContract(contractId) {
      this.$router.push(`/CoSignContract/${contractId}`);
    },
    endContract(contractId) {
      // 结束会签的逻辑
      console.log('结束会签:', contractId);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    searchContracts() {
      // 搜索逻辑已经在计算属性中实现
      // 这里只是为了响应搜索按钮点击
    }
  }
}
</script>

<style scoped>
.flex {
  display: flex;
}

.contract-list {
  margin-top: 20px;
  margin-left: 200px; 
  padding: 20px;
  flex-grow: 1;
}

.tab-buttons {
  margin-bottom: 20px;
}

.tab-buttons button {
  padding: 8px 16px;
  margin-right: 10px;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
}

.tab-buttons button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

/* 搜索栏样式 */
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