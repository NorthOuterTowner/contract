<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/contractInfo" class="mr-4">← 返回合同信息管理</router-link>
        <router-link to="/DraftContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>起草合同</h2>
      
      <div class="contract-info" v-if="contract.contractID">
        <h3>合同基本信息</h3>
        <div class="info-item">
          <label>合同编号:</label>
          <span>{{ contract.contractID }}</span>
        </div>
        <div class="info-item">
          <label>草案标题:</label>
          <span>{{ draft.draftTitle }}</span>
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
        <h3>起草内容</h3>
        <form @submit.prevent="saveAsDraft">
          <div class="form-group">
            <label for="draftTitle">草案标题:</label>
            <input 
              type="text" 
              id="draftTitle" 
              v-model="draft.draftTitle" 
              required
              placeholder="请输入草案标题"
            />
            <span class="error" v-if="errors.draftTitle">{{ errors.draftTitle }}</span>
          </div>
          
          <div class="form-group">
            <label for="contractNumber">合同编号:</label>
            <input 
              type="text" 
              id="contractNumber" 
              v-model="contract.contractID" 
              required
              placeholder="请输入合同编号(10个字符以内)"
              maxlength="10"
              @input="validateContractNumber"
            />
            <span class="error" v-if="errors.contractNumber">{{ errors.contractNumber }}</span>
          </div>
          
          <div class="form-group">
            <label for="description">合同摘要:</label>
            <textarea 
              id="description" 
              v-model="contract.description" 
              required
              placeholder="请输入合同简要描述(200字以内)"
              maxlength="200"
              rows="2"
            ></textarea>
            <span class="error" v-if="errors.description">{{ errors.description }}</span>
          </div>
          
          <!-- 新增生效起止时间 -->
          <div class="form-group">
            <label>合同生效时间:</label>
            <div class="date-range">
              <div class="date-input">
                <label for="startDate">开始日期:</label>
                <input 
                  type="date" 
                  id="startDate" 
                  v-model="contract.startDate" 
                  required
                  :min="minStartDate"
                />
                <span class="error" v-if="errors.startDate">{{ errors.startDate }}</span>
              </div>
              <div class="date-input">
                <label for="endDate">结束日期:</label>
                <input 
                  type="date" 
                  id="endDate" 
                  v-model="contract.endDate" 
                  required
                  :min="contract.startDate || minStartDate"
                />
                <span class="error" v-if="errors.endDate">{{ errors.endDate }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <div class="upload-section">
              <input 
                type="file" 
                id="fileInput" 
                ref="fileInput"
                style="display: none"
                @change="handleFileUpload"
              />
              <button 
                type="button" 
                class="upload-btn"
                @click="triggerFileInput"
              >
                上传合同文件
              </button>
              <span v-if="uploading" class="upload-status">文件上传中...</span>
              <div v-if="fileName" class="file-info">
                <div class="file-name">已选择文件: {{ fileName }}</div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="savingDraft">
              {{ savingDraft ? '保存中...' : '保存草稿' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const fileInput = ref(null);
    
    const loading = ref(true);
    const savingDraft = ref(false);
    const uploading = ref(false);
    const fileName = ref('');
    
    const contract = ref({
      contractID: '',
      title: '',
      description: '',
      status: '待起草',
      creationDate: new Date(),
      startDate: '',
      endDate: ''
    });
    
    const draft = ref({
      draftTitle: '',
      createdBy: '当前用户'
    });
    
    const errors = ref({
      draftTitle: '',
      contractNumber: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    
    // 计算最小开始日期（今天）
    const minStartDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      uploading.value = true;
      fileName.value = file.name;
      
      setTimeout(() => {
        uploading.value = false;
      }, 500);
    };
    
    const validateContractNumber = () => {
      if (contract.value.contractID.length > 10) {
        errors.value.contractNumber = '合同编号不能超过10个字符';
        return false;
      }
      errors.value.contractNumber = '';
      return true;
    };
    
    const validateDates = () => {
      let isValid = true;
      
      if (!contract.value.startDate) {
        errors.value.startDate = '请选择开始日期';
        isValid = false;
      } else {
        errors.value.startDate = '';
      }
      
      if (!contract.value.endDate) {
        errors.value.endDate = '请选择结束日期';
        isValid = false;
      } else if (contract.value.startDate && contract.value.endDate < contract.value.startDate) {
        errors.value.endDate = '结束日期不能早于开始日期';
        isValid = false;
      } else {
        errors.value.endDate = '';
      }
      
      return isValid;
    };
    
    const fetchContractInfo = async () => {
      try {
        contract.value = {
          contractID: 'CON' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          title: '新合同',
          description: '',
          status: '待起草',
          creationDate: new Date(),
          startDate: '',
          endDate: ''
        };
        loading.value = false;
      } catch (error) {
        console.error('获取合同信息失败:', error);
        loading.value = false;
      }
    };
    
    const validateForm = () => {
      let isValid = true;
      
      if (!draft.value.draftTitle.trim()) {
        errors.value.draftTitle = '草案标题不能为空';
        isValid = false;
      } else {
        errors.value.draftTitle = '';
      }
      
      if (!contract.value.contractID.trim()) {
        errors.value.contractNumber = '合同编号不能为空';
        isValid = false;
      } else if (!validateContractNumber()) {
        isValid = false;
      }
      
      if (!contract.value.description.trim()) {
        errors.value.description = '合同摘要不能为空';
        isValid = false;
      } else if (contract.value.description.length > 200) {
        errors.value.description = '摘要不能超过200字';
        isValid = false;
      } else {
        errors.value.description = '';
      }
      
      if (!validateDates()) {
        isValid = false;
      }
      
      return isValid;
    };
    
    const saveAsDraft = async () => {
      if (!validateForm()) return;
      
      savingDraft.value = true;
      
      try {
        const formData = new FormData();
        formData.append('contractID', contract.value.contractID);
        formData.append('title', draft.value.draftTitle);
        formData.append('description', contract.value.description);
        formData.append('creationDate', contract.value.creationDate.toISOString());
        formData.append('startDate', contract.value.startDate);
        formData.append('endDate', contract.value.endDate);
        formData.append('status', '待起草');
        
        if (fileInput.value.files[0]) {
          formData.append('content', fileInput.value.files[0]);
        }

        const response = await axios.post('/draft/savedraft', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.code === 200) {
          alert('草稿保存成功');
          router.push('/DraftContractList');
        } else {
          alert('保存失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('保存草稿失败:', error);
        alert('保存失败，请重试');
      } finally {
        savingDraft.value = false;
      }
    };
    
    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };
    
    fetchContractInfo();
    
    return {
      loading,
      savingDraft,
      uploading,
      fileName,
      contract,
      draft,
      errors,
      fileInput,
      minStartDate,
      triggerFileInput,
      handleFileUpload,
      validateContractNumber,
      saveAsDraft,
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

input[type="text"],
textarea,
input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
textarea:focus,
input[type="date"]:focus {
  border-color: #409eff;
  outline: none;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.upload-section {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  padding: 8px 15px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.upload-btn:hover {
  background-color: #85ce61;
}

.upload-status {
  color: #909399;
  font-size: 13px;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.file-name {
  color: #606266;
  font-size: 13px;
  margin: 5px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #409eff;
  color: white;
}

button:hover {
  background-color: #66b1ff;
}

button:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.date-range {
  display: flex;
  gap: 20px;
}

.date-input {
  flex: 1;
}

.date-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: normal;
  color: #555;
}
</style>