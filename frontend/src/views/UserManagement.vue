<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <button @click="goToAddUser" class="add-user-btn">添加用户</button>
    <div class="search-bar">
      <input v-model="query" placeholder="输入用户ID或用户名查询" />
      <button @click="searchUsers">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <!-- 使用 currentPageUsers 渲染表格 -->
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
            <button @click="viewUser(user.user_id)" class="action-btn">查看</button>
            <button @click="deleteUser(user.user_id)" class="action-btn">删除</button>
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
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const query = ref('');
const users = ref('');
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalPages = ref(Math.ceil(users.value.length / itemsPerPage.value));

// 计算当前页的用户数据
const currentPageUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return users.value.slice(startIndex, endIndex);
});

const goToAddUser = () => {
  router.push('/user/add');
};

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
  }
  totalPages.value = Math.ceil(users.value.length / itemsPerPage.value);
  currentPage.value = 1; // 查询后重置到第一页
};

const viewUser = (userId) => {
  // 这里可以实现查看用户详情的逻辑，例如跳转到用户详情页面
  console.log(`查看用户 ${userId} 的详情`);
};

const deleteUser = async (userId) => {
  const confirm = await inject('dialog').confirm({
    title: '确认删除',
    content: '确定要删除此用户吗？',
    positiveText: '确认',
    negativeText: '取消'
  });
  
  if (!confirm) return;
  
  try {
    await axios.delete(`/user/delete?userId=${userId}`);
    message.success('删除成功！');
    searchUsers(); // 刷新列表
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
</script>

<style scoped>
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