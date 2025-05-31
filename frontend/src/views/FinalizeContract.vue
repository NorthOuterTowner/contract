<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/FinalizeContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>合同定稿</h2>
      
      <div class="contract-info" v-if="contract.contractID">
      <div class="info-header">
        <h3>合同基本信息</h3>
        <button class="download-btn" @click="downloadExistingVersion">
          下载已有版本
        </button>
      </div>
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
      
      <!-- 会签意见部分 -->
      <div class="signing-opinions">
        <h3>会签意见</h3>
        <div class="opinion-list">
          <div class="opinion-item" v-for="(opinion, index) in signingOpinions" :key="index">
            <div class="opinion-header">
              <span class="opinion-party">{{ opinion.party }}</span>
              <span class="opinion-date">{{ formatDate(opinion.date) }}</span>
            </div>
            <div class="opinion-content">
              <textarea 
                readonly
                :value="opinion.content"
                rows="3"
                class="opinion-textarea"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div class="draft-form">
        <h3>定稿内容</h3>
        <div class="file-upload-section">
          <label for="file-upload" class="upload-btn">
            上传终稿版本
            <input 
              id="file-upload" 
              type="file" 
              @change="handleFileUpload" 
              accept=".doc,.docx,.pdf"
              style="display: none;"
            >
          </label>
          <span class="file-name" v-if="uploadedFile">
            {{ uploadedFile.name }}
          </span>
        </div>
        
        <div class="submit-section">
          <button type="button" class="complete-btn" @click="completeFinalize">
            完成
          </button>
        </div>
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
    const uploadedFile = ref(null);
    
    const contract = ref({
      contractID: '',
      title: '',
      status: '待定稿',
      creationDate: new Date()
    });
    
    // 会签意见数据
    const signingOpinions = ref([
      {
        party: '技术部 - 张经理',
        content: '经技术评估，合同中的服务器配置满足我司未来三年的业务发展需求，建议通过。',
        date: new Date(Date.now() - 86400000) // 昨天
      },
      {
        party: '财务部 - 李总监',
        content: '合同金额在预算范围内，付款条款合理，建议财务部会签通过。但建议将付款周期从30天调整为45天。',
        date: new Date(Date.now() - 172800000) // 前天
      }
    ]);
    
    const fetchContractInfo = async () => {
      try {
        contract.value = {
          contractID: 'CON' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          title: '年度服务器采购合同',
          status: '待定稿',
          creationDate: new Date()
        };
        loading.value = false;
      } catch (error) {
        console.error('获取合同信息失败:', error);
        loading.value = false;
      }
    };
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // 检查文件类型
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          alert('请上传PDF或Word文档');
          return;
        }
        
        // 检查文件大小 (5MB以内)
        if (file.size > 5 * 1024 * 1024) {
          alert('文件大小不能超过5MB');
          return;
        }
        
        uploadedFile.value = file;
      }
    };
    
    const completeFinalize = () => {
      if (!uploadedFile.value) {
        alert('请先上传合同文件');
        return;
      }
      
      // 这里可以添加文件上传逻辑
      alert('合同定稿完成，文件已上传: ' + uploadedFile.value.name);
      router.push('/FinalizeContractList');
    };
    
    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    const downloadExistingVersion = () => {
      // 这里添加下载逻辑
      alert('开始下载已有版本...');
      // 模拟下载过程
      setTimeout(() => {
        alert('下载完成');
      }, 1000);
    };
    
    fetchContractInfo();
    
    return {
      loading,
      contract,
      signingOpinions,
      uploadedFile,
      handleFileUpload,
      completeFinalize,
      formatDate,
      downloadExistingVersion
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

.contract-info, .draft-form, .signing-opinions {
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

/* 会签意见样式 */
.signing-opinions {
  background-color: #f0f7ff;
}

.opinion-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.opinion-item {
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.opinion-party {
  font-weight: bold;
  color: #333;
}

.opinion-date {
  color: #666;
}

.opinion-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fafafa;
  resize: none;
  color: #333;
  font-size: 14px;
}

/* 文件上传区域 */
.file-upload-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.download-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.download-btn:hover {
  background-color: #66b1ff;
}

.upload-btn {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-block;
}

.upload-btn:hover {
  background-color: #66b1ff;
}

.file-name {
  color: #333;
  font-size: 14px;
}

/* 完成按钮区域 */
.submit-section {
  display: flex;
  justify-content: flex-end;
}

.complete-btn {
  padding: 10px 30px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
}

.complete-btn:hover {
  background-color: #85ce61;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>