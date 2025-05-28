<template>
  <div class="container">
    <Sidebar class="sidebar" />

    <div class="content">
      <div v-if="loading" class="loading">加载中喵...</div>

      <div v-else-if="contract" class="details-box">
        <h2 class="title">合同详情（编号：{{ contract.ContractID }}）</h2>
        <ul class="info-list">
          <li><strong>合同标题：</strong>{{ contract.Title }}</li>
          <li><strong>状态：</strong>{{ contract.Status }}</li>
          <li><strong>内容：</strong>{{ contract.Content }}</li>
          <li><strong>修改时间：</strong>{{ formatDate(contract.LastModifiedDate) }}</li>
        </ul>

        <!-- 审批模块放在合同详情下 -->
        <div class="approval-box">
          <h3 class="sub-title">审批操作</h3>
          <div class="radio-group">
            <label><input type="radio" value="通过" v-model="form.status" /> 通过</label>
            <label><input type="radio" value="拒绝" v-model="form.status" /> 拒绝</label>
          </div>
          <textarea v-model="form.comment" class="textarea" placeholder="输入审批意见。。。"></textarea>
          <div class="button-group">
            <button @click="submitApproval" class="btn">提交</button>
            <button @click="resetForm" class="btn btn-secondary">重置</button>
          </div>
        </div>
      </div>

      <div v-else class="error-message">
        未找到该合同的详细信息喵~
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/sidebar.vue';

export default {
  name: 'Content',
  components: {
    Sidebar
  },
  data() {
    return {
      contract: null,
      loading: true,
      form: {
        status: '',
        comment: ''
      }
    };
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) {
      this.fetchContractContent(id);
    } else {
      this.loading = false;
    }
  },
  methods: {
    async fetchContractContent(id) {
      try {
        const res = await axios.get('/approve/content', {
          params: { id }
        });

        if (res.data.code === 200) {
          this.contract = res.data.data;
        } else {
          console.warn(res.data.msg);
        }
      } catch (error) {
        console.error('获取合同详情失败:', error);
      } finally {
        this.loading = false;
      }
    },
    async submitApproval() {
      if (!this.form.status || !this.form.comment) {
        alert("请选择审批结果并填写审批意见！");
        return;
      }

      try {
        const res = await axios.post('/approve/submit', {
          id: this.contract.ContractID,
          status: this.form.status,
          comment: this.form.comment
        });

        if (res.data.code === 200) {
          alert("审批提交成功！");
        } else {
          alert("提交失败：" + res.data.msg);
        }
      } catch (error) {
        console.error("提交审批失败:", error);
      }
    },
    resetForm() {
      this.form.status = '';
      this.form.comment = '';
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background-color: #2c3e50;
  color: #fff;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.content {
  margin-left: 220px;
  padding: 30px;
  background-color: #fff;
  flex: 1;
}

.loading,
.error-message {
  font-size: 18px;
  color: #666;
  margin-top: 20px;
}

.details-box {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.info-list {
  list-style: none;
  padding: 0;
  line-height: 1.8;
  font-size: 16px;
}

/* 审批模块样式 */
.approval-box {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
}

.sub-title {
  font-size: 20px;
  margin-bottom: 15px;
}

.radio-group {
  margin-bottom: 10px;
  font-size: 16px;
}

.radio-group label {
  margin-right: 20px;
}

.textarea {
  width: 100%;
  min-height: 80px;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
}
</style>
