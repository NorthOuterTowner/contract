<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/CoSignContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>合同会签</h2>
      
      <div class="contract-info" v-if="contract.ContractID">
        <h3>合同基本信息</h3>
        <div class="info-item">
          <label>合同名称:</label>
          <span>{{ contract.Title }}</span>
        </div>
        <div class="info-item">
          <label>合同编号:</label>
          <span>{{ contract.ContractID }}</span>
        </div>
        <div class="info-item">
          <label>创建日期:</label>
          <span>{{ formatDate(contract.CreationDate) }}</span>
        </div>
        <div class="info-item">
          <label>当前状态:</label>
          <span>{{ contract.Status }}</span>
        </div>
      </div>
      
      <div class="draft-form">
        <h3>会签内容</h3>
        <form @submit.prevent="submitDraft">
          <div class="form-group">
            <label for="description">会签修改意见摘要:</label>
            <textarea 
              id="description" 
              v-model="description" 
              required
              placeholder="请输入会签修改意见"
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
                @click="onDownload"
              >
                下载合同文件
              </button>
              <span class="file-name">{{ contract.Content || '无合同文件' }}</span>
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
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { inject } from 'vue';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const message = inject("message");
    
    const loading = ref(true);
    const submitting = ref(false);
    const description = ref('请输入会签修改意见'); // 修改为固定默认值
    
    const contract = ref({
      ContractID: '',
      Title: '',
      Status: '',
      CreationDate: '',
      Content: ''
    });
    
    const errors = ref({
      description: ''
    });
    
    const fetchContractInfo = async () => {
      try {
        const res = await axios.get('/cosign/get', {
          params: { id: route.params.contractId }
        });

        if (res.data.code === 200) {
          contract.value = res.data.data;
        } else {
          console.warn(res.data.msg);
          message.error("获取合同信息失败");
          router.push('/CoSignContractList');
        }
      } catch (error) {
        console.error('获取合同信息失败:', error);
        message.error("获取合同信息失败");
        router.push('/CoSignContractList');
      } finally {
        loading.value = false;
      }
    };
    
    const onDownload = async () => {
  try {
    // 检查是否有可下载的文件
    if (!contract.value?.Content) {
      message?.error("没有可下载的文件");
      return;
    }

    const response = await axios.get("/download", {
      params: { filename: contract.value.Content },
      responseType: 'blob'
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data])); // 修正这里的拼写错误
    const link = document.createElement('a');
    link.href = url;
    
    // 尝试从响应头获取文件名
    const contentDisposition = response.headers['content-disposition'];
    let filename = contract.value.Content;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载失败:', error);
    message?.error("文件下载失败"); // 使用可选链操作符
  }
};
    
    const validateForm = () => {
      let isValid = true;
      
      if (!description.value.trim()) {
        errors.value.description = '会签意见不能为空';
        isValid = false;
      } else if (description.value.length > 200) {
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
    const formData = new FormData();
    formData.append('contractId', contract.value.ContractID);
    formData.append('description', description.value);

    const res = await axios.post('/cosign/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.code === 200) {
      message.info("会签意见提交成功");
      router.push('/CoSignContractList');
    } else {
      message.error(res.data.msg || '提交会签失败');
    }
  } catch (error) {
    console.error('提交会签失败:', error);
    message.error("提交会签失败");
  } finally {
    submitting.value = false;
  }
};
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };
    
    fetchContractInfo();
    
    return {
      loading,
      submitting,
      contract,
      description,
      errors,
      onDownload,
      submitDraft,
      formatDate
    };
  }
};
</script>

<style scoped>
/* 样式保持不变 */
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