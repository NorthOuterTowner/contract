<template>
  <div>
    <h2>用户管理</h2>
    <button @click="goToAddUser">添加用户</button>
    
    <div class="search-bar">
      <input v-model="query" placeholder="输入用户ID或用户名查询" />
      <button @click="searchUsers">查询</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <table v-if="users.length > 0">
      <thead>
        <tr>
          <th>用户ID</th>
          <th>用户名</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.user_name }}</td>
          <td>
            <button @click="goToUpdateUser(user.user_id)">修改</button>
            <button @click="deleteUser(user.user_id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && query">
      未找到匹配的用户
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const query = ref('');
const users = ref([]);
const loading = ref(false);

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
};

const goToUpdateUser = (userId) => {
  router.push(`/user/update/${userId}`);
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
</script>

<style scoped>
.search-bar {
  margin: 16px 0;
}

.loading {
  margin: 16px 0;
  color: #999;
}
</style>