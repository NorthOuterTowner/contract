<template>
  <div class="query-page">
    <!-- 合同信息查询 -->
    <div class="contract-info-query">
      <h2>合同信息查询</h2>
      <input
        type="text"
        v-model="contractName"
        placeholder="输入合同名称查询"
      />
      <button @click="searchByName">查询</button>
      <table v-if="contractsByName.length > 0">
        <thead>
          <tr>
            <th>合同编号</th>
            <th>合同名称</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contractsByName" :key="contract.ContractID">
            <td>{{ contract.ContractID }}</td>
            <td>{{ contract.Title }}</td>
            <td>{{ contract.Status }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="contractsByName.length === 0 && searchedByName">暂无匹配的合同信息</div>
    </div>

    <!-- 合同流程查询 -->
    <div class="contract-process-query">
      <h2>合同流程查询</h2>
      <select v-model="contractStatus">
        <option value="待起草">待起草</option>
        <option value="待签署">待签署</option>
        <option value="待审批">待审批</option>
        <option value="审批完成">审批完成</option>
      </select>
      <button @click="searchByStatus">查询</button>
      <table v-if="contractsByStatus.length > 0">
        <thead>
          <tr>
            <th>合同编号</th>
            <th>合同名称</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contractsByStatus" :key="contract.ContractID">
            <td>{{ contract.ContractID }}</td>
            <td>{{ contract.Title }}</td>
            <td>{{ contract.Status }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="contractsByStatus.length === 0 && searchedByStatus">暂无匹配的合同信息</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      contractName: "",
      contractStatus: "",
      contractsByName: [],
      contractsByStatus: [],
      searchedByName: false,
      searchedByStatus: false
    };
  },
  methods: {
    async searchByName() {
      try {
        const res = await axios.get("/query/contract/name", {
          params: { name: this.contractName }
        });
        this.contractsByName = res.data;
        this.searchedByName = true;
      } catch (error) {
        console.error("查询合同信息失败:", error);
      }
    },
    async searchByStatus() {
      try {
        const res = await axios.get("/query/contract/status", {
          params: { status: this.contractStatus }
        });
        this.contractsByStatus = res.data;
        this.searchedByStatus = true;
      } catch (error) {
        console.error("查询合同流程信息失败:", error);
      }
    }
  }
};
</script>

<style scoped>
.query-page {
  padding: 20px;
}

.contract-info-query,
.contract-process-query {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>