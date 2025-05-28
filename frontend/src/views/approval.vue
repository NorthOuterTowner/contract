<template>
  <div class="contract-approval">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/">← 返回列表</router-link>
      </div>
      
      <h2>合同审批</h2>
      
      <div class="contract-details">
        <h3>合同详情</h3>
        <div class="detail-item">
          <label>合同编号:</label>
          <span>{{ contract.contractNumber }}</span>
        </div>
        <div class="detail-item">
          <label>合同名称:</label>
          <span>{{ contract.contractName }}</span>
        </div>
        <div class="detail-item">
          <label>申请人:</label>
          <span>{{ contract.applicant }}</span>
        </div>
        <div class="detail-item">
          <label>申请日期:</label>
          <span>{{ formatDate(contract.applyDate) }}</span>
        </div>
        <div class="detail-item">
          <label>合同内容:</label>
          <div class="contract-content">{{ contract.content }}</div>
        </div>
      </div>
      
      <div class="approval-form">
        <h3>审批意见</h3>
        <form @submit.prevent="submitApproval">
          <div class="form-group">
            <label>审批操作:</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="approvalData.action" value="approve" required>
                通过
              </label>
              <label>
                <input type="radio" v-model="approvalData.action" value="reject" required>
                拒绝
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="comment">审批意见:</label>
            <textarea 
              id="comment" 
              v-model="approvalData.comment" 
              required
              placeholder="请输入审批意见"
              rows="4"
            ></textarea>
            <div v-if="errors.comment" class="error">{{ errors.comment }}</div>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交审批' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-if="approvalHistory.length >= 0" class="approval-history">
        <h3>审批历史</h3>
        <ul>
          <li v-for="(item, index) in approvalHistory" :key="index">
            <div class="history-item">
              <span class="approver">{{ item.approver }}</span>
              <span class="action" :class="item.action">{{ item.action === 'approve' ? '通过' : '拒绝' }}</span>
              <span class="date">{{ formatDate(item.date) }}</span>
              <div class="comment">{{ item.comment }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      contract: {},
      approvalData: {
        action: '',
        comment: ''
      },
      approvalHistory: [],
      loading: true,
      submitting: false,
      errors: {
        comment: ''
      }
    }
  },
  created() {
    this.fetchContractDetails(this.$route.params.id);
  },
  methods: {
    async fetchContractDetails(contractId) {
      try {
        // 模拟API调用
        this.contract = {
          id: contractId,
          contractNumber: 'HT20230001',
          contractName: '年度服务器采购合同',
          applicant: '张三',
          applyDate: '2023-05-15',
          content: '本合同为年度服务器采购合同，包含100台服务器及相关配件，总金额￥1,200,000元。'
        };
        
        // 模拟审批历史
        this.approvalHistory = [
          {
            approver: '王五',
            action: 'approve',
            date: '2023-05-16',
            comment: '符合公司采购流程，建议通过'
          }
        ];
        
        this.loading = false;
      } catch (error) {
        console.error('获取合同详情失败:', error);
        this.loading = false;
      }
    },
    validateForm() {
      let isValid = true;
      
      if (!this.approvalData.comment.trim()) {
        this.errors.comment = '审批意见不能为空';
        isValid = false;
      } else {
        this.errors.comment = '';
      }
      
      return isValid;
    },
    async submitApproval() {
      if (!this.validateForm()) return;
      
      this.submitting = true;
      
      try {
        // 这里应该是API调用，提交审批结果
        console.log('提交审批:', {
          contractId: this.contract.id,
          userId: '当前用户ID', // 实际应用中应从登录信息获取
          action: this.approvalData.action,
          comment: this.approvalData.comment
        });
        
        // 模拟成功响应
        setTimeout(() => {
          this.submitting = false;
          alert('审批提交成功');
          this.$router.push('/');
        }, 1000);
      } catch (error) {
        console.error('提交审批失败:', error);
        this.submitting = false;
        alert('提交审批失败，请重试');
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
}
</script>

<style scoped>
.contract-approval {
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

.contract-content {
  margin-top: 10px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.approval-form {
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

.radio-group {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

.radio-group label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 5px;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.error {
  color: #f44336;
  font-size: 0.8em;
  margin-top: 5px;
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

.approval-history {
  margin-top: 20px;
}

.approval-history ul {
  list-style: none;
  padding: 0;
}

.history-item {
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.history-item .approver {
  font-weight: bold;
  margin-right: 10px;
}

.history-item .action {
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 10px;
}

.history-item .action.approve {
  background-color: #4CAF50;
  color: white;
}

.history-item .action.reject {
  background-color: #f44336;
  color: white;
}

.history-item .date {
  color: #666;
  font-size: 0.9em;
}

.history-item .comment {
  margin-top: 5px;
  padding-left: 20px;
  color: #555;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>