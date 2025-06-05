<template>
  <div class="contract-draft">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="back-link">
        <router-link to="/QueryContractList">← 返回合同列表</router-link>
      </div>
      
      <h2>合同查询详情</h2>
      
      <div class="contract-info" v-if="contract.contractID">
        <h3>合同基本信息</h3>
        <div class="info-item">
          <label>合同编号:</label>
          <span>{{ contract.contractID }}</span>
        </div>
        <div class="info-item">
          <label>合同名称:</label>
          <span>{{ contract.title }}</span>
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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const contract = ref({
      contractID: '',
      title: '',
      creationDate: '',
      status: ''
    });

    const fetchContractInfo = async () => {
      const contractId = router.currentRoute.value.params.id;
      try {
        const res = await axios.get(`/query/detail/${contractId}`);
        contract.value = res.data;
        loading.value = false;
      } catch (error) {
        console.error('获取合同信息失败:', error);
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    fetchContractInfo();

    return {
      loading,
      contract,
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

.contract-info {
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

.loading {
  text-align: center;
  padding: 50px;
}
</style>