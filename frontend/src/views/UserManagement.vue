<template>
  <SystemManagementSidebar />
  <div class="user-management">
    <h2>用户管理</h2>
    <button @click="goToAddUser" class="add-user-btn">添加用户</button>
    <div class="search-bar">
      <input v-model="query" placeholder="输入用户ID或用户名查询" />
      <button @click="searchUsers">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 用户表格 -->
    <table v-if="currentPageUsers.length > 0" class="user-table">
      <thead>
        <tr>
          <th>用户ID</th>
          <th>用户名</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in currentPageUsers" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.user_name }}</td>
          <td>
            <button @click="viewUser(user.user_id)" class="action-btn view-btn">查看</button>
            <button @click="showDeleteConfirm(user)" class="action-btn delete-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && query" class="no-data">未找到匹配的用户</div>

    <!-- 分页组件 -->
    <div v-if="users.length > 0" class="pagination">
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
          <p>确定要删除用户 "{{ currentDeletingUser.user_name || '此用户' }}" 吗？</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="action-btn secondary">取消</button>
          <button 
            @click="confirmDelete" 
            :disabled="isDeleting" 
            class="action-btn primary"
          >
            {{ isDeleting ? '删除中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';
import { useAuthStore } from '../common/auth';

const router = useRouter();
const message = inject('message');

// 状态管理
const query = ref('');
const users = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// 删除相关状态
const isDeleteConfirmVisible = ref(false);
const currentDeletingUser = ref({});
const isDeleting = ref(false);

// 计算属性
const totalPages = computed(() => Math.ceil(users.value.length / itemsPerPage.value));
const currentPageUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  return users.value.slice(startIndex, startIndex + itemsPerPage.value);
});

// 导航方法
const goToAddUser = () => {
  router.push('/user/add');
};

// 搜索用户
const searchUsers = async () => {
  if (!query.value.trim()) {
    return message.warning('请输入查询内容');
  }

  loading.value = true;
  try {
    const response = await axios.get(`/user/query?query=${query.value}`);
    users.value = response.data;

    if (response.data.length === 0) {
      message.info('未找到匹配的用户');
    } else {
      message.success('查询成功！');
    }
  } catch (error) {
    message.error('查询失败！');
    console.error(error);
  } finally {
    loading.value = false;
    currentPage.value = 1;
  }
};

// 查看用户详情
const viewUser = (userId) => {
  router.push(`/user/modify/${userId}`);
};

// 显示删除确认模态框
const showDeleteConfirm = (user) => {
  currentDeletingUser.value = user;
  isDeleteConfirmVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!currentDeletingUser.value.user_id) return;

  isDeleting.value = true;
  try {
    await axios.delete(`/user/delete?userId=${currentDeletingUser.value.user_id}`);
    message.success('删除成功！');

    // 从本地列表中移除已删除用户（优化体验）
    users.value = users.value.filter(
      user => user.user_id !== currentDeletingUser.value.user_id
    );

    // 如果当前页没有数据了，跳转到上一页
    if (currentPageUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  } finally {
    isDeleting.value = false;
    isDeleteConfirmVisible.value = false;
  }
};

// 取消删除
const cancelDelete = () => {
  isDeleteConfirmVisible.value = false;
};

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// 初始化获取用户列表
const getAllUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/user/all');
    users.value = response.data;
    message.success('获取用户列表成功！');
  } catch (error) {
    message.error('获取用户列表失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await getAllUsers();
});
</script>

<style scoped>
/* 样式部分保持不变 */
.user-management {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.add-user-btn {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-user-btn:hover {
  background-color: #0056b3;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-bar input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
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
  text-align: center;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.user-table th {
  background-color: #f2f2f2;
  font-weight: 500;
}

.user-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.user-table tr:hover {
  background-color: #f1f1f1;
}

.action-btn {
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.action-btn.view-btn {
  background-color: #007bff;
}

.action-btn.delete-btn {
  background-color: #dc3545;
}

.action-btn:hover {
  opacity: 0.9;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  text-align: center;
  color: #333;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  transition: background-color 0.3s;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 模态框样式 */
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
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  position: relative;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-content {
  padding: 16px;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #ddd;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.action-btn.secondary {
  background-color: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background-color: #495057;
}

.action-btn.primary:hover {
  background-color: #0056b3;
}
</style>