<template>
  <div class="contract-finalize">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/FinalizeContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>合同定稿</h2>
      
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
        <div class="info-item" v-if="contract.FinalizedVersion">
          <label>定稿版本:</label>
          <span>{{ contract.FinalizedVersion }}</span>
        </div>
        <div class="info-item" v-if="contract.FinalizedDate">
          <label>定稿日期:</label>
          <span>{{ formatDate(contract.FinalizedDate) }}</span>
        </div>
      </div>
      
      <div class="finalize-content">
        <h3>定稿内容</h3>
        <div class="content-display" v-if="finalizedContent">
          <pre>{{ finalizedContent }}</pre>
        </div>
        <div v-else class="no-content">
          暂无定稿内容
        </div>
        
        <div class="download-section">
          <button 
            type="button" 
            class="download-btn"
            @click="onDownload"
            :disabled="!contract.Content"
          >
            下载定稿文件
          </button>
          <span class="file-name">{{ contract.Content || '无定稿文件' }}</span>
        </div>

        <div class="upload-section">
          <input 
            type="file" 
            id="updateFileInput" 
            ref="updateFileInput"
            style="display: none"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt"
          />
          <button 
            type="button" 
            class="upload-btn"
            @click="triggerFileInput"
          >
            选择文件
          </button>
          <span v-if="fileName" class="file-info">已选择: {{ fileName }}</span>
        </div>
      </div>
      
      <div class="action-buttons" v-if="contract.Status !== '已定稿'">
        <button 
          type="button" 
          class="confirm-btn"
          @click="confirmFinalize"
          :disabled="submitting || !selectedFile"
        >
          {{ submitting ? '处理中...' : '确认定稿' }}
        </button>
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
    const updateFileInput = ref(null);
    const fileName = ref('');
    const selectedFile = ref(null);
    const contract = ref({
      ContractID: '',
      Title: '',
      Status: '',
      CreationDate: '',
      Content: '',
      FinalizedVersion: '',
      FinalizedDate: ''
    });
    
    const finalizedContent = ref('');

    const fetchContractInfo = async () => {
      try {
        const res = await axios.get('/finalize/get', {
          params: { id: route.params.contractId }
        });

        if (res.data.code === 200) {
          contract.value = res.data.data;
          if (res.data.data.content) {
            finalizedContent.value = res.data.data.content;
          }
        } else {
          console.warn(res.data.msg);
          message.error("获取定稿信息失败");
          router.push('/FinalizeContractList');
        }
      } catch (error) {
        console.error('获取定稿信息失败:', error);
        message.error("获取定稿信息失败");
        router.push('/FinalizeContractList');
      } finally {
        loading.value = false;
      }
    };
    
    const onDownload = async () => {
      try {
        if (!contract.value?.Content) {
          message?.error("没有可下载的文件");
          return;
        }

        const response = await axios.get("/download", {
          params: { filename: contract.value.Content },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
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
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('下载失败:', error);
        message?.error("文件下载失败");
      }
    };
    
    const confirmFinalize = async () => {
      if (!selectedFile.value) {
        message.error("请先选择定稿文件");
        return;
      }

      submitting.value = true;
      
      try {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        formData.append('contractId', contract.value.ContractID);
        
        const res = await axios.post('/finalize/save', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data.code === 200) {
          message.success("合同定稿成功");
          await fetchContractInfo();
          // 清空已选文件
          selectedFile.value = null;
          fileName.value = '';
          updateFileInput.value.value = '';
        } else {
          message.error(res.data.msg || '合同定稿失败');
        }
      } catch (error) {
        console.error('合同定稿失败:', error);
        message.error("合同定稿失败");
      } finally {
        submitting.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
    };
    
    const triggerFileInput = () => {
      updateFileInput.value.click();
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // 验证文件类型
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
        message.error('只支持PDF、Word和TXT文档');
        return;
      }
      
      // 验证文件大小 (50MB以内)
      if (file.size > 50 * 1024 * 1024) {
        message.error('文件大小不能超过50MB');
        return;
      }
      
      fileName.value = file.name;
      selectedFile.value = file;
    };
    
    fetchContractInfo();
    
    return {
      loading,
      submitting,
      contract,
      finalizedContent,
      updateFileInput,
      fileName,
      selectedFile,
      onDownload,
      confirmFinalize,
      formatDate,
      triggerFileInput,
      handleFileChange
    };
  }
};
</script>

<style scoped>
.contract-finalize {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.upload-section {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-btn {
  padding: 8px 15px;
  background-color: #e6a23c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #ebb563;
}

.file-info {
  color: #606266;
  font-size: 13px;
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

.contract-info, .finalize-content {
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
  min-width: 120px;
  color: #666;
}

.content-display {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.content-display pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  line-height: 1.5;
}

.no-content {
  color: #999;
  font-style: italic;
  padding: 15px;
  text-align: center;
  background-color: #fff;
  border: 1px dashed #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
}

.download-section {
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

.download-btn:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.file-name {
  color: #606266;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  background-color: #85ce61;
}

.confirm-btn:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>