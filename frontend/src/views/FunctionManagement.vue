<template>
  <SystemManagementSidebar />
  <div class="function-management">
    <h2>功能管理</h2>
    <button @click="goToAddFunction" class="add-function-btn">添加功能</button>
    <div class="search-bar">
      <input v-model="query" placeholder="输入功能 ID 或功能名称查询" />
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
            <button @click="viewFunction(systemFunction.FunctionID)" class="action-btn view-btn">查看</button>
            <button @click="showDeleteConfirm(systemFunction.FunctionID)" class="action-btn delete-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && query" class="no-data">未找到匹配的功能</div>
    <!-- 分页组件 -->
    <div v-if="functions.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 确认删除模态框 -->
    <div v-if="isDeleteConfirmVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-content">
          <p>确定要删除此功能吗？</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="action-btn secondary">取消</button>
          <button @click="confirmDelete" class="action-btn primary">确认</button>
        </div>
      </div>
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

const query = ref('');
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
    let response;
    if (/^\d+$/.test(query.value)) {
      // 如果输入是纯数字，按功能 ID 查询
      response = await axios.get(`/function/query?functionId=${query.value}`);
    } else {
      // 否则按功能名称查询
      response = await axios.get(`/function/query?functionName=${query.value}`);
    }
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
  router.push(`/function/modify/${functionId}`);
};

const isDeleteConfirmVisible = ref(false);
const functionIdToDelete = ref('');

const showDeleteConfirm = (functionId) => {
  functionIdToDelete.value = functionId;
  isDeleteConfirmVisible.value = true;
};

const cancelDelete = () => {
  isDeleteConfirmVisible.value = false;
};

const confirmDelete = async () => {
  try {
    await axios.delete(`/function/delete?functionId=${functionIdToDelete.value}`);
    message.success('删除成功！');
    // 重新获取功能列表
    await searchFunctions();
  } catch (error) {
    message.error('删除失败！');
    console.error('删除功能错误:', error);
  }
  isDeleteConfirmVisible.value = false;
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

.action-btn.view-btn {
  background-color: #007bff;
}

.action-btn.delete-btn {
  background-color: #dc3545;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  width: 300px;
}

.modal-header {
  margin-bottom: 10px;
}

.modal-content {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.action-btn.secondary {
  background-color: #6c757d;
  margin-right: 10px;
}

.action-btn.primary {
  background-color: #007bff;
}
</style>