<template>
  <SystemManagementSidebar />
  <div class="function-management">
    <h2>功能管理</h2>
    <button @click="goToAddFunction" class="add-function-btn">添加功能</button>
    <div class="search-bar">
      <input v-model="functionName" placeholder="输入功能名称查询" />
      <button @click="searchFunctions">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-if="currentPageFunctions.length > 0" class="function-table">
      <thead>
        <tr>
          <th>功能ID</th>
          <th>功能名称</th>
          <th>功能描述</th>
          <th>父功能ID</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="systemFunction in currentPageFunctions" :key="systemFunction.FunctionID">
          <td>{{ systemFunction.FunctionID }}</td>
          <td>{{ systemFunction.FunctionName }}</td>
          <td>{{ systemFunction.FunctionDescription }}</td>
          <td>{{ systemFunction.ParentID || '无' }}</td>
          <td>
            <button @click="viewFunction(systemFunction.FunctionID)" class="action-btn">查看</button>
            <button @click="deleteFunction(systemFunction.FunctionID)" class="action-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && functionName" class="no-data">未找到匹配的功能</div>
    <!-- 分页组件 -->
    <div v-if="functions.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';

const router = useRouter();
const message = inject('message');

const functionName = ref('');
const functions = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalPages = computed(() => Math.ceil(functions.value.length / itemsPerPage.value));

// 计算当前页的数据
const currentPageFunctions = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return functions.value.slice(startIndex, endIndex);
});

const goToAddFunction = () => {
  router.push('/function/add');
};

const searchFunctions = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/function/query?functionName=${functionName.value}`);
    functions.value = response.data;

    if (response.data.length === 0) {
      message.info('未找到匹配的功能');
    } else {
      message.success('查询成功！');
    }
  } catch (error) {
    message.error('查询失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
  currentPage.value = 1; // 查询后重置到第一页
};

const viewFunction = (functionId) => {
  // 这里可以实现查看功能详情的逻辑，例如跳转到功能详情页面
  console.log(`查看功能 ${functionId} 的详情`);
};

const deleteFunction = async (functionId) => {
  const confirm = await inject('dialog').confirm({
    title: '确认删除',
    content: '确定要删除此功能吗？',
    positiveText: '确认',
    negativeText: '取消'
  });

  if (!confirm) return;

  try {
    await axios.delete(`/function/delete?functionId=${functionId}`);
    message.success('删除成功！');
    searchFunctions(); // 刷新列表
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 页面加载时查询功能列表
searchFunctions();
</script>

<style scoped>
.function-management {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.add-function-btn {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-function-btn:hover {
  background-color: #0056b3;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.search-bar button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #45a049;
}

.loading {
  margin: 16px 0;
  color: #999;
}

.function-table {
  width: 100%;
  border-collapse: collapse;
}

.function-table th,
.function-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.function-table th {
  background-color: #f2f2f2;
}

.function-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.function-table tr:hover {
  background-color: #f1f1f1;
}

.action-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.action-btn:hover {
  background-color: #0056b3;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>