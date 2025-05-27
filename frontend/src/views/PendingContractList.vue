<template>
  <div class="contract-assignment">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/PendingContractList">← 返回列表</router-link>
      </div>
      <h2>分配合同</h2>
      <div class="contract-details">
        <h3>合同详情</h3>
        <div class="detail-item">
          <label>合同编号:</label>
          <span>{{ contractInfo.ContractID }}</span>
        </div>
        <div class="detail-item">
          <label>合同名称:</label>
          <span>{{ contractInfo.Title }}</span>
        </div>
      </div>
      <div class="assignment-form">
        <h3>分配信息</h3>
        <form @submit.prevent="submitAssignment">
          <div class="form-group">
            <label for="signer">会签人员:</label>
            <select id="signer" v-model="signerId">
              <option v-for="user in userList" :key="user.UserID" :value="user.UserID">{{ user.UserName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="approver">审批人员:</label>
            <select id="approver" v-model="approverId">
              <option v-for="user in userList" :key="user.UserID" :value="user.UserID">{{ user.UserName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="executor">签订人员:</label>
            <select id="executor" v-model="executorId">
              <option v-for="user in userList" :key="user.UserID" :value="user.UserID">{{ user.UserName }}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      contractInfo: {},
      userList: [],
      signerId: '',
      approverId: '',
      executorId: '',
      loading: true,
      submitting: false
    };
  },
  created() {
    this.fetchAssignmentInfo();
  },
  methods: {
    async fetchAssignmentInfo() {
      const contractId = this.$route.params.contractId;
      try {
        const response = await fetch(`/api/contract-assignment/${contractId}`);
        const data = await response.json();
        this.contractInfo = data.contractInfo;
        this.userList = data.userList;
        this.loading = false;
      } catch (error) {
        console.error('获取合同分配信息失败:', error);
        this.loading = false;
      }
    },
    async submitAssignment() {
      if (!this.signerId || !this.approverId || !this.executorId) {
        alert('会签、审批、签订人员需全部指定');
        return;
      }
      this.submitting = true;
      try {
        const response = await fetch('/api/contract-assignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contractId: this.contractInfo.ContractID,
            signerId: this.signerId,
            approverId: this.approverId,
            executorId: this.executorId
          })
        });
        const data = await response.json();
        alert(data.message);
        this.$router.push('/PendingContractList');
      } catch (error) {
        console.error('提交合同分配信息失败:', error);
        alert('提交失败，请重试');
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.contract-assignment {
  margin-top: 20px;
}

.back-link {
  margin-bottom: 20px;
}

.contract-details {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-item label {
  font-weight: bold;
  min-width: 100px;
  display: inline-block;
}

.assignment-form {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 15px;
}

.form-actions button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>