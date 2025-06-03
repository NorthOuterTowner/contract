<template>
  <SystemManagementSidebar />
  <div class="permission-management">
    <h2>权限配置</h2>
    <hr />
    <h3>用户权限列表</h3>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-if="users.length > 0" class="user-table">
      <thead>
        <tr>
          <th>用户名</th>
          <th>角色名</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>{{ user.username }}</td>
          <td>{{ user.RoleName }}</td>
          <td>
            <button @click="goToAssignPermissions(user.user_id)" class="action-btn">授权</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && users.length === 0" class="no-data">未找到用户信息</div>
    <!-- 分页组件 -->
    <div v-if="users.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';

const router = useRouter();
const message = inject('message');

const users = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalPages = ref(Math.ceil(users.value.length / itemsPerPage.value));

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/user/allWithRoles');
    users.value = response.data;
  } catch (error) {
    message.error('获取用户信息失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
  totalPages.value = Math.ceil(users.value.length / itemsPerPage.value);
};

const goToAssignPermissions = (userId) => {
  router.push(`/permission/assign/${userId}`);
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

// 页面加载时获取用户信息
fetchUsers();
</script>

<style scoped>
.permission-management {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.loading {
  margin: 16px 0;
  color: #999;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.user-table th {
  background-color: #f2f2f2;
}

.user-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.user-table tr:hover {
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