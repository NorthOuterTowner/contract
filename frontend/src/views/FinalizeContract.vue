<template>
  <div class="contract-finalize">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/approveList">← 返回列表</router-link>
      </div>
      
      <h2>定稿合同</h2>
      
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
        <div classdetail="-item">
          <label>合同内容:</label>
          <div class="contract-content">{{ contract.content }}</div>
        </div>
      </div>
      
      <div class="finalize-form">
        <h3>定稿信息</h3>
        <form @submit.prevent="submitFinalize">
          <div class="form-group">
            <label for="finalizeDate">定稿日期:</label>
            <input 
              type="date" 
              id="finalizeDate" 
              v-model="finalizeData.finalizeDate" 
              required
            />
          </div>
          <div class="form-group">
            <label for="comment">定稿意见:</label>
            <textarea 
              id="comment" 
              v-model="finalizeData.comment" 
              required
              placeholder="请输入定稿意见"
              rows="4"
            ></textarea>
            <div v-if="errors.comment" class="error">{{ errors.comment }}</div>
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
import { defineComponent, ref } from 'vue';
import { NCard, NForm, NFormItem, NInput, NUpload, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    NCard,
    NForm,
    NFormItem,
    NInput,
    NUpload,
    NButton
  },
  data() {
    return {
      contract: {
        contractNumber: '',
        contractName: '',
        applicant: '',
        applyDate: '',
        content: ''
      },
      finalizeData: {
        finalizeDate: '',
        comment: ''
      },
      loading: true,
      submitting: false,
      errors: {
        comment: ''
      }
    }
  },
  created() {
    this.fetchContractDetails();
  },
  methods: {
    async fetchContractDetails() {
      try {
        // 模拟API调用
        this.contract = {
          id: 1,
          contractNumber: 'HT20230001',
          contractName: '年度服务器采购合同',
          applicant: '张三',
          applyDate: '2023-05-15',
          content: '本合同为年度服务器采购合同，包含100台服务器及相关配件，总金额￥1,200,000元。'
        };
        
        this.loading = false;
      } catch (error) {
        console.error('获取合同详情失败:', error);
        this.loading = false;
      }
    },
    validateForm() {
      let isValid = true;
      
      if (!this.finalizeData.comment.trim()) {
        this.errors.comment = '定稿意见不能为空';
        isValid = false;
      } else {
        this.errors.comment = '';
      }
      
      return isValid;
    },
    async submitFinalize() {
      if (!this.validateForm()) return;
      
      this.submitting = true;
      
      try {
        // 这里应该是API调用，提交定稿结果
        console.log('提交定稿:', {
          contractId: this.contract.id,
          userId: '当前用户ID', // 实际应用中应从登录信息获取
          action: this.finalizeData.action,
          comment: this.finalizeData.comment
        });
        
        // 模拟成功响应
        setTimeout(() => {
          this.submitting = false;
          alert('定稿提交成功');
          this.$router.push('/approveList');
        }, 1000);
      } catch (error) {
        console.error('提交定稿失败:', error);
        this.submitting = false;
        alert('定稿失败，请重试');
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  }
});
</script>

<style scoped>
.contract-finalize {
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

.finalize-form {
  background-color:white;
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
</style>