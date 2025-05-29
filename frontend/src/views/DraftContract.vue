<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
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
        <form @submit.prevent="submitDraft">
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
          
          <div class="form-group">
            <label for="draftContent">合同内容:</label>
            <textarea 
              id="draftContent" 
              v-model="draft.draftContent" 
              required
              placeholder="请输入详细的合同内容"
              rows="10"
            ></textarea>
            <span class="error" v-if="errors.draftContent">{{ errors.draftContent }}</span>
            
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
                上传文件
              </button>
              <span v-if="uploading" class="upload-status">文件上传中...</span>
              <span v-if="fileName" class="file-name">{{ fileName }}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="secondary" @click="saveAsDraft">
              {{ savingDraft ? '保存中...' : '保存草稿' }}
            </button>
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交草案' }}
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
    const fileInput = ref(null);
    
    const loading = ref(true);
    const savingDraft = ref(false);
    const submitting = ref(false);
    const uploading = ref(false);
    const fileName = ref('');
    
    const contract = ref({
      contractID: '',
      title: '',
      description: '',
      status: '待起草',
      creationDate: new Date()
    });
    
    const draft = ref({
      draftTitle: '',
      draftContent: '',
      createdBy: '当前用户'
    });
    
    const errors = ref({
      draftTitle: '',
      description: '',
      draftContent: ''
    });
    
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      fileName.value = file.name;
      uploading.value = true;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          draft.value.draftContent = content;
          uploading.value = false;
        } catch (error) {
          console.error('文件读取错误:', error);
          uploading.value = false;
          alert('文件读取失败，请重试');
        }
      };
      
      reader.onerror = () => {
        uploading.value = false;
        alert('文件读取错误，请选择其他文件');
      };
      
      // 支持大文件读取
      if (file.size > 1024 * 1024 * 10) { // 大于10MB的文件使用不同读取方式
        reader.readAsText(file); // 对于超大文本文件
      } else {
        if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file); // 对于非文本文件
        }
      }
    };
    
    const fetchContractInfo = async () => {
      try {
        contract.value = {
          contractID: 'CON' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          title: '新合同',
          description: '',
          status: '待起草',
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
      
      if (!draft.value.draftTitle.trim()) {
        errors.value.draftTitle = '草案标题不能为空';
        isValid = false;
      } else {
        errors.value.draftTitle = '';
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
      
      if (!draft.value.draftContent.trim()) {
        errors.value.draftContent = '合同内容不能为空';
        isValid = false;
      } else {
        errors.value.draftContent = '';
      }
      
      return isValid;
    };
    
    const saveAsDraft = async () => {
      if (!validateForm()) return;
      
      savingDraft.value = true;
      
      try {
        console.log('保存草稿:', {
          contractID: contract.value.contractID,
          ...draft.value
        });
        
        setTimeout(() => {
          savingDraft.value = false;
          alert('草稿保存成功');
        }, 800);
      } catch (error) {
        console.error('保存草稿失败:', error);
        savingDraft.value = false;
        alert('保存失败，请重试');
      }
    };
    
    const submitDraft = async () => {
      if (!validateForm()) return;
      
      submitting.value = true;
      
      try {
        console.log('提交草案:', {
          contract: contract.value,
          draft: draft.value
        });
        
        setTimeout(() => {
          submitting.value = false;
          alert('草案提交成功');
          router.push('/DraftContractList');
        }, 1000);
      } catch (error) {
        console.error('提交草案失败:', error);
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
      savingDraft,
      submitting,
      uploading,
      fileName,
      contract,
      draft,
      errors,
      fileInput,
      triggerFileInput,
      handleFileUpload,
      saveAsDraft,
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

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
textarea:focus {
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
  align-items: center;
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
}

.upload-btn:hover {
  background-color: #85ce61;
}

.upload-status {
  color: #909399;
  font-size: 13px;
}

.file-name {
  color: #606266;
  font-size: 13px;
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
}

button[type="submit"] {
  background-color: #409eff;
  color: white;
}

button[type="submit"]:hover {
  background-color: #66b1ff;
}

button[type="submit"]:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

button.secondary {
  background-color: #f4f4f5;
  color: #606266;
}

button.secondary:hover {
  background-color: #e9e9eb;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>