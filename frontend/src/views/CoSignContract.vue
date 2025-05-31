<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/CoSignContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>合同会签</h2>
      
      <div class="contract-info" v-if="contract.contractID">
        <h3>合同基本信息</h3>
        <div class="info-item">
          <label>合同名称:</label>
          <span>{{ contract.title }}</span>
        </div>
        <div class="info-item">
          <label>合同编号:</label>
          <span>{{ contract.contractID }}</span>
        </div>
        <div class="info-item">
          <label>创建日期:</label>
          <span>{{ formatDate(contract.creationDate) }}</span>
        </div>
        <div class="info-item">
          <label>当前状态:</label>
          <span>{{ contract.status }}</span>
        </div>
      </div>
      
      <div class="draft-form">
        <h3>会签内容</h3>
        <form @submit.prevent="submitDraft">
          <div class="form-group">
            <span class="error" v-if="errors.draftTitle">{{ errors.draftTitle }}</span>
          </div>
          
          <div class="form-group">
            <label for="description">会签修改意见摘要:</label>
            <textarea 
              id="description" 
              v-model="contract.description" 
              required
              placeholder="请简要描述合同修改意见(200字以内)"
              maxlength="200"
              rows="2"
            ></textarea>
            <span class="error" v-if="errors.description">{{ errors.description }}</span>
          </div>
          
          <div class="form-group">
            <div class="download-section">
              <button 
                type="button" 
                class="download-btn"
                @click="downloadContract"
              >
                下载合同文件
              </button>
              <span class="file-name">该合同文件</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交会签' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    
    const loading = ref(true);
    const submitting = ref(false);
    
    const contract = ref({
      contractID: '',
      title: '',
      description: '',
      status: '待会签',
      creationDate: new Date()
    });
    
    const errors = ref({
      description: ''
    });
    
    const downloadContract = () => {
      // 这里添加下载合同文件的逻辑
      alert('合同文件下载功能将在此实现');
    };
    
    const fetchContractInfo = async () => {
      try {
        contract.value = {
          contractID: 'CON' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          title: '待会签合同',
          description: '',
          status: '待会签',
          creationDate: new Date()
        };
        loading.value = false;
      } catch (error) {
        console.error('获取合同信息失败:', error);
        loading.value = false;
      }
    };
    
    const validateForm = () => {
      let isValid = true;
      
      if (!contract.value.description.trim()) {
        errors.value.description = '会签意见不能为空';
        isValid = false;
      } else if (contract.value.description.length > 200) {
        errors.value.description = '会签意见不能超过200字';
        isValid = false;
      } else {
        errors.value.description = '';
      }
      
      return isValid;
    };
    
    const submitDraft = async () => {
      if (!validateForm()) return;
      
      submitting.value = true;
      
      try {
        console.log('提交会签:', {
          contract: contract.value
        });
        
        setTimeout(() => {
          submitting.value = false;
          alert('会签意见提交成功');
          router.push('/CoSignContractList');
        }, 1000);
      } catch (error) {
        console.error('提交会签失败:', error);
        submitting.value = false;
        alert('提交失败，请重试');
      }
    };
    
    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };
    
    fetchContractInfo();
    
    return {
      loading,
      submitting,
      contract,
      errors,
      downloadContract,
      submitDraft,
      formatDate
    };
  }
};
</script>

<style scoped>
.contract-draft {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-link {
  margin-bottom: 20px;
}

.back-link a {
  color: #409eff;
  text-decoration: none;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.contract-info, .draft-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 25px;
}

h3 {
  color: #444;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-item label {
  font-weight: bold;
  min-width: 100px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  min-height: 100px;
  resize: vertical;
}

textarea:focus {
  border-color: #409eff;
  outline: none;
}

.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.download-section {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.download-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.download-btn:hover {
  background-color: #66b1ff;
}

.file-name {
  color: #606266;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;
}

button[type="submit"] {
  padding: 10px 20px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

button[type="submit"]:hover {
  background-color: #85ce61;
}

button[type="submit"]:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>